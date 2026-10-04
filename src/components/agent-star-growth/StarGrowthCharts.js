'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import styles from './StarGrowthCharts.module.css';

const palette = ['#f5c542', '#f27ca5', '#72a7ff', '#64d6c5', '#c59bff', '#ff916b', '#9fce65', '#e58acb', '#67b4da', '#f0a84f', '#a9b4c0', '#e06b75', '#82c1a8', '#aaa0ff', '#d3c26f'];

function seriesColor(item, series) {
  if (item.color) return item.color;
  if (item.name === 'OpenClaw') return '#f5c542';
  if (item.name === 'Hermes Agent') return '#f27ca5';
  if (item.name === 'DeepSeek Harness') return '#72a7ff';
  return palette[series.findIndex((candidate) => candidate.name === item.name) % palette.length];
}

const dateFormat = d3.utcFormat('%b %-d, %Y');
const countFormat = d3.format(',');

function valueAt(series, timestamp) {
  const points = series.points.map((point) => ({
    date: new Date(`${point.date}T00:00:00Z`),
    stars: point.stars,
  }));
  const bisect = d3.bisector((point) => +point.date).left;
  if (!points.length || timestamp < +points[0].date || timestamp > +points[points.length - 1].date) return null;
  const index = bisect(points, timestamp);
  if (index === 0) return points[0].stars;
  if (index >= points.length) return points[points.length - 1].stars;
  const before = points[index - 1];
  const after = points[index];
  const progress = (timestamp - +before.date) / (+after.date - +before.date);
  return Math.round(d3.interpolateNumber(before.stars, after.stars)(progress));
}

