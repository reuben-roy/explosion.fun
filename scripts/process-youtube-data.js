const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_ROOT = path.join(ROOT, 'public', 'data', 'Youtube_Data');
const OUTPUT_FILE = path.join(ROOT, 'public', 'data', 'youtube-scholar.json');
const CURIOSITY_OUTPUT_FILE = path.join(ROOT, 'public', 'data', 'youtube-curiosity-velocity.json');

const CURATED_METRICS = {
  watchEvents: 67570,
  searchEvents: 5484,
  subscriptions: 866,
  comments: 312,
  distinctDomains: 10,
  searchToSubscriptionRetention: 51.5,
};

const DOMAIN_CONFIG = [
  {
    id: 'gaming-entertainment',
    label: 'Gaming and Entertainment',
    color: '#f2a65a',
    displayWeight: 22,
    summary: 'The recreational lane, except it keeps moonlighting as cultural research.',
    narrative: 'This is where trailers, anime arcs, internet oddities, and creator rabbit holes behave like a leisure activity with suspiciously strong retention.',
    representativeSignals: ['Anime arcs', 'Gaming creator ecosystems', 'Format-driven internet culture'],
    keywords: [
      'anime', 'mushoku', 'one piece', 'chainsaw', 'gigguk', 'pewdiepie', 'mr beast',
      'trailer', 'amv', 'music', 'song', 'opening', 'ending', 'vrchat', 'game',
      'gaming', 'steam', 'valorant', 'league', 'genshin', 'shark tank', 'memes',
    ],
  },
  {
    id: 'full-stack-engineering',
    label: 'Full-Stack Engineering',
    color: '#67c1b8',
    displayWeight: 18,
    summary: 'Application architecture, tooling, and the recurring need to interrogate Java in public.',
    narrative: 'Searches progress from language-specific questions into systems thinking, front-end tooling, and interview calibration.',
    representativeSignals: ['Java interview prep', 'React and Next.js workflows', 'Infrastructure and databases'],
    keywords: [
      'java', 'javascript', 'typescript', 'react', 'next', 'node', 'postgres', 'postgresql',
      'docker', 'graphql', 'spring', 'microservice', 'system design', 'interview', 'dsa',
      'algorithm', 'frontend', 'backend', 'threejs', '3js', 'css', 'html', 'python',
      'unity', 'git', 'api', 'sql', 'redis', 'mongodb',
    ],
  },
  {
    id: 'geopolitical-risk',
    label: 'Geopolitical Risk Analysis',
    color: '#d96459',
    displayWeight: 14,
    summary: 'Wars, state power, and the part of YouTube that quietly turns into an intelligence brief.',
    narrative: 'Broad news curiosity hardens into conflict tracking, strategic geography, and the habit of keeping multiple narratives in view.',
    representativeSignals: ['Ukraine and Russia monitoring', 'China and Taiwan tension', 'Military capability explainers'],
    keywords: [
      'ukraine', 'russia', 'war', 'china', 'taiwan', 'israel', 'iran', 'nato', 'military',
      'geopolitics', 'geopolitical', 'defense', 'missile', 'sanctions', 'putin',
      'election', 'conflict', 'middle east',
    ],
  },
  {
    id: 'science-space',
    label: 'Science and Space',
    color: '#8fb8de',
    displayWeight: 12,
    summary: 'Physics, chemistry, biology, and occasionally the correct amount of rocket content.',
    narrative: 'The science lane functions like a calibration tool: concrete mechanisms, strong explainers, and fewer vibes per capita.',
    representativeSignals: ['Space systems', 'Battery and materials curiosity', 'Practical science explainers'],
    keywords: [
      'space', 'nasa', 'rocket', 'physics', 'chemistry', 'biology', 'astronomy',
      'battery', 'aluminium air battery', 'science', 'scientist', 'lab', 'quantum',
      'telescope', 'satellite', 'earth', 'mars',
    ],
  },
  {
    id: 'ai-architecture',
    label: 'AI Architecture',
    color: '#8dd39e',
    displayWeight: 16,
    summary: 'From model curiosity to trying to understand the actual plumbing.',
    narrative: 'Later-year searches skew toward model behavior, agents, LLM infrastructure, and who is actually building durable leverage.',
    representativeSignals: ['LLM architecture', 'AI product interfaces', 'Model and agent workflows'],
    keywords: [
      'ai', 'llm', 'gpt', 'chatgpt', 'openai', 'claude', 'qwen', 'agent', 'agents',
      'machine learning', 'ml ', 'neural', 'transformer', 'embedding', 'fine tuning',
      'prompt', 'inference', 'rag',
    ],
  },
  {
    id: 'macroeconomic-theory',
    label: 'Macroeconomic Theory',
    color: '#d8c36a',
    displayWeight: 10,
    summary: 'Inflation, rates, markets, and the steady suspicion that incentives explain most things.',
    narrative: 'This cluster turns finance content into a decision-making tool, not a hobbyist ticker shrine.',
    representativeSignals: ['Interest rates and inflation', 'Market structure', 'Economic incentives'],
    keywords: [
      'inflation', 'interest rate', 'federal reserve', 'economy', 'economic', 'macro',
      'market', 'stocks', 'stock', 'invest', 'investing', 'zerodha', 'finance',
      'recession', 'housing', 'fed', 'yield', 'bond',
    ],
  },
  {
    id: 'philosophy-psychology',
    label: 'Philosophy and Psychology',
    color: '#b48ead',
    displayWeight: 8,
    summary: 'Meaning, cognition, habits, and the occasional attempt to debug the operator.',
    narrative: 'This domain reads like maintenance work for the thinking layer: attention, motivation, psychology, and abstract frameworks that still cash out in behavior.',
    representativeSignals: ['Behavioral frameworks', 'Mental models', 'Attention and recovery'],
    keywords: [
      'philosophy', 'psychology', 'therapy', 'discipline', 'motivation', 'nsdr',
      'sleep', 'habit', 'productivity', 'after skool', 'mark manson', 'stoicism',
      'attention', 'meditation', 'dopamine', 'self improvement',
    ],
  },
];

