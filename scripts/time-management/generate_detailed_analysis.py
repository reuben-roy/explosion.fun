import pandas as pd
import json
import re
from datetime import datetime, timedelta

def parse_iso_duration(duration_str):
    """
    Parses ISO 8601 duration string (e.g., P0DT0H0M51.132S) into total seconds.
    Does not support months/years (P1M), assumes P0DT...
    """
    if not isinstance(duration_str, str):
        return 0.0
    
    # Regex to capture days, hours, minutes, seconds
    # P(n)DT(n)H(n)M(n)S
    pattern = re.compile(r'P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:([\d.]+)S)?')
    match = pattern.match(duration_str)
    
    if not match:
        return 0.0
    
    days = float(match.group(1) or 0)
    hours = float(match.group(2) or 0)
    minutes = float(match.group(3) or 0)
    seconds = float(match.group(4) or 0)
    
    return days * 86400 + hours * 3600 + minutes * 60 + seconds

def classify_activity(row):
    """
    Returns (Category, Activity_Type)
    Category: Specific bucket (e.g., 'Coding', 'Anime', 'Social')
    Activity_Type: High-level bucket (Productive, Entertainment, Neutral, Sleep, Social, Education, Life)
    """
    project = str(row.get('Project', '') or '')
    app = str(row.get('Application', '') or '')
    title = str(row.get('Title', '') or '')
    path = str(row.get('Path', '') or '')
    
    # Normalization
    project_lower = project.lower()
    title_lower = title.lower()
    app_lower = app.lower()
    path_lower = path.lower()

    # 1. Sleep
    if project == 'Sleep':
        return 'Sleep', 'Sleep'
    
    # 2. Education (University)
    if 'canvas.asu.edu' in path_lower or 'phy 113' in title_lower or 'gradebook' in title_lower:
        return 'University', 'Education'
    
    if project == 'Education & Research':
        return 'Research', 'Education'

    # 3. Development / Coding (High Priority)
    if app in ['Code', 'VS Code', 'Terminal', 'iTerm2', 'Xcode', 'Android Studio']:
        return 'Coding', 'Productive'
    
    if 'github.com' in path_lower or 'stackoverflow.com' in path_lower or 'localhost' in path_lower or '127.0.0.1' in path_lower:
        return 'Coding', 'Productive'
        
    if 'kaggle.com' in path_lower or 'colab.research.google.com' in path_lower:
        return 'Data Science', 'Productive'

    if 'crontab.guru' in path_lower or 'jsonlint' in path_lower:
        return 'Dev Tools', 'Productive'

    # 4. AI Assistance (Productive)
    if 'claude.ai' in path_lower or 'chatgpt.com' in path_lower or 'gemini.google.com' in path_lower:
        return 'AI Tools', 'Productive'

    # 5. Planning & Organization
    if 'notion' in app_lower or 'calendar' in title_lower or 'keep.google.com' in path_lower or 'dayone.me' in path_lower:
        return 'Planning/Journaling', 'Productive'

    # 6. Job / Career
    if 'linkedin.com' in path_lower or 'explosion.fun' in path_lower or 'block.xyz' in path_lower or 'career' in title_lower:
        return 'Career', 'Productive'

    # 7. Entertainment (Distraction)
    if 'hianime.to' in path_lower or 'anime' in title_lower or 'crunchyroll' in path_lower:
        return 'Anime', 'Entertainment'
    
    if 'youtube.com' in path_lower or 'netflix.com' in path_lower or 'twitch.tv' in path_lower:
        # Check if educational youtube? Hard to say, default to Entertainment for "Tough Love"
        if 'lecture' in title_lower or 'tutorial' in title_lower:
            return 'Learning Video', 'Education'
        return 'YouTube', 'Entertainment'
        
    if 'reddit.com' in path_lower or 'twitter.com' in path_lower or 'x.com' in path_lower or 'instagram.com' in path_lower:
        return 'Social Media', 'Entertainment'
        
    if app in ['Spotify', 'Music']:
        return 'Music', 'Entertainment' # Or Neutral? Usually background.
        
    # 8. Social (Real Life)
    if project in ['Friends and Family', 'Communication', 'Social']:
        return 'Socializing', 'Social'
    
    if app in ['WhatsApp', 'Telegram', 'Signal', 'Messages', 'Discord', 'Slack', 'Zoom']:
        if 'zoom' in app_lower and ('class' in title_lower or 'meet' in title_lower):
            return 'Class/Meeting', 'Education'
        return 'Messaging', 'Social'

    # 9. Life Maintenance
    if project in ['Cooking', 'Bathroom', 'General Maintenance', 'Shopping & Travel', 'Weight Training', 'Gym']:
        return 'Life Maintenance', 'Life'

    # 10. Fallback
    if project == 'Development': # If not caught by app rules
        return 'Development', 'Productive'
        
    if project == 'Web Browsing':
        # Unclassified browsing
        return 'Web Browsing (Misc)', 'Neutral'

    return project, 'Neutral'