function StarChart({ title, description, series, chartId, initialNames, selection, onToggle, embedded = false, asOf }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(760);
  const [localEnabled, setLocalEnabled] = useState(() => new Set(series.filter((item) => initialNames.includes(item.name)).map((item) => item.name)));
  const enabled = selection ?? localEnabled;
  const [selectedTime, setSelectedTime] = useState(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(1, entry.contentRect.width)));
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const chart = useMemo(() => {
    const visibleSeries = series.filter((item) => enabled.has(item.name));
    const historyPoints = visibleSeries.filter((item) => (item.points || []).length > 1).flatMap((item) => item.points.map((point) => ({
      date: new Date(`${point.date}T00:00:00Z`),
      stars: point.stars,
    })));
    const snapshotDate = asOf ? new Date(`${asOf}T00:00:00Z`) : null;
    const allPoints = [...historyPoints, ...(snapshotDate ? visibleSeries.filter((item) => (item.points || []).length <= 1).map((item) => ({ date: snapshotDate, stars: item.current })) : [])];
    if (!allPoints.length) return null;

    const height = 360;
    const margin = { top: 22, right: 24, bottom: 62, left: 66 };
    const innerWidth = Math.max(1, width - margin.left - margin.right);
    const innerHeight = height - margin.top - margin.bottom;
    const historyDates = historyPoints.map((point) => point.date);
    const xDomain = asOf
      ? [historyDates.length ? d3.min(historyDates) : d3.utcDay.offset(snapshotDate, -30), snapshotDate]
      : d3.extent(allPoints, (point) => point.date);
    const x = d3.scaleUtc().domain(xDomain).range([0, innerWidth]);
    const maxValue = d3.max(allPoints, (point) => point.stars);
    const y = d3.scaleLinear().domain([0, maxValue * 1.08]).nice(5).range([innerHeight, 0]);
    const line = d3.line().x((point) => x(point.date)).y((point) => y(point.stars)).curve(d3.curveLinear);
    const cursorDate = selectedTime === null ? null : new Date(Math.max(+x.domain()[0], Math.min(+x.domain()[1], selectedTime)));
    const ticks = x.ticks(Math.max(3, Math.floor(innerWidth / 110)));
    const snapshotItems = visibleSeries.filter((item) => (item.points || []).length <= 1);
    const valueRows = cursorDate ? [
      ...visibleSeries.filter((item) => (item.points || []).length > 1).map((item) => ({ name: item.name, value: valueAt(item, +cursorDate) })).filter((row) => row.value !== null),
      ...(snapshotDate && +cursorDate === +snapshotDate ? snapshotItems.map((item) => ({ name: item.name, value: item.current })) : []),
    ] : [];
    return { height, margin, innerWidth, innerHeight, x, y, line, cursorDate, ticks, valueRows, visibleSeries, snapshotDate, snapshotItems };
  }, [enabled, selectedTime, series, width, asOf]);

  function updateFromPointer(event) {
    if (!chart || !containerRef.current) return;
    const bounds = containerRef.current.getBoundingClientRect();
    const localX = event.clientX - bounds.left - chart.margin.left;
    setSelectedTime(+chart.x.invert(Math.max(0, Math.min(chart.innerWidth, localX))));
  }

  function onKeyDown(event) {
    if (!chart) return;
    const [start, end] = chart.x.domain().map(Number);
    const current = selectedTime === null ? end : selectedTime;
    const day = 24 * 60 * 60 * 1000;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedTime(Math.max(start, current - day * 3));
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedTime(Math.min(end, current + day * 3));
    } else if (event.key === 'Home') {
      event.preventDefault();
      setSelectedTime(start);
    } else if (event.key === 'End') {
      event.preventDefault();
      setSelectedTime(end);
    } else if (event.key === 'Escape') {
      setActive(false);
    }
  }

  function toggleSeries(name) {
    const change = (current) => {
      const next = new Set(current);
      if (next.has(name)) {
        if (next.size === 1) return current;
        next.delete(name);
      } else next.add(name);
      return next;
    };
    if (onToggle) onToggle(change(enabled));
    else setLocalEnabled(change);
  }

  const content = (
    <>
      {!embedded && <div className={styles.chartHeading}>
        <div>
          <h2 id={`${chartId}-title`}>{title}</h2>
          <p>{description}</p>
        </div>
        <div className={styles.legend} aria-label={`${title} series`}>
          {series.map((item) => (
            <button
              className={`${styles.legendButton} ${enabled.has(item.name) ? '' : styles.mutedLegend}`}
              key={item.name}
              type="button"
              aria-pressed={enabled.has(item.name)}
              onClick={() => toggleSeries(item.name)}
            >
              <span className={styles.legendSwatch} style={{ '--series-color': seriesColor(item, series) }} />
              {item.name}<span className={styles.legendCount}>{countFormat(item.current)}</span>
            </button>
          ))}
        </div>
      </div>}
      <div className={styles.chartWrap} ref={containerRef}>
        {chart && (
          <svg
            className={styles.chartSvg}
            viewBox={`0 0 ${width} ${chart.height}`}
            role="img"
            aria-label={`${title}. Interactive chart of GitHub stars by date. Focus the chart and use arrow keys to inspect values.`}
          >
            <g transform={`translate(${chart.margin.left},${chart.margin.top})`}>
              {chart.y.ticks(5).map((tick) => (
                <g className={styles.yTick} key={tick} transform={`translate(0,${chart.y(tick)})`}>
                  <line x2={chart.innerWidth} />
                  <text x={-12} dy="0.32em">{d3.format('~s')(tick)}</text>
                </g>
              ))}
              {chart.ticks.map((tick) => (
                <g className={styles.xTick} key={+tick} transform={`translate(${chart.x(tick)},${chart.innerHeight})`}>
                  <line y2="6" />
                  <text y="23" textAnchor="middle">{d3.utcFormat('%b %Y')(tick)}</text>
                </g>
              ))}
              {chart.visibleSeries.filter((item) => (item.points || []).length > 1).map((item) => (
                <g key={item.name}>
                  <path className={styles.line} d={chart.line(item.points.map((point) => ({ date: new Date(`${point.date}T00:00:00Z`), stars: point.stars })))} stroke={seriesColor(item, series)} />
                  {item.points.map((point) => <circle key={point.date} className={styles.sampleDot} cx={chart.x(new Date(`${point.date}T00:00:00Z`))} cy={chart.y(point.stars)} r="2.7" fill={seriesColor(item, series)} />)}
                </g>
              ))}
              {chart.snapshotItems.map((item) => <circle key={`snapshot-${item.name}`} className={styles.snapshotDot} cx={chart.x(chart.snapshotDate)} cy={chart.y(item.current)} r="5" fill={seriesColor(item, series)} />)}
              {chart.cursorDate && (
                <g pointerEvents="none">
                  <line className={styles.cursorLine} x1={chart.x(chart.cursorDate)} x2={chart.x(chart.cursorDate)} y1="0" y2={chart.innerHeight} />
                  {chart.valueRows.map((row) => (
                  <circle key={row.name} cx={chart.x(chart.cursorDate)} cy={chart.y(row.value)} r="5" fill={seriesColor(series.find((item) => item.name === row.name), series)} stroke="#080b10" strokeWidth="2" />
                  ))}
                </g>
              )}
              <rect
                className={styles.interactionSurface}
                x="0" y="0" width={chart.innerWidth} height={chart.innerHeight}
                tabIndex="0" role="slider"
                aria-label={`${title} date selector`}
                aria-valuemin={Number(chart.x.domain()[0])} aria-valuemax={Number(chart.x.domain()[1])}
                aria-valuenow={chart.cursorDate ? Number(chart.cursorDate) : Number(chart.x.domain()[1])}
                aria-valuetext={chart.cursorDate ? dateFormat(chart.cursorDate) : `Latest date, ${dateFormat(chart.x.domain()[1])}`}
                onPointerMove={(event) => { setActive(true); updateFromPointer(event); }}
                onPointerLeave={() => setActive(false)}
                onFocus={() => { setActive(true); setSelectedTime((value) => value ?? +chart.x.domain()[1]); }}
                onBlur={() => setActive(false)}
                onKeyDown={onKeyDown}
                onClick={updateFromPointer}
              />
            </g>
            <text className={styles.xLabel} x={chart.margin.left + chart.innerWidth / 2} y={chart.height - 5}>Date (UTC)</text>
            <text className={styles.yLabel} transform={`translate(16 ${chart.margin.top + chart.innerHeight / 2}) rotate(-90)`}>GitHub stars</text>
          </svg>
        )}
        {chart?.cursorDate && active && (
          <div className={styles.tooltip} aria-hidden="true">
            <strong>{dateFormat(chart.cursorDate)}</strong>
            {chart.valueRows.map((row) => (
              <span key={row.name}>
              <i style={{ backgroundColor: seriesColor(series.find((item) => item.name === row.name), series) }} />{row.name}<b>{countFormat(row.value)}</b>
              </span>
            ))}
          </div>
        )}
      </div>
      {!embedded && <p className={styles.keyboardHint}>Hover, tap, or focus the chart and use ←/→ to inspect dates. Values between sampled points are linearly interpolated.</p>}
      {embedded && chart && <div className={styles.historyAvailability}>
        {chart.snapshotItems.length ? <p><strong>Snapshot only; history unavailable:</strong> {chart.snapshotItems.map((item) => `${item.name} (${countFormat(item.current)} stars)`).join(', ')}. Dots show their {dateFormat(chart.snapshotDate)} counts.</p> : null}
        {!chart.visibleSeries.some((item) => (item.points || []).length > 1) && <p>There is no historical line for this selection. The chart shows the snapshot counts against a 30-day date window.</p>}
        {chart.visibleSeries.some((item) => (item.points || []).length > 1) && <>
          {chart.visibleSeries.filter((item) => item.comparisonHistory?.coverage === 'recent').map((item) => <p key={`coverage-${item.name}`}><strong>{item.name}:</strong> recent coverage since {item.points[0].date}.</p>)}
          <p>Historical counts are estimated from GitHub weekly star additions, backcast from the fixed snapshot. The estimates can be affected by removed stars and non-UTC calendar boundaries. <a href="https://docs.github.com/en/rest/activity/starring#get-repository-star-history" target="_blank" rel="noreferrer">GitHub star history API ↗</a></p>
        </>}
      </div>}
      {embedded && <p className={styles.keyboardHint}>Hover, tap, or focus the chart and use ←/→ to inspect dates. Values between weekly estimates are linearly interpolated for display.</p>}
      <div className={styles.srOnly} aria-live="polite" aria-atomic="true">
        {active && chart?.cursorDate && `${dateFormat(chart.cursorDate)}. ${chart.valueRows.map((row) => `${row.name}: ${countFormat(row.value)} stars`).join('. ')}`}
      </div>
    </>
  );
  return embedded ? <div aria-label={title}>{content}</div> : <section className={styles.chartCard} aria-labelledby={`${chartId}-title`}>{content}</section>;
}

