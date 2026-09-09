'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import styles from './EmploymentBySexExperience.module.css';

const WOMEN = '#ff6b8a';
const MEN = '#5ec7e8';
const GAIN = '#d9c65c';
const LOSS = '#75648c';

const RANGES = [
  { id: 'decade', label: 'Full decade', start: '2016-09-01' },
  { id: 'since2020', label: 'Since 2020', start: '2020-01-01' },
  { id: '2026', label: '2026', start: '2026-01-01' },
];

function formatPercent(value, digits = 1) {
  return Number.isFinite(value) ? `${value.toFixed(digits)}%` : '—';
}

const METRICS = {
  payrollShare: {
    label: 'Payroll employment share',
    eyebrow: 'Who holds payroll jobs?',
    unit: '% of nonfarm payroll jobs',
    women: 'payrollShareWomen',
    men: 'payrollShareMen',
    format: value => formatPercent(value, 2),
    fixedDomain: [48.5, 51.5],
  },
  monthly: {
    label: 'Monthly net payroll jobs',
    eyebrow: 'What changed this month?',
    unit: 'thousand payroll jobs',
    women: 'monthWomen',
    men: 'monthMen',
    format: formatJobs,
    zero: true,
  },
  rolling: {
    label: 'Trailing 12-month net payroll jobs',
    eyebrow: 'What does the trend say?',
    unit: 'thousand payroll jobs',
    women: 'rollingWomen',
    men: 'rollingMen',
    format: formatJobs,
    zero: true,
  },
  participation: {
    label: 'Labor-force participation rate',
    eyebrow: 'Who is in the labor force?',
    unit: '% of civilian noninstitutional population 16+',
    women: 'participationWomen',
    men: 'participationMen',
    format: formatPercent,
  },
  employmentRate: {
    label: 'Employment–population ratio',
    eyebrow: 'Who is employed?',
    unit: '% of civilian noninstitutional population 16+',
    women: 'employmentRateWomen',
    men: 'employmentRateMen',
    format: formatPercent,
  },
  unemployment: {
    label: 'Unemployment rate',
    eyebrow: 'Who is looking for work?',
    unit: '% of labor force',
    women: 'unemploymentWomen',
    men: 'unemploymentMen',
    format: formatPercent,
  },
};

function formatJobs(value) {
  if (!Number.isFinite(value)) return '—';
  return `${value > 0 ? '+' : ''}${d3.format(',')(value)}k`;
}

function formatMonth(date) {
  return d3.timeFormat('%B %Y')(date);
}

function filterRange(data, range) {
  const start = new Date(`${RANGES.find(item => item.id === range).start}T00:00:00`);
  return data.filter(row => row.date >= start);
}

function styleAxes(svg) {
  svg.selectAll(`.${styles.axis} .domain`).attr('stroke', 'rgba(232, 228, 216, .18)');
  svg.selectAll(`.${styles.axis} .tick line`).attr('stroke', 'rgba(232, 228, 216, .18)');
  svg.selectAll(`.${styles.axis} .tick text`).attr('fill', '#9da4aa');
}

