'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import * as d3 from 'd3';
import styles from './CuriosityVelocityExperience.module.css';

function useChartSize(defaultHeight) {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: defaultHeight });

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const updateSize = (width) => {
      if (!width) return;
      setSize({
        width,
        height: Math.max(defaultHeight, Math.min(defaultHeight + 120, width * 0.62)),
      });
    };

    updateSize(node.getBoundingClientRect().width);

    const observer = new ResizeObserver(([entry]) => {
      updateSize(entry.contentRect.width);
    });
    const handleResize = () => updateSize(node.getBoundingClientRect().width);

    observer.observe(node);
    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [defaultHeight]);

  return [ref, size];
}

function topicLookup(topics) {
  return Object.fromEntries(topics.map((topic) => [topic.id, topic]));
}

function MetricStrip({ items }) {
  return (
    <div className={styles.metricGrid}>
      {items.map((item) => (
        <article key={item.label} className={styles.metricCard}>
          <div className={styles.metricValue}>{item.value}</div>
          <div className={styles.metricLabel}>{item.label}</div>
          <p className={styles.metricDetail}>{item.detail}</p>
        </article>
      ))}
    </div>
  );
}

function ChartPlaceholder({ label, title, body }) {
  return (
    <>
      <div className={styles.sectionHeader}>
        <span className={styles.eyebrow}>{label}</span>
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
      <div className={styles.chartPlaceholder} aria-hidden="true">
        <div className={styles.chartPlaceholderGrid} />
        <div className={styles.chartPlaceholderGlow} />
      </div>
    </>
  );
}

