'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import styles from './StarGrowthCharts.module.css';

const colors = {
  'OpenClaw': '#f5c542',
  'Hermes Agent': '#f27ca5',
  'DeepSeek Harness': '#72a7ff',
};

const dateFormat = d3.utcFormat('%b %-d, %Y');
const countFormat = d3.format(',');

function valueAt(series, timestamp) {
  const points = series.points.map((point) => ({
    date: new Date(`${point.date}T00:00:00Z`),
    stars: point.stars,
  }));
  const bisect = d3.bisector((point) => +point.date).left;
  if (timestamp < +points[0].date || timestamp > +points[points.length - 1].date) return null;
  const index = bisect(points, timestamp);
  if (index === 0) return points[0].stars;
  if (index >= points.length) return points[points.length - 1].stars;
  const before = points[index - 1];
  const after = points[index];
  const progress = (timestamp - +before.date) / (+after.date - +before.date);
  return Math.round(d3.interpolateNumber(before.stars, after.stars)(progress));
}

function StarChart({ title, description, series, chartId }) {
  const containerRef = useRef(null);
  const [width, setWidth] = useState(760);
  const [enabled, setEnabled] = useState(() => new Set(series.map((item) => item.name)));
  const [selectedTime, setSelectedTime] = useState(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry.contentRect.width)));
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const chart = useMemo(() => {
    const visibleSeries = series.filter((item) => enabled.has(item.name));
    const allPoints = visibleSeries.flatMap((item) => item.points.map((point) => ({
      date: new Date(`${point.date}T00:00:00Z`),
      stars: point.stars,
    })));
    if (!allPoints.length) return null;

    const height = 360;
    const margin = { top: 22, right: 24, bottom: 62, left: 66 };
    const innerWidth = Math.max(1, width - margin.left - margin.right);
    const innerHeight = height - margin.top - margin.bottom;
    const x = d3.scaleUtc().domain(d3.extent(allPoints, (point) => point.date)).range([0, innerWidth]);
    const maxValue = d3.max(allPoints, (point) => point.stars);
    const y = d3.scaleLinear().domain([0, maxValue * 1.08]).nice(5).range([innerHeight, 0]);
    const line = d3.line().x((point) => x(point.date)).y((point) => y(point.stars)).curve(d3.curveLinear);
    const cursorDate = selectedTime === null ? null : new Date(Math.max(+x.domain()[0], Math.min(+x.domain()[1], selectedTime)));
    const ticks = x.ticks(Math.max(3, Math.floor(innerWidth / 110)));
    const valueRows = cursorDate ? visibleSeries.map((item) => ({ name: item.name, value: valueAt(item, +cursorDate) })).filter((row) => row.value !== null) : [];
    return { height, margin, innerWidth, innerHeight, x, y, line, cursorDate, ticks, valueRows, visibleSeries };
  }, [enabled, selectedTime, series, width]);

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
    setEnabled((current) => {
      const next = new Set(current);
      if (next.has(name)) {
        if (next.size === 1) return current;
        next.delete(name);
      } else next.add(name);
      return next;
    });
  }

  return (
    <section className={styles.chartCard} aria-labelledby={`${chartId}-title`}>
      <div className={styles.chartHeading}>
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
              <span className={styles.legendSwatch} style={{ '--series-color': colors[item.name] }} />
              {item.name}<span className={styles.legendCount}>{countFormat(item.current)}</span>
            </button>
          ))}
        </div>
      </div>
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
              {chart.visibleSeries.map((item) => (
                <g key={item.name}>
                  <path className={styles.line} d={chart.line(item.points.map((point) => ({ date: new Date(`${point.date}T00:00:00Z`), stars: point.stars })))} stroke={colors[item.name]} />
                  {item.points.map((point) => <circle key={point.date} className={styles.sampleDot} cx={chart.x(new Date(`${point.date}T00:00:00Z`))} cy={chart.y(point.stars)} r="2.7" fill={colors[item.name]} />)}
                </g>
              ))}
              {chart.cursorDate && (
                <g pointerEvents="none">
                  <line className={styles.cursorLine} x1={chart.x(chart.cursorDate)} x2={chart.x(chart.cursorDate)} y1="0" y2={chart.innerHeight} />
                  {chart.valueRows.map((row) => (
                    <circle key={row.name} cx={chart.x(chart.cursorDate)} cy={chart.y(row.value)} r="5" fill={colors[row.name]} stroke="#080b10" strokeWidth="2" />
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
                <i style={{ backgroundColor: colors[row.name] }} />{row.name}<b>{countFormat(row.value)}</b>
              </span>
            ))}
          </div>
        )}
      </div>
      <p className={styles.keyboardHint}>Hover, tap, or focus the chart and use ←/→ to inspect dates. Values between sampled points are linearly interpolated.</p>
      <div className={styles.srOnly} aria-live="polite" aria-atomic="true">
        {active && chart?.cursorDate && `${dateFormat(chart.cursorDate)}. ${chart.valueRows.map((row) => `${row.name}: ${countFormat(row.value)} stars`).join('. ')}`}
      </div>
    </section>
  );
}

export default function StarGrowthCharts({ data }) {
  const comparison = data.series.filter((item) => item.name !== 'OpenClaw');
  return (
    <div className={styles.experience}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Open source · GitHub stars</p>
        <h1>GitHub stars: the rise of AI agents</h1>
        <p className={styles.intro}>A historical look at the star growth of OpenClaw, Hermes Agent, and DeepSeek Harness, through October 3, 2026.</p>
        <div className={styles.snapshot}>
          <span>Snapshot date <strong>October 3, 2026</strong></span>
          <span>Latest counts <strong>GitHub API</strong></span>
          <span>Historical curve <strong>Digitized estimates</strong></span>
        </div>
      </header>

      <div className={styles.charts}>
        <StarChart
          chartId="three-agents"
          title="The full race"
          description="Star history for all three repositories, from each series’ first sampled point to the snapshot date."
          series={data.series}
        />
        <StarChart
          chartId="hermes-deepseek"
          title="Hermes Agent and DeepSeek Harness"
          description="A closer comparison of the two projects, with a separate scale for readability."
          series={comparison}
        />
      </div>

      <aside className={styles.methodology}>
        <div>
          <p className={styles.eyebrow}>How to read this</p>
          <h2>Historical estimates, exact snapshot</h2>
        </div>
        <div className={styles.methodCopy}>
          <p>Historical points are approximate values digitized from the endpoints of the <a href={data.source} target="_blank" rel="noreferrer">Star History chart</a> path, rounded to the nearest 100 stars and calendar day. Lines connect these sampled points; values shown between them are linear interpolations, not daily observations.</p>
          <p>October 3 counts are exact repository star counts retrieved from the GitHub API: <a href="https://github.com/openclaw/openclaw">OpenClaw</a> ({countFormat(data.series.find((item) => item.name === 'OpenClaw').current)}), <a href="https://github.com/NousResearch/hermes-agent">Hermes Agent</a> ({countFormat(data.series.find((item) => item.name === 'Hermes Agent').current)}), and <a href="https://github.com/deepseek-ai/deepseek-harness">DeepSeek Harness</a> ({countFormat(data.series.find((item) => item.name === 'DeepSeek Harness').current)}). This is a fixed historical snapshot and does not refresh live.</p>
          <a className={styles.download} href="/data/agent-star-growth/history.json" download>Download the chart data <span>↓</span></a>
        </div>
      </aside>
      <footer className={styles.footer}>Data snapshot: October 3, 2026 · Source: GitHub and <a href="https://star-history.com/">Star History</a></footer>
    </div>
  );
}
