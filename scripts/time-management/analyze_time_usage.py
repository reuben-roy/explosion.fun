"""
Deep time-usage analysis.

Loads All Activities.xlsx, merges fragmented rows via merge_activities.py,
classifies with the existing classifier, runs six analysis modules, writes
an updated analysis.json and a human-readable time_analysis_report.md.
"""

from __future__ import annotations

import json
import re
import textwrap
from collections import Counter, defaultdict
from datetime import timedelta
from urllib.parse import urlparse

import pandas as pd

from generate_detailed_analysis import classify_activity, parse_iso_duration
from merge_activities import merge_consecutive_activities

EXCEL_PATH = "All Activities.xlsx"
REPORT_PATH = "time_analysis_report.md"
JSON_PATH = "analysis.json"
DASHBOARD_PATH = "dashboard.html"
DASHBOARD_TEMPLATE_MARKER = "const DATA = "

# ---------------------------------------------------------------------------
# Neutral reclassification rules (domain -> (Category, Activity_Type))
# ---------------------------------------------------------------------------
DOMAIN_RULES: dict[str, tuple[str, str]] = {
    "docs.google.com": ("Google Docs", "Productive"),
    "drive.google.com": ("Google Drive", "Productive"),
    "sheets.google.com": ("Google Sheets", "Productive"),
    "mail.google.com": ("Email", "Productive"),
    "outlook.com": ("Email", "Productive"),
    "outlook.live.com": ("Email", "Productive"),
    "calendar.google.com": ("Calendar", "Productive"),
    "trello.com": ("Planning", "Productive"),
    "asana.com": ("Planning", "Productive"),
    "figma.com": ("Design", "Productive"),
    "canva.com": ("Design", "Productive"),
    "medium.com": ("Reading", "Education"),
    "dev.to": ("Reading", "Education"),
    "hackernews.com": ("Tech News", "Education"),
    "news.ycombinator.com": ("Tech News", "Education"),
    "arxiv.org": ("Research", "Education"),
    "wikipedia.org": ("Wikipedia", "Education"),
    "en.wikipedia.org": ("Wikipedia", "Education"),
    "coursera.org": ("Online Course", "Education"),
    "udemy.com": ("Online Course", "Education"),
    "edx.org": ("Online Course", "Education"),
    "amazon.com": ("Shopping", "Life"),
    "walmart.com": ("Shopping", "Life"),
    "target.com": ("Shopping", "Life"),
    "ebay.com": ("Shopping", "Life"),
    "maps.google.com": ("Navigation", "Life"),
    "yelp.com": ("Restaurants", "Life"),
    "uber.com": ("Transport", "Life"),
    "doordash.com": ("Food Delivery", "Life"),
    "grubhub.com": ("Food Delivery", "Life"),
    "facebook.com": ("Social Media", "Entertainment"),
    "tiktok.com": ("Social Media", "Entertainment"),
    "pinterest.com": ("Social Media", "Entertainment"),
    "9gag.com": ("Memes", "Entertainment"),
    "imgur.com": ("Memes", "Entertainment"),
    "twitch.tv": ("Streaming", "Entertainment"),
    "fandom.com": ("Wiki Browsing", "Entertainment"),
}

TITLE_KEYWORD_RULES: list[tuple[str, str, str]] = [
    ("invoice", "Finance", "Productive"),
    ("resume", "Career", "Productive"),
    ("cover letter", "Career", "Productive"),
    ("interview", "Career", "Productive"),
    ("application", "Career", "Productive"),
    ("job", "Career", "Productive"),
    ("assignment", "University", "Education"),
    ("homework", "University", "Education"),
    ("lecture", "University", "Education"),
    ("quiz", "University", "Education"),
    ("exam", "University", "Education"),
    ("course", "University", "Education"),
    ("syllabus", "University", "Education"),
    ("recipe", "Cooking", "Life"),
    ("weather", "Weather", "Life"),
    ("tracking", "Shipping", "Life"),
    ("order", "Shopping", "Life"),
]


# ── helpers ────────────────────────────────────────────────────────────────

def _domain_from_path(path: str) -> str | None:
    if not isinstance(path, str) or not path.startswith(("http://", "https://")):
        return None
    try:
        host = urlparse(path).netloc.lower()
        if host.startswith("www."):
            host = host[4:]
        return host or None
    except Exception:
        return None


def _fmt_hours(seconds: float) -> str:
    h = seconds / 3600
    if h >= 1:
        return f"{h:.1f}h"
    return f"{seconds / 60:.0f}m"


def _fmt_mins(seconds: float) -> str:
    return f"{seconds / 60:.1f} min"


def _pct(part: float, whole: float) -> str:
    if whole == 0:
        return "0%"
    return f"{part / whole * 100:.1f}%"


# ── data loading ───────────────────────────────────────────────────────────

def load_and_prepare() -> pd.DataFrame:
    print("Loading Excel...")
    df = pd.read_excel(EXCEL_PATH)
    print(f"  {len(df)} raw rows")

    print("Merging consecutive activities...")
    df = merge_consecutive_activities(df, gap_seconds=2.0)
    print(f"  {len(df)} rows after merge")

    if pd.api.types.is_timedelta64_dtype(df["Duration"]):
        df["Seconds"] = df["Duration"].dt.total_seconds()
    else:
        df["Seconds"] = df["Duration"].astype(str).apply(parse_iso_duration)

    df["Start_DT"] = pd.to_datetime(df["Start Date"], errors="coerce")
    df["End_DT"] = pd.to_datetime(df["End Date"], errors="coerce")
    df["Hour"] = df["Start_DT"].dt.hour
    df["DayOfWeek"] = df["Start_DT"].dt.day_name()
    df["DOW_num"] = df["Start_DT"].dt.dayofweek  # 0=Mon
    df["Day"] = df["Start_DT"].dt.floor("D")

    print("Classifying activities...")
    df[["Category", "Activity_Type"]] = df.apply(
        lambda r: pd.Series(classify_activity(r)), axis=1
    )

    df["Category"] = df["Category"].fillna("Uncategorized").replace(
        {"nan": "Uncategorized", "": "Uncategorized"}
    )

    return df


# ── Step 2: reclassify Neutral ─────────────────────────────────────────────