function RangeControl({ range, onChange }) {
  return (
    <div className={styles.segmented} role="group" aria-label="Time range">
      {RANGES.map(item => (
        <button
          key={item.id}
          type="button"
          aria-pressed={range === item.id}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function ChartTooltip({ tooltip }) {
  if (!tooltip) return null;
  return (
    <div className={styles.tooltip} style={{ left: tooltip.left, top: tooltip.top }} role="status">
      <div className={styles.tooltipDate}>{tooltip.date}</div>
      {tooltip.rows.map(row => (
        <div className={styles.tooltipRow} key={row.label}>
          <span>{row.color && <i style={{ background: row.color }} />}{row.label}</span>
          <strong>{row.value}</strong>
        </div>
      ))}
    </div>
  );
}

function PrimaryChart({ data, range }) {
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const node = svgRef.current;
    if (!wrap || !node) return undefined;

    const draw = () => {
      const rows = filterRange(data, range);
      const width = Math.max(320, Math.round(wrap.getBoundingClientRect().width));
      const height = width < 560 ? 390 : 470;
      const compact = width < 560;
      const margin = { top: 34, right: compact ? 58 : 78, bottom: 52, left: compact ? 58 : 76 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;
      const x = d3.scaleTime().domain(d3.extent(rows, d => d.date)).range([margin.left, width - margin.right]);
      const yShare = d3.scaleLinear().domain([0, 100]).range([height - margin.bottom, margin.top]);
      const yMagnitude = d3.scaleLinear().domain([0, 10000]).range([height - margin.bottom, margin.top]);
      const svg = d3.select(node).attr('viewBox', `0 0 ${width} ${height}`);
      const barWidth = Math.max(2, Math.min(10, (innerWidth / rows.length) * 0.72));

      svg.selectAll('*').remove();
      svg.append('g')
        .attr('class', styles.grid)
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(yShare).tickValues([0, 25, 50, 75, 100]).tickSize(-innerWidth).tickFormat(''));

      svg.append('g')
        .selectAll('rect')
        .data(rows)
        .join('rect')
        .attr('x', d => x(d.date) - barWidth / 2)
        .attr('y', d => yMagnitude(Math.min(10000, Math.abs(d.monthTotal))))
        .attr('width', barWidth)
        .attr('height', d => yMagnitude(0) - yMagnitude(Math.min(10000, Math.abs(d.monthTotal))))
        .attr('rx', Math.min(2, barWidth / 2))
        .attr('fill', d => d.monthTotal >= 0 ? GAIN : LOSS)
        .attr('opacity', 0.3);

      const capped = rows.filter(d => Math.abs(d.monthTotal) > 10000);
      svg.append('g').selectAll('path').data(capped).join('path')
        .attr('d', d => `M${x(d.date) - 6},${margin.top + 5}l4,-4 4,4 4,-4 4,4`)
        .attr('fill', 'none').attr('stroke', LOSS).attr('stroke-width', 2.5);

      const line = key => d3.line()
        .x(d => x(d.date))
        .y(d => yShare(d[key]))
        .curve(d3.curveMonotoneX);

      svg.append('path').datum(rows).attr('class', styles.womenLine).attr('d', line('movementShareWomen'));
      svg.append('path').datum(rows).attr('class', styles.menLine).attr('d', line('movementShareMen'));

      const xTicks = compact ? 4 : Math.min(10, Math.floor(innerWidth / 90));
      svg.append('g').attr('class', styles.axis).attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(xTicks).tickFormat(range === '2026' ? d3.timeFormat('%b') : d3.timeFormat('%Y')));
      svg.append('g').attr('class', styles.axis).attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(yShare).tickValues([0, 25, 50, 75, 100]).tickFormat(d => `${d}%`));
      svg.append('g').attr('class', styles.axis).attr('transform', `translate(${width - margin.right},0)`)
        .call(d3.axisRight(yMagnitude).tickValues([0, 2500, 5000, 7500, 10000]).tickFormat(d => d === 0 ? '0' : `${d3.format(',')(d)}k`));
      styleAxes(svg);

      svg.append('text').attr('class', styles.axisTitle).attr('x', margin.left).attr('y', 16).text('SHARE OF ABSOLUTE MOVEMENT');
      svg.append('text').attr('class', styles.axisTitle).attr('text-anchor', 'end').attr('x', width - margin.right).attr('y', 16).text('NET MAGNITUDE · THOUSANDS');

      const guide = svg.append('line').attr('class', styles.guide).attr('y1', margin.top).attr('y2', height - margin.bottom).style('display', 'none');
      const womenDot = svg.append('circle').attr('class', styles.marker).attr('fill', WOMEN).attr('r', 5).style('display', 'none');
      const menDot = svg.append('circle').attr('class', styles.marker).attr('fill', MEN).attr('r', 5).style('display', 'none');
      const bisect = d3.bisector(d => d.date).center;

      function show(event) {
        const [pointerX] = d3.pointer(event, node);
        const px = Math.max(margin.left, Math.min(width - margin.right, pointerX));
        const index = Math.max(0, Math.min(rows.length - 1, bisect(rows, x.invert(px))));
        const selected = rows[index];
        const selectedX = x(selected.date);
        guide.attr('x1', selectedX).attr('x2', selectedX).style('display', null);
        womenDot.attr('cx', selectedX).attr('cy', yShare(selected.movementShareWomen)).style('display', null);
        menDot.attr('cx', selectedX).attr('cy', yShare(selected.movementShareMen)).style('display', null);
        const tooltipWidth = compact ? 230 : 260;
        const left = selectedX > width * 0.62 ? selectedX - tooltipWidth - 10 : selectedX + 10;
        setTooltip({
          left: Math.max(4, Math.min(width - tooltipWidth - 4, left)),
          top: margin.top + 10,
          date: formatMonth(selected.date),
          rows: [
            { label: 'Women’s movement', value: `${selected.movementShareWomen.toFixed(1)}% · ${formatJobs(selected.monthWomen)}`, color: WOMEN },
            { label: 'Men’s movement', value: `${selected.movementShareMen.toFixed(1)}% · ${formatJobs(selected.monthMen)}`, color: MEN },
            { label: selected.monthTotal >= 0 ? 'Total gain' : 'Total loss', value: formatJobs(selected.monthTotal), color: selected.monthTotal >= 0 ? GAIN : LOSS },
          ],
        });
      }

      function hide() {
        guide.style('display', 'none');
        womenDot.style('display', 'none');
        menDot.style('display', 'none');
        setTooltip(null);
      }

      svg.append('rect')
        .attr('x', margin.left).attr('y', margin.top).attr('width', innerWidth).attr('height', innerHeight)
        .attr('fill', 'transparent').style('cursor', 'crosshair')
        .on('pointermove', show).on('pointerdown', show).on('pointerleave', hide);
    };

    const observer = new ResizeObserver(draw);
    observer.observe(wrap);
    draw();
    return () => observer.disconnect();
  }, [data, range]);

  return <div className={styles.chartWrap} ref={wrapRef}><svg ref={svgRef} aria-label="Monthly women’s and men’s share of absolute payroll movement, with total net-change magnitude" role="img" /><ChartTooltip tooltip={tooltip} /></div>;
}

function ExplorerChart({ data, metric, range }) {
  const wrapRef = useRef(null);
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const node = svgRef.current;
    if (!wrap || !node) return undefined;
    const config = METRICS[metric];

    const draw = () => {
      const rows = filterRange(data, range);
      const width = Math.max(320, Math.round(wrap.getBoundingClientRect().width));
      const height = width < 560 ? 330 : 390;
      const margin = { top: 26, right: 22, bottom: 46, left: width < 560 ? 54 : 70 };
      const innerWidth = width - margin.left - margin.right;
      const values = rows.flatMap(d => [d[config.women], d[config.men]]).filter(Number.isFinite);
      let domain = config.fixedDomain || d3.extent(values);
      if (!config.fixedDomain) {
        const pad = Math.max((domain[1] - domain[0]) * 0.12, config.zero ? 30 : 0.5);
        domain = [domain[0] - pad, domain[1] + pad];
        if (config.zero) domain = [Math.min(0, domain[0]), Math.max(0, domain[1])];
      }
      const x = d3.scaleTime().domain(d3.extent(rows, d => d.date)).range([margin.left, width - margin.right]);
      const y = d3.scaleLinear().domain(domain).nice().range([height - margin.bottom, margin.top]);
      const svg = d3.select(node).attr('viewBox', `0 0 ${width} ${height}`);
      svg.selectAll('*').remove();

      svg.append('g').attr('class', styles.grid).attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(''));
      if (config.zero && domain[0] < 0) svg.append('line').attr('class', styles.zero).attr('x1', margin.left).attr('x2', width - margin.right).attr('y1', y(0)).attr('y2', y(0));

      const line = key => d3.line().defined(d => Number.isFinite(d[key])).x(d => x(d.date)).y(d => y(d[key])).curve(d3.curveMonotoneX);
      svg.append('path').datum(rows).attr('class', styles.womenLine).attr('d', line(config.women));
      svg.append('path').datum(rows).attr('class', styles.menLine).attr('d', line(config.men));
      svg.append('g').attr('class', styles.axis).attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width < 560 ? 4 : 9).tickFormat(range === '2026' ? d3.timeFormat('%b') : d3.timeFormat('%Y')));
      svg.append('g').attr('class', styles.axis).attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5).tickFormat(value => config.format(value)));
      styleAxes(svg);

      const guide = svg.append('line').attr('class', styles.guide).attr('y1', margin.top).attr('y2', height - margin.bottom).style('display', 'none');
      const dots = [
        svg.append('circle').attr('class', styles.marker).attr('fill', WOMEN).attr('r', 5).style('display', 'none'),
        svg.append('circle').attr('class', styles.marker).attr('fill', MEN).attr('r', 5).style('display', 'none'),
      ];
      const bisect = d3.bisector(d => d.date).center;
      function show(event) {
        const [pointerX] = d3.pointer(event, node);
        const px = Math.max(margin.left, Math.min(width - margin.right, pointerX));
        const selected = rows[Math.max(0, Math.min(rows.length - 1, bisect(rows, x.invert(px))))];
        const selectedX = x(selected.date);
        guide.attr('x1', selectedX).attr('x2', selectedX).style('display', null);
        [config.women, config.men].forEach((key, index) => dots[index].attr('cx', selectedX).attr('cy', y(selected[key])).style('display', Number.isFinite(selected[key]) ? null : 'none'));
        const tooltipWidth = 220;
        const left = selectedX > width * 0.62 ? selectedX - tooltipWidth - 10 : selectedX + 10;
        setTooltip({ left: Math.max(4, Math.min(width - tooltipWidth - 4, left)), top: margin.top + 8, date: formatMonth(selected.date), rows: [
          { label: 'Women', value: config.format(selected[config.women]), color: WOMEN },
          { label: 'Men', value: config.format(selected[config.men]), color: MEN },
        ] });
      }
      function hide() { guide.style('display', 'none'); dots.forEach(dot => dot.style('display', 'none')); setTooltip(null); }
      svg.append('rect').attr('x', margin.left).attr('y', margin.top).attr('width', innerWidth).attr('height', height - margin.top - margin.bottom)
        .attr('fill', 'transparent').style('cursor', 'crosshair').on('pointermove', show).on('pointerdown', show).on('pointerleave', hide);
    };
    const observer = new ResizeObserver(draw);
    observer.observe(wrap);
    draw();
    return () => observer.disconnect();
  }, [data, metric, range]);

  return <div className={styles.chartWrap} ref={wrapRef}><svg ref={svgRef} aria-label={`${METRICS[metric].label}, women and men`} role="img" /><ChartTooltip tooltip={tooltip} /></div>;
}