function RibbonTimeline({ topics, windows, phaseMeta }) {
  const [containerRef, size] = useChartSize(420);
  const [hovered, setHovered] = useState(null);

  if (!size.width || !windows.length) {
    return (
      <section className={styles.chartCard} ref={containerRef}>
        <ChartPlaceholder
          label="Curiosity ribbon"
          title="Broad range, then convergence, then deliberate pivots"
          body="Loading the ribbon timeline and phase strip."
        />
      </section>
    );
  }

  const margin = { top: 26, right: 20, bottom: 58, left: 46 };
  const innerWidth = size.width - margin.left - margin.right;
  const innerHeight = size.height - margin.top - margin.bottom;
  const visibleTopics = topics.filter((topic) => topic.id !== 'unclassified');
  const stackedInput = windows.map((window) => ({
    date: new Date(window.date),
    ...Object.fromEntries(window.topicShares.map((share) => [share.topicId, share.share])),
  }));
  const stack = d3.stack().keys(visibleTopics.map((topic) => topic.id))(stackedInput);
  const x = d3.scaleTime()
    .domain(d3.extent(stackedInput, (item) => item.date))
    .range([0, innerWidth]);
  const y = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0]);
  const area = d3.area()
    .x((point) => x(point.data.date))
    .y0((point) => y(point[0]))
    .y1((point) => y(point[1]))
    .curve(d3.curveMonotoneX);
  const bandY = innerHeight + 18;
  const bandHeight = 12;

  return (
    <section className={styles.chartCard} ref={containerRef}>
      <div className={styles.sectionHeader}>
        <span className={styles.eyebrow}>Curiosity ribbon</span>
        <h2>Broad range, then convergence, then deliberate pivots</h2>
        <p>
          Each slice is a trailing 90-day window. The ribbon shows topic share while the phase strip below names the structural mood of that period.
        </p>
      </div>

      <div className={styles.legendRow}>
        {visibleTopics.map((topic) => (
          <div key={topic.id} className={styles.legendItem}>
            <span className={styles.legendSwatch} style={{ background: topic.color }} />
            {topic.label}
          </div>
        ))}
      </div>

      <div className={styles.chartSurface}>
        <svg viewBox={`0 0 ${size.width} ${size.height}`} className={styles.svgChart} role="img" aria-label="Ribbon timeline of curiosity topics and phases">
          <g transform={`translate(${margin.left},${margin.top})`}>
            {stack.map((layer) => {
              const topic = visibleTopics.find((item) => item.id === layer.key);
              return (
                <path
                  key={layer.key}
                  d={area(layer)}
                  fill={topic.color}
                  opacity="0.88"
                />
              );
            })}

            {y.ticks(4).map((tick) => (
              <g key={tick} transform={`translate(0,${y(tick)})`}>
                <line x2={innerWidth} stroke="rgba(255,255,255,0.08)" />
                <text x="-10" dy="0.32em" textAnchor="end" className={styles.axisText}>
                  {Math.round(tick * 100)}%
                </text>
              </g>
            ))}

            {x.ticks(size.width > 820 ? 8 : 5).map((tick) => (
              <g key={tick.toISOString()} transform={`translate(${x(tick)},0)`}>
                <line y2={innerHeight} stroke="rgba(255,255,255,0.06)" />
                <text y={innerHeight + 38} textAnchor="middle" className={styles.axisText}>
                  {d3.timeFormat('%b %Y')(tick)}
                </text>
              </g>
            ))}

            {windows.map((window, index) => {
              const date = new Date(window.date);
              const nextDate = new Date(windows[Math.min(index + 1, windows.length - 1)].date);
              const x0 = x(date);
              const x1 = index === windows.length - 1 ? innerWidth : x(nextDate);
              const phase = phaseMeta[window.phaseLabel];
              return (
                <g key={`${window.label}-${window.phaseLabel}`}>
                  <rect
                    x={x0}
                    y={bandY}
                    width={Math.max(x1 - x0, 6)}
                    height={bandHeight}
                    rx="4"
                    fill={phase.color}
                    opacity="0.88"
                  />
                  <rect
                    x={x0}
                    y="0"
                    width={Math.max(x1 - x0, 6)}
                    height={innerHeight}
                    fill="transparent"
                    onMouseEnter={() => setHovered(window)}
                    onMouseLeave={() => setHovered(null)}
                  />
                </g>
              );
            })}
          </g>
        </svg>

        <div className={styles.phaseLegend}>
          {Object.values(phaseMeta).map((phase) => (
            <div key={phase.label} className={styles.phaseLegendItem}>
              <span className={styles.phaseSwatch} style={{ background: phase.color }} />
              {phase.label}
            </div>
          ))}
        </div>

        {hovered ? (
          <div className={styles.tooltip}>
            <strong>{hovered.label}</strong>
            <span>{phaseMeta[hovered.phaseLabel].label}</span>
            <span>Focus share {Math.round(hovered.focusShare * 100)}%</span>
            <span>Exploration {hovered.explorationScore.toFixed(2)} / exploitation {hovered.exploitationScore.toFixed(2)}</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function PhaseMap({ topics, windows }) {
  const [containerRef, size] = useChartSize(340);
  const [hovered, setHovered] = useState(null);
  const lookup = topicLookup(topics);

  if (!size.width || !windows.length) {
    return (
      <section className={styles.chartCard} ref={containerRef}>
        <ChartPlaceholder
          label="Phase map"
          title="Exploration and focus are separate axes"
          body="Loading the exploration versus focus map."
        />
      </section>
    );
  }

  const margin = { top: 24, right: 18, bottom: 44, left: 44 };
  const innerWidth = size.width - margin.left - margin.right;
  const innerHeight = size.height - margin.top - margin.bottom;
  const x = d3.scaleLinear().domain([0, 1]).range([0, innerWidth]);
  const y = d3.scaleLinear().domain([0, 1]).range([innerHeight, 0]);
  const line = d3.line()
    .x((item) => x(item.explorationScore))
    .y((item) => y(item.exploitationScore))
    .curve(d3.curveCatmullRom.alpha(0.5));

  return (
    <section className={styles.chartCard} ref={containerRef}>
      <div className={styles.sectionHeader}>
        <span className={styles.eyebrow}>Phase map</span>
        <h2>Exploration and focus are separate axes</h2>
        <p>
          Windows can stay intellectually wide and still disciplined. The path shows when the balance tips into concentration or swings into a pivot.
        </p>
      </div>

      <div className={styles.chartSurface}>
        <svg viewBox={`0 0 ${size.width} ${size.height}`} className={styles.svgChart} role="img" aria-label="Scatter map of exploration versus exploitation over time">
          <g transform={`translate(${margin.left},${margin.top})`}>
            {[0.25, 0.5, 0.75].map((tick) => (
              <g key={`x-${tick}`} transform={`translate(${x(tick)},0)`}>
                <line y2={innerHeight} stroke="rgba(255,255,255,0.08)" />
              </g>
            ))}
            {[0.25, 0.5, 0.75].map((tick) => (
              <g key={`y-${tick}`} transform={`translate(0,${y(tick)})`}>
                <line x2={innerWidth} stroke="rgba(255,255,255,0.08)" />
              </g>
            ))}

            <path d={line(windows)} fill="none" stroke="rgba(255,255,255,0.24)" strokeWidth="2.4" />

            {windows.map((window) => {
              const topic = lookup[window.dominantTopic] || lookup.unclassified;
              return (
                <circle
                  key={window.date}
                  cx={x(window.explorationScore)}
                  cy={y(window.exploitationScore)}
                  r={4 + window.focusShare * 10}
                  fill={topic.color}
                  opacity="0.86"
                  stroke="rgba(7,11,15,0.8)"
                  strokeWidth="1.5"
                  onMouseEnter={() => setHovered(window)}
                  onMouseLeave={() => setHovered(null)}
                />
              );
            })}

            <text x={innerWidth / 2} y={innerHeight + 30} textAnchor="middle" className={styles.axisText}>
              Exploration score
            </text>
            <text x="-16" y={-10} className={styles.axisText}>
              Focus score
            </text>
          </g>
        </svg>

        {hovered ? (
          <div className={styles.tooltipStatic}>
            <strong>{hovered.label}</strong>
            <span>{lookup[hovered.dominantTopic]?.label || 'Unclassified'}</span>
            <span>Phase: {hovered.phaseLabel.replace(/_/g, ' ')}</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function EpisodeList({ episodes, phaseMeta, topics }) {
  const lookup = topicLookup(topics);

  return (
    <section className={styles.sideCard}>
      <div className={styles.sideCardHeader}>
        <span className={styles.eyebrow}>Episodes</span>
        <h3>Phase changes worth reading as a story</h3>
      </div>
      <div className={styles.episodeList}>
        {episodes.slice(0, 8).map((episode) => {
          const phase = phaseMeta[episode.phaseLabel];
          const topic = lookup[episode.dominantTopic] || lookup.unclassified;
          return (
            <article key={`${episode.start}-${episode.phaseLabel}`} className={styles.episodeCard}>
              <div className={styles.episodeHeader}>
                <span className={styles.phaseBadge} style={{ background: `${phase.color}1f`, color: phase.color }}>
                  {phase.label}
                </span>
                <span className={styles.episodeDates}>
                  {d3.timeFormat('%b %Y')(new Date(episode.start))} to {d3.timeFormat('%b %Y')(new Date(episode.end))}
                </span>
              </div>
              <strong className={styles.episodeTopic}>{topic.label}</strong>
              <p className={styles.episodeSummary}>{phase.summary}</p>
              <div className={styles.episodeMeta}>
                <span>{episode.windowCount} windows</span>
                <span>{Math.round(episode.avgFocus * 100)}% avg focus</span>
                <span>{Math.round(episode.confidence * 100)}% confidence</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Highlights({ highlights, topics }) {
  const lookup = topicLookup(topics);

  return (
    <section className={styles.highlightsGrid}>
      {highlights.map((highlight) => {
        const topic = lookup[highlight.topicId] || lookup.unclassified;
        return (
          <article key={highlight.title} className={styles.noteCard}>
            <span className={styles.eyebrow}>Highlight</span>
            <h3>{highlight.title}</h3>
            <p className={styles.highlightLabel}>{highlight.label}</p>
            <p className={styles.bodyCopy}>{highlight.body}</p>
            <div className={styles.topicPill}>
              <span className={styles.legendSwatch} style={{ background: topic.color }} />
              {topic.label}
            </div>
          </article>
        );
      })}
    </section>
  );
}

function MethodCard({ data }) {
  return (
    <aside className={styles.sideCard}>
      <div className={styles.sideCardHeader}>
        <span className={styles.eyebrow}>Method</span>
        <h3>Interpretability over fake precision</h3>
      </div>
      <div className={styles.copyStack}>
        {data.notes.map((note) => (
          <p key={note} className={styles.bodyCopy}>{note}</p>
        ))}
      </div>
      <div className={styles.copyStack}>
        <p className={styles.bodyCopy}>
          Deep dives require concentration and streak length. Pivots only appear when that focus breaks into a meaningfully different domain.
        </p>
      </div>
      <Link href="/projects/youtube-scholar" className={styles.expandButton}>
        Back to YouTube Scholar
      </Link>
    </aside>
  );
}

export default function CuriosityVelocityExperience({ data }) {
  if (!data) {
    return (
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.noteCard}>
            <h1>Curiosity Velocity</h1>
            <p className={styles.bodyCopy}>The current dataset does not contain enough parsed watch history to render this breakdown yet.</p>
            <Link href="/projects/youtube-scholar" className={styles.expandButton}>
              Back to YouTube Scholar
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>Curiosity Velocity</span>
          <h1>Intellectual range with visible rhythm</h1>
          <p className={styles.heroSubtitle}>{data.summary}</p>
        </div>
        <MethodCard data={data} />
      </section>

      <MetricStrip items={data.overview} />

      <Highlights highlights={data.highlights} topics={data.topics} />

      <section className={styles.chartSectionGrid}>
        <RibbonTimeline topics={data.topics} windows={data.windows} phaseMeta={data.phaseMeta} />
        <EpisodeList episodes={data.phaseEpisodes} phaseMeta={data.phaseMeta} topics={data.topics} />
      </section>

      <section className={styles.footerGrid}>
        <PhaseMap topics={data.topics} windows={data.windows} />
        <aside className={styles.sideCard}>
          <div className={styles.sideCardHeader}>
            <span className={styles.eyebrow}>Reading guide</span>
            <h3>How to interpret the page</h3>
          </div>
          <div className={styles.copyStack}>
            <p className={styles.bodyCopy}>Blue and warm mixed ribbons usually indicate exploration. A thicker single-color band with lower entropy suggests narrowing or a deep dive.</p>
            <p className={styles.bodyCopy}>The phase strip is the editorial layer: broad exploration, narrowing, deep dives, pivots, and returns. It is deliberately broad because the metadata is broad.</p>
            <p className={styles.bodyCopy}>Unclassified activity is preserved rather than forced into a topic bucket, so the story stays credible when titles are noisy.</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