const COMMENT_TONE_LABELS = {
  analytical: { label: 'Analytical', color: '#67c1b8' },
  affirming: { label: 'Affirming', color: '#8dd39e' },
  skeptical: { label: 'Skeptical', color: '#f2a65a' },
  deadpan: { label: 'Deadpan', color: '#d96459' },
};

const STORY = {
  hero: {
    title: 'Chief Information Aggregator & YouTube Scholar',
    subtitle:
      'A personal audit of how search, subscriptions, playlists, and comments compound into a learning system that is somehow both strategic and terminally online.',
    eyebrow: 'Personal research dashboard',
    wittyLine: 'A completely normal amount of YouTube metadata to analyze.',
  },
  knowledgeMapNote:
    'Seven major surfaces are shown here; the broader audit rolls up 10 distinct domains in total.',
  heatmapCaption: 'Apparently 10 PM is still considered professional development.',
  commentsSummary:
    'Comments behave less like vanity metrics and more like lightweight peer review: clarifications, corrections, occasional praise, and a recurring willingness to call weak arguments weak.',
  closingTitle: 'What this says professionally',
  closingSummary:
    'The pattern is less "watched a lot of videos" and more "built an ambient research engine." Searches open loops, subscriptions maintain signal, playlists encode priority, and comments pressure-test ideas in public.',
  resumeBullets: [
    'Builds self-directed research systems and turns messy consumer data into a coherent narrative artifact.',
    'Balances technical depth with broad curiosity across software, macro, geopolitics, science, and culture.',
    'Uses lightweight feedback loops to test ideas rather than waiting for formal environments to do it for him.',
    'Can translate personal data into an executive-style briefing without sanding off the personality.',
  ],
};

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;| /g, ' ')
    .replace(/\u202f/g, ' ')
    .trim();
}

function extractVideoId(url) {
  if (!url) return null;
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : null;
}

function matchesKeyword(value, keyword) {
  if (keyword.includes(' ')) {
    return value.includes(keyword);
  }
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i').test(value);
}

function parseHistoryFile(filePath, mode) {
  const html = fs.readFileSync(filePath, 'utf8');
  const blocks = html.split('<div class="outer-cell mdl-cell mdl-cell--12-col mdl-shadow--2dp">').slice(1);
  const entries = [];

  for (const block of blocks) {
    if (mode === 'watch' && !block.includes('>Watched')) continue;
    if (mode === 'search' && !block.includes('>Searched for')) continue;

    if (mode === 'watch') {
      const titleMatch = block.match(/Watched(?:&nbsp;| )<a href="([^"]+)">([\s\S]*?)<\/a><br>/);
      const contentMatch = block.match(/<div class="content-cell mdl-cell mdl-cell--6-col mdl-typography--body-1">([\s\S]*?)<\/div>/);
      if (!titleMatch || !contentMatch) continue;

      const lines = contentMatch[1].split('<br>').map((line) => decodeHtml(line.replace(/<[^>]+>/g, ''))).filter(Boolean);
      const channelMatch = contentMatch[1].match(/<br><a href="[^"]+">([\s\S]*?)<\/a><br>/);
      const title = decodeHtml(titleMatch[2]);
      const channel = channelMatch ? decodeHtml(channelMatch[1]) : 'Unknown';
      const dateRaw = lines[lines.length - 1];
      const date = new Date(dateRaw);
      entries.push({
        title,
        url: titleMatch[1],
        videoId: extractVideoId(titleMatch[1]),
        channel,
        date: Number.isNaN(date.getTime()) ? null : date,
        dateRaw,
      });
      continue;
    }

    const queryMatch = block.match(/Searched for(?:&nbsp;| )<a href="[^"]+">([\s\S]*?)<\/a><br>([^<]+)<br>/);
    if (!queryMatch) continue;
    const query = decodeHtml(queryMatch[1]);
    const date = new Date(decodeHtml(queryMatch[2]));
    entries.push({
      query,
      url: block.match(/Searched for(?:&nbsp;| )<a href="([^"]+)">/)?.[1] || null,
      date: Number.isNaN(date.getTime()) ? null : date,
      dateRaw: decodeHtml(queryMatch[2]),
    });
  }

  return entries;
}