def reclassify_neutral(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    neutral_mask = df["Activity_Type"] == "Neutral"
    before_count = neutral_mask.sum()
    before_seconds = df.loc[neutral_mask, "Seconds"].sum()

    reclassified_stats: dict[str, float] = defaultdict(float)

    for idx in df.index[neutral_mask]:
        row = df.loc[idx]
        path = str(row.get("Path", "") or "")
        title = str(row.get("Title", "") or "").lower()
        domain = _domain_from_path(path)

        new_cat, new_type = None, None

        if domain:
            for rule_domain, (cat, atype) in DOMAIN_RULES.items():
                if rule_domain in domain:
                    new_cat, new_type = cat, atype
                    break

        if new_type is None:
            for kw, cat, atype in TITLE_KEYWORD_RULES:
                if kw in title:
                    new_cat, new_type = cat, atype
                    break

        if new_type is not None:
            df.at[idx, "Category"] = new_cat
            df.at[idx, "Activity_Type"] = new_type
            reclassified_stats[new_type] += row["Seconds"]

    after_neutral = df["Activity_Type"] == "Neutral"
    after_seconds = df.loc[after_neutral, "Seconds"].sum()

    stats = {
        "neutral_rows_before": int(before_count),
        "neutral_seconds_before": before_seconds,
        "neutral_seconds_after": after_seconds,
        "seconds_reclassified": before_seconds - after_seconds,
        "breakdown": dict(reclassified_stats),
    }
    print(f"  Reclassified {_fmt_hours(stats['seconds_reclassified'])} from Neutral")
    return df, stats


# ── Analysis Module A: Task Switching & Fragmentation ──────────────────────

def analyze_fragmentation(df: pd.DataFrame) -> dict:
    df_sorted = df.sort_values("Start_DT").copy()

    df_sorted["Prev_Type"] = df_sorted["Activity_Type"].shift(1)
    df_sorted["New_Session"] = df_sorted["Activity_Type"] != df_sorted["Prev_Type"]
    df_sorted["Session_ID"] = df_sorted["New_Session"].cumsum()

    sessions = (
        df_sorted.groupby(["Session_ID", "Activity_Type"])["Seconds"]
        .sum()
        .reset_index()
    )

    result = {}
    for atype in ["Productive", "Entertainment", "Education", "Social", "Neutral"]:
        t = sessions[sessions["Activity_Type"] == atype]["Seconds"]
        if t.empty:
            result[atype.lower()] = {
                "session_count": 0,
                "avg_min": 0,
                "median_min": 0,
                "max_min": 0,
                "total_hours": 0,
                "pct_under_2min": 0,
                "pct_under_5min": 0,
                "pct_over_25min": 0,
            }
            continue
        result[atype.lower()] = {
            "session_count": int(len(t)),
            "avg_min": round(t.mean() / 60, 2),
            "median_min": round(t.median() / 60, 2),
            "max_min": round(t.max() / 60, 1),
            "total_hours": round(t.sum() / 3600, 1),
            "pct_under_2min": round((t < 120).mean() * 100, 1),
            "pct_under_5min": round((t < 300).mean() * 100, 1),
            "pct_over_25min": round((t >= 1500).mean() * 100, 1),
        }

    unique_days = df["Day"].nunique()
    flow_sessions = sessions[
        (sessions["Activity_Type"] == "Productive") & (sessions["Seconds"] >= 1500)
    ]
    daily_fragmentation = (
        df_sorted[df_sorted["Activity_Type"] == "Productive"]
        .groupby("Day")
        .agg(n_sessions=("Session_ID", "nunique"), total_sec=("Seconds", "sum"))
    )
    daily_fragmentation["frag_index"] = (
        daily_fragmentation["n_sessions"] / (daily_fragmentation["total_sec"] / 3600).clip(lower=0.01)
    )

    ctx_df = df_sorted[df_sorted["Seconds"] > 5].copy()
    ctx_df["Prev_App"] = ctx_df["Application"].shift(1)
    ctx_df["Switch"] = (
        (ctx_df["Application"] != ctx_df["Prev_App"])
        & ctx_df["Application"].notna()
        & ctx_df["Prev_App"].notna()
    )
    switches_by_hour = ctx_df.groupby("Hour")["Switch"].sum()
    ctx_switching = {int(k): round(v / unique_days, 1) for k, v in switches_by_hour.items()}

    ctx_df["Prev_Type"] = ctx_df["Activity_Type"].shift(1)
    ctx_df["TypeSwitch"] = (
        (ctx_df["Activity_Type"] != ctx_df["Prev_Type"])
        & ctx_df["Activity_Type"].notna()
        & ctx_df["Prev_Type"].notna()
    )
    type_switches_by_hour = ctx_df.groupby("Hour")["TypeSwitch"].sum()
    type_ctx = {int(k): round(v / unique_days, 1) for k, v in type_switches_by_hour.items()}

    return {
        "session_stats": result,
        "flow_sessions_25min": {
            "count": int(len(flow_sessions)),
            "total_hours": round(flow_sessions["Seconds"].sum() / 3600, 1),
            "per_day": round(len(flow_sessions) / unique_days, 2),
        },
        "daily_fragmentation_index": {
            "mean": round(daily_fragmentation["frag_index"].mean(), 1),
            "best_day": str(daily_fragmentation["frag_index"].idxmin()) if not daily_fragmentation.empty else "N/A",
            "worst_day": str(daily_fragmentation["frag_index"].idxmax()) if not daily_fragmentation.empty else "N/A",
        },
        "context_switching_per_hour": ctx_switching,
        "type_switching_per_hour": type_ctx,
    }


# ── Analysis Module B: Transition Matrix ───────────────────────────────────

def analyze_transitions(df: pd.DataFrame) -> dict:
    df_sorted = df.sort_values("Start_DT").copy()
    df_sorted["Prev_Type"] = df_sorted["Activity_Type"].shift(1)
    df_sorted["Prev_Category"] = df_sorted["Category"].shift(1)

    type_valid = df_sorted["Prev_Type"].notna() & df_sorted["Activity_Type"].notna()
    type_pairs = df_sorted.loc[type_valid, ["Prev_Type", "Activity_Type"]]

    types = sorted(df["Activity_Type"].unique())
    matrix: dict[str, dict[str, int]] = {t: {t2: 0 for t2 in types} for t in types}
    for _, row in type_pairs.iterrows():
        f, t = row["Prev_Type"], row["Activity_Type"]
        if f != t:
            matrix[f][t] += 1

    row_totals = {t: sum(matrix[t].values()) for t in types}
    pct_matrix: dict[str, dict[str, float]] = {}
    for t in types:
        total = row_totals[t] or 1
        pct_matrix[t] = {t2: round(matrix[t][t2] / total * 100, 1) for t2 in types}

    prod_to_ent = df_sorted[
        (df_sorted["Prev_Type"] == "Productive")
        & (df_sorted["Activity_Type"] == "Entertainment")
    ]
    drift_paths = (
        prod_to_ent.groupby(["Prev_Category", "Category"])
        .size()
        .sort_values(ascending=False)
        .head(10)
    )
    top_drift = {f"{a} -> {b}": int(v) for (a, b), v in drift_paths.items()}

    ent_sessions = df_sorted[df_sorted["Activity_Type"] == "Entertainment"].copy()
    ent_sessions["Next_Type"] = df_sorted["Activity_Type"].shift(-1)
    sticky = ent_sessions.groupby("Category").apply(
        lambda g: (g["Next_Type"] == "Entertainment").mean() if len(g) > 5 else 0.0,
        include_groups=False,
    )
    stickiness = {k: round(v * 100, 1) for k, v in sticky.sort_values(ascending=False).head(10).items()}

    return_to_work = df_sorted[
        (df_sorted["Prev_Type"] == "Entertainment")
        & (df_sorted["Activity_Type"] == "Productive")
    ]
    triggers = return_to_work["Prev_Category"].value_counts().head(5).to_dict()
    triggers = {k: int(v) for k, v in triggers.items()}

    return {
        "transition_matrix_counts": matrix,
        "transition_matrix_pct": pct_matrix,
        "top_productive_to_entertainment_paths": top_drift,
        "distraction_stickiness_pct": stickiness,
        "return_to_work_triggers": triggers,
    }


# ── Analysis Module C: Circadian Rhythm ────────────────────────────────────

def analyze_circadian(df: pd.DataFrame) -> dict:
    unique_days = df["Day"].nunique()

    hourly = df.groupby(["Hour", "Activity_Type"])["Seconds"].sum().unstack(fill_value=0)
    hourly_total = hourly.drop(columns=["Sleep"], errors="ignore").sum(axis=1)

    prod_cols = [c for c in ["Productive", "Education"] if c in hourly.columns]
    hourly_prod = hourly[prod_cols].sum(axis=1) if prod_cols else pd.Series(0, index=hourly.index)

    ent_col = "Entertainment"
    hourly_ent = hourly[ent_col] if ent_col in hourly.columns else pd.Series(0, index=hourly.index)

    prod_ratio = {}
    ent_ratio = {}
    for h in range(24):
        total = hourly_total.get(h, 0)
        if total > 0:
            prod_ratio[h] = round(hourly_prod.get(h, 0) / total * 100, 1)
            ent_ratio[h] = round(hourly_ent.get(h, 0) / total * 100, 1)
        else:
            prod_ratio[h] = 0
            ent_ratio[h] = 0

    active_threshold = 60 * unique_days  # at least 1 min avg per day
    active_hours = [h for h in range(6, 24) if hourly_total.get(h, 0) > active_threshold]
    best_focus_hours = sorted(active_hours, key=lambda h: prod_ratio.get(h, 0), reverse=True)[:5]
    worst_focus_hours = sorted(active_hours, key=lambda h: prod_ratio.get(h, 0))[:5]

    wake_latency = []
    for day, grp in df.sort_values("Start_DT").groupby("Day"):
        non_sleep = grp[grp["Activity_Type"] != "Sleep"]
        if non_sleep.empty:
            continue
        first_activity = non_sleep["Start_DT"].min()
        productive = non_sleep[non_sleep["Activity_Type"].isin(["Productive", "Education"])]
        if productive.empty:
            continue
        first_prod = productive["Start_DT"].min()
        latency_min = (first_prod - first_activity).total_seconds() / 60
        if 0 <= latency_min <= 600:
            wake_latency.append(latency_min)

    late_night = df[df["Hour"].isin([22, 23, 0, 1])].copy()
    ln_breakdown = late_night.groupby("Activity_Type")["Seconds"].sum()
    ln_total = ln_breakdown.sum()
    late_night_stats = {
        k: {"hours": round(v / 3600, 1), "pct": round(v / ln_total * 100, 1) if ln_total else 0}
        for k, v in ln_breakdown.items()
    }

    morning_8_12 = df[df["Hour"].between(8, 11)]
    afternoon_12_17 = df[df["Hour"].between(12, 16)]
    evening_17_22 = df[df["Hour"].between(17, 21)]

    def _ent_share(subset: pd.DataFrame) -> float:
        total = subset["Seconds"].sum()
        ent = subset.loc[subset["Activity_Type"] == "Entertainment", "Seconds"].sum()
        return round(ent / total * 100, 1) if total else 0

    willpower_curve = {
        "morning_8_12_ent_pct": _ent_share(morning_8_12),
        "afternoon_12_17_ent_pct": _ent_share(afternoon_12_17),
        "evening_17_22_ent_pct": _ent_share(evening_17_22),
    }

    return {
        "productive_ratio_by_hour": prod_ratio,
        "entertainment_ratio_by_hour": ent_ratio,
        "best_focus_hours": best_focus_hours,
        "worst_focus_hours": worst_focus_hours,
        "wake_to_productive_latency_min": {
            "mean": round(sum(wake_latency) / len(wake_latency), 1) if wake_latency else 0,
            "median": round(sorted(wake_latency)[len(wake_latency) // 2], 1) if wake_latency else 0,
        },
        "late_night_breakdown": late_night_stats,
        "willpower_depletion": willpower_curve,
    }


# ── Analysis Module D: Day of Week ────────────────────────────────────────

def analyze_day_of_week(df: pd.DataFrame) -> dict:
    dow_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    by_dow = df.groupby(["DayOfWeek", "Activity_Type"])["Seconds"].sum().unstack(fill_value=0)
    day_count = df.groupby("DayOfWeek")["Day"].nunique()

    result: dict[str, dict] = {}
    for day in dow_order:
        if day not in by_dow.index:
            continue
        n = day_count.get(day, 1)
        row = by_dow.loc[day]
        result[day] = {
            "n_days": int(n),
            "productive_h": round(row.get("Productive", 0) / 3600 / n, 1),
            "education_h": round(row.get("Education", 0) / 3600 / n, 1),
            "entertainment_h": round(row.get("Entertainment", 0) / 3600 / n, 1),
            "social_h": round(row.get("Social", 0) / 3600 / n, 1),
            "sleep_h": round(row.get("Sleep", 0) / 3600 / n, 1),
        }

    weekday = df[df["DOW_num"] < 5]
    weekend = df[df["DOW_num"] >= 5]
    wd_days = weekday["Day"].nunique() or 1
    we_days = weekend["Day"].nunique() or 1

    def _daily_avg(subset, n):
        g = subset.groupby("Activity_Type")["Seconds"].sum()
        return {k: round(v / 3600 / n, 1) for k, v in g.items()}

    ctx_by_dow = {}
    ctx_df = df[df["Seconds"] > 5].sort_values("Start_DT").copy()
    ctx_df["Prev_App"] = ctx_df["Application"].shift(1)
    ctx_df["Switch"] = (
        (ctx_df["Application"] != ctx_df["Prev_App"])
        & ctx_df["Application"].notna()
        & ctx_df["Prev_App"].notna()
    )
    for day in dow_order:
        day_switches = ctx_df[ctx_df["DayOfWeek"] == day]["Switch"].sum()
        n = day_count.get(day, 1)
        ctx_by_dow[day] = round(day_switches / n, 1)

    productive_by_day = {
        d: v.get("productive_h", 0) + v.get("education_h", 0)
        for d, v in result.items()
    }
    best_day = max(productive_by_day, key=productive_by_day.get) if productive_by_day else "N/A"
    worst_day = min(productive_by_day, key=productive_by_day.get) if productive_by_day else "N/A"

    sleep_data = df[df["Activity_Type"] == "Sleep"].groupby("Day")["Seconds"].sum() / 3600
    sleep_consistency = {
        "mean_h": round(sleep_data.mean(), 1) if not sleep_data.empty else 0,
        "std_h": round(sleep_data.std(), 1) if not sleep_data.empty else 0,
        "min_h": round(sleep_data.min(), 1) if not sleep_data.empty else 0,
        "max_h": round(sleep_data.max(), 1) if not sleep_data.empty else 0,
    }

    return {
        "daily_averages_by_dow": result,
        "weekday_avg": _daily_avg(weekday, wd_days),
        "weekend_avg": _daily_avg(weekend, we_days),
        "context_switches_by_dow": ctx_by_dow,
        "best_productive_day": best_day,
        "worst_productive_day": worst_day,
        "sleep_consistency": sleep_consistency,
    }


# ── Analysis Module E: Hobby & Interest Affinity ───────────────────────────

def analyze_interests(df: pd.DataFrame) -> dict:
    yt = df[df["Category"] == "YouTube"].copy()
    yt_titles = yt["Title"].astype(str)

    yt_title_clean = yt_titles.str.replace(r"\s*-\s*YouTube.*$", "", regex=True)
    yt_title_clean = yt_title_clean.str.replace(r"\s*-\s*Audio playing.*$", "", regex=True)
    yt_title_clean = yt_title_clean.str.replace(r"\s*-\s*High memory usage.*$", "", regex=True)

    topic_keywords = {
        "Tech/Programming": ["programming", "coding", "software", "engineer", "developer", "code", "python",
                             "javascript", "react", "ai", "machine learning", "data science", "api",
                             "benchmark", "linux", "terminal", "tech"],
        "Politics/News": ["politics", "war", "immigration", "government", "election", "president",
                          "country", "nation", "iran", "china", "congress", "policy"],
        "Entertainment/Comedy": ["funny", "meme", "comedy", "prank", "challenge", "vs", "virgin",
                                 "react", "tier list", "ranking"],
        "Education/Science": ["lecture", "tutorial", "explained", "how to", "learn", "course",
                              "physics", "math", "science", "history", "level"],
        "Gaming": ["game", "gaming", "playthrough", "gameplay", "stream", "esport"],
        "Finance/Career": ["money", "salary", "job", "career", "interview", "resume",
                           "investing", "crypto", "stock"],
        "Lifestyle": ["routine", "productivity", "habit", "workout", "gym", "diet",
                      "health", "morning", "vlog"],
    }

    yt_with_secs = pd.DataFrame({"title": yt_title_clean.values, "seconds": yt["Seconds"].values})
    topic_totals: dict[str, float] = defaultdict(float)
    for _, row in yt_with_secs.iterrows():
        title_lower = str(row["title"]).lower()
        matched = False
        for topic, keywords in topic_keywords.items():
            if any(kw in title_lower for kw in keywords):
                topic_totals[topic] += row["seconds"]
                matched = True
                break
        if not matched:
            topic_totals["Other/Uncategorized"] += row["seconds"]

    topic_totals = dict(sorted(topic_totals.items(), key=lambda x: x[1], reverse=True))

    anime = df[df["Category"] == "Anime"].copy()
    anime_pattern = re.compile(r"Watch (.+?) English")
    anime["Show"] = anime["Title"].astype(str).apply(
        lambda t: m.group(1) if (m := anime_pattern.search(t)) else t
    )
    anime_shows = anime.groupby("Show")["Seconds"].agg(["sum", "count"]).sort_values("sum", ascending=False)
    anime_breakdown = {
        row.Index: {"hours": round(row.sum / 3600, 1), "sessions": int(row.count)}
        for row in anime_shows.head(10).itertuples()
    }

    binge_threshold = 3600
    anime_daily = anime.groupby(["Day", "Show"])["Seconds"].sum()
    binge_days = anime_daily[anime_daily >= binge_threshold]
    binge_count = len(binge_days)

    initiation_counts = (
        df.sort_values("Start_DT")
        .assign(Prev_Cat=lambda d: d["Category"].shift(1))
        .query("Category != Prev_Cat")
        .groupby("Category")
        .size()
        .sort_values(ascending=False)
    )
    top_initiated = initiation_counts.head(15).to_dict()

    ent_df = df[df["Activity_Type"] == "Entertainment"].sort_values("Start_DT").copy()
    ent_df["Next_Type"] = df.sort_values("Start_DT")["Activity_Type"].shift(-1).values[: len(ent_df)] if len(ent_df) <= len(df) else None

    guilty_pleasure = {}
    if ent_df is not None and "Next_Type" in ent_df.columns:
        for cat, grp in ent_df.groupby("Category"):
            if len(grp) < 3:
                continue
            next_types = grp["Next_Type"].dropna()
            return_rate = (next_types.isin(["Productive", "Education"])).mean()
            guilty_pleasure[cat] = round(return_rate * 100, 1)

    guilty_pleasure = dict(sorted(guilty_pleasure.items(), key=lambda x: x[1], reverse=True))

    return {
        "youtube_topic_breakdown_hours": {k: round(v / 3600, 1) for k, v in topic_totals.items()},
        "anime_show_breakdown": anime_breakdown,
        "anime_binge_days": binge_count,
        "most_initiated_activities": top_initiated,
        "guilty_pleasure_return_rate": guilty_pleasure,
    }


# ── Analysis Module F: Sleep-Productivity Correlation ──────────────────────

def analyze_sleep_productivity(df: pd.DataFrame) -> dict:
    daily = df.groupby("Day").apply(
        lambda g: pd.Series({
            "sleep_h": g.loc[g["Activity_Type"] == "Sleep", "Seconds"].sum() / 3600,
            "productive_h": g.loc[g["Activity_Type"].isin(["Productive", "Education"]), "Seconds"].sum() / 3600,
            "entertainment_h": g.loc[g["Activity_Type"] == "Entertainment", "Seconds"].sum() / 3600,
            "total_switches": len(g) - 1,
        }),
        include_groups=False,
    )

    sleep_next_day = daily["sleep_h"].shift(1)
    sleep_next_day.name = "prev_night_sleep"
    paired = daily.join(sleep_next_day).dropna()

    # Only include days where sleep was actually tracked (> 0)
    paired = paired[paired["prev_night_sleep"] > 0.5]

    if len(paired) < 5:
        return {"insufficient_data": True}

    threshold = paired["prev_night_sleep"].median()
    good_sleep = paired[paired["prev_night_sleep"] >= threshold]
    bad_sleep = paired[paired["prev_night_sleep"] < threshold]

    return {
        "good_sleep_avg_productive_h": round(good_sleep["productive_h"].mean(), 1),
        "bad_sleep_avg_productive_h": round(bad_sleep["productive_h"].mean(), 1),
        "good_sleep_avg_entertainment_h": round(good_sleep["entertainment_h"].mean(), 1),
        "bad_sleep_avg_entertainment_h": round(bad_sleep["entertainment_h"].mean(), 1),
        "good_sleep_threshold_h": round(paired["prev_night_sleep"].median(), 1),
        "correlation_sleep_prod": round(paired["prev_night_sleep"].corr(paired["productive_h"]), 3),
        "correlation_sleep_ent": round(paired["prev_night_sleep"].corr(paired["entertainment_h"]), 3),
    }


# ── Report generation ─────────────────────────────────────────────────────

def generate_report(
    df: pd.DataFrame,
    reclass_stats: dict,
    frag: dict,
    trans: dict,
    circadian: dict,
    dow: dict,
    interests: dict,
    sleep_prod: dict,
) -> str:
    unique_days = df["Day"].nunique()
    total_sec = df["Seconds"].sum()
    type_bd = df.groupby("Activity_Type")["Seconds"].sum().to_dict()

    prod_h = (type_bd.get("Productive", 0) + type_bd.get("Education", 0)) / 3600
    ent_h = type_bd.get("Entertainment", 0) / 3600
    social_h = type_bd.get("Social", 0) / 3600
    sleep_h = type_bd.get("Sleep", 0) / 3600
    neutral_h = type_bd.get("Neutral", 0) / 3600
    life_h = type_bd.get("Life", 0) / 3600

    fs = frag["session_stats"]
    flow = frag["flow_sessions_25min"]
    tm = trans["transition_matrix_pct"]
    circ = circadian

    lines = []

    def w(text=""):
        lines.append(text)

    # ── Header ──
    w("# Time Usage Deep Analysis Report")
    w()
    w(f"**Period:** {df['Start_DT'].min().strftime('%b %d')} - {df['Start_DT'].max().strftime('%b %d, %Y')} ({unique_days} days)")
    w(f"**Total tracked:** {total_sec / 3600:.1f} hours ({total_sec / 3600 / unique_days:.1f}h/day avg)")
    w()

    # ── Executive Summary ──
    w("## Executive Summary")
    w()

    prod_to_ent_pct = tm.get("Productive", {}).get("Entertainment", 0)
    ent_to_prod_pct = tm.get("Entertainment", {}).get("Productive", 0)

    findings = []

    findings.append(
        f"**Your productive work is severely fragmented.** "
        f"The average productive session lasts just {fs['productive']['avg_min']} minutes "
        f"(median {fs['productive']['median_min']} min). "
        f"{fs['productive']['pct_under_2min']}% of all productive sessions are under 2 minutes. "
        f"You only achieved {flow['count']} deep-work sessions (>=25 min) in {unique_days} days -- "
        f"that's {flow['per_day']:.1f} per day."
    )

    findings.append(
        f"**Entertainment holds your attention 3x longer than work.** "
        f"Average entertainment session: {fs['entertainment']['avg_min']} min. "
        f"Average productive session: {fs['productive']['avg_min']} min. "
        f"Your brain sustains focus on distractions far more easily than on tasks."
    )

    findings.append(
        f"**YouTube is your biggest time sink at {interests['youtube_topic_breakdown_hours'].get('Entertainment/Comedy', 0) + sum(interests['youtube_topic_breakdown_hours'].values()):.0f}h total.** "
        f"Top YouTube categories: "
        + ", ".join(f"{k} ({v}h)" for k, v in list(interests["youtube_topic_breakdown_hours"].items())[:3])
        + "."
    )

    findings.append(
        f"**Willpower depletes through the day.** "
        f"Entertainment share: morning {circ['willpower_depletion']['morning_8_12_ent_pct']}%, "
        f"afternoon {circ['willpower_depletion']['afternoon_12_17_ent_pct']}%, "
        f"evening {circ['willpower_depletion']['evening_17_22_ent_pct']}%. "
        f"Your best focus hours are {', '.join(f'{h}:00' for h in circ['best_focus_hours'][:3])}."
    )

    if not sleep_prod.get("insufficient_data"):
        findings.append(
            f"**Sleep quality affects next-day output.** "
            f"After good sleep (>={sleep_prod['good_sleep_threshold_h']}h): "
            f"{sleep_prod['good_sleep_avg_productive_h']}h productive. "
            f"After poor sleep: {sleep_prod['bad_sleep_avg_productive_h']}h productive. "
            f"Correlation: {sleep_prod['correlation_sleep_prod']:.2f}."
        )

    for i, f_text in enumerate(findings, 1):
        w(f"{i}. {f_text}")
        w()

    # ── Time Allocation ──
    w("---")
    w("## Time Allocation Overview")
    w()
    w(f"After reclassifying {_fmt_hours(reclass_stats['seconds_reclassified'])} "
      f"out of the Neutral bucket:")
    w()
    w("| Category | Total Hours | Daily Avg | Share |")
    w("|----------|------------|-----------|-------|")
    for atype in ["Productive", "Education", "Entertainment", "Social", "Life", "Sleep", "Neutral"]:
        sec = type_bd.get(atype, 0)
        w(f"| {atype} | {sec/3600:.1f}h | {sec/3600/unique_days:.1f}h | {_pct(sec, total_sec)} |")
    w()

    cat_bd = df.groupby("Category")["Seconds"].sum().sort_values(ascending=False).head(15)
    w("**Top 15 Categories:**")
    w()
    w("| Category | Hours |")
    w("|----------|-------|")
    for cat, sec in cat_bd.items():
        w(f"| {cat} | {sec/3600:.1f}h |")
    w()

    # ── Attention & Focus ──
    w("---")
    w("## Attention and Focus Analysis")
    w()
    w("### Session Duration Profile")
    w()
    w("| Metric | Productive | Entertainment | Education |")
    w("|--------|-----------|---------------|-----------|")
    w(f"| Sessions | {fs['productive']['session_count']} | {fs['entertainment']['session_count']} | {fs['education']['session_count']} |")
    w(f"| Avg Duration | {fs['productive']['avg_min']} min | {fs['entertainment']['avg_min']} min | {fs['education']['avg_min']} min |")
    w(f"| Median Duration | {fs['productive']['median_min']} min | {fs['entertainment']['median_min']} min | {fs['education']['median_min']} min |")
    w(f"| Max Duration | {fs['productive']['max_min']} min | {fs['entertainment']['max_min']} min | {fs['education']['max_min']} min |")
    w(f"| Under 2 min | {fs['productive']['pct_under_2min']}% | {fs['entertainment']['pct_under_2min']}% | {fs['education']['pct_under_2min']}% |")
    w(f"| Over 25 min | {fs['productive']['pct_over_25min']}% | {fs['entertainment']['pct_over_25min']}% | {fs['education']['pct_over_25min']}% |")
    w()

    w("### Deep Work (Flow State) Sessions")
    w()
    w(f"- **{flow['count']}** sessions of 25+ minutes of unbroken productive work")
    w(f"- Total deep-work time: **{flow['total_hours']}h** out of "
      f"{fs['productive']['total_hours']}h productive "
      f"({_pct(flow['total_hours'], fs['productive']['total_hours'])} of productive time)")
    w(f"- Average **{flow['per_day']}** deep-work sessions per day")
    w()

    w("### Fragmentation Index")
    w()
    w(f"- Average: **{frag['daily_fragmentation_index']['mean']}** sessions per productive hour")
    w(f"- Best day (least fragmented): {frag['daily_fragmentation_index']['best_day']}")
    w(f"- Worst day (most fragmented): {frag['daily_fragmentation_index']['worst_day']}")
    w()

    w("### Context Switching by Hour")
    w()
    w("| Hour | App Switches/day | Type Switches/day |")
    w("|------|-----------------|-------------------|")
    for h in range(24):
        app_s = frag["context_switching_per_hour"].get(h, 0)
        type_s = frag["type_switching_per_hour"].get(h, 0)
        if app_s > 0 or type_s > 0:
            w(f"| {h}:00 | {app_s} | {type_s} |")
    w()

    # ── Distraction Analysis ──
    w("---")
    w("## Distraction Gravity Analysis")
    w()

    w("### Where Does Your Attention Drift?")
    w()
    w("When you leave productive work, here is where you go (% of transitions):")
    w()
    if "Productive" in tm:
        w("| Destination | % of Productive Exits |")
        w("|------------|----------------------|")
        for dest in sorted(tm["Productive"], key=tm["Productive"].get, reverse=True):
            pct = tm["Productive"][dest]
            if pct > 0:
                w(f"| {dest} | {pct}% |")
    w()

    w("### Top Productive -> Entertainment Drift Paths")
    w()
    if trans["top_productive_to_entertainment_paths"]:
        w("| Path | Count |")
        w("|------|-------|")
        for path, count in trans["top_productive_to_entertainment_paths"].items():
            w(f"| {path} | {count} |")
    w()

    w("### Distraction Stickiness")
    w()
    w("How likely you are to stay in the same entertainment category once you start:")
    w()
    if trans["distraction_stickiness_pct"]:
        w("| Category | Stickiness |")
        w("|----------|-----------|")
        for cat, pct in trans["distraction_stickiness_pct"].items():
            w(f"| {cat} | {pct}% |")
    w()

    w("### What Brings You Back to Work?")
    w()
    if trans["return_to_work_triggers"]:
        w("| Activity Before Returning to Work | Times |")
        w("|-----------------------------------|-------|")
        for cat, count in trans["return_to_work_triggers"].items():
            w(f"| {cat} | {count} |")
    w()

    # ── Circadian ──
    w("---")
    w("## Circadian Rhythm and Energy Patterns")
    w()

    w("### Productive Focus Ratio by Hour")
    w()
    w("(% of active time spent on Productive + Education)")
    w()
    w("| Hour | Focus % | Entertainment % |")
    w("|------|---------|----------------|")
    for h in range(6, 24):
        w(f"| {h}:00 | {circ['productive_ratio_by_hour'].get(h, 0)}% | {circ['entertainment_ratio_by_hour'].get(h, 0)}% |")
    w()

    w(f"**Best focus hours:** {', '.join(f'{h}:00' for h in circ['best_focus_hours'])}")
    w()
    w(f"**Worst focus hours (with significant activity):** {', '.join(f'{h}:00' for h in circ['worst_focus_hours'])}")
    w()

    w("### Willpower Depletion Curve")
    w()
    wpc = circ["willpower_depletion"]
    w(f"- Morning (8am-12pm): **{wpc['morning_8_12_ent_pct']}%** entertainment")
    w(f"- Afternoon (12pm-5pm): **{wpc['afternoon_12_17_ent_pct']}%** entertainment")
    w(f"- Evening (5pm-10pm): **{wpc['evening_17_22_ent_pct']}%** entertainment")
    w()

    w("### Wake-to-Work Latency")
    w()
    lat = circ["wake_to_productive_latency_min"]
    w(f"- Average: **{lat['mean']} min** from first activity to first productive task")
    w(f"- Median: **{lat['median']} min**")
    w()

    w("### Late Night Audit (10pm - 2am)")
    w()
    if circ["late_night_breakdown"]:
        w("| Activity Type | Hours | Share |")
        w("|--------------|-------|-------|")
        for atype, stats in sorted(circ["late_night_breakdown"].items(), key=lambda x: x[1]["hours"], reverse=True):
            w(f"| {atype} | {stats['hours']}h | {stats['pct']}% |")
    w()

    # ── Day of Week ──
    w("---")
    w("## Day-of-Week Patterns")
    w()

    w(f"**Most productive day:** {dow['best_productive_day']}")
    w()
    w(f"**Least productive day:** {dow['worst_productive_day']}")
    w()

    w("### Daily Averages by Day of Week")
    w()
    w("| Day | Productive | Education | Entertainment | Social | Sleep |")
    w("|-----|-----------|-----------|---------------|--------|-------|")
    for day, stats in dow["daily_averages_by_dow"].items():
        w(f"| {day} | {stats['productive_h']}h | {stats['education_h']}h | {stats['entertainment_h']}h | {stats['social_h']}h | {stats['sleep_h']}h |")
    w()

    w("### Weekday vs Weekend")
    w()
    w("| Metric | Weekday Avg | Weekend Avg |")
    w("|--------|------------|-------------|")
    for key in ["Productive", "Education", "Entertainment", "Social"]:
        wd_val = dow["weekday_avg"].get(key, 0)
        we_val = dow["weekend_avg"].get(key, 0)
        w(f"| {key} | {wd_val}h | {we_val}h |")
    w()

    w("### Context Switches by Day")
    w()
    w("| Day | Switches/day |")
    w("|-----|-------------|")
    for day, count in dow["context_switches_by_dow"].items():
        w(f"| {day} | {count} |")
    w()

    w("### Sleep Consistency")
    w()
    sc = dow["sleep_consistency"]
    w(f"- Mean: **{sc['mean_h']}h/night**, Std Dev: {sc['std_h']}h")
    w(f"- Range: {sc['min_h']}h to {sc['max_h']}h")
    w()

    # ── Interests ──
    w("---")
    w("## Interests and Affinities")
    w()

    w("### YouTube Topic Breakdown")
    w()
    w("| Topic | Hours |")
    w("|-------|-------|")
    for topic, hours in interests["youtube_topic_breakdown_hours"].items():
        w(f"| {topic} | {hours}h |")
    w()

    w("### Anime Breakdown")
    w()
    if interests["anime_show_breakdown"]:
        w("| Show | Hours | Sessions |")
        w("|------|-------|----------|")
        for show, stats in interests["anime_show_breakdown"].items():
            w(f"| {show} | {stats['hours']}h | {stats['sessions']} |")
    w()
    w(f"**Binge days** (1h+ anime in a single day): **{interests['anime_binge_days']}** out of {unique_days} days")
    w()

    w("### What You Voluntarily Start Most Often")
    w()
    w("(Ranked by number of times you *initiated* the activity, not total time)")
    w()
    w("| Activity | Times Initiated |")
    w("|----------|----------------|")
    for cat, count in list(interests["most_initiated_activities"].items())[:15]:
        w(f"| {cat} | {count} |")
    w()

    w("### Guilty Pleasures vs Dead Ends")
    w()
    w("(% chance you return to productive work after this entertainment category)")
    w()
    if interests["guilty_pleasure_return_rate"]:
        w("| Category | Return-to-Work Rate |")
        w("|----------|-------------------|")
        for cat, rate in interests["guilty_pleasure_return_rate"].items():
            label = "Recoverable" if rate >= 40 else "Dead End"
            w(f"| {cat} | {rate}% ({label}) |")
    w()

    # ── Sleep-Productivity Correlation ──
    if not sleep_prod.get("insufficient_data"):
        w("---")
        w("## Sleep-Productivity Correlation")
        w()
        w(f"Threshold: nights with >= {sleep_prod['good_sleep_threshold_h']}h sleep vs below")
        w()
        w("| Metric | After Good Sleep | After Poor Sleep |")
        w("|--------|-----------------|-----------------|")
        w(f"| Productive hours | {sleep_prod['good_sleep_avg_productive_h']}h | {sleep_prod['bad_sleep_avg_productive_h']}h |")
        w(f"| Entertainment hours | {sleep_prod['good_sleep_avg_entertainment_h']}h | {sleep_prod['bad_sleep_avg_entertainment_h']}h |")
        w()
        w(f"- Sleep-Productivity correlation: **{sleep_prod['correlation_sleep_prod']}**")
        w(f"- Sleep-Entertainment correlation: **{sleep_prod['correlation_sleep_ent']}**")
        w()

    # ── Recommendations ──
    w("---")
    w("## Actionable Recommendations")
    w()

    recs = []

    recs.append(
        "**Implement a 25-minute timer rule.** Your productive sessions average under 2 minutes. "
        "Use a Pomodoro timer -- commit to 25 minutes of uninterrupted work before allowing "
        "any context switch. Even getting 4 of these per day would dramatically increase your "
        f"deep-work count from the current {flow['per_day']:.1f}/day."
    )

    if circ["willpower_depletion"]["evening_17_22_ent_pct"] > circ["willpower_depletion"]["morning_8_12_ent_pct"]:
        recs.append(
            "**Front-load hard work to the morning.** Your data shows entertainment creeps "
            f"from {wpc['morning_8_12_ent_pct']}% in the morning to {wpc['evening_17_22_ent_pct']}% "
            "by evening. Schedule your most cognitively demanding tasks before noon."
        )

    if circ["best_focus_hours"]:
        top3 = [f"{h}:00" for h in circ["best_focus_hours"][:3]]
        recs.append(
            f"**Protect your peak hours ({', '.join(top3)}).** These are your highest-focus hours. "
            "Block them as 'Do Not Disturb' -- no social media, no YouTube, no messaging."
        )

    stickiest = list(trans["distraction_stickiness_pct"].items())
    if stickiest:
        worst_sticky = stickiest[0]
        recs.append(
            f"**Watch out for {worst_sticky[0]}** -- once you start, there's a {worst_sticky[1]}% "
            "chance you stay. This is your stickiest distraction. Consider blocking it during "
            "work hours entirely, not just relying on willpower."
        )

    if lat["mean"] > 30:
        recs.append(
            f"**Reduce your morning startup time.** You currently take {lat['mean']} min on average "
            "from your first activity to first productive work. Prepare your work environment "
            "the night before -- leave your IDE open, have a task ready."
        )

    if not sleep_prod.get("insufficient_data") and sleep_prod["correlation_sleep_prod"] > 0.1:
        recs.append(
            "**Prioritize sleep for productivity.** Your data shows a positive correlation "
            f"({sleep_prod['correlation_sleep_prod']:.2f}) between sleep and next-day productive output. "
            f"Aim for >= {sleep_prod['good_sleep_threshold_h']}h consistently."
        )

    recs.append(
        "**Create browser friction.** Use separate browser profiles: a 'Work' profile "
        "that blocks YouTube, Reddit, X/Twitter, and HiAnime; and a 'Personal' profile for "
        "after-hours use. This adds a speed bump to the Productive -> Entertainment drift."
    )

    for i, rec in enumerate(recs, 1):
        w(f"{i}. {rec}")
        w()

    # ── Further Exploration ──
    w("---")
    w("## Suggestions for Further Self-Discovery")
    w()

    suggestions = [
        (
            "Track your mood alongside activities",
            "Add a 1-5 mood rating at the start and end of each work block. "
            "After 2 weeks, correlate mood with activity type to discover which tasks "
            "energize vs drain you."
        ),
        (
            "Gamify your deep-work streaks",
            f"Your current record is {fs['productive']['max_min']} minutes of unbroken productive work. "
            "Set a visible daily target (start with 30 min) and try to beat your record each week."
        ),
        (
            "Audit your social time budget",
            f"You spend {social_h:.1f}h ({social_h/unique_days:.1f}h/day) on social activities. "
            "Journal after social interactions: did you feel energized or drained? "
            "This reveals whether your social time is recharging or obligation."
        ),
        (
            "Run a no-YouTube experiment",
            "Block YouTube for one full work week and measure the impact. "
            "Your data suggests it's your #1 drift target. A week without it would reveal "
            "how much productive time you reclaim and whether you substitute with something else."
        ),
        (
            "Investigate the 5pm context-switching spike",
            "Your context switching peaks dramatically in the late afternoon. "
            "This could be fatigue, schedule transitions, or social obligations. "
            "Log what happens at 5pm each day for a week to identify the trigger."
        ),
        (
            "Weekly automated reports",
            "Run this analysis weekly to track trends over time. "
            "Key metrics to watch: deep-work sessions per day, entertainment hours, "
            "wake-to-work latency, and fragmentation index."
        ),
        (
            "Energy mapping experiment",
            "For two weeks, rate your energy (1-5) every hour. "
            "Overlay this with your activity data to discover if your schedule "
            "aligns with your natural energy peaks."
        ),
        (
            "Categorize the remaining Neutral time",
            f"There are still {neutral_h:.1f}h of unclassified Neutral time. "
            "Manually review the top 20 domains/titles to create better classification rules."
        ),
    ]

    for i, (title, desc) in enumerate(suggestions, 1):
        w(f"### {i}. {title}")
        w()
        w(desc)
        w()

    w("---")
    w(f"*Report generated from {len(df)} merged activity records over {unique_days} days.*")

    return "\n".join(lines)


# ── JSON output (extended) ─────────────────────────────────────────────────

def build_extended_json(
    df: pd.DataFrame,
    frag: dict,
    trans: dict,
    circadian: dict,
    dow: dict,
    interests: dict,
    sleep_prod: dict,
) -> dict:
    unique_days = df["Day"].nunique()
    total_seconds = df["Seconds"].sum()
    type_breakdown = df.groupby("Activity_Type")["Seconds"].sum().to_dict()
    category_breakdown = (
        df.groupby("Category")["Seconds"].sum().sort_values(ascending=False).to_dict()
    )
    app_breakdown = (
        df.groupby("Application")["Seconds"]
        .sum()
        .sort_values(ascending=False)
        .head(20)
        .to_dict()
    )
    distractions = (
        df[df["Activity_Type"] == "Entertainment"]
        .groupby("Title")["Seconds"]
        .sum()
        .sort_values(ascending=False)
        .head(20)
        .to_dict()
    )
    productive_items = (
        df[df["Activity_Type"] == "Productive"]
        .groupby("Title")["Seconds"]
        .sum()
        .sort_values(ascending=False)
        .head(20)
        .to_dict()
    )

    hourly_groups = df.groupby(["Activity_Type", "Hour"])["Seconds"].sum()
    all_types = df["Activity_Type"].unique()
    hourly_distribution = {}
    for t in all_types:
        hourly_distribution[t] = {}
        for h in range(24):
            total_sec = hourly_groups.get((t, h), 0)
            avg_min = (total_sec / 60) / unique_days
            hourly_distribution[t][h] = round(avg_min, 1)

    df_sorted = df.sort_values("Start_DT")
    df_sorted["Prev_Type"] = df_sorted["Activity_Type"].shift(1)
    df_sorted["New_Session"] = df_sorted["Activity_Type"] != df_sorted["Prev_Type"]
    df_sorted["Session_ID"] = df_sorted["New_Session"].cumsum()
    sessions = df_sorted.groupby(["Session_ID", "Activity_Type"])["Seconds"].sum()
    focus_stats = {}
    for t in ["Productive", "Entertainment", "Education"]:
        ts = sessions[sessions.index.get_level_values("Activity_Type") == t]
        if not ts.empty:
            focus_stats[t.lower()] = {
                "count": int(len(ts)),
                "avg_duration_min": round(float(ts.mean() / 60), 2),
                "median_duration_min": round(float(ts.median() / 60), 2),
                "max_duration_min": round(float(ts.max() / 60), 1),
            }
        else:
            focus_stats[t.lower()] = {"count": 0, "avg_duration_min": 0}

    output = {
        "total_seconds": float(total_seconds),
        "total_days": int(unique_days),
        "date_range": {
            "start": df["Start_DT"].min().strftime("%Y-%m-%d"),
            "end": df["Start_DT"].max().strftime("%Y-%m-%d"),
        },
        "daily_avg_hours": round(total_seconds / 3600 / unique_days, 2),
        "project_breakdown": {k: float(v) for k, v in category_breakdown.items()},
        "activity_type_breakdown": {k: float(v) for k, v in type_breakdown.items()},
        "app_breakdown": {k: float(v) for k, v in app_breakdown.items()},
        "top_distractions": {k: float(v) for k, v in distractions.items()},
        "top_productive": {k: float(v) for k, v in productive_items.items()},
        "hourly_distribution": hourly_distribution,
        "focus_stats": focus_stats,
        "context_switching": frag["context_switching_per_hour"],
        "type_switching": frag["type_switching_per_hour"],
        "flow_sessions": frag["flow_sessions_25min"],
        "fragmentation_index": frag["daily_fragmentation_index"],
        "session_duration_profile": frag["session_stats"],
        "transition_matrix_pct": trans["transition_matrix_pct"],
        "distraction_stickiness": trans["distraction_stickiness_pct"],
        "productive_to_entertainment_paths": trans["top_productive_to_entertainment_paths"],
        "circadian_productive_ratio": circadian["productive_ratio_by_hour"],
        "circadian_entertainment_ratio": circadian["entertainment_ratio_by_hour"],
        "best_focus_hours": circadian["best_focus_hours"],
        "willpower_depletion": circadian["willpower_depletion"],
        "wake_to_work_latency": circadian["wake_to_productive_latency_min"],
        "late_night_breakdown": circadian["late_night_breakdown"],
        "day_of_week": dow["daily_averages_by_dow"],
        "weekday_vs_weekend": {"weekday": dow["weekday_avg"], "weekend": dow["weekend_avg"]},
        "sleep_consistency": dow["sleep_consistency"],
        "youtube_topics": interests["youtube_topic_breakdown_hours"],
        "anime_breakdown": interests["anime_show_breakdown"],
        "most_initiated": interests["most_initiated_activities"],
        "sleep_productivity": sleep_prod,
    }
    return output


# ── main ───────────────────────────────────────────────────────────────────

def main():
    df = load_and_prepare()

    print("\nStep 2: Reclassifying Neutral rows...")
    df, reclass_stats = reclassify_neutral(df)

    print("\nStep 3A: Analyzing fragmentation...")
    frag = analyze_fragmentation(df)

    print("Step 3B: Analyzing transitions...")
    trans = analyze_transitions(df)

    print("Step 3C: Analyzing circadian rhythm...")
    circadian = analyze_circadian(df)

    print("Step 3D: Analyzing day-of-week patterns...")
    dow = analyze_day_of_week(df)

    print("Step 3E: Analyzing interests...")
    interests = analyze_interests(df)

    print("Step 3F: Analyzing sleep-productivity correlation...")
    sleep_prod = analyze_sleep_productivity(df)

    print("\nStep 4: Generating report...")
    report = generate_report(df, reclass_stats, frag, trans, circadian, dow, interests, sleep_prod)
    with open(REPORT_PATH, "w") as f:
        f.write(report)
    print(f"  Wrote {REPORT_PATH}")

    print("\nStep 5: Writing extended analysis.json...")
    output = build_extended_json(df, frag, trans, circadian, dow, interests, sleep_prod)
    with open(JSON_PATH, "w") as f:
        json.dump(output, f, indent=2)
    print(f"  Wrote {JSON_PATH}")

    print("\nStep 6: Embedding data into dashboard.html...")
    _update_dashboard_data(output)

    print("\nDone.")


def _update_dashboard_data(data: dict) -> None:
    """Replace the inline DATA blob in dashboard.html with fresh analysis data."""
    import os
    if not os.path.isfile(DASHBOARD_PATH):
        print(f"  Skipped: {DASHBOARD_PATH} not found")
        return
    with open(DASHBOARD_PATH) as f:
        html = f.read()
    marker = DASHBOARD_TEMPLATE_MARKER
    idx = html.find(marker)
    if idx == -1:
        print(f"  Skipped: marker not found in {DASHBOARD_PATH}")
        return
    start = idx + len(marker)
    end = html.index(";", start)
    new_html = html[:start] + json.dumps(data) + html[end:]
    with open(DASHBOARD_PATH, "w") as f:
        f.write(new_html)
    print(f"  Updated {DASHBOARD_PATH}")


if __name__ == "__main__":
    main()