export default function EmploymentBySexExperience({ data: rawData }) {
  const data = useMemo(() => rawData.map(row => {
    const movementTotal = Math.abs(row.monthWomen) + Math.abs(row.monthMen);
    return {
      ...row,
      date: new Date(`${row.date}T00:00:00`),
      movementShareWomen: movementTotal ? Math.abs(row.monthWomen) / movementTotal * 100 : 50,
      movementShareMen: movementTotal ? Math.abs(row.monthMen) / movementTotal * 100 : 50,
    };
  }), [rawData]);
  const [range, setRange] = useState('decade');
  const [metric, setMetric] = useState('payrollShare');
  const latest = data.at(-1);

  return (
    <main>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>The U.S. labor market, by sex · 2016–2026</p>
          <h1>Who got the jobs?</h1>
          <p className={styles.dek}>One viral-sounding number, placed back inside a decade of payroll movement.</p>
          <div className={styles.heroStat}>
            <div><span>August 2026</span><strong>+162k</strong><small>net payroll jobs</small></div>
            <div><span>Women</span><strong>+158k</strong><small>97.53% of the net gain</small></div>
            <div><span>Men</span><strong>+4k</strong><small>2.47% of the net gain</small></div>
          </div>
          <p className={styles.heroFootnote}>That is a one-month estimate of net payroll positions—not gross hires, newly created jobs, or unique people.</p>
        </div>
      </header>

      <section className={styles.storySection}>
        <div className={styles.sectionHeading}>
          <div><p className={styles.sectionNumber}>01 · The headline</p><h2>Monthly movement, in context</h2></div>
          <p>The lines divide each month’s absolute movement between women and men. The bars show the magnitude of the overall net change; gold is a gain and violet is a loss.</p>
        </div>
        <div className={styles.chartCard}>
          <div className={styles.cardTop}>
            <div>
              <h3>Share of absolute payroll movement</h3>
              <p>Hover or tap anywhere on the chart for the signed values behind each share.</p>
            </div>
            <RangeControl range={range} onChange={setRange} />
          </div>
          <div className={styles.legend}>
            <span><i style={{ background: WOMEN }} />Women</span>
            <span><i style={{ background: MEN }} />Men</span>
            <span><i className={styles.barKey} style={{ background: GAIN }} />Total gain</span>
            <span><i className={styles.barKey} style={{ background: LOSS }} />Total loss</span>
          </div>
          <PrimaryChart data={data} range={range} />
          <div className={styles.capNote}><strong>Scale break:</strong> April 2020’s 20.469 million net loss exceeds the requested 10 million right-axis ceiling, so its bar is capped and marked with a zigzag.</div>
        </div>
      </section>

      <section className={styles.explainerBand}>
        <div><span>How to read 97.53%</span><strong>158 ÷ 162</strong><p>Women’s monthly payroll change divided by the total change.</p></div>
        <div><span>Share of all payroll jobs</span><strong>{latest.payrollShareWomen.toFixed(2)}%</strong><p>Women held roughly half—not 97.53%—of payroll positions.</p></div>
        <div><span>Unit of measurement</span><strong>Jobs, not people</strong><p>A person appearing on two payrolls is counted twice in CES.</p></div>
      </section>

      <section className={styles.storySection}>
        <div className={styles.sectionHeading}>
          <div><p className={styles.sectionNumber}>02 · The longer view</p><h2>Six ways to see the same labor market</h2></div>
          <p>Payroll series track jobs. Household survey rates track people. Switch the measure without losing the women–men comparison.</p>
        </div>
        <div className={styles.explorerGrid}>
          <nav className={styles.metricNav} aria-label="Employment metric">
            {Object.entries(METRICS).map(([id, item]) => (
              <button key={id} type="button" aria-pressed={metric === id} onClick={() => setMetric(id)}>
                <span>{item.eyebrow}</span>{item.label}
              </button>
            ))}
          </nav>
          <div className={styles.chartCard}>
            <div className={styles.cardTop}>
              <div><p className={styles.miniKicker}>{METRICS[metric].eyebrow}</p><h3>{METRICS[metric].label}</h3><p>{METRICS[metric].unit}</p></div>
              <RangeControl range={range} onChange={setRange} />
            </div>
            <div className={styles.legend}><span><i style={{ background: WOMEN }} />Women</span><span><i style={{ background: MEN }} />Men</span></div>
            <ExplorerChart data={data} metric={metric} range={range} />
            {(metric === 'participation' || metric === 'employmentRate' || metric === 'unemployment') && <p className={styles.missingNote}>October 2025 is intentionally blank: CPS data were not collected during the federal funding lapse.</p>}
          </div>
        </div>
      </section>

      <section className={styles.methodSection}>
        <div className={styles.sectionHeading}>
          <div><p className={styles.sectionNumber}>03 · What the data can say</p><h2>The fine print is the point</h2></div>
        </div>
        <div className={styles.methodGrid}>
          <article><span>01</span><h3>Net change is not hiring</h3><p>These figures subtract payroll jobs lost from payroll jobs added. They do not describe gross hires, individual workers, or who was hired into a newly created role.</p></article>
          <article><span>02</span><h3>Men are derived</h3><p>BLS publishes total nonfarm payrolls and women employees. This analysis calculates men as total minus women. The relevant monthly BLS series offer women and men, but no “other” category.</p></article>
          <article><span>03</span><h3>Shares show movement</h3><p>Absolute women’s and men’s movements always sum to 100%, even when one rises while the other falls. Direction remains visible in the signed hover details.</p></article>
          <article><span>04</span><h3>Two surveys, two lenses</h3><p>CES is an establishment survey of payroll positions. Participation, employment–population, and unemployment rates come from the CPS household survey of people age 16 and over.</p></article>
        </div>
      </section>

      <footer className={styles.sourceFooter}>
        <p className={styles.sourceLabel}>Source & methodology</p>
        <p>Seasonally adjusted monthly data from the U.S. Bureau of Labor Statistics, September 2016–August 2026. August 2026 CES estimates are preliminary and subject to revision.</p>
        <div className={styles.sourceLinks}>
          <a href="https://data.bls.gov/timeseries/CES0000000001" target="_blank" rel="noreferrer">Total nonfarm payrolls ↗</a>
          <a href="https://data.bls.gov/timeseries/CES0000000010" target="_blank" rel="noreferrer">Women payroll employees ↗</a>
          <a href="https://www.bls.gov/news.release/archives/empsit_09042026.htm" target="_blank" rel="noreferrer">August 2026 Employment Situation ↗</a>
          <a href="https://www.bls.gov/cps/definitions.htm" target="_blank" rel="noreferrer">CPS definitions ↗</a>
        </div>
      </footer>
    </main>
  );
}