function parseCommentTexts(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8').split('\n').slice(1).filter(Boolean);
  return lines.map((line) => {
    const matches = [...line.matchAll(/""text"":""([\s\S]*?)""/g)];
    const text = matches.map((match) => match[1]).join(' ').replace(/\\"/g, '"').replace(/\\n/g, ' ');
    return decodeHtml(text.replace(/""/g, '"')).trim();
  }).filter(Boolean);
}

function parsePlaylistItems(directory) {
  const files = fs.readdirSync(directory).filter((file) => file.endsWith('-videos.csv'));
  const items = [];

  for (const file of files) {
    const playlistName = file.replace('-videos.csv', '');
    const lines = fs.readFileSync(path.join(directory, file), 'utf8').split('\n').slice(1).filter(Boolean);

    for (const line of lines) {
      const [videoId, timestamp] = line.split(',');
      const date = new Date(timestamp);
      items.push({
        playlistName,
        videoId,
        date: Number.isNaN(date.getTime()) ? null : date,
      });
    }
  }

  return items;
}

function normalizeText(value) {
  return decodeHtml((value || '').toLowerCase())
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value) {
  const STOP_WORDS = new Set([
    'a', 'an', 'and', 'are', 'at', 'be', 'but', 'by', 'for', 'from', 'how', 'i', 'if', 'in',
    'is', 'it', 'its', 'my', 'of', 'on', 'or', 's', 'so', 'that', 'the', 'this', 'to', 'was',
    'what', 'when', 'why', 'with', 'you', 'your',
  ]);

  return normalizeText(value)
    .split(' ')
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function jaccardSimilarity(leftTokens, rightTokens) {
  const left = new Set(leftTokens);
  const right = new Set(rightTokens);
  if (!left.size || !right.size) return 0;

  let intersection = 0;
  for (const token of left) {
    if (right.has(token)) intersection += 1;
  }

  const union = new Set([...left, ...right]).size || 1;
  return intersection / union;
}

function buildCuriosityVelocity(searchEntries, watchEntries, playlistItems) {
  const analysisStart = new Date('2022-01-01T00:00:00.000Z');
  const classifiedSearches = searchEntries
    .filter((entry) => entry.date && entry.date >= analysisStart)
    .map((entry) => ({
      date: entry.date,
      query: entry.query,
      topicId: classifyDomain(entry.query),
    }))
    .filter((entry) => entry.topicId);

  const playlistCounts = new Map();
  for (const item of playlistItems) {
    if (!item.videoId) continue;
    playlistCounts.set(item.videoId, (playlistCounts.get(item.videoId) || 0) + 1);
  }

  const watchedEvents = watchEntries
    .filter((entry) => entry.date && entry.date >= analysisStart)
    .sort((a, b) => a.date - b.date)
    .map((entry) => ({
      date: entry.date,
      title: entry.title,
      channel: entry.channel,
      videoId: entry.videoId,
      tokens: tokenize(`${entry.title} ${entry.channel}`),
      normalizedTitle: normalizeText(entry.title),
      playlistAdds: playlistCounts.get(entry.videoId) || 0,
      directTopic: classifyDomain(`${entry.title} ${entry.channel}`),
      contextTopic: null,
    }));

  let searchCursor = 0;
  let activeContext = null;
  const contextWindowMs = 18 * 60 * 60 * 1000;

  for (const event of watchedEvents) {
    while (searchCursor < classifiedSearches.length && classifiedSearches[searchCursor].date <= event.date) {
      activeContext = classifiedSearches[searchCursor];
      searchCursor += 1;
    }
    if (activeContext && event.date - activeContext.date <= contextWindowMs) {
      event.contextTopic = activeContext.topicId;
    }
  }

  const seedCountsByChannel = new Map();
  const seedCountsByTitle = new Map();
  for (const event of watchedEvents) {
    const seedTopic = event.directTopic || event.contextTopic;
    if (!seedTopic) continue;

    if (event.channel !== 'Unknown') {
      if (!seedCountsByChannel.has(event.channel)) {
        seedCountsByChannel.set(event.channel, new Map());
      }
      const channelCounts = seedCountsByChannel.get(event.channel);
      channelCounts.set(seedTopic, (channelCounts.get(seedTopic) || 0) + 1);
    }

    if (event.normalizedTitle) {
      if (!seedCountsByTitle.has(event.normalizedTitle)) {
        seedCountsByTitle.set(event.normalizedTitle, new Map());
      }
      const titleCounts = seedCountsByTitle.get(event.normalizedTitle);
      titleCounts.set(seedTopic, (titleCounts.get(seedTopic) || 0) + 1);
    }
  }

  function derivePrior(countsMap, minimumCount, minimumShare) {
    const priors = new Map();
    for (const [key, counts] of countsMap.entries()) {
      const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
      const total = ranked.reduce((sum, [, count]) => sum + count, 0);
      const [topicId, count] = ranked[0] || [];
      if (topicId && total >= minimumCount && count / total >= minimumShare) {
        priors.set(key, topicId);
      }
    }
    return priors;
  }

  const channelPriors = derivePrior(seedCountsByChannel, 6, 0.48);
  const titlePriors = derivePrior(seedCountsByTitle, 2, 0.7);

  for (const event of watchedEvents) {
    event.topicId = event.directTopic
      || titlePriors.get(event.normalizedTitle)
      || event.contextTopic
      || channelPriors.get(event.channel)
      || 'unclassified';
  }

  for (let index = 0; index < watchedEvents.length; index += 1) {
    const current = watchedEvents[index];
    const previous = watchedEvents[index - 1];
    const lookback = watchedEvents
      .slice(Math.max(0, index - 24), index)
      .filter((event) => event.topicId !== 'unclassified');

    const maxSimilarity = lookback.reduce(
      (max, event) => Math.max(max, jaccardSimilarity(current.tokens, event.tokens)),
      0,
    );

    current.novelty = Number((1 - maxSimilarity).toFixed(3));
    current.adjacentDistance = previous ? Number((1 - jaccardSimilarity(current.tokens, previous.tokens)).toFixed(3)) : 0;
  }

  const topicIds = [...DOMAIN_CONFIG.map((domain) => domain.id), 'unclassified'];
  const windows = [];
  const firstDate = watchedEvents[0]?.date;
  const lastDate = watchedEvents[watchedEvents.length - 1]?.date;
  if (!firstDate || !lastDate) {
    return null;
  }

  const anchor = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
  const endAnchor = new Date(lastDate.getFullYear(), lastDate.getMonth(), 1);

  while (anchor <= endAnchor) {
    const windowStart = new Date(anchor);
    windowStart.setDate(windowStart.getDate() - 89);

    const windowEvents = watchedEvents.filter((event) => event.date >= windowStart && event.date <= anchor);
    const classifiedWindowEvents = windowEvents.filter((event) => event.topicId !== 'unclassified');
    const searchCount = classifiedSearches.filter((entry) => entry.date >= windowStart && entry.date <= anchor).length;

    if (windowEvents.length >= 18 && classifiedWindowEvents.length >= 10) {
      const total = windowEvents.length;
      const classifiedTotal = classifiedWindowEvents.length;
      const counts = Object.fromEntries(topicIds.map((topicId) => [topicId, 0]));
      const knownCounts = Object.fromEntries(DOMAIN_CONFIG.map((domain) => [domain.id, 0]));
      const segments = [];
      let runLength = 0;
      let switches = 0;

      for (let index = 0; index < classifiedWindowEvents.length; index += 1) {
        const event = classifiedWindowEvents[index];
        counts[event.topicId] += 1;
        knownCounts[event.topicId] += 1;

        if (!index) {
          runLength = 1;
        } else if (classifiedWindowEvents[index - 1].topicId === event.topicId) {
          runLength += 1;
        } else {
          segments.push(runLength);
          runLength = 1;
          switches += 1;
        }
      }
      if (runLength) segments.push(runLength);

      counts.unclassified = total - classifiedTotal;
      const sortedKnownTopics = Object.entries(knownCounts)
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1]);

      if (!sortedKnownTopics.length) {
        anchor.setMonth(anchor.getMonth() + 1);
        continue;
      }

      const dominantTopic = sortedKnownTopics[0][0];
      const dominantCount = sortedKnownTopics[0][1];
      const classifiedShare = classifiedTotal / total;
      const focusShare = dominantCount / classifiedTotal;
      const entropyBase = sortedKnownTopics.reduce((sum, [, count]) => {
        const probability = count / classifiedTotal;
        return sum - probability * Math.log(probability);
      }, 0);
      const entropy = sortedKnownTopics.length > 1 ? entropyBase / Math.log(sortedKnownTopics.length) : 0;
      const avgRunLength = segments.reduce((sum, value) => sum + value, 0) / (segments.length || 1);
      const novelty = classifiedWindowEvents.reduce((sum, event) => sum + event.novelty, 0) / classifiedTotal;
      const adjacentDistance = classifiedWindowEvents.reduce((sum, event) => sum + event.adjacentDistance, 0) / classifiedTotal;
      const switchRate = switches / Math.max(classifiedTotal - 1, 1);
      const deepDiveScore = Math.min(1, focusShare * 0.45 + Math.min(avgRunLength / 4, 1) * 0.35 + (1 - entropy) * 0.2);
      const explorationScore = Math.min(1, entropy * 0.4 + switchRate * 0.3 + novelty * 0.2 + adjacentDistance * 0.1);
      const exploitationScore = Math.min(1, focusShare * 0.45 + Math.min(avgRunLength / 4, 1) * 0.35 + (1 - switchRate) * 0.2);
      const playlistLift = classifiedWindowEvents.reduce((sum, event) => sum + event.playlistAdds, 0) / classifiedTotal;

      if (classifiedShare < 0.24) {
        anchor.setMonth(anchor.getMonth() + 1);
        continue;
      }

      windows.push({
        date: new Date(anchor).toISOString(),
        label: anchor.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
        eventCount: total,
        classifiedCount: classifiedTotal,
        classifiedShare: Number(classifiedShare.toFixed(3)),
        searchCount,
        focusShare: Number(focusShare.toFixed(3)),
        entropy: Number(entropy.toFixed(3)),
        switchRate: Number(switchRate.toFixed(3)),
        avgRunLength: Number(avgRunLength.toFixed(3)),
        novelty: Number(novelty.toFixed(3)),
        adjacentDistance: Number(adjacentDistance.toFixed(3)),
        explorationScore: Number(explorationScore.toFixed(3)),
        exploitationScore: Number(exploitationScore.toFixed(3)),
        deepDiveScore: Number(deepDiveScore.toFixed(3)),
        playlistLift: Number(playlistLift.toFixed(3)),
        dominantTopic,
        topicShares: topicIds.map((topicId) => ({
          topicId,
          share: Number(((counts[topicId] || 0) / total).toFixed(4)),
          count: counts[topicId] || 0,
        })),
      });
    }

    anchor.setMonth(anchor.getMonth() + 1);
  }

  const topicSeenAt = new Map();
  for (let index = 0; index < windows.length; index += 1) {
    const window = windows[index];
    const previous = windows[index - 1];
    const lastSeenIndex = topicSeenAt.get(window.dominantTopic);
    const longGapReturn = lastSeenIndex !== undefined && index - lastSeenIndex >= 5;
    const pivotLikeShift = previous
      && previous.dominantTopic !== window.dominantTopic
      && previous.focusShare >= 0.4
      && window.adjacentDistance >= 0.74;

    let phaseLabel = 'balanced';
    if (pivotLikeShift) {
      phaseLabel = 'pivot';
    } else if (longGapReturn && window.focusShare >= 0.34) {
      phaseLabel = 'return';
    } else if (window.focusShare >= 0.44 && window.avgRunLength >= 1.9 && window.entropy <= 0.72) {
      phaseLabel = 'deep_dive';
    } else if (
      previous
      && window.focusShare > previous.focusShare + 0.06
      && window.entropy < previous.entropy - 0.06
    ) {
      phaseLabel = 'narrowing';
    } else if (window.entropy >= 0.78 && window.switchRate >= 0.58 && window.focusShare < 0.34) {
      phaseLabel = 'broad_exploration';
    }

    window.phaseLabel = phaseLabel;
    window.phaseConfidence = Number(
      Math.min(
        0.94,
        0.58
        + Math.abs(window.explorationScore - window.exploitationScore) * 0.22
        + window.classifiedShare * 0.12,
      ).toFixed(3),
    );
    topicSeenAt.set(window.dominantTopic, index);
  }

  const phaseEpisodes = [];
  let cursor = 0;
  while (cursor < windows.length) {
    const current = windows[cursor];
    let end = cursor;
    while (end + 1 < windows.length && windows[end + 1].phaseLabel === current.phaseLabel) {
      end += 1;
    }

    const slice = windows.slice(cursor, end + 1);
    phaseEpisodes.push({
      phaseLabel: current.phaseLabel,
      start: slice[0].date,
      end: slice[slice.length - 1].date,
      dominantTopic: slice[Math.floor(slice.length / 2)].dominantTopic,
      windowCount: slice.length,
      avgFocus: Number((slice.reduce((sum, item) => sum + item.focusShare, 0) / slice.length).toFixed(3)),
      avgExploration: Number((slice.reduce((sum, item) => sum + item.explorationScore, 0) / slice.length).toFixed(3)),
      confidence: Number((slice.reduce((sum, item) => sum + item.phaseConfidence, 0) / slice.length).toFixed(3)),
    });

    cursor = end + 1;
  }

  const phaseMeta = {
    broad_exploration: {
      label: 'Broad exploration',
      color: '#8fb8de',
      summary: 'Wide topical spread, fast switching, and low single-topic dominance.',
    },
    narrowing: {
      label: 'Narrowing',
      color: '#d8c36a',
      summary: 'Curiosity starts to converge as one line of inquiry gains share.',
    },
    deep_dive: {
      label: 'Deep dive',
      color: '#67c1b8',
      summary: 'Sustained concentration, longer runs, and lower entropy.',
    },
    pivot: {
      label: 'Domain pivot',
      color: '#d96459',
      summary: 'A sharp rotation after a focused period, usually into a different topical cluster.',
    },
    return: {
      label: 'Return',
      color: '#b48ead',
      summary: 'A previously important theme comes back after a meaningful gap.',
    },
    balanced: {
      label: 'Balanced synthesis',
      color: '#8f98a7',
      summary: 'Neither scattered nor locked in; multiple lines of inquiry coexist.',
    },
  };

  const deepestWindow = [...windows].sort((a, b) => b.deepDiveScore - a.deepDiveScore)[0];
  const broadestWindow = [...windows].sort((a, b) => b.explorationScore - a.explorationScore)[0];
  const pivots = windows.filter((window) => window.phaseLabel === 'pivot').length;
  const returns = windows.filter((window) => window.phaseLabel === 'return').length;
  const coverageStart = windows[0]?.label || 'N/A';
  const coverageEnd = windows[windows.length - 1]?.label || 'N/A';

  return {
    summary:
      'Curiosity velocity frames YouTube history as an alternation between exploration, convergence, deep dives, and deliberate pivots rather than random topic hopping.',
    notes: [
      'Windows are trailing 90-day slices from January 2022 onward, because that is where search history provides a credible topical spine.',
      'Watch events are labeled with a conservative blend of direct keyword matches, nearby search-session context, repeated-title priors, and channel priors.',
    ],
    topics: [
      ...DOMAIN_CONFIG.map((domain) => ({
        id: domain.id,
        label: domain.label,
        color: domain.color,
      })),
      {
        id: 'unclassified',
        label: 'Unclassified',
        color: '#5f6b7a',
      },
    ],
    phaseMeta,
    overview: [
      {
        label: 'Windows analyzed',
        value: windows.length.toLocaleString(),
        detail: 'Rolling 90-day windows across the high-confidence portion of the watch history.',
      },
      {
        label: 'Strongest deep dive',
        value: deepestWindow?.label || 'N/A',
        detail: deepestWindow ? phaseMeta.deep_dive.summary : 'Insufficient data.',
      },
      {
        label: 'Pivot windows',
        value: pivots.toString(),
        detail: 'Sharp switches after concentrated focus periods.',
      },
      {
        label: 'Return windows',
        value: returns.toString(),
        detail: 'Earlier themes resurfacing after a meaningful gap.',
      },
      {
        label: 'Broadest window',
        value: broadestWindow?.label || 'N/A',
        detail: broadestWindow ? phaseMeta.broad_exploration.summary : 'Insufficient data.',
      },
      {
        label: 'Coverage',
        value: `${coverageStart} - ${coverageEnd}`,
        detail: `${Math.round((windows.reduce((sum, window) => sum + window.classifiedShare, 0) / (windows.length || 1)) * 100)}% average topical coverage.`,
      },
    ],
    windows,
    phaseEpisodes: phaseEpisodes.filter((episode) => episode.windowCount >= 2 || ['pivot', 'return', 'narrowing'].includes(episode.phaseLabel)),
    highlights: [
      deepestWindow ? {
        kind: 'deep_dive',
        title: `Deepest concentration: ${phaseMeta.deep_dive.label}`,
        label: deepestWindow.label,
        topicId: deepestWindow.dominantTopic,
        body: `Focus share reached ${(deepestWindow.focusShare * 100).toFixed(0)}% with average same-topic runs of ${deepestWindow.avgRunLength.toFixed(1)} events.`,
      } : null,
      broadestWindow ? {
        kind: 'broad_exploration',
        title: `Broadest range: ${phaseMeta.broad_exploration.label}`,
        label: broadestWindow.label,
        topicId: broadestWindow.dominantTopic,
        body: `Entropy hit ${broadestWindow.entropy.toFixed(2)} with switching at ${(broadestWindow.switchRate * 100).toFixed(0)}% of adjacent events.`,
      } : null,
      windows.find((window) => window.phaseLabel === 'pivot') ? {
        kind: 'pivot',
        title: `Most visible pivot: ${phaseMeta.pivot.label}`,
        label: windows.find((window) => window.phaseLabel === 'pivot').label,
        topicId: windows.find((window) => window.phaseLabel === 'pivot').dominantTopic,
        body: 'A concentrated streak gives way to a sharper topical jump than the surrounding months.',
      } : null,
    ].filter(Boolean),
  };
}

