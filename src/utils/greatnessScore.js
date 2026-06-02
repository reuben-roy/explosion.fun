const WEIGHTS = {
  selfActualization: 0.45,
  deepWork: 0.30,
  driftFriction: 0.25,
};

export function calcSelfActualizationRatio(goalTime, distractionTime) {
  const total = goalTime + distractionTime;
  if (total === 0) return 0;
  return (goalTime / total) * 100;
}

export function calcDeepWorkDensity(goalSessions) {
  if (goalSessions.length === 0) return 0;

  let consecutiveBlocks = [];
  let currentBlock = 0;

  const sorted = [...goalSessions].sort((a, b) => a.visitedAt - b.visitedAt);

  for (let i = 0; i < sorted.length; i++) {
    currentBlock += sorted[i].durationSeconds;

    const isLast = i === sorted.length - 1;
    const gapToNext = isLast
      ? Infinity
      : (sorted[i + 1].visitedAt - sorted[i].visitedAt) / 1000;

    if (gapToNext > 300 || isLast) {
      consecutiveBlocks.push(currentBlock);
      currentBlock = 0;
    }
  }

  if (consecutiveBlocks.length === 0) return 0;

  const totalDeepWork = consecutiveBlocks
    .filter(b => b >= 1500)
    .reduce((sum, b) => sum + b, 0);

  const totalGoalTime = goalSessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  if (totalGoalTime === 0) return 0;

  return Math.min((totalDeepWork / totalGoalTime) * 100, 100);
}

export function calcDriftFriction(allSessions) {
  if (allSessions.length < 2) return 100;

  const sorted = [...allSessions].sort((a, b) => a.visitedAt - b.visitedAt);
  let drifts = 0;
  let transitions = 0;

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const gap = (curr.visitedAt - prev.visitedAt) / 1000;

    if (gap > 1800) continue;
    transitions++;

    if (prev.isGoalAligned && !curr.isGoalAligned) {
      drifts++;
    }
  }

  if (transitions === 0) return 100;
  return Math.max(0, (1 - drifts / transitions) * 100);
}

export function calcCompositeScore(selfActualization, deepWork, driftFriction) {
  return (
    selfActualization * WEIGHTS.selfActualization +
    deepWork * WEIGHTS.deepWork +
    driftFriction * WEIGHTS.driftFriction
  );
}

export function computeDayScore(dayData) {
  const selfActualization = calcSelfActualizationRatio(
    dayData.goalTime,
    dayData.distractionTime
  );
  const deepWork = calcDeepWorkDensity(dayData.goalSessions);
  const driftFriction = calcDriftFriction(dayData.allSessions);
  const composite = calcCompositeScore(selfActualization, deepWork, driftFriction);

  return {
    date: dayData.date,
    selfActualizationRatio: Math.round(selfActualization * 10) / 10,
    deepWorkDensity: Math.round(deepWork * 10) / 10,
    driftFriction: Math.round(driftFriction * 10) / 10,
    compositeScore: Math.round(composite * 10) / 10,
    goalTimeSeconds: dayData.goalTime,
    distractionTimeSeconds: dayData.distractionTime,
    totalSessions: dayData.totalSessions,
  };
}

export function computeOverallScore(dayScores) {
  if (dayScores.length === 0) {
    return {
      compositeScore: 0,
      avgSelfActualization: 0,
      avgDeepWork: 0,
      avgDriftFriction: 0,
      totalDays: 0,
      totalGoalHours: 0,
      totalDistractionHours: 0,
      trend: 0,
    };
  }

  const n = dayScores.length;
  const avgSelf = dayScores.reduce((s, d) => s + d.selfActualizationRatio, 0) / n;
  const avgDeep = dayScores.reduce((s, d) => s + d.deepWorkDensity, 0) / n;
  const avgDrift = dayScores.reduce((s, d) => s + d.driftFriction, 0) / n;
  const composite = calcCompositeScore(avgSelf, avgDeep, avgDrift);

  const totalGoalH = dayScores.reduce((s, d) => s + d.goalTimeSeconds, 0) / 3600;
  const totalDistH = dayScores.reduce((s, d) => s + d.distractionTimeSeconds, 0) / 3600;

  let trend = 0;
  if (n >= 7) {
    const recentWeek = dayScores.slice(-7);
    const prevWeek = dayScores.slice(-14, -7);
    if (prevWeek.length > 0) {
      const recentAvg = recentWeek.reduce((s, d) => s + d.compositeScore, 0) / recentWeek.length;
      const prevAvg = prevWeek.reduce((s, d) => s + d.compositeScore, 0) / prevWeek.length;
      trend = recentAvg - prevAvg;
    }
  }

  return {
    compositeScore: Math.round(composite * 10) / 10,
    avgSelfActualization: Math.round(avgSelf * 10) / 10,
    avgDeepWork: Math.round(avgDeep * 10) / 10,
    avgDriftFriction: Math.round(avgDrift * 10) / 10,
    totalDays: n,
    totalGoalHours: Math.round(totalGoalH * 10) / 10,
    totalDistractionHours: Math.round(totalDistH * 10) / 10,
    trend: Math.round(trend * 10) / 10,
  };
}
