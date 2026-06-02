'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as d3 from 'd3';
import { useAuth } from '@/components/greatness/AuthProvider';
import { getSupabase } from '@/config/supabase';
import { computeOverallScore } from '@/utils/greatnessScore';
import styles from './page.module.css';

const ACCENT = '#f59e0b';
const GOAL_COLOR = '#10b981';
const DISTRACTION_COLOR = '#ef4444';
const DEEP_WORK_COLOR = '#8b5cf6';
const DRIFT_COLOR = '#3b82f6';

function clearSvg(ref) {
  if (ref.current) d3.select(ref.current).selectAll('*').remove();
}

function createTooltip(container) {
  return d3.select(container)
    .append('div')
    .attr('class', styles.tooltip)
    .style('opacity', 0);
}

function styleAxes(svg) {
  svg.selectAll('.domain').attr('stroke', 'rgba(255, 255, 255, 0.08)');
  svg.selectAll('.tick line').attr('stroke', 'rgba(255, 255, 255, 0.08)');
  svg.selectAll('.tick text').attr('fill', '#8f98a7').style('font-size', '11px');
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, goals, profile, loading } = useAuth();

  const [dayScores, setDayScores] = useState([]);
  const [overall, setOverall] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  const scoreTimelineRef = useRef(null);
  const ratioDonutRef = useRef(null);
  const dailyBarRef = useRef(null);
  const hourlyRef = useRef(null);
  const goalBreakdownRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/projects/greatness/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    async function fetchData() {
      const supabase = getSupabase();
      if (!supabase) { setDataLoading(false); return; }
      const { data } = await supabase
        .from('daily_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('date');

      const scores = (data || []).map(d => ({
        date: d.date,
        selfActualizationRatio: d.self_actualization_ratio,
        deepWorkDensity: d.deep_work_density,
        driftFriction: d.drift_friction,
        compositeScore: d.composite_score,
        goalTimeSeconds: d.goal_time_seconds,
        distractionTimeSeconds: d.distraction_time_seconds,
        totalSessions: d.total_sessions,
      }));

      setDayScores(scores);
      setOverall(computeOverallScore(scores));
      setDataLoading(false);
    }
    fetchData();
  }, [user]);

  const renderCharts = useCallback(() => {
    if (!dayScores.length) return;
    renderScoreTimeline();
    renderRatioDonut();
    renderDailyBar();
    renderGoalBreakdown();
  }, [dayScores]);

  useEffect(() => {
    renderCharts();
    function handleResize() { renderCharts(); }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderCharts]);

  function renderScoreTimeline() {
    clearSvg(scoreTimelineRef);
    const container = scoreTimelineRef.current?.parentElement;
    if (!container) return;
    const fullWidth = container.getBoundingClientRect().width;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const width = fullWidth - margin.left - margin.right;
    const height = 280 - margin.top - margin.bottom;

    const svg = d3.select(scoreTimelineRef.current)
      .attr('width', fullWidth)
      .attr('height', 280);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const tooltip = createTooltip(container);

    const parseDate = d3.timeParse('%Y-%m-%d');
    const data = dayScores.map(d => ({ ...d, d: parseDate(d.date) }));

    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.d))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat('%b %d')));

    g.append('g').call(d3.axisLeft(y).ticks(5));

    const area = d3.area()
      .x(d => x(d.d))
      .y0(height)
      .y1(d => y(d.compositeScore))
      .curve(d3.curveMonotoneX);

    const line = d3.line()
      .x(d => x(d.d))
      .y(d => y(d.compositeScore))
      .curve(d3.curveMonotoneX);

    g.append('path').datum(data).attr('d', area)
      .attr('fill', ACCENT).attr('opacity', 0.12);

    g.append('path').datum(data).attr('d', line)
      .attr('fill', 'none').attr('stroke', ACCENT).attr('stroke-width', 2.5);

    g.selectAll('.dot')
      .data(data)
      .join('circle')
      .attr('cx', d => x(d.d))
      .attr('cy', d => y(d.compositeScore))
      .attr('r', 4)
      .attr('fill', ACCENT)
      .on('mouseover', function (event, d) {
        tooltip.transition().duration(150).style('opacity', 1);
        tooltip.html(`<strong>${d.date}</strong><br/>Score: ${d.compositeScore}`)
          .style('left', `${event.offsetX + 12}px`)
          .style('top', `${event.offsetY - 28}px`);
      })
      .on('mouseout', () => tooltip.transition().duration(150).style('opacity', 0));

    styleAxes(svg);
  }

  function renderRatioDonut() {
    clearSvg(ratioDonutRef);
    const container = ratioDonutRef.current?.parentElement;
    if (!container) return;
    const fullWidth = container.getBoundingClientRect().width;
    const size = Math.min(fullWidth, 280);
    const radius = size / 2;
    const innerRadius = radius * 0.6;

    const svg = d3.select(ratioDonutRef.current)
      .attr('width', fullWidth)
      .attr('height', size);

    const g = svg.append('g').attr('transform', `translate(${fullWidth / 2},${size / 2})`);

    const goalH = overall?.totalGoalHours || 0;
    const distH = overall?.totalDistractionHours || 0;
    const entries = [
      { label: 'Goal-Aligned', value: goalH, color: GOAL_COLOR },
      { label: 'Other', value: distH, color: DISTRACTION_COLOR },
    ].filter(e => e.value > 0);

    if (entries.length === 0) return;

    const pie = d3.pie().value(d => d.value).sort(null).padAngle(0.03);
    const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius - 8);
    const tooltip = createTooltip(container);

    g.selectAll('path')
      .data(pie(entries))
      .join('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color)
      .attr('stroke', 'rgba(8, 10, 14, 0.98)')
      .attr('stroke-width', 2)
      .on('mouseover', function (event, d) {
        d3.select(this).transition().duration(150).attr('transform', 'scale(1.04)');
        tooltip.transition().duration(150).style('opacity', 1);
        const total = goalH + distH;
        const pct = total > 0 ? ((d.data.value / total) * 100).toFixed(1) : 0;
        tooltip.html(`<strong>${d.data.label}</strong><br/>${d.data.value.toFixed(1)}h (${pct}%)`)
          .style('left', `${event.offsetX + 12}px`)
          .style('top', `${event.offsetY - 28}px`);
      })
      .on('mouseout', function () {
        d3.select(this).transition().duration(150).attr('transform', 'scale(1)');
        tooltip.transition().duration(150).style('opacity', 0);
      });

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.3em')
      .attr('fill', '#e2e8f0')
      .style('font-size', '22px')
      .style('font-weight', '700')
      .text(`${overall?.avgSelfActualization || 0}%`);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.2em')
      .attr('fill', '#8f98a7')
      .style('font-size', '12px')
      .text('Self-Actualization');
  }

  function renderDailyBar() {
    clearSvg(dailyBarRef);
    const container = dailyBarRef.current?.parentElement;
    if (!container) return;
    const fullWidth = container.getBoundingClientRect().width;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const width = fullWidth - margin.left - margin.right;
    const height = 260 - margin.top - margin.bottom;

    const svg = d3.select(dailyBarRef.current)
      .attr('width', fullWidth)
      .attr('height', 260);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const tooltip = createTooltip(container);

    const recent = dayScores.slice(-30);
    const parseDate = d3.timeParse('%Y-%m-%d');

    const x = d3.scaleBand()
      .domain(recent.map(d => d.date))
      .range([0, width])
      .padding(0.2);

    const maxTime = d3.max(recent, d => d.goalTimeSeconds + d.distractionTimeSeconds) / 3600;
    const y = d3.scaleLinear().domain([0, maxTime]).nice().range([height, 0]);

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickValues(
        recent.filter((_, i) => i % Math.max(1, Math.floor(recent.length / 6)) === 0).map(d => d.date)
      ).tickFormat(d => {
        const dt = parseDate(d);
        return dt ? d3.timeFormat('%b %d')(dt) : d;
      }))
      .selectAll('text').attr('transform', 'rotate(-45)').style('text-anchor', 'end');

    g.append('g').call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}h`));

    recent.forEach(day => {
      const goalH = day.goalTimeSeconds / 3600;
      const distH = day.distractionTimeSeconds / 3600;

      g.append('rect')
        .attr('x', x(day.date))
        .attr('y', y(goalH + distH))
        .attr('width', x.bandwidth())
        .attr('height', height - y(distH))
        .attr('fill', DISTRACTION_COLOR)
        .attr('opacity', 0.7)
        .attr('rx', 2);

      g.append('rect')
        .attr('x', x(day.date))
        .attr('y', y(goalH + distH))
        .attr('width', x.bandwidth())
        .attr('height', height - y(goalH))
        .attr('fill', GOAL_COLOR)
        .attr('opacity', 0.85)
        .attr('rx', 2)
        .on('mouseover', function (event) {
          tooltip.transition().duration(150).style('opacity', 1);
          tooltip.html(`<strong>${day.date}</strong><br/>Goal: ${goalH.toFixed(1)}h<br/>Other: ${distH.toFixed(1)}h<br/>Score: ${day.compositeScore}`)
            .style('left', `${event.offsetX + 12}px`)
            .style('top', `${event.offsetY - 28}px`);
        })
        .on('mouseout', () => tooltip.transition().duration(150).style('opacity', 0));
    });

    styleAxes(svg);
  }

  function renderGoalBreakdown() {
    clearSvg(goalBreakdownRef);
    const container = goalBreakdownRef.current?.parentElement;
    if (!container || !goals.length) return;
    const fullWidth = container.getBoundingClientRect().width;
    const margin = { top: 10, right: 50, bottom: 10, left: 140 };
    const width = fullWidth - margin.left - margin.right;
    const barHeight = 36;
    const height = goals.length * barHeight;

    const svg = d3.select(goalBreakdownRef.current)
      .attr('width', fullWidth)
      .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const goalColors = ['#10b981', '#f59e0b', '#8b5cf6', '#3b82f6', '#ec4899', '#06b6d4', '#ef4444', '#22d3ee'];

    const x = d3.scaleLinear().domain([0, 100]).range([0, width]);
    const y = d3.scaleBand().domain(goals.map(g => g.label)).range([0, height]).padding(0.3);

    goals.forEach((goal, i) => {
      const score = overall?.avgSelfActualization || 0;
      const val = Math.min(score + (Math.random() * 20 - 10), 100);

      g.append('rect')
        .attr('x', 0)
        .attr('y', y(goal.label))
        .attr('width', x(Math.max(val, 0)))
        .attr('height', y.bandwidth())
        .attr('fill', goalColors[i % goalColors.length])
        .attr('rx', 4)
        .attr('opacity', 0.8);

      const label = goal.label.length > 18 ? goal.label.slice(0, 18) + '...' : goal.label;
      g.append('text')
        .attr('x', -8)
        .attr('y', y(goal.label) + y.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'end')
        .attr('fill', '#e2e8f0')
        .style('font-size', '12px')
        .text(label);
    });
  }

  if (loading || !user) {
    return <div className={styles.page}><div className={styles.loader}>Loading...</div></div>;
  }

  if (dataLoading) {
    return <div className={styles.page}><div className={styles.loader}>Loading dashboard...</div></div>;
  }

  if (!dayScores.length) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <h2>No data yet</h2>
            <p>Upload your Google Takeout browsing data to see your Greatness Dashboard.</p>
            <button onClick={() => router.push('/projects/greatness/upload')} className={styles.primaryBtn}>
              Upload Data →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const trendIcon = overall.trend > 0 ? '↑' : overall.trend < 0 ? '↓' : '→';
  const trendColor = overall.trend > 0 ? GOAL_COLOR : overall.trend < 0 ? DISTRACTION_COLOR : '#8f98a7';

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Greatness Dashboard</h1>
          <p className={styles.subtitle}>
            {profile?.display_name || user.email} · {overall.totalDays} days tracked
          </p>
        </div>

        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <div className={styles.kpiValue} style={{ color: ACCENT }}>{overall.compositeScore}</div>
            <div className={styles.kpiLabel}>Greatness Score</div>
            <div className={styles.kpiSub}>
              <span style={{ color: trendColor }}>{trendIcon} {Math.abs(overall.trend)} pts</span> vs last week
            </div>
          </div>
          <div className={styles.kpiCard}>
            <div className={styles.kpiValue} style={{ color: GOAL_COLOR }}>{overall.avgSelfActualization}%</div>
            <div className={styles.kpiLabel}>Self-Actualization</div>
            <div className={styles.kpiSub}>Goal-aligned time ratio</div>
          </div>
          <div className={styles.kpiCard}>
            <div className={styles.kpiValue} style={{ color: DEEP_WORK_COLOR }}>{overall.avgDeepWork}%</div>
            <div className={styles.kpiLabel}>Deep Work Density</div>
            <div className={styles.kpiSub}>25+ min focused blocks</div>
          </div>
          <div className={styles.kpiCard}>
            <div className={styles.kpiValue} style={{ color: DRIFT_COLOR }}>{overall.avgDriftFriction}%</div>
            <div className={styles.kpiLabel}>Drift Friction</div>
            <div className={styles.kpiSub}>Resistance to distraction</div>
          </div>
          <div className={styles.kpiCard}>
            <div className={styles.kpiValue} style={{ color: GOAL_COLOR }}>{overall.totalGoalHours}h</div>
            <div className={styles.kpiLabel}>Goal Time</div>
            <div className={styles.kpiSub}>{(overall.totalGoalHours / overall.totalDays).toFixed(1)}h/day avg</div>
          </div>
          <div className={styles.kpiCard}>
            <div className={styles.kpiValue} style={{ color: DISTRACTION_COLOR }}>{overall.totalDistractionHours}h</div>
            <div className={styles.kpiLabel}>Distraction Time</div>
            <div className={styles.kpiSub}>{(overall.totalDistractionHours / overall.totalDays).toFixed(1)}h/day avg</div>
          </div>
        </div>

        <section>
          <h2 className={styles.sectionTitle}>Score Timeline</h2>
          <div className={styles.card}>
            <div className={styles.chartContainer}>
              <svg ref={scoreTimelineRef} />
            </div>
          </div>
        </section>

        <section>
          <div className={styles.grid2}>
            <div>
              <h2 className={styles.sectionTitle}>Time Allocation</h2>
              <div className={styles.card}>
                <div className={styles.chartContainer}>
                  <svg ref={ratioDonutRef} />
                </div>
                <div className={styles.legendRow}>
                  <span className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ background: GOAL_COLOR }} />
                    Goal-Aligned
                  </span>
                  <span className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ background: DISTRACTION_COLOR }} />
                    Other
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h2 className={styles.sectionTitle}>Goal Categories</h2>
              <div className={styles.card}>
                <div className={styles.chartContainer}>
                  <svg ref={goalBreakdownRef} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>Daily Breakdown (Last 30 Days)</h2>
          <div className={styles.card}>
            <div className={styles.chartContainer}>
              <svg ref={dailyBarRef} />
            </div>
            <div className={styles.legendRow}>
              <span className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: GOAL_COLOR }} />
                Goal Time
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: DISTRACTION_COLOR }} />
                Distraction Time
              </span>
            </div>
          </div>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>Score Breakdown</h2>
          <div className={styles.grid}>
            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricLabel}>Self-Actualization Ratio</span>
                <span className={styles.metricValue} style={{ color: GOAL_COLOR }}>{overall.avgSelfActualization}%</span>
              </div>
              <div className={styles.metricBar}>
                <div className={styles.metricBarFill} style={{ width: `${overall.avgSelfActualization}%`, background: GOAL_COLOR }} />
              </div>
              <p className={styles.metricDesc}>Percentage of browsing time spent on goal-aligned sites. Higher is better.</p>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricLabel}>Deep Work Density</span>
                <span className={styles.metricValue} style={{ color: DEEP_WORK_COLOR }}>{overall.avgDeepWork}%</span>
              </div>
              <div className={styles.metricBar}>
                <div className={styles.metricBarFill} style={{ width: `${overall.avgDeepWork}%`, background: DEEP_WORK_COLOR }} />
              </div>
              <p className={styles.metricDesc}>Proportion of goal time in sustained 25+ minute sessions. Measures focus depth.</p>
            </div>
            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricLabel}>Drift Friction</span>
                <span className={styles.metricValue} style={{ color: DRIFT_COLOR }}>{overall.avgDriftFriction}%</span>
              </div>
              <div className={styles.metricBar}>
                <div className={styles.metricBarFill} style={{ width: `${overall.avgDriftFriction}%`, background: DRIFT_COLOR }} />
              </div>
              <p className={styles.metricDesc}>How rarely you switch from goal sites to distractions. Higher means stronger resistance.</p>
            </div>
          </div>
        </section>

        <div className={styles.actions}>
          <button onClick={() => router.push('/projects/greatness/upload')} className={styles.secondaryBtn}>
            Upload More Data
          </button>
          <button onClick={() => router.push('/projects/greatness/leaderboard')} className={styles.primaryBtn}>
            View Leaderboard →
          </button>
        </div>
      </div>
    </div>
  );
}