function CurrentStarsChart({ series, asOf }) {
  const defaultNames = ['DeepSeek Harness', 'Hermes Agent', 'OpenClaw', 'Claude Code', 'Codex CLI', 'Gemini CLI', 'OpenCode'];
  const [enabled, setEnabled] = useState(() => new Set(series.filter((item) => defaultNames.includes(item.name)).map((item) => item.name)));
  const [view, setView] = useState('line');
  const containerRef = useRef(null);
  const [width, setWidth] = useState(760);
  useEffect(() => {
    if (!containerRef.current) return undefined;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(1, entry.contentRect.width)));
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [view]);
  const visible = series.filter((item) => enabled.has(item.name)).sort((a, b) => b.current - a.current);
  const maxValue = d3.max(series, (item) => item.current) || 1;
  const left = width < 400 ? 116 : 142;
  const right = width < 400 ? 58 : 94;
  const rowHeight = 34;
  const height = Math.max(200, visible.length * rowHeight + 34);
  const scale = d3.scaleLinear().domain([0, maxValue]).range([0, width - left - right]);
  const comparisonSeries = series.map((item) => ({ ...item, points: item.comparisonPoints || item.points }));
  function toggle(name) {
    setEnabled((current) => {
      const next = new Set(current);
      if (next.has(name)) { if (next.size > 1) next.delete(name); }
      else next.add(name);
      return next;
    });
  }
  return (
    <section className={styles.chartCard} aria-labelledby="current-harness-stars-title">
      <div className={styles.chartHeading}>
        <div>
          <h2 id="current-harness-stars-title">Compare repository stars</h2>
          <p>{view === 'line' ? 'Follow estimated historical counts and see current snapshots for repositories without history.' : 'Compare the latest repository counts.'}</p>
        </div>
        <div className={styles.viewControls} role="group" aria-label="Chart view">
          <button type="button" className={view === 'line' ? styles.selectedControl : ''} aria-pressed={view === 'line'} onClick={() => setView('line')}>Growth over time</button>
          <button type="button" className={view === 'bar' ? styles.selectedControl : ''} aria-pressed={view === 'bar'} onClick={() => setView('bar')}>Current stars</button>
        </div>
      </div>
      {view === 'bar' && <p className={styles.selectionHint}>Select repositories to compare.</p>}
      <div className={styles.choiceList} aria-label="Repositories to compare">
        {series.map((item) => <label key={item.name} className={`${styles.choice} ${enabled.has(item.name) ? '' : styles.choiceOff}`}>
          <input type="checkbox" checked={enabled.has(item.name)} onChange={() => toggle(item.name)} />
          <span className={styles.legendSwatch} style={{ '--series-color': seriesColor(item, series) }} />
          <span>{item.name}<span className={styles.srOnly}>: {countFormat(item.current)} stars</span></span>
        </label>)}
      </div>
      {view === 'bar' && <div className={styles.barWrap} ref={containerRef}>
        <svg className={styles.chartSvg} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Current GitHub star counts for ${visible.map((item) => item.name).join(', ')}`}>
          {visible.map((item, index) => {
            const y = 12 + index * rowHeight;
            const color = seriesColor(item, series);
            return <g key={item.name} transform={`translate(0,${y})`}>
              <text className={styles.barName} x={left - 12} y="19" textAnchor="end">{item.name}</text>
              <rect className={styles.barTrack} x={left} y="4" width={width - left - right} height="20" rx="5" />
              <rect x={left} y="4" width={Math.max(2, scale(item.current))} height="20" rx="5" fill={color} />
              <text className={styles.barValue} x={Math.min(width - 8, left + scale(item.current) + 8)} y="19">{countFormat(item.current)}</text>
            </g>;
          })}
        </svg>
      </div>}
      {view === 'bar' && <div className={styles.repoNotes}>
        {visible.map((item) => <p key={item.name}><a href={item.url || `https://github.com/${item.repo}`} target="_blank" rel="noreferrer">{item.name} ↗</a>{item.note ? ` · ${item.note}` : ''}</p>)}
      </div>}
      {view === 'line' && <StarChart
        chartId="current-stars-history"
        title="Repository star history"
        description="Estimated historical counts are shown as a line; repositories with one snapshot appear as a dot on the snapshot date."
        series={comparisonSeries}
        initialNames={[]}
        selection={enabled}
        onToggle={setEnabled}
        embedded
        asOf={asOf}
      />}
      <p className={styles.keyboardHint}>Counts are a fixed snapshot from {dateFormat(new Date(`${asOf}T00:00:00Z`))}; stars do not measure usage or quality.</p>
      <div className={styles.srOnly} aria-live="polite" aria-atomic="true">Selected repository counts: {visible.map((item) => `${item.name}, ${countFormat(item.current)} stars`).join('; ')}.</div>
    </section>
  );
}