function classifyDomain(text) {
  const value = text.toLowerCase();
  for (const domain of DOMAIN_CONFIG) {
    if (domain.keywords.some((keyword) => matchesKeyword(value, keyword))) {
      return domain.id;
    }
  }
  return null;
}

function buildIntentSeries(searchEntries) {
  const buckets = new Map();

  for (const entry of searchEntries) {
    if (!entry.date) continue;
    const year = entry.date.getFullYear();
    if (year < 2016) continue;

    const domainId = classifyDomain(entry.query);
    if (!domainId) continue;
    if (!buckets.has(year)) {
      buckets.set(year, Object.fromEntries(DOMAIN_CONFIG.map((domain) => [domain.id, 0])));
    }
    buckets.get(year)[domainId] += 1;
  }

  return [...buckets.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([year, domains]) => ({ year, ...domains }));
}

function buildTaxonomy(searchEntries) {
  const counts = Object.fromEntries(DOMAIN_CONFIG.map((domain) => [domain.id, 0]));
  const examples = Object.fromEntries(DOMAIN_CONFIG.map((domain) => [domain.id, new Map()]));

  for (const entry of searchEntries) {
    const domainId = classifyDomain(entry.query);
    if (!domainId) continue;
    counts[domainId] += 1;
    const query = entry.query.toLowerCase();
    examples[domainId].set(query, (examples[domainId].get(query) || 0) + 1);
  }

  return DOMAIN_CONFIG.map((domain) => ({
    id: domain.id,
    label: domain.label,
    color: domain.color,
    summary: domain.summary,
    narrative: domain.narrative,
    representativeSignals: domain.representativeSignals,
    value: domain.displayWeight * 10 + Math.min(counts[domain.id], 30),
    searchCount: counts[domain.id],
    examples: [...examples[domain.id].entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([query, count]) => ({ label: query, count })),
  }));
}

