const DISTRACTION_DOMAINS = new Set([
  'youtube.com', 'reddit.com', 'twitter.com', 'x.com', 'instagram.com',
  'facebook.com', 'tiktok.com', 'netflix.com', 'twitch.tv', 'hianime.to',
  'crunchyroll.com', 'funimation.com', '9anime.to', 'discord.com',
  'snapchat.com', 'pinterest.com', 'tumblr.com', 'buzzfeed.com',
]);

function extractDomain(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function estimateDurations(entries) {
  const sorted = [...entries].sort((a, b) => a.visitedAt - b.visitedAt);

  for (let i = 0; i < sorted.length; i++) {
    if (i < sorted.length - 1) {
      const gap = (sorted[i + 1].visitedAt - sorted[i].visitedAt) / 1000;
      sorted[i].durationSeconds = Math.min(gap, 1800);
    } else {
      sorted[i].durationSeconds = 60;
    }
  }

  return sorted;
}

export function parseChromeHistory(jsonData) {
  const entries = [];
  const historyArray = jsonData['Browser History'] || jsonData;

  if (!Array.isArray(historyArray)) return entries;

  for (const item of historyArray) {
    const url = item.url || item.titleUrl;
    const title = item.title || '';
    let visitedAt;

    if (item.time_usec) {
      visitedAt = new Date(item.time_usec / 1000);
    } else if (item.time) {
      visitedAt = new Date(item.time);
    } else {
      continue;
    }

    if (isNaN(visitedAt.getTime())) continue;

    const domain = extractDomain(url);
    if (!domain) continue;

    entries.push({
      url,
      domain,
      title,
      visitedAt,
      durationSeconds: 0,
    });
  }

  return estimateDurations(entries);
}

export function parseMyActivity(jsonData) {
  const entries = [];
  const items = Array.isArray(jsonData) ? jsonData : [];

  for (const item of items) {
    const url = item.titleUrl;
    const title = (item.title || '').replace(/^Visited\s+/i, '');
    const time = item.time;

    if (!url || !time) continue;

    const visitedAt = new Date(time);
    if (isNaN(visitedAt.getTime())) continue;

    const domain = extractDomain(url);
    if (!domain) continue;

    entries.push({
      url,
      domain,
      title,
      visitedAt,
      durationSeconds: 0,
    });
  }

  return estimateDurations(entries);
}

export function detectFormat(jsonData) {
  if (jsonData['Browser History']) return 'chrome-history';
  if (Array.isArray(jsonData) && jsonData[0]?.titleUrl) return 'my-activity';
  if (Array.isArray(jsonData) && jsonData[0]?.url) return 'chrome-history';
  return 'unknown';
}

export function parseAutoDetect(jsonData) {
  const format = detectFormat(jsonData);
  switch (format) {
    case 'chrome-history':
      return parseChromeHistory(jsonData);
    case 'my-activity':
      return parseMyActivity(jsonData);
    default:
      throw new Error('Unrecognized Google Takeout format. Please upload Chrome History or My Activity JSON.');
  }
}

export function categorizeEntries(entries, goals) {
  const goalMatchers = goals.map(goal => ({
    id: goal.id,
    domains: (goal.domains || []).map(d => d.toLowerCase()),
    keywords: (goal.keywords || []).map(k => k.toLowerCase()),
  }));

  return entries.map(entry => {
    const domain = entry.domain.toLowerCase();
    const title = entry.title.toLowerCase();

    for (const matcher of goalMatchers) {
      const domainMatch = matcher.domains.some(d => domain.includes(d));
      const keywordMatch = matcher.keywords.some(k =>
        title.includes(k) || domain.includes(k)
      );

      if (domainMatch || keywordMatch) {
        return { ...entry, isGoalAligned: true, matchedGoalId: matcher.id };
      }
    }

    return {
      ...entry,
      isGoalAligned: false,
      matchedGoalId: null,
      isDistraction: DISTRACTION_DOMAINS.has(domain),
    };
  });
}

export function aggregateByDay(categorizedEntries) {
  const days = {};

  for (const entry of categorizedEntries) {
    const dateStr = entry.visitedAt.toISOString().split('T')[0];
    if (!days[dateStr]) {
      days[dateStr] = {
        date: dateStr,
        goalTime: 0,
        distractionTime: 0,
        totalSessions: 0,
        goalSessions: [],
        allSessions: [],
      };
    }

    const day = days[dateStr];
    day.totalSessions++;

    if (entry.isGoalAligned) {
      day.goalTime += entry.durationSeconds;
    } else {
      day.distractionTime += entry.durationSeconds;
    }

    day.allSessions.push(entry);
    if (entry.isGoalAligned) day.goalSessions.push(entry);
  }

  return Object.values(days).sort((a, b) => a.date.localeCompare(b.date));
}