function ProjectionChart({ data }) {
  const deepSeek = data.series.find((item) => item.name === 'DeepSeek Harness');
  const [windowDays, setWindowDays] = useState(30);
  const [horizon, setHorizon] = useState(90);
  const [active, setActive] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const containerRef = useRef(null);
  const [width, setWidth] = useState(760);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(1, entry.contentRect.width)));
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const projection = useMemo(() => {
    if (!deepSeek?.points?.length) return null;
    const baseDate = new Date(`${data.asOf}T00:00:00Z`);
    const startValue = deepSeek.current;
    const dailyRate = Number(data.rates?.[windowDays]) || 0;
    const samples = Array.from({ length: horizon + 1 }, (_, day) => {
      const elapsed = day;
      const slow = dailyRate * ((1 - Math.pow(0.5, elapsed / 30)) / Math.log(2)) * 30;
      return {
        day,
        date: d3.utcDay.offset(baseDate, day),
        slow: Math.round(startValue + slow),
        steady: Math.round(startValue + dailyRate * elapsed),
        fast: Math.round(startValue + dailyRate * 1.5 * elapsed),
      };
    });
    const historical = deepSeek.points.map((point) => ({ date: new Date(`${point.date}T00:00:00Z`), stars: point.stars }));
    const historyStart = historical[0].date;
    const height = 360;
    const margin = { top: 22, right: 24, bottom: 62, left: 66 };
    const innerWidth = Math.max(1, width - margin.left - margin.right);
    const innerHeight = height - margin.top - margin.bottom;
    const x = d3.scaleUtc().domain([historyStart, d3.utcDay.offset(baseDate, horizon)]).range([0, innerWidth]);
    const maxValue = d3.max(samples, (point) => point.fast);
    const y = d3.scaleLinear().domain([0, maxValue * 1.08]).nice(5).range([innerHeight, 0]);
    const scenarioLine = (key) => d3.line().x((point) => x(point.date)).y((point) => y(point[key])).curve(d3.curveLinear);
    const historyLine = d3.line().x((point) => x(point.date)).y((point) => y(point.stars));
    const cursorDay = selectedDay === null ? null : Math.max(0, Math.min(horizon, selectedDay));
    const cursor = cursorDay === null ? null : samples[cursorDay];
    return { baseDate, dailyRate, projection: samples, historical, height, margin, innerWidth, innerHeight, x, y, scenarioLine, historyLine, cursor };
  }, [data, deepSeek, horizon, selectedDay, width, windowDays]);

  if (!deepSeek) return null;
  const scenarios = [
    { key: 'slow', label: 'Slower · gains halve every 30 days', color: '#64d6c5' },
    { key: 'steady', label: 'Steady · current daily rate', color: '#72a7ff' },
    { key: 'fast', label: 'Faster · 1.5× current daily rate', color: '#f5c542' },
  ];
  const dateFormatLong = d3.utcFormat('%b %-d, %Y');
  const onKeyDown = (event) => {
    if (!projection) return;
    const current = selectedDay ?? 0;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') { event.preventDefault(); setSelectedDay(Math.max(0, current - 3)); }
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') { event.preventDefault(); setSelectedDay(Math.min(horizon, current + 3)); }
    else if (event.key === 'Home') { event.preventDefault(); setSelectedDay(0); }
    else if (event.key === 'End') { event.preventDefault(); setSelectedDay(horizon); }
    else if (event.key === 'Escape') setActive(false);
  };
  const updatePointer = (event) => {
    const bounds = containerRef.current.getBoundingClientRect();
    const localX = event.clientX - bounds.left - projection.margin.left;
    const date = projection.x.invert(Math.max(0, Math.min(projection.innerWidth, localX)));
    setSelectedDay(Math.max(0, Math.min(horizon, Math.round((+date - +projection.baseDate) / 86400000))));
  };

  return (
    <section className={styles.chartCard} aria-labelledby="deepseek-projection-title">
      <div className={styles.chartHeading}>
        <div>
          <h2 id="deepseek-projection-title">Where could DeepSeek Harness go next?</h2>
          <p>Explore three simple paths from its current star count. Change the recent growth window and projection horizon.</p>
        </div>
      </div>
      <div className={styles.projectionControls}>
        <fieldset><legend>Recent daily gain</legend>{[7, 14, 30].map((days) => <button key={days} type="button" aria-pressed={windowDays === days} className={windowDays === days ? styles.selectedControl : ''} onClick={() => setWindowDays(days)}>{days} days</button>)}</fieldset>
        <fieldset><legend>Project ahead</legend>{[30, 90, 180].map((days) => <button key={days} type="button" aria-pressed={horizon === days} className={horizon === days ? styles.selectedControl : ''} onClick={() => { setHorizon(days); setSelectedDay(null); }}>{days} days</button>)}</fieldset>
      </div>
      <div className={styles.projectionLegend}>
        <span><i className={styles.observedSwatch} />Observed history · sampled</span>
        {scenarios.map((scenario) => <span key={scenario.key}><i style={{ backgroundColor: scenario.color }} />{scenario.label}</span>)}
      </div>
      <p className={styles.rateSummary}>Selected pace: ≈{countFormat(Math.round(projection?.dailyRate || 0))} stars/day using the {windowDays}-day window. Projection endpoint: {projection ? dateFormatLong(projection.projection[horizon].date) : ''}.</p>
      <div className={styles.chartWrap} ref={containerRef}>
        {projection && <svg className={styles.chartSvg} viewBox={`0 0 ${width} ${projection.height}`} role="img" aria-label="Interactive DeepSeek Harness GitHub star projections. Use arrow keys to inspect projected values.">
          <g transform={`translate(${projection.margin.left},${projection.margin.top})`}>
            {projection.y.ticks(5).map((tick) => <g className={styles.yTick} key={tick} transform={`translate(0,${projection.y(tick)})`}><line x2={projection.innerWidth} /><text x={-12} dy="0.32em">{d3.format('~s')(tick)}</text></g>)}
            {projection.x.ticks(Math.max(3, Math.floor(projection.innerWidth / 110))).map((tick) => <g className={styles.xTick} key={+tick} transform={`translate(${projection.x(tick)},${projection.innerHeight})`}><line y2="6" /><text y="23" textAnchor="middle">{d3.utcFormat('%b %Y')(tick)}</text></g>)}
            <path className={styles.line} d={projection.historyLine(projection.historical)} stroke="#72a7ff" />
            {scenarios.map((scenario) => <path key={scenario.key} className={`${styles.line} ${styles.projectionLine}`} d={projection.scenarioLine(scenario.key)(projection.projection)} stroke={scenario.color} />)}
            <g pointerEvents="none"><line className={styles.snapshotLine} x1={projection.x(projection.baseDate)} x2={projection.x(projection.baseDate)} y1="0" y2={projection.innerHeight} /><text className={styles.snapshotLabel} x={projection.x(projection.baseDate) + 5} y="12">Snapshot</text></g>
            {projection.cursor && <g pointerEvents="none"><line className={styles.cursorLine} x1={projection.x(projection.cursor.date)} x2={projection.x(projection.cursor.date)} y1="0" y2={projection.innerHeight} />{scenarios.map((scenario) => <circle key={scenario.key} cx={projection.x(projection.cursor.date)} cy={projection.y(projection.cursor[scenario.key])} r="4.5" fill={scenario.color} stroke="#080b10" strokeWidth="2" />)}</g>}
            <rect className={styles.interactionSurface} x={projection.x(projection.baseDate)} y="0" width={projection.innerWidth - projection.x(projection.baseDate)} height={projection.innerHeight} tabIndex="0" role="slider" aria-label="Projection date selector" aria-valuemin="0" aria-valuemax={horizon} aria-valuenow={projection.cursor?.day ?? 0} aria-valuetext={projection.cursor ? dateFormatLong(projection.cursor.date) : 'Current count'} onPointerMove={(event) => { setActive(true); updatePointer(event); }} onPointerLeave={() => setActive(false)} onFocus={() => { setActive(true); setSelectedDay((value) => value ?? 0); }} onBlur={() => setActive(false)} onKeyDown={onKeyDown} onClick={updatePointer} />
          </g>
          <text className={styles.xLabel} x={projection.margin.left + projection.innerWidth / 2} y={projection.height - 5}>Date (UTC)</text>
          <text className={styles.yLabel} transform={`translate(16 ${projection.margin.top + projection.innerHeight / 2}) rotate(-90)`}>GitHub stars</text>
        </svg>}
        {projection?.cursor && active && <div className={styles.tooltip}><strong>{dateFormatLong(projection.cursor.date)}</strong>{scenarios.map((scenario) => <span key={scenario.key}><i style={{ backgroundColor: scenario.color }} />{scenario.label.split(' ·')[0]}<b>{countFormat(projection.cursor[scenario.key])}</b></span>)}</div>}
      </div>
      <div className={styles.projectionTotals}>
        <span>Snapshot {dateFormatLong(projection?.baseDate)} <strong>{countFormat(deepSeek.current)}</strong></span>
        {scenarios.map((scenario) => <span key={scenario.key} style={{ '--series-color': scenario.color }}>{scenario.label.split(' ·')[0]} at {horizon} days <strong>{countFormat(projection?.projection[horizon][scenario.key] ?? deepSeek.current)}</strong></span>)}
      </div>
      <p className={styles.projectionNote}>Illustrative math, not a forecast with a confidence interval. Each scenario starts from the {data.asOf} GitHub count and applies the selected {windowDays}-day average daily gain. “Slower” halves that daily gain every 30 days; “steady” holds it constant; “faster” multiplies it by 1.5. Historical points are sampled estimates.</p>
      <div className={styles.srOnly} aria-live="polite" aria-atomic="true">{active && projection?.cursor && `${dateFormatLong(projection.cursor.date)}. Slower: ${countFormat(projection.cursor.slow)}. Steady: ${countFormat(projection.cursor.steady)}. Faster: ${countFormat(projection.cursor.fast)} stars.`}</div>
    </section>
  );
}