def main():
    print("Loading data from Excel...")
    try:
        df = pd.read_excel('All Activities.xlsx')
        print(f"Loaded {len(df)} rows.")
    except Exception as e:
        print(f"Error loading Excel: {e}")
        return

    # Write merged activities to a separate file. Analysis below still uses the raw df.
    try:
        from merge_activities import write_merged_file

        m, out = write_merged_file('All Activities.xlsx')
        print(f"Wrote 'Merged Activities.xlsx' ({len(m)} rows). Original untouched.")
    except Exception as e:
        print(f"Warning: could not write merged file: {e}")

    # Process Durations (Assuming timedelta object if read from Excel correctly)
    print("Processing durations...")
    if pd.api.types.is_timedelta64_dtype(df['Duration']):
        df['Seconds'] = df['Duration'].dt.total_seconds()
        print(f"Duration is timedelta64. Total seconds sum: {df['Seconds'].sum()}")
    else:
        # Fallback to string parsing if needed
        print("Duration is NOT timedelta64. Attempting parse.")
        df['Seconds'] = df['Duration'].astype(str).apply(parse_iso_duration)
        print(f"Parsed total seconds sum: {df['Seconds'].sum()}")

    # Ensure Start Date is datetime
    df['Start_DT'] = pd.to_datetime(df['Start Date'], errors='coerce')
    print(f"Start_DT valid count: {df['Start_DT'].notna().sum()}")
    print(f"Date range: {df['Start_DT'].min()} to {df['Start_DT'].max()}")
    
    df['Day'] = df['Start_DT'].dt.floor('D') # Extract Day

    
    # Classify
    print("Classifying activities...")
    df[['Category', 'Activity_Type']] = df.apply(lambda row: pd.Series(classify_activity(row)), axis=1)
    
    # Aggregate Metrics
    total_seconds = df['Seconds'].sum()
    unique_days = df['Day'].nunique()
    
    # Activity Type Breakdown
    type_breakdown = df.groupby('Activity_Type')['Seconds'].sum().to_dict()
    
    # Category Breakdown
    category_breakdown = df.groupby('Category')['Seconds'].sum().sort_values(ascending=False).to_dict()
    
    # App Breakdown
    app_breakdown = df.groupby('Application')['Seconds'].sum().sort_values(ascending=False).head(20).to_dict()
    
    # Top Distractions (Entertainment items)
    distractions = df[df['Activity_Type'] == 'Entertainment'].groupby('Title')['Seconds'].sum().sort_values(ascending=False).head(20).to_dict()
    
    # Top Productive (Productive items)
    productive_items = df[df['Activity_Type'] == 'Productive'].groupby('Title')['Seconds'].sum().sort_values(ascending=False).head(20).to_dict()
    
    # Hourly Heatmap Data
    # Parse Start Date
    df['Start_DT'] = pd.to_datetime(df['Start Date'], errors='coerce')
    df['Hour'] = df['Start_DT'].dt.hour
    
    # Normalize by day count for "Avg Minutes per Hour"
    # Group by Activity_Type and Hour
    hourly_groups = df.groupby(['Activity_Type', 'Hour'])['Seconds'].sum()
    
    # Structure: { Type: { Hour: AvgMinutes } }
    hourly_distribution = {}
    all_types = df['Activity_Type'].unique()
    
    for t in all_types:
        hourly_distribution[t] = {}
        for h in range(24):
            # Sum seconds for this type at this hour across ALL days
            total_sec = hourly_groups.get((t, float(h)), 0)
            # Average minutes per day
            avg_min = (total_sec / 60) / unique_days
            hourly_distribution[t][h] = round(avg_min, 1)

    # Focus Stats (Consecutive blocks)
    # Simple heuristic: Sort by Start Date, look for streaks of same Type
    df_sorted = df.sort_values('Start_DT')
    df_sorted['Prev_Type'] = df_sorted['Activity_Type'].shift(1)
    df_sorted['New_Session'] = df_sorted['Activity_Type'] != df_sorted['Prev_Type']
    df_sorted['Session_ID'] = df_sorted['New_Session'].cumsum()
    
    sessions = df_sorted.groupby(['Session_ID', 'Activity_Type'])['Seconds'].sum()
    
    focus_stats = {}
    for t in ['Productive', 'Entertainment', 'Education']:
        type_sessions = sessions[sessions.index.get_level_values('Activity_Type') == t]
        if not type_sessions.empty:
            focus_stats[t.lower()] = {
                'count': int(len(type_sessions)),
                'avg_duration_min': float(type_sessions.mean() / 60),
                'median_duration_min': float(type_sessions.median() / 60),
                'max_duration_min': float(type_sessions.max() / 60)
            }
        else:
            focus_stats[t.lower()] = {'count': 0, 'avg_duration_min': 0}

    # Context Switching
    # Count application changes per hour
    # Filter out very short durations (noise) < 10s?
    df_clean = df_sorted[df_sorted['Seconds'] > 5].copy()
    df_clean['Prev_App'] = df_clean['Application'].shift(1)
    df_clean['Switch'] = (df_clean['Application'] != df_clean['Prev_App']) & df_clean['Application'].notna() & df_clean['Prev_App'].notna()
    
    switches_by_hour = df_clean.groupby('Hour')['Switch'].sum()
    # Normalize by number of days
    context_switching = (switches_by_hour / unique_days).to_dict()

    output = {
        "total_seconds": total_seconds,
        "total_days": unique_days,
        "date_range": {
            "start": df_sorted['Start_DT'].min().strftime('%Y-%m-%d'),
            "end": df_sorted['Start_DT'].max().strftime('%Y-%m-%d')
        },
        "daily_avg_hours": (total_seconds / 3600) / unique_days,
        "project_breakdown": category_breakdown, # Using new categories as "Projects"
        "activity_type_breakdown": type_breakdown,
        "app_breakdown": app_breakdown,
        "top_distractions": distractions,
        "top_productive": productive_items,
        "hourly_distribution": hourly_distribution,
        "focus_stats": focus_stats,
        "context_switching": context_switching
    }
    
    with open('analysis.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print("Analysis complete. Saved to analysis.json")

if __name__ == "__main__":
    main()
