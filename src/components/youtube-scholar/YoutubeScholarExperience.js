'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import * as d3 from 'd3';
import styles from './YoutubeScholarExperience.module.css';

function useChartSize(defaultHeight) {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: defaultHeight });

  useEffect(() => {
    if (!ref.current) return undefined;

    const node = ref.current;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      setSize({
        width,
        height: Math.max(defaultHeight, Math.min(defaultHeight + 80, width * 0.68)),
      });
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, [defaultHeight]);

  return [ref, size];
}

function domainLookup(taxonomy) {
  return Object.fromEntries(taxonomy.map((domain) => [domain.id, domain]));
}

function KpiStrip({ items }) {
  return (
    <div className={styles.kpiGrid}>
      {items.map((item) => (
        <div key={item.label} className={styles.kpiCard}>
          <div className={styles.kpiValue}>{item.value}</div>
          <div className={styles.kpiLabel}>
            {item.label}
            {item.estimated ? <span className={styles.kpiMeta}>Est.</span> : null}
          </div>
          <p className={styles.kpiDetail}>{item.detail}</p>
        </div>
      ))}
    </div>
  );
}

function LoyaltyCreators({ creators, domains, activeDomain, onSelect }) {
  const maxScore = d3.max(creators, (creator) => creator.loyaltyScore) || 100;

  return (
    <div className={styles.sideCard}>
      <div className={styles.sideCardHeader}>
        <span className={styles.eyebrow}>Loyalty creators</span>
        <h3>Signal sources with tenure</h3>
      </div>
      <div className={styles.loyaltyList}>
        {creators.map((creator) => {
          const domain = domains[creator.domainId];
          const focused = !activeDomain || activeDomain === creator.domainId;
          return (
            <button
              type="button"
              key={creator.label}
              className={`${styles.loyaltyRow} ${focused ? styles.focusedRow : styles.dimmedRow}`}
              onClick={() => onSelect(creator.domainId)}
            >
              <div className={styles.loyaltyHead}>
                <span>{creator.label}</span>
                <span>{creator.watchCount} watches</span>
              </div>
              <div className={styles.loyaltyBar}>
                <div
                  className={styles.loyaltyFill}
                  style={{
                    width: `${(creator.loyaltyScore / maxScore) * 100}%`,
                    background: domain.color,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function KnowledgeMap({ taxonomy, activeDomain, onSelect }) {
  const [containerRef, size] = useChartSize(340);
  const [tooltip, setTooltip] = useState(null);
  const selected = taxonomy.find((domain) => domain.id === activeDomain) || taxonomy[0];

  let leaves = [];
  if (size.width > 0) {
    const root = d3.hierarchy({ children: taxonomy }).sum((item) => item.value);
    d3.treemap().size([size.width, size.height]).paddingOuter(6).paddingInner(8).round(true)(root);
    leaves = root.leaves();
  }

  return (
    <div className={styles.chartSectionGrid}>
      <div className={styles.chartCard} ref={containerRef}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Knowledge map</span>
          <h2>Domain portfolio, not dashboard filler</h2>
          <p>
            Click a tile to focus the rest of the page. Hover if you want the plain-English version without pretending everyone enjoys taxonomy diagrams.
          </p>
        </div>

        {size.width > 0 ? (
          <div className={styles.chartSurface}>
            <svg viewBox={`0 0 ${size.width} ${size.height}`} className={styles.svgChart} role="img" aria-label="Treemap of YouTube knowledge domains">
              {leaves.map((leaf) => {
                const domain = leaf.data;
                const isActive = domain.id === selected.id;
                const isDim = activeDomain && !isActive;
                const width = Math.max(leaf.x1 - leaf.x0, 0);
                const height = Math.max(leaf.y1 - leaf.y0, 0);
                return (
                  <g
                    key={domain.id}
                    transform={`translate(${leaf.x0},${leaf.y0})`}
                    onMouseEnter={() => setTooltip({ domain, x: leaf.x0 + width / 2, y: leaf.y0 + 18 })}
                    onMouseLeave={() => setTooltip(null)}
                    onClick={() => onSelect(domain.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect
                      width={width}
                      height={height}
                      rx="18"
                      className={isDim ? styles.treemapDim : styles.treemapRect}
                      fill={domain.color}
                      fillOpacity={isActive ? 0.95 : 0.74}
                      stroke={isActive ? '#f5f5f4' : 'rgba(255,255,255,0.1)'}
                      strokeWidth={isActive ? 2 : 1}
                    />
                    <foreignObject x="14" y="14" width={Math.max(width - 28, 0)} height={Math.max(height - 28, 0)}>
                      <div className={styles.treemapLabel}>
                        <strong>{domain.label}</strong>
                        <span>{domain.summary}</span>
                        <em>{domain.searchCount} matched searches</em>
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
            </svg>
            {tooltip ? (
              <div
                className={styles.tooltip}
                style={{
                  left: Math.min(Math.max(tooltip.x, 80), size.width - 80),
                  top: tooltip.y,
                }}
              >
                <strong>{tooltip.domain.label}</strong>
                <span>{tooltip.domain.narrative}</span>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <aside className={styles.detailCard}>
        <span className={styles.eyebrow}>Focused domain</span>
        <h3>{selected.label}</h3>
        <p className={styles.detailLead}>{selected.narrative}</p>
        <div className={styles.signalList}>
          {selected.representativeSignals.map((signal) => (
            <div key={signal} className={styles.signalPill}>
              {signal}
            </div>
          ))}
        </div>
        <div className={styles.noteCard}>
          <strong>{selected.searchCount} matched search signals</strong>
          <p className={styles.footnote}>
            Enough direct evidence to make the pattern credible, without pretending every watch session fits neatly inside a labeled box.
          </p>
        </div>
      </aside>
    </div>
  );
}

function IntentCurve({ series, annotations, taxonomy, activeDomain, onSelect, watchTrend }) {
  const [containerRef, size] = useChartSize(300);
  const domainIds = taxonomy.map((domain) => domain.id);
  const xDomain = series.map((item) => new Date(item.year, 0, 1));
  const stacked = d3.stack().keys(domainIds)(series);
  const totals = series.map((item) => domainIds.reduce((sum, id) => sum + item[id], 0));
  const chartWatchTrend = watchTrend.slice(-5);
  const declineWindow = chartWatchTrend.length >= 3 && chartWatchTrend[2].count > chartWatchTrend[chartWatchTrend.length - 1].count;

  if (!size.width || !series.length) {
    return <div ref={containerRef} className={styles.chartCard} />;
  }

  const margin = { top: 26, right: 24, bottom: 42, left: 46 };
  const innerWidth = size.width - margin.left - margin.right;
  const innerHeight = size.height - margin.top - margin.bottom;
  const x = d3.scaleTime().domain(d3.extent(xDomain)).range([0, innerWidth]);
  const y = d3.scaleLinear().domain([0, d3.max(totals) || 0]).nice().range([innerHeight, 0]);
  const area = d3.area()
    .x((d) => x(new Date(d.data.year, 0, 1)))
    .y0((d) => y(d[0]))
    .y1((d) => y(d[1]))
    .curve(d3.curveMonotoneX);

  return (
    <div className={styles.chartCard} ref={containerRef}>
      <div className={styles.sectionHeader}>
        <span className={styles.eyebrow}>Search intent growth curve</span>
        <h2>Curiosity becomes strategy over time</h2>
        <p>
          Early breadth gives way to engineering depth, geopolitical monitoring, and later AI architecture. The interesting part is not the volume. It&apos;s the specialization.
        </p>
      </div>

      <div className={styles.legendRow}>
        {taxonomy.map((domain) => {
          const active = !activeDomain || activeDomain === domain.id;
          return (
            <button
              type="button"
              key={domain.id}
              className={`${styles.legendItem} ${active ? styles.legendActive : styles.legendMuted}`}
              onClick={() => onSelect(activeDomain === domain.id ? taxonomy[0].id : domain.id)}
            >
              <span className={styles.legendSwatch} style={{ background: domain.color }} />
              {domain.label}
            </button>
          );
        })}
      </div>

      <div className={styles.chartSurface}>
        <svg viewBox={`0 0 ${size.width} ${size.height}`} className={styles.svgChart} role="img" aria-label="Stacked area chart of search intent over time">
          <g transform={`translate(${margin.left},${margin.top})`}>
            {stacked.map((layer) => {
              const domain = taxonomy.find((item) => item.id === layer.key);
              const dimmed = activeDomain && activeDomain !== layer.key;
              return (
                <path
                  key={layer.key}
                  d={area(layer)}
                  fill={domain.color}
                  opacity={dimmed ? 0.14 : 0.82}
                  onClick={() => onSelect(layer.key)}
                  style={{ cursor: 'pointer' }}
                />
              );
            })}

            {y.ticks(4).map((tick) => (
              <g key={tick} transform={`translate(0,${y(tick)})`}>
                <line x2={innerWidth} stroke="rgba(255,255,255,0.08)" />
                <text x="-10" dy="0.32em" textAnchor="end" className={styles.axisText}>
                  {tick}
                </text>
              </g>
            ))}

            {series.map((item) => {
              const date = new Date(item.year, 0, 1);
              return (
                <g key={item.year} transform={`translate(${x(date)},0)`}>
                  <line y2={innerHeight} stroke="rgba(255,255,255,0.08)" />
                  <text y={innerHeight + 24} textAnchor="middle" className={styles.axisText}>
                    {item.year}
                  </text>
                </g>
              );
            })}

            {annotations.map((note) => {
              const date = new Date(note.year, 0, 1);
              const xPos = x(date);
              const yPos = 18 + (note.domainId === activeDomain ? 0 : 12);
              return (
                <g key={note.title} transform={`translate(${xPos},${yPos})`} opacity={!activeDomain || activeDomain === note.domainId ? 1 : 0.45}>
                  <line y1="16" y2={innerHeight - 18} stroke="rgba(255,255,255,0.16)" strokeDasharray="4 6" />
                  <circle r="4" fill={domainLookup(taxonomy)[note.domainId].color} />
                  <foreignObject x="10" y="-12" width="180" height="72">
                    <div className={styles.annotationCard}>
                      <strong>{note.title}</strong>
                      <span>{note.body}</span>
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <div className={styles.contextBand}>
        <div>
          <strong>Watch trend:</strong>{' '}
          {declineWindow ? 'overall watch volume has eased after the 2022-2023 peak.' : 'watch volume is still cycling at a high level.'}
        </div>
        <div className={styles.sparklineRow}>
          {chartWatchTrend.map((point) => (
            <div key={point.year} className={styles.sparkBarWrap}>
              <div
                className={styles.sparkBar}
                style={{ height: `${(point.count / (d3.max(chartWatchTrend, (item) => item.count) || 1)) * 100}%` }}
              />
              <span>{point.year}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LearningHeatmap({ heatmap }) {
  const [containerRef, size] = useChartSize(260);
  const [tooltip, setTooltip] = useState(null);
  const color = d3.scaleLinear().domain([0, 1]).range(['#111827', '#67c1b8']);

  if (!size.width) {
    return <div ref={containerRef} className={styles.chartCard} />;
  }

  const margin = { top: 30, right: 12, bottom: 38, left: 56 };
  const innerWidth = size.width - margin.left - margin.right;
  const innerHeight = size.height - margin.top - margin.bottom;
  const x = d3.scaleBand().domain(heatmap.hourLabels).range([0, innerWidth]).padding(0.12);
  const y = d3.scaleBand().domain(heatmap.dayLabels).range([0, innerHeight]).padding(0.16);

  return (
    <div className={styles.chartCard} ref={containerRef}>
      <div className={styles.sectionHeader}>
        <span className={styles.eyebrow}>Peak learning heatmap</span>
        <h2>Time windows where the algorithm met a willing accomplice</h2>
        <p>Morning focus and late-evening curiosity do most of the lifting. The calendar remains imperfect, but the pattern is very clear.</p>
      </div>
      <div className={styles.chartSurface}>
        <svg viewBox={`0 0 ${size.width} ${size.height}`} className={styles.svgChart} role="img" aria-label="Heatmap of learning activity by day and hour">
          <g transform={`translate(${margin.left},${margin.top})`}>
            {heatmap.cells.map((cell) => {
              const xPos = x(heatmap.hourLabels[cell.hour]);
              const yPos = y(cell.dayLabel);
              const highlighted = [9, 10, 11, 22, 23].includes(cell.hour);
              return (
                <rect
                  key={`${cell.day}-${cell.hour}`}
                  x={xPos}
                  y={yPos}
                  width={x.bandwidth()}
                  height={y.bandwidth()}
                  rx="6"
                  fill={color(cell.intensity)}
                  stroke={highlighted ? 'rgba(242,166,90,0.65)' : 'rgba(255,255,255,0.06)'}
                  strokeWidth={highlighted ? 1.2 : 1}
                  onMouseEnter={() => setTooltip(cell)}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}

            {heatmap.dayLabels.map((label) => (
              <text key={label} x="-12" y={(y(label) || 0) + y.bandwidth() / 2} textAnchor="end" dominantBaseline="middle" className={styles.axisText}>
                {label}
              </text>
            ))}

            {heatmap.hourLabels.filter((_, index) => index % 3 === 0).map((label) => (
              <text
                key={label}
                x={(x(label) || 0) + x.bandwidth() / 2}
                y={innerHeight + 20}
                textAnchor="middle"
                className={styles.axisText}
              >
                {label.slice(0, 5)}
              </text>
            ))}
          </g>
        </svg>
        {tooltip ? (
          <div className={styles.tooltipStatic}>
            <strong>{tooltip.dayLabel}</strong>
            <span>{heatmap.hourLabels[tooltip.hour]}</span>
            <span>{tooltip.count.toLocaleString()} watch events</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function RabbitHoles({ rabbitHoles, domains, activeDomain, onSelect }) {
  const [containerRef, size] = useChartSize(240);
  if (!size.width) {
    return <div ref={containerRef} className={styles.chartCard} />;
  }

  const margin = { top: 10, right: 12, bottom: 24, left: 12 };
  const innerWidth = size.width - margin.left - margin.right;
  const rowHeight = 82;
  const chartHeight = rabbitHoles.length * rowHeight;
  const x = d3.scaleLinear()
    .domain([0, d3.max(rabbitHoles, (item) => Math.max(item.searchCount, item.watchCount)) || 1])
    .range([128, innerWidth - 12]);

  return (
    <div className={styles.chartCard} ref={containerRef}>
      <div className={styles.sectionHeader}>
        <span className={styles.eyebrow}>Rabbit holes</span>
        <h2>Small prompt, large consumption cluster</h2>
        <p>This is the curiosity engine: a search opens the loop, and suddenly the session has a plot arc.</p>
      </div>

      <div className={styles.chartSurface}>
        <svg viewBox={`0 0 ${size.width} ${chartHeight + margin.top + margin.bottom}`} className={styles.svgChart} role="img" aria-label="Rabbit hole chart showing search prompts growing into watch clusters">
          <g transform={`translate(${margin.left},${margin.top})`}>
            {rabbitHoles.map((item, index) => {
              const y = index * rowHeight + 26;
              const domain = domains[item.domainId];
              const dimmed = activeDomain && activeDomain !== item.domainId;
              return (
                <g key={item.id} opacity={dimmed ? 0.3 : 1} onClick={() => onSelect(item.domainId)} style={{ cursor: 'pointer' }}>
                  <text x="0" y={y - 8} className={styles.rabbitTitle}>{item.title}</text>
                  <text x="0" y={y + 12} className={styles.rabbitNote}>{item.spark}</text>
                  <line x1={x(item.searchCount)} x2={x(item.watchCount)} y1={y + 20} y2={y + 20} stroke={domain.color} strokeWidth="5" strokeLinecap="round" opacity="0.8" />
                  <circle cx={x(item.searchCount)} cy={y + 20} r="8" fill="#0b0f14" stroke={domain.color} strokeWidth="2" />
                  <circle cx={x(item.watchCount)} cy={y + 20} r="10" fill={domain.color} />
                  <text x={x(item.searchCount)} y={y + 44} textAnchor="middle" className={styles.axisText}>search</text>
                  <text x={x(item.watchCount)} y={y + 44} textAnchor="middle" className={styles.axisText}>watch</text>
                  <foreignObject x={x(item.searchCount) + 18} y={y - 10} width={Math.max(innerWidth - x(item.searchCount) - 18, 100)} height="46">
                    <div className={styles.rabbitBadge}>{item.conversionLabel}</div>
                  </foreignObject>
                  <text x="0" y={y + 60} className={styles.rabbitNote}>{item.note}</text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}

function ChannelWatchProxy({ data }) {
  const [containerRef, size] = useChartSize(320);
  const [granularity, setGranularity] = useState('year');
  const periods = data[granularity];
  const [selectedPeriod, setSelectedPeriod] = useState(periods[periods.length - 1]?.period || null);
  const [selectedChannel, setSelectedChannel] = useState(data.overall[0]?.channel || null);

  useEffect(() => {
    const latest = data[granularity][data[granularity].length - 1]?.period || null;
    setSelectedPeriod(latest);
  }, [data, granularity]);

  const currentPeriod = periods.find((period) => period.period === selectedPeriod) || periods[periods.length - 1];
  const leaderboard = currentPeriod?.leaderboard || [];
  const focusedChannel = selectedChannel || leaderboard[0]?.channel || data.overall[0]?.channel || '';

  const trend = periods.map((period) => ({
    period: period.period,
    count: period.leaderboard.find((item) => item.channel === focusedChannel)?.count || 0,
  }));

  if (!size.width) {
    return <div ref={containerRef} className={styles.chartCard} />;
  }

  const margin = { top: 12, right: 20, bottom: 18, left: 12 };
  const innerWidth = size.width - margin.left - margin.right;
  const rowHeight = 34;
  const chartHeight = leaderboard.length * rowHeight + 12;
  const labelOffset = size.width < 720 ? 138 : 178;
  const x = d3.scaleLinear()
    .domain([0, d3.max(leaderboard, (item) => item.count) || 1])
    .range([labelOffset, innerWidth - 8]);
  const y = d3.scaleBand().domain(leaderboard.map((item) => item.channel)).range([0, leaderboard.length * rowHeight]).padding(0.24);

  return (
    <div className={styles.chartSectionGrid}>
      <div className={styles.chartCard} ref={containerRef}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Channel watch proxy</span>
          <h2>Who absorbs the most attention</h2>
          <p>
            Ordered by watch events, not claimed minutes. It is the strongest clean proxy available in the export, and still useful for seeing channel gravity over time.
          </p>
        </div>

        <div className={styles.toggleRow}>
          {['year', 'quarter'].map((option) => (
            <button
              type="button"
              key={option}
              className={`${styles.toggleButton} ${granularity === option ? styles.toggleActive : ''}`}
              onClick={() => setGranularity(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <div className={styles.periodScroller}>
          {periods.map((period) => (
            <button
              type="button"
              key={period.period}
              className={`${styles.periodChip} ${selectedPeriod === period.period ? styles.periodChipActive : ''}`}
              onClick={() => setSelectedPeriod(period.period)}
            >
              {period.period}
            </button>
          ))}
        </div>

        <div className={styles.chartSurface}>
          <svg viewBox={`0 0 ${size.width} ${chartHeight + margin.top + margin.bottom}`} className={styles.svgChart} role="img" aria-label="Descending chart of watched channels by selected period">
            <g transform={`translate(${margin.left},${margin.top})`}>
              {leaderboard.map((item) => {
                const yPos = y(item.channel) || 0;
                const focused = item.channel === focusedChannel;
                return (
                  <g key={item.channel} onClick={() => setSelectedChannel(item.channel)} style={{ cursor: 'pointer' }}>
                    <text x="0" y={yPos + y.bandwidth() / 2} dominantBaseline="middle" className={styles.channelLabel}>
                      {item.channel}
                    </text>
                    <line
                      x1={labelOffset}
                      x2={x(item.count)}
                      y1={yPos + y.bandwidth() / 2}
                      y2={yPos + y.bandwidth() / 2}
                      stroke={focused ? '#67c1b8' : 'rgba(255,255,255,0.22)'}
                      strokeWidth={focused ? 10 : 8}
                      strokeLinecap="round"
                    />
                    <circle cx={x(item.count)} cy={yPos + y.bandwidth() / 2} r={focused ? 7 : 5} fill={focused ? '#f2a65a' : '#8f98a7'} />
                    <text x={x(item.count) + 14} y={yPos + y.bandwidth() / 2} dominantBaseline="middle" className={styles.axisText}>
                      {item.count}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        <p className={styles.footnote}>{data.note}</p>
      </div>

      <aside className={styles.sideCard}>
        <div className={styles.sideCardHeader}>
          <span className={styles.eyebrow}>Focused channel</span>
          <h3>{focusedChannel}</h3>
        </div>
        <div className={styles.periodMetric}>
          <strong>{currentPeriod?.period}</strong>
          <span>
            {leaderboard.find((item) => item.channel === focusedChannel)?.count || 0} watch events
          </span>
        </div>
        <Link
          href={`/projects/youtube-scholar/channels?view=${granularity}&period=${encodeURIComponent(currentPeriod?.period || '')}&channel=${encodeURIComponent(focusedChannel)}`}
          className={styles.expandButton}
        >
          Open expanded channel view
        </Link>
        <div className={styles.trendCard}>
          <ChannelTrend trend={trend} />
        </div>
        <div className={styles.loyaltyList}>
          {data.overall.slice(0, 8).map((item, index) => (
            <button
              type="button"
              key={item.channel}
              className={`${styles.loyaltyRow} ${focusedChannel === item.channel ? styles.focusedRow : ''}`}
              onClick={() => setSelectedChannel(item.channel)}
            >
              <div className={styles.loyaltyHead}>
                <span>{index + 1}. {item.channel}</span>
                <span>{item.count}</span>
              </div>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}

export function YoutubeScholarChannelsExplorer({ data, initialView = 'year', initialPeriod = null, initialChannel = null, compact = false }) {
  const searchParams = useSearchParams();
  const queryView = searchParams?.get('view');
  const queryPeriod = searchParams?.get('period');
  const queryChannel = searchParams?.get('channel');
  const resolvedInitialView = queryView === 'quarter' ? 'quarter' : initialView === 'quarter' ? 'quarter' : 'year';
  const [view, setView] = useState(resolvedInitialView);
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(compact ? 30 : 120);
  const periods = data[view];
  const [selectedPeriod, setSelectedPeriod] = useState(queryPeriod || initialPeriod || periods[periods.length - 1]?.period || null);
  const [selectedChannel, setSelectedChannel] = useState(queryChannel || initialChannel || data.overall[0]?.channel || null);

  useEffect(() => {
    if (queryView === 'quarter' || queryView === 'year') {
      setView(queryView);
    }
    if (queryPeriod) {
      setSelectedPeriod(queryPeriod);
    }
    if (queryChannel) {
      setSelectedChannel(queryChannel);
    }
  }, [queryChannel, queryPeriod, queryView]);

  useEffect(() => {
    if (!periods.some((item) => item.period === selectedPeriod)) {
      setSelectedPeriod(periods[periods.length - 1]?.period || null);
    }
  }, [periods, selectedPeriod]);

  const currentPeriod = periods.find((item) => item.period === selectedPeriod) || periods[periods.length - 1];
  const filtered = (currentPeriod?.leaderboard || []).filter((item) => item.channel.toLowerCase().includes(query.toLowerCase()));
  const visible = filtered.slice(0, limit);
  const focusedChannel = selectedChannel || visible[0]?.channel || data.overall[0]?.channel || '';
  const trend = periods.map((period) => ({
    period: period.period,
    count: period.leaderboard.find((item) => item.channel === focusedChannel)?.count || 0,
  }));
  const maxCount = visible[0]?.count || 1;

  return (
    <div className={compact ? styles.explorerCompact : styles.explorerGrid}>
      <div className={styles.chartCard}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>Expanded channel view</span>
          <h2>Every tracked channel, same proxy model</h2>
          <p>
            Search, sort by the selected period, and inspect long-tail channels without collapsing everything into a top-10 highlight reel.
          </p>
        </div>

        <div className={styles.controlsStack}>
          <div className={styles.toggleRow}>
            {['year', 'quarter'].map((option) => (
              <button
                type="button"
                key={option}
                className={`${styles.toggleButton} ${view === option ? styles.toggleActive : ''}`}
                onClick={() => setView(option)}
              >
                {option}
              </button>
            ))}
          </div>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={styles.searchInput}
            placeholder="Filter channels"
            aria-label="Filter channels"
          />
          <div className={styles.periodScroller}>
            {periods.map((period) => (
              <button
                type="button"
                key={period.period}
                className={`${styles.periodChip} ${selectedPeriod === period.period ? styles.periodChipActive : ''}`}
                onClick={() => setSelectedPeriod(period.period)}
              >
                {period.period}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.channelTable}>
          {visible.map((item, index) => (
            <button
              type="button"
              key={`${item.channel}-${item.count}`}
              className={`${styles.channelRow} ${focusedChannel === item.channel ? styles.channelRowActive : ''}`}
              onClick={() => setSelectedChannel(item.channel)}
            >
              <span className={styles.channelRank}>{index + 1}</span>
              <span className={styles.channelName}>{item.channel}</span>
              <div className={styles.channelBarTrack}>
                <div
                  className={styles.channelBarFill}
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                />
              </div>
              <span className={styles.channelCount}>{item.count}</span>
            </button>
          ))}
        </div>

        {filtered.length > visible.length ? (
          <button type="button" className={styles.expandButton} onClick={() => setLimit((value) => value + (compact ? 20 : 60))}>
            Show more channels
          </button>
        ) : null}

        <p className={styles.footnote}>{data.note}</p>
      </div>

      <aside className={styles.sideCard}>
        <div className={styles.sideCardHeader}>
          <span className={styles.eyebrow}>Focused channel</span>
          <h3>{focusedChannel}</h3>
        </div>
        <div className={styles.periodMetric}>
          <strong>{currentPeriod?.period}</strong>
          <span>{currentPeriod?.leaderboard.find((item) => item.channel === focusedChannel)?.count || 0} watch events</span>
        </div>
        <div className={styles.trendCard}>
          <ChannelTrend trend={trend} />
        </div>
        <div className={styles.resumeBullets}>
          <div className={styles.resumeBullet}>Overall rank: {data.overall.findIndex((item) => item.channel === focusedChannel) + 1 || 'Unranked'}</div>
          <div className={styles.resumeBullet}>Overall watch-event proxy: {data.overall.find((item) => item.channel === focusedChannel)?.count || 0}</div>
          <div className={styles.resumeBullet}>Visible channels in this slice: {filtered.length}</div>
        </div>
      </aside>
    </div>
  );
}

function ChannelTrend({ trend }) {
  const width = 320;
  const height = 140;
  const margin = { top: 12, right: 12, bottom: 28, left: 10 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const x = d3.scalePoint().domain(trend.map((item) => item.period)).range([0, innerWidth]);
  const y = d3.scaleLinear().domain([0, d3.max(trend, (item) => item.count) || 1]).nice().range([innerHeight, 0]);
  const line = d3.line()
    .x((d) => x(d.period))
    .y((d) => y(d.count))
    .curve(d3.curveMonotoneX);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={styles.svgChart} role="img" aria-label="Trend of watch events for the selected channel">
      <g transform={`translate(${margin.left},${margin.top})`}>
        {y.ticks(3).map((tick) => (
          <g key={tick} transform={`translate(0,${y(tick)})`}>
            <line x2={innerWidth} stroke="rgba(255,255,255,0.08)" />
            <text x={innerWidth + 6} dy="0.32em" className={styles.axisText}>{tick}</text>
          </g>
        ))}
        <path d={line(trend)} fill="none" stroke="#67c1b8" strokeWidth="3" />
        {trend.map((item) => (
          <g key={item.period} transform={`translate(${x(item.period)},${y(item.count)})`}>
            <circle r="4.5" fill="#f2a65a" />
            <text y={innerHeight - y(item.count) + 18} textAnchor="middle" className={styles.axisText}>
              {item.period.replace('20', "'")}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function CommentsPanel({ comments }) {
  const total = d3.sum(comments.toneBreakdown, (item) => item.count) || 1;
  return (
    <div className={styles.sideCard}>
      <div className={styles.sideCardHeader}>
        <span className={styles.eyebrow}>Comments</span>
        <h3>Peer review, not applause tracking</h3>
      </div>
      <p className={styles.bodyCopy}>{comments.summary}</p>
      <div className={styles.stackBar}>
        {comments.toneBreakdown.map((tone) => (
          <div
            key={tone.id}
            className={styles.stackSegment}
            style={{ width: `${(tone.count / total) * 100}%`, background: tone.color }}
            title={`${tone.label}: ${tone.count}`}
          />
        ))}
      </div>
      <div className={styles.toneList}>
        {comments.toneBreakdown.map((tone) => (
          <div key={tone.id} className={styles.toneRow}>
            <span className={styles.legendSwatch} style={{ background: tone.color }} />
            <span>{tone.label}</span>
            <span>{tone.count}</span>
          </div>
        ))}
      </div>
      <p className={styles.footnote}>Heuristic tone read from the exported comment text.</p>
    </div>
  );
}

function ResumePanel({ closing }) {
  return (
    <div className={styles.sideCard}>
      <div className={styles.sideCardHeader}>
        <span className={styles.eyebrow}>Resume layer</span>
        <h3>{closing.title}</h3>
      </div>
      <p className={styles.bodyCopy}>{closing.summary}</p>
      <div className={styles.resumeBullets}>
        {closing.bullets.map((bullet) => (
          <div key={bullet} className={styles.resumeBullet}>{bullet}</div>
        ))}
      </div>
    </div>
  );
}

export default function YoutubeScholarExperience({ data }) {
  const [activeDomain, setActiveDomain] = useState(data.taxonomy[0]?.id || null);
  const domains = domainLookup(data.taxonomy);

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>{data.hero.eyebrow}</span>
          <h1>{data.hero.title}</h1>
          <p className={styles.heroSubtitle}>{data.hero.subtitle}</p>
          <p className={styles.heroWitty}>{data.hero.wittyLine}</p>
        </div>
        <div className={styles.heroMeta}>
          <div className={styles.noteCard}>
            <strong>Method note</strong>
            <p>{data.notes.headlineMetrics}</p>
            <p>{data.notes.estimation}</p>
            <Link href="/projects/youtube-scholar/curiosity-velocity" className={styles.expandButton}>
              Open Curiosity Velocity breakdown
            </Link>
          </div>
        </div>
      </section>

      <KpiStrip items={data.kpis} />

      <section className={styles.heroSecondary}>
        <div className={styles.noteCard}>
          <span className={styles.eyebrow}>Core narrative</span>
          <p>
            Searches open the loop. Subscriptions maintain signal. Playlists encode prioritization. Comments function as lightweight peer review.
          </p>
        </div>
        <LoyaltyCreators creators={data.loyaltyCreators} domains={domains} activeDomain={activeDomain} onSelect={setActiveDomain} />
      </section>

      <section>
        <KnowledgeMap taxonomy={data.taxonomy} activeDomain={activeDomain} onSelect={setActiveDomain} />
        <p className={styles.footnote}>{data.knowledgeMapNote}</p>
      </section>

      <section>
        <IntentCurve
          series={data.intentSeries}
          annotations={data.annotations}
          taxonomy={data.taxonomy}
          activeDomain={activeDomain}
          onSelect={setActiveDomain}
          watchTrend={data.watchTrend}
        />
      </section>

      <section>
        <LearningHeatmap heatmap={data.heatmap} />
        <p className={styles.footnote}>{data.heatmapCaption}</p>
      </section>

      <section>
        <RabbitHoles rabbitHoles={data.rabbitHoles} domains={domains} activeDomain={activeDomain} onSelect={setActiveDomain} />
      </section>

      <section>
        <ChannelWatchProxy data={data.channelWatchProxy} />
      </section>

      <section className={styles.footerGrid}>
        <CommentsPanel comments={data.comments} />
        <ResumePanel closing={data.closing} />
      </section>
    </main>
  );
}