export default function StarGrowthCharts({ data }) {
  const comparison = data.series.filter((item) => ['Hermes Agent', 'DeepSeek Harness'].includes(item.name));
  const historicalSeries = data.series.filter((item) => ['OpenClaw', 'Hermes Agent', 'DeepSeek Harness'].includes(item.name));
  const deepSeek = data.series.find((item) => item.name === 'DeepSeek Harness');
  const asOfLabel = dateFormat(new Date(`${data.asOf}T00:00:00Z`));
  return (
    <div className={styles.experience}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Public repositories · GitHub stars</p>
        <h1>GitHub stars: the rise of DeepSeek Harness</h1>
        <p className={styles.intro}>A snapshot of how DeepSeek Harness has grown alongside public repositories for major coding harnesses, plus an interactive look at possible paths ahead.</p>
        <div className={styles.snapshot}>
          <span>Snapshot date <strong>{asOfLabel}</strong></span>
          <span>Latest counts <strong>GitHub API</strong></span>
          <span>History charts <strong>3 sampled · 14 estimated</strong></span>
        </div>
      </header>

      <div className={styles.charts}>
        <ProjectionChart data={data} />
        <CurrentStarsChart series={data.series} asOf={data.asOf} />
        <StarChart
          chartId="three-agents"
          title="The original three: historical growth"
          description="These three repositories have sampled history. Values between points are interpolated for display."
          series={historicalSeries}
          initialNames={['DeepSeek Harness', 'Hermes Agent', 'OpenClaw']}
        />
        <StarChart
          chartId="hermes-deepseek"
          title="Hermes Agent and DeepSeek Harness"
          description="A focused view of Hermes Agent and DeepSeek Harness on their own shared scale."
          series={comparison}
          initialNames={['Hermes Agent', 'DeepSeek Harness']}
        />
      </div>

      <aside className={styles.methodology}>
        <div>
          <p className={styles.eyebrow}>How to read this</p>
          <h2>Repository stars, with context</h2>
        </div>
        <div className={styles.methodCopy}>
          <p>The original history charts below continue to use digitized points for OpenClaw, Hermes Agent, and DeepSeek Harness, rounded to the nearest 100 stars and calendar day. The switchable comparison above also shows estimated histories for 14 repositories, built by subtracting GitHub-reported weekly star additions from the fixed snapshot; three have recent-only coverage. Four repositories have only a single snapshot. Estimates can be affected by removed stars and non-UTC calendar boundaries.</p>
          <p>Star counts measure GitHub stars on each listed repository; they do not measure product usage, quality, or the full audience. Claude Code’s public repository reflects feedback and documentation around a closed product. Pi’s repository is a monorepo with more than one package. Counts are a fixed snapshot from {asOfLabel} and do not refresh live.</p>
          <a className={styles.download} href="/data/agent-star-growth/history.json" download>Download the chart data <span>↓</span></a>
        </div>
      </aside>
      <footer className={styles.footer}>Data snapshot: {asOfLabel} · Source: GitHub and <a href="https://star-history.com/">Star History</a></footer>
    </div>
  );
}