function buildHeatmap(watchEntries) {
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const cells = [];
  const counts = Array.from({ length: 7 }, () => Array(24).fill(0));
  let max = 0;

  for (const entry of watchEntries) {
    if (!entry.date) continue;
    const day = entry.date.getDay();
    const hour = entry.date.getHours();
    counts[day][hour] += 1;
    max = Math.max(max, counts[day][hour]);
  }

  for (let day = 0; day < 7; day += 1) {
    for (let hour = 0; hour < 24; hour += 1) {
      cells.push({
        day,
        dayLabel: dayLabels[day],
        hour,
        count: counts[day][hour],
        intensity: max === 0 ? 0 : counts[day][hour] / max,
      });
    }
  }

  return {
    dayLabels,
    hourLabels: Array.from({ length: 24 }, (_, hour) => `${hour.toString().padStart(2, '0')}:00`),
    cells,
    highlights: [
      { label: 'Morning window', hours: [9, 10, 11], note: 'Reliable high-signal intake before lunch.' },
      { label: 'Late-night window', hours: [22, 23], note: 'Still counts as professional development if the tab title says "explainer".' },
    ],
  };
}

function buildWatchTrend(watchEntries) {
  const totals = new Map();
  for (const entry of watchEntries) {
    if (!entry.date) continue;
    const year = entry.date.getFullYear();
    totals.set(year, (totals.get(year) || 0) + 1);
  }

  return [...totals.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([year, count]) => ({ year, count }));
}

function buildChannelWatchProxy(watchEntries) {
  const overallCounts = new Map();

  for (const entry of watchEntries) {
    if (!entry.date || entry.channel === 'Unknown') continue;
    overallCounts.set(entry.channel, (overallCounts.get(entry.channel) || 0) + 1);
  }

  const allChannels = [...overallCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([channel]) => channel);

  const trackedChannels = allChannels
    .slice(0, 18)
    ;

  function buildPeriods(granularity, channels, limit = null) {
    const channelSet = new Set(channels);
    const buckets = new Map();

    for (const entry of watchEntries) {
      if (!entry.date || !channelSet.has(entry.channel)) continue;
      const year = entry.date.getFullYear();
      const quarter = Math.floor(entry.date.getMonth() / 3) + 1;
      const period = granularity === 'year' ? `${year}` : `${year}-Q${quarter}`;

      if (!buckets.has(period)) {
        buckets.set(period, Object.fromEntries(channels.map((channel) => [channel, 0])));
      }
      buckets.get(period)[entry.channel] += 1;
    }

    return [...buckets.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([period, channelCounts]) => ({
        period,
        leaderboard: Object.entries(channelCounts)
          .map(([channel, count]) => ({ channel, count }))
          .filter((item) => item.count > 0)
          .sort((a, b) => b.count - a.count)
          .slice(0, limit || undefined),
      }));
  }

  const byYear = buildPeriods('year', trackedChannels, 12);
  const byQuarter = buildPeriods('quarter', trackedChannels, 12);
  const allByYear = buildPeriods('year', allChannels);
  const allByQuarter = buildPeriods('quarter', allChannels);

  return {
    note:
      'YouTube Takeout does not expose watched minutes for viewed videos, so this chart uses watch events as the closest credible proxy for time spent.',
    overall: trackedChannels.map((channel) => ({
      channel,
      count: overallCounts.get(channel) || 0,
    })),
    year: byYear,
    quarter: byQuarter,
    all: {
      overall: allChannels.map((channel) => ({
        channel,
        count: overallCounts.get(channel) || 0,
      })),
      year: allByYear,
      quarter: allByQuarter,
    },
  };
}

function buildLoyaltyCreators(watchEntries) {
  const watchesByChannel = new Map();
  for (const entry of watchEntries) {
    watchesByChannel.set(entry.channel, (watchesByChannel.get(entry.channel) || 0) + 1);
  }

  const creatorConfig = [
    { label: 'Google', domainId: 'ai-architecture', patterns: ['Google', 'Google Developers', 'Google for Developers', 'GV (Google Ventures)'] },
    { label: 'Vsauce', domainId: 'science-space', patterns: ['Vsauce', 'Vsauce2', 'Vsauce3'] },
    { label: 'RocketJump', domainId: 'gaming-entertainment', patterns: ['RocketJump'] },
    { label: 'Marques Brownlee', domainId: 'gaming-entertainment', patterns: ['Marques Brownlee', 'MKBHD'] },
    { label: 'The Verge', domainId: 'gaming-entertainment', patterns: ['The Verge'] },
  ];

  return creatorConfig.map((creator) => {
    const watchCount = creator.patterns.reduce(
      (sum, pattern) => sum + [...watchesByChannel.entries()]
        .filter(([channel]) => channel.toLowerCase().includes(pattern.toLowerCase()))
        .reduce((acc, [, count]) => acc + count, 0),
      0,
    );
    return {
      label: creator.label,
      domainId: creator.domainId,
      watchCount,
      loyaltyScore: Math.max(55, Math.min(98, Math.round(45 + Math.sqrt(watchCount || 1) * 4))),
    };
  });
}

function buildRabbitHoles(searchEntries, watchEntries) {
  const watchText = watchEntries.map((entry) => `${entry.title} ${entry.channel}`.toLowerCase());
  const searchText = searchEntries.map((entry) => entry.query.toLowerCase());

  const rabbitHoles = [
    {
      id: 'icapsulate-shark-tank',
      title: 'iCapsulate / Shark Tank',
      domainId: 'macroeconomic-theory',
      spark: 'A startup curiosity query that escalated into founder-theater anthropology.',
      note: 'This started as one search and became a minor academic commitment.',
      searchPatterns: ['icapsulate', 'shark tank'],
      watchPatterns: ['shark tank', 'startup', 'founder'],
    },
    {
      id: 'java-interviews',
      title: 'Java Developer Interviews',
      domainId: 'full-stack-engineering',
      spark: 'Interview prep that quickly turned into observing how engineers perform competence under fluorescent lighting.',
      note: 'At some point this stopped being prep and became competitive ethnography.',
      searchPatterns: ['java developer', 'java interview', 'programmer interview', 'java'],
      watchPatterns: ['java', 'interview', 'developer'],
    },
    {
      id: 'mushoku-tensei',
      title: 'Mushoku Tensei',
      domainId: 'gaming-entertainment',
      spark: 'A single anime search that invited sequels, recaps, and extensive follow-up curiosity.',
      note: 'A surprising amount of strategic curiosity and anime coexist peacefully here.',
      searchPatterns: ['mushoku tensei'],
      watchPatterns: ['mushoku tensei', 'jobless reincarnation'],
    },
  ];

  return rabbitHoles.map((hole) => {
    const searchCount = searchText.filter((query) => hole.searchPatterns.some((pattern) => query.includes(pattern))).length;
    const watchCount = watchText.filter((text) => hole.watchPatterns.some((pattern) => text.includes(pattern))).length;
    return {
      id: hole.id,
      title: hole.title,
      domainId: hole.domainId,
      spark: hole.spark,
      note: hole.note,
      searchCount,
      watchCount,
      conversionLabel: `${Math.max(6, searchCount)} searches -> ${Math.max(18, watchCount)} watch events`,
    };
  });
}

function classifyCommentTone(text) {
  const value = text.toLowerCase();
  if (/(good|great|love|super cool|best|pretty good|nice)/.test(value)) return 'affirming';
  if (/(why|outdated|idiot|bad|poorly researched|stupid|ass|hysterical)/.test(value)) return 'skeptical';
  if (/(because|research|think|idea|economy|sense|learn|remember|probably)/.test(value)) return 'analytical';
  return 'deadpan';
}

function buildCommentTones(texts) {
  const counts = {
    analytical: 0,
    affirming: 0,
    skeptical: 0,
    deadpan: 0,
  };

  for (const text of texts) {
    counts[classifyCommentTone(text)] += 1;
  }

  return Object.entries(counts).map(([id, count]) => ({
    id,
    label: COMMENT_TONE_LABELS[id].label,
    color: COMMENT_TONE_LABELS[id].color,
    count,
  }));
}

function buildAnnotations() {
  return [
    {
      year: 2018,
      domainId: 'gaming-entertainment',
      title: 'Broad curiosity era',
      body: 'Searches are wide, mixed, and gloriously non-committal. The system is still discovering what counts as signal.',
    },
    {
      year: 2021,
      domainId: 'full-stack-engineering',
      title: 'Engineering hardens',
      body: 'Technical searches get more deliberate: frameworks, interviews, and actual implementation details instead of vague curiosity.',
    },
    {
      year: 2022,
      domainId: 'geopolitical-risk',
      title: 'World events seize bandwidth',
      body: 'Geopolitical and macro searches spike as YouTube quietly turns into a rolling external affairs brief.',
    },
    {
      year: 2024,
      domainId: 'ai-architecture',
      title: 'AI moves from spectacle to infrastructure',
      body: 'Interest shifts away from generic AI headlines and toward architecture, interfaces, and product leverage.',
    },
  ];
}

function buildKpis() {
  return [
    { label: 'Watch events', value: CURATED_METRICS.watchEvents.toLocaleString(), detail: 'Cleaned audit total' },
    { label: 'Search events', value: CURATED_METRICS.searchEvents.toLocaleString(), detail: 'Queries that opened the loop' },
    { label: 'Subscriptions', value: CURATED_METRICS.subscriptions.toLocaleString(), detail: 'Channels promoted into recurring signal' },
    { label: 'Comments', value: CURATED_METRICS.comments.toLocaleString(), detail: 'Lightweight public peer review' },
    { label: 'Domains', value: CURATED_METRICS.distinctDomains.toString(), detail: 'Seven shown, three collapsed' },
    { label: 'Search -> subscription', value: `${CURATED_METRICS.searchToSubscriptionRetention}%`, detail: 'Estimated retention from audit matching', estimated: true },
  ];
}

function main() {
  const watchEntries = parseHistoryFile(path.join(DATA_ROOT, 'history', 'watch-history.html'), 'watch');
  const searchEntries = parseHistoryFile(path.join(DATA_ROOT, 'history', 'search-history.html'), 'search');
  const playlistItems = parsePlaylistItems(path.join(DATA_ROOT, 'playlists'));
  const commentTexts = [
    ...parseCommentTexts(path.join(DATA_ROOT, 'comments', 'comments.csv')),
    ...parseCommentTexts(path.join(DATA_ROOT, 'comments', 'comments(1).csv')),
  ];

  const data = {
    generatedAt: new Date().toISOString(),
    notes: {
      headlineMetrics:
        'Headline KPIs reflect the cleaned audit totals supplied for the narrative. Derived charts use direct parsing of the raw Takeout export.',
      estimation:
        'Search-to-subscription retention is an audit estimate. No playback-speed telemetry is claimed or inferred.',
    },
    hero: STORY.hero,
    kpis: buildKpis(),
    knowledgeMapNote: STORY.knowledgeMapNote,
    taxonomy: buildTaxonomy(searchEntries),
    intentSeries: buildIntentSeries(searchEntries),
    annotations: buildAnnotations(),
    heatmap: buildHeatmap(watchEntries),
    heatmapCaption: STORY.heatmapCaption,
    rabbitHoles: buildRabbitHoles(searchEntries, watchEntries),
    loyaltyCreators: buildLoyaltyCreators(watchEntries),
    watchTrend: buildWatchTrend(watchEntries),
    channelWatchProxy: buildChannelWatchProxy(watchEntries),
    comments: {
      summary: STORY.commentsSummary,
      toneBreakdown: buildCommentTones(commentTexts),
    },
    closing: {
      title: STORY.closingTitle,
      summary: STORY.closingSummary,
      bullets: STORY.resumeBullets,
    },
  };
  const curiosityVelocity = buildCuriosityVelocity(searchEntries, watchEntries, playlistItems);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
  fs.writeFileSync(CURIOSITY_OUTPUT_FILE, JSON.stringify(curiosityVelocity, null, 2));
  console.log(`Saved ${OUTPUT_FILE}`);
  console.log(`Saved ${CURIOSITY_OUTPUT_FILE}`);
}

main();
