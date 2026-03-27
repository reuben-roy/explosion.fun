'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import styles from './TimeManagementDashboard.module.css';

const COLORS = {
  Productive: '#4f46e5',
  Education: '#3b82f6',
  Entertainment: '#ef4444',
  Social: '#f59e0b',
  Life: '#10b981',
  Sleep: '#8b5cf6',
  Neutral: '#475569',
};

const ACTIVITY_ORDER = ['Productive', 'Education', 'Entertainment', 'Social', 'Life', 'Sleep', 'Neutral'];

function fmtHours(seconds) {
  return (seconds / 3600).toFixed(1);
}

function fmtPct(val) {
  return `${val.toFixed(1)}%`;
}

function createTooltip(container) {
  return d3.select(container)
    .append('div')
    .attr('class', styles.tooltip)
    .style('opacity', 0);
}

function clearSvg(ref) {
  if (ref.current) d3.select(ref.current).selectAll('*').remove();
}

function getContainerWidth(ref) {
  if (!ref.current) return 500;
  return ref.current.parentElement.getBoundingClientRect().width;
}

function styleAxes(svg) {
  svg.selectAll('.domain').attr('stroke', 'rgba(255, 255, 255, 0.08)');
  svg.selectAll('.tick line').attr('stroke', 'rgba(255, 255, 255, 0.08)');
  svg.selectAll('.tick text').attr('fill', '#8f98a7').style('font-size', '11px');
}

export default function TimeManagementDashboard({ data }) {
  const hourlyRef = useRef(null);
  const donutRef = useRef(null);
  const circadianRef = useRef(null);
  const sessionDurRef = useRef(null);
  const dayOfWeekRef = useRef(null);
  const stickinessRef = useRef(null);
  const topCategoriesRef = useRef(null);
  const youtubeTopicsRef = useRef(null);
  const animeRef = useRef(null);
  const lateNightRef = useRef(null);
  const willpowerRef = useRef(null);

  useEffect(() => {
    if (!data) return;

    renderHourlyChart();
    renderDonutChart();
    renderCircadianChart();
    renderSessionDurationChart();
    renderDayOfWeekChart();
    renderStickinessChart();
    renderTopCategoriesChart();
    renderYoutubeTopicsChart();
    renderAnimeChart();
    renderLateNightChart();
    renderWillpowerChart();

    function renderHourlyChart() {
      clearSvg(hourlyRef);
      const container = hourlyRef.current?.parentElement;
      if (!container) return;
      const fullWidth = container.getBoundingClientRect().width;
      const margin = { top: 20, right: 20, bottom: 40, left: 50 };
      const width = fullWidth - margin.left - margin.right;
      const height = 320 - margin.top - margin.bottom;

      const svg = d3.select(hourlyRef.current)
        .attr('width', fullWidth)
        .attr('height', 320);

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
      const tooltip = createTooltip(container);

      const hours = Array.from({ length: 24 }, (_, i) => i);
      const types = ACTIVITY_ORDER;

      const stackedData = hours.map(h => {
        const row = { hour: h };
        types.forEach(t => {
          row[t] = data.hourly_distribution[t]?.[String(h)] || 0;
        });
        return row;
      });

      const stack = d3.stack().keys(types);
      const series = stack(stackedData);

      const x = d3.scaleBand().domain(hours).range([0, width]).padding(0.15);
      const y = d3.scaleLinear()
        .domain([0, d3.max(stackedData, d => types.reduce((s, t) => s + d[t], 0))])
        .nice()
        .range([height, 0]);

      g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).tickValues(hours.filter(h => h % 2 === 0)).tickFormat(h => `${h}:00`))
        .selectAll('text').attr('transform', 'rotate(-45)').style('text-anchor', 'end');

      g.append('g').call(d3.axisLeft(y).ticks(6).tickFormat(d => `${d}h`));

      series.forEach(s => {
        g.append('g')
          .selectAll('rect')
          .data(s)
          .join('rect')
          .attr('x', d => x(d.data.hour))
          .attr('y', d => y(d[1]))
          .attr('height', d => y(d[0]) - y(d[1]))
          .attr('width', x.bandwidth())
          .attr('fill', COLORS[s.key])
          .attr('opacity', 0.85)
          .on('mouseover', function (event, d) {
            d3.select(this).attr('opacity', 1);
            tooltip.transition().duration(150).style('opacity', 1);
            tooltip.html(`<strong>${d.data.hour}:00</strong><br/>${s.key}: ${d.data[s.key].toFixed(1)}h`)
              .style('left', `${event.offsetX + 12}px`)
              .style('top', `${event.offsetY - 28}px`);
          })
          .on('mouseout', function () {
            d3.select(this).attr('opacity', 0.85);
            tooltip.transition().duration(150).style('opacity', 0);
          });
      });

      styleAxes(svg);
    }

    function renderDonutChart() {
      clearSvg(donutRef);
      const container = donutRef.current?.parentElement;
      if (!container) return;
      const fullWidth = container.getBoundingClientRect().width;
      const size = Math.min(fullWidth, 360);
      const radius = size / 2;
      const innerRadius = radius * 0.55;

      const svg = d3.select(donutRef.current)
        .attr('width', fullWidth)
        .attr('height', size);

      const g = svg.append('g').attr('transform', `translate(${fullWidth / 2},${size / 2})`);
      const tooltip = createTooltip(container);

      const entries = Object.entries(data.activity_type_breakdown)
        .filter(([k]) => k !== 'Sleep')
        .map(([k, v]) => ({ type: k, value: v }));

      const total = d3.sum(entries, d => d.value);

      const pie = d3.pie().value(d => d.value).sort(null).padAngle(0.02);
      const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius - 8);

      g.selectAll('path')
        .data(pie(entries))
        .join('path')
        .attr('d', arc)
        .attr('fill', d => COLORS[d.data.type])
        .attr('stroke', 'rgba(8, 10, 14, 0.98)')
        .attr('stroke-width', 2)
        .on('mouseover', function (event, d) {
          d3.select(this).transition().duration(150).attr('transform', 'scale(1.04)');
          tooltip.transition().duration(150).style('opacity', 1);
          tooltip.html(`<strong>${d.data.type}</strong><br/>${fmtHours(d.data.value)}h (${((d.data.value / total) * 100).toFixed(1)}%)`)
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
        .text(`${(total / 3600).toFixed(0)}h`);

      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '1.2em')
        .attr('fill', '#8f98a7')
        .style('font-size', '12px')
        .text('Active Time');
    }

    function renderCircadianChart() {
      clearSvg(circadianRef);
      const container = circadianRef.current?.parentElement;
      if (!container) return;
      const fullWidth = container.getBoundingClientRect().width;
      const margin = { top: 20, right: 20, bottom: 40, left: 50 };
      const width = fullWidth - margin.left - margin.right;
      const height = 280 - margin.top - margin.bottom;

      const svg = d3.select(circadianRef.current)
        .attr('width', fullWidth)
        .attr('height', 280);

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
      const tooltip = createTooltip(container);

      const hours = Array.from({ length: 18 }, (_, i) => i + 6);

      const prodData = hours.map(h => ({ hour: h, value: data.circadian_productive_ratio[String(h)] || 0 }));
      const entData = hours.map(h => ({ hour: h, value: data.circadian_entertainment_ratio[String(h)] || 0 }));

      const x = d3.scaleLinear().domain([6, 23]).range([0, width]);
      const y = d3.scaleLinear().domain([0, d3.max([...prodData, ...entData], d => d.value) * 1.1]).nice().range([height, 0]);

      g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(9).tickFormat(h => `${h}:00`));

      g.append('g').call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`));

      const areaProd = d3.area()
        .x(d => x(d.hour))
        .y0(height)
        .y1(d => y(d.value))
        .curve(d3.curveMonotoneX);

      const areaEnt = d3.area()
        .x(d => x(d.hour))
        .y0(height)
        .y1(d => y(d.value))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(prodData)
        .attr('d', areaProd)
        .attr('fill', COLORS.Productive)
        .attr('opacity', 0.2);

      g.append('path')
        .datum(entData)
        .attr('d', areaEnt)
        .attr('fill', COLORS.Entertainment)
        .attr('opacity', 0.2);

      const lineProd = d3.line().x(d => x(d.hour)).y(d => y(d.value)).curve(d3.curveMonotoneX);
      const lineEnt = d3.line().x(d => x(d.hour)).y(d => y(d.value)).curve(d3.curveMonotoneX);

      g.append('path')
        .datum(prodData)
        .attr('d', lineProd)
        .attr('fill', 'none')
        .attr('stroke', COLORS.Productive)
        .attr('stroke-width', 2.5);

      g.append('path')
        .datum(entData)
        .attr('d', lineEnt)
        .attr('fill', 'none')
        .attr('stroke', COLORS.Entertainment)
        .attr('stroke-width', 2.5);

      g.selectAll('.dot-prod')
        .data(prodData)
        .join('circle')
        .attr('cx', d => x(d.hour))
        .attr('cy', d => y(d.value))
        .attr('r', 4)
        .attr('fill', COLORS.Productive)
        .on('mouseover', function (event, d) {
          tooltip.transition().duration(150).style('opacity', 1);
          tooltip.html(`<strong>${d.hour}:00</strong><br/>Productive: ${d.value.toFixed(1)}%`)
            .style('left', `${event.offsetX + 12}px`)
            .style('top', `${event.offsetY - 28}px`);
        })
        .on('mouseout', () => tooltip.transition().duration(150).style('opacity', 0));

      g.selectAll('.dot-ent')
        .data(entData)
        .join('circle')
        .attr('cx', d => x(d.hour))
        .attr('cy', d => y(d.value))
        .attr('r', 4)
        .attr('fill', COLORS.Entertainment)
        .on('mouseover', function (event, d) {
          tooltip.transition().duration(150).style('opacity', 1);
          tooltip.html(`<strong>${d.hour}:00</strong><br/>Entertainment: ${d.value.toFixed(1)}%`)
            .style('left', `${event.offsetX + 12}px`)
            .style('top', `${event.offsetY - 28}px`);
        })
        .on('mouseout', () => tooltip.transition().duration(150).style('opacity', 0));

      const legend = g.append('g').attr('transform', `translate(${width - 180}, 0)`);
      [{ label: 'Productive %', color: COLORS.Productive }, { label: 'Entertainment %', color: COLORS.Entertainment }]
        .forEach((item, i) => {
          legend.append('rect').attr('x', 0).attr('y', i * 20).attr('width', 14).attr('height', 14).attr('rx', 3).attr('fill', item.color);
          legend.append('text').attr('x', 20).attr('y', i * 20 + 11).attr('fill', '#8f98a7').style('font-size', '12px').text(item.label);
        });

      styleAxes(svg);
    }

    function renderSessionDurationChart() {
      clearSvg(sessionDurRef);
      const container = sessionDurRef.current?.parentElement;
      if (!container) return;
      const fullWidth = container.getBoundingClientRect().width;
      const margin = { top: 20, right: 20, bottom: 50, left: 50 };
      const width = fullWidth - margin.left - margin.right;
      const height = 280 - margin.top - margin.bottom;

      const svg = d3.select(sessionDurRef.current)
        .attr('width', fullWidth)
        .attr('height', 280);

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
      const tooltip = createTooltip(container);

      const types = ['productive', 'entertainment', 'education'];
      const typeColors = { productive: COLORS.Productive, entertainment: COLORS.Entertainment, education: COLORS.Education };
      const typeLabels = { productive: 'Productive', entertainment: 'Entertainment', education: 'Education' };
      const buckets = ['<2min', '2-5min', '5-25min', '25+min'];

      const chartData = types.map(t => {
        const p = data.session_duration_profile[t];
        const pct2to5 = p.pct_under_5min - p.pct_under_2min;
        const pct5to25 = 100 - p.pct_under_5min - p.pct_over_25min;
        return {
          type: t,
          '<2min': p.pct_under_2min,
          '2-5min': pct2to5,
          '5-25min': pct5to25,
          '25+min': p.pct_over_25min,
        };
      });

      const x0 = d3.scaleBand().domain(buckets).range([0, width]).padding(0.2);
      const x1 = d3.scaleBand().domain(types).range([0, x0.bandwidth()]).padding(0.1);
      const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

      g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x0));

      g.append('g').call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`));

      buckets.forEach(bucket => {
        g.append('g')
          .selectAll('rect')
          .data(chartData)
          .join('rect')
          .attr('x', d => x0(bucket) + x1(d.type))
          .attr('y', d => y(d[bucket]))
          .attr('width', x1.bandwidth())
          .attr('height', d => height - y(d[bucket]))
          .attr('fill', d => typeColors[d.type])
          .attr('rx', 2)
          .attr('opacity', 0.85)
          .on('mouseover', function (event, d) {
            d3.select(this).attr('opacity', 1);
            tooltip.transition().duration(150).style('opacity', 1);
            tooltip.html(`<strong>${typeLabels[d.type]}</strong><br/>${bucket}: ${d[bucket].toFixed(1)}%`)
              .style('left', `${event.offsetX + 12}px`)
              .style('top', `${event.offsetY - 28}px`);
          })
          .on('mouseout', function () {
            d3.select(this).attr('opacity', 0.85);
            tooltip.transition().duration(150).style('opacity', 0);
          });
      });

      const legend = g.append('g').attr('transform', `translate(${width - 260}, -5)`);
      types.forEach((t, i) => {
        legend.append('rect').attr('x', i * 100).attr('y', 0).attr('width', 12).attr('height', 12).attr('rx', 2).attr('fill', typeColors[t]);
        legend.append('text').attr('x', i * 100 + 16).attr('y', 10).attr('fill', '#8f98a7').style('font-size', '11px').text(typeLabels[t]);
      });

      styleAxes(svg);
    }

    function renderDayOfWeekChart() {
      clearSvg(dayOfWeekRef);
      const container = dayOfWeekRef.current?.parentElement;
      if (!container) return;
      const fullWidth = container.getBoundingClientRect().width;
      const margin = { top: 20, right: 20, bottom: 40, left: 50 };
      const width = fullWidth - margin.left - margin.right;
      const height = 300 - margin.top - margin.bottom;

      const svg = d3.select(dayOfWeekRef.current)
        .attr('width', fullWidth)
        .attr('height', 300);

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
      const tooltip = createTooltip(container);

      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const keys = ['productive_h', 'education_h', 'entertainment_h', 'social_h', 'sleep_h'];
      const keyColors = {
        productive_h: COLORS.Productive,
        education_h: COLORS.Education,
        entertainment_h: COLORS.Entertainment,
        social_h: COLORS.Social,
        sleep_h: COLORS.Sleep,
      };
      const keyLabels = {
        productive_h: 'Productive',
        education_h: 'Education',
        entertainment_h: 'Entertainment',
        social_h: 'Social',
        sleep_h: 'Sleep',
      };

      const dayData = days.map(d => ({ day: d, ...data.day_of_week[d] }));

      const x0 = d3.scaleBand().domain(days).range([0, width]).padding(0.15);
      const x1 = d3.scaleBand().domain(keys).range([0, x0.bandwidth()]).padding(0.08);
      const y = d3.scaleLinear()
        .domain([0, d3.max(dayData, d => d3.max(keys, k => d[k]))])
        .nice()
        .range([height, 0]);

      g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x0).tickFormat(d => d.slice(0, 3)));

      g.append('g').call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}h`));

      days.forEach(day => {
        const dayG = g.append('g').attr('transform', `translate(${x0(day)},0)`);
        keys.forEach(k => {
          const val = data.day_of_week[day][k];
          dayG.append('rect')
            .attr('x', x1(k))
            .attr('y', y(val))
            .attr('width', x1.bandwidth())
            .attr('height', height - y(val))
            .attr('fill', keyColors[k])
            .attr('rx', 2)
            .attr('opacity', 0.85)
            .on('mouseover', function (event) {
              d3.select(this).attr('opacity', 1);
              tooltip.transition().duration(150).style('opacity', 1);
              tooltip.html(`<strong>${day}</strong><br/>${keyLabels[k]}: ${val.toFixed(1)}h`)
                .style('left', `${event.offsetX + 12}px`)
                .style('top', `${event.offsetY - 28}px`);
            })
            .on('mouseout', function () {
              d3.select(this).attr('opacity', 0.85);
              tooltip.transition().duration(150).style('opacity', 0);
            });
        });
      });

      const legend = g.append('g').attr('transform', `translate(0, -5)`);
      keys.forEach((k, i) => {
        legend.append('rect').attr('x', i * 95).attr('y', 0).attr('width', 12).attr('height', 12).attr('rx', 2).attr('fill', keyColors[k]);
        legend.append('text').attr('x', i * 95 + 16).attr('y', 10).attr('fill', '#8f98a7').style('font-size', '11px').text(keyLabels[k]);
      });

      styleAxes(svg);
    }

    function renderStickinessChart() {
      clearSvg(stickinessRef);
      const container = stickinessRef.current?.parentElement;
      if (!container) return;
      const fullWidth = container.getBoundingClientRect().width;
      const margin = { top: 10, right: 30, bottom: 20, left: 110 };
      const width = fullWidth - margin.left - margin.right;
      const entries = Object.entries(data.distraction_stickiness).sort((a, b) => b[1] - a[1]);
      const barHeight = 32;
      const height = entries.length * barHeight;

      const svg = d3.select(stickinessRef.current)
        .attr('width', fullWidth)
        .attr('height', height + margin.top + margin.bottom);

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
      const tooltip = createTooltip(container);

      const x = d3.scaleLinear().domain([0, 100]).range([0, width]);
      const y = d3.scaleBand().domain(entries.map(e => e[0])).range([0, height]).padding(0.25);

      entries.forEach(([name, val]) => {
        g.append('rect')
          .attr('x', 0)
          .attr('y', y(name))
          .attr('width', x(val))
          .attr('height', y.bandwidth())
          .attr('fill', COLORS.Entertainment)
          .attr('rx', 4)
          .attr('opacity', 0.8)
          .on('mouseover', function (event) {
            d3.select(this).attr('opacity', 1);
            tooltip.transition().duration(150).style('opacity', 1);
            tooltip.html(`<strong>${name}</strong><br/>Stickiness: ${val}%`)
              .style('left', `${event.offsetX + 12}px`)
              .style('top', `${event.offsetY - 28}px`);
          })
          .on('mouseout', function () {
            d3.select(this).attr('opacity', 0.8);
            tooltip.transition().duration(150).style('opacity', 0);
          });

        g.append('text')
          .attr('x', -8)
          .attr('y', y(name) + y.bandwidth() / 2)
          .attr('dy', '0.35em')
          .attr('text-anchor', 'end')
          .attr('fill', '#e2e8f0')
          .style('font-size', '12px')
          .text(name);

        g.append('text')
          .attr('x', x(val) + 6)
          .attr('y', y(name) + y.bandwidth() / 2)
          .attr('dy', '0.35em')
          .attr('fill', '#8f98a7')
          .style('font-size', '11px')
          .text(`${val}%`);
      });
    }

    function renderTopCategoriesChart() {
      clearSvg(topCategoriesRef);
      const container = topCategoriesRef.current?.parentElement;
      if (!container) return;
      const fullWidth = container.getBoundingClientRect().width;
      const margin = { top: 10, right: 50, bottom: 20, left: 140 };
      const width = fullWidth - margin.left - margin.right;
      const entries = Object.entries(data.project_breakdown)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
      const barHeight = 32;
      const height = entries.length * barHeight;

      const svg = d3.select(topCategoriesRef.current)
        .attr('width', fullWidth)
        .attr('height', height + margin.top + margin.bottom);

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
      const tooltip = createTooltip(container);

      const maxVal = d3.max(entries, e => e[1]);
      const x = d3.scaleLinear().domain([0, maxVal]).range([0, width]);
      const y = d3.scaleBand().domain(entries.map(e => e[0])).range([0, height]).padding(0.25);

      const barColors = ['#67c1b8', '#f2a65a', '#8b5cf6', '#3b82f6', '#10b981', '#818cf8', '#f59e0b', '#06b6d4'];

      entries.forEach(([name, val], i) => {
        const label = name.length > 20 ? name.slice(0, 20) + '…' : name;

        g.append('rect')
          .attr('x', 0)
          .attr('y', y(name))
          .attr('width', x(val))
          .attr('height', y.bandwidth())
          .attr('fill', barColors[i % barColors.length])
          .attr('rx', 4)
          .attr('opacity', 0.8)
          .on('mouseover', function (event) {
            d3.select(this).attr('opacity', 1);
            tooltip.transition().duration(150).style('opacity', 1);
            tooltip.html(`<strong>${name}</strong><br/>${fmtHours(val)}h`)
              .style('left', `${event.offsetX + 12}px`)
              .style('top', `${event.offsetY - 28}px`);
          })
          .on('mouseout', function () {
            d3.select(this).attr('opacity', 0.8);
            tooltip.transition().duration(150).style('opacity', 0);
          });

        g.append('text')
          .attr('x', -8)
          .attr('y', y(name) + y.bandwidth() / 2)
          .attr('dy', '0.35em')
          .attr('text-anchor', 'end')
          .attr('fill', '#e2e8f0')
          .style('font-size', '12px')
          .text(label);

        g.append('text')
          .attr('x', x(val) + 6)
          .attr('y', y(name) + y.bandwidth() / 2)
          .attr('dy', '0.35em')
          .attr('fill', '#8f98a7')
          .style('font-size', '11px')
          .text(`${fmtHours(val)}h`);
      });
    }

    function renderYoutubeTopicsChart() {
      clearSvg(youtubeTopicsRef);
      const container = youtubeTopicsRef.current?.parentElement;
      if (!container) return;
      const fullWidth = container.getBoundingClientRect().width;
      const size = Math.min(fullWidth, 320);
      const radius = size / 2;
      const innerRadius = radius * 0.5;

      const svg = d3.select(youtubeTopicsRef.current)
        .attr('width', fullWidth)
        .attr('height', size);

      const g = svg.append('g').attr('transform', `translate(${fullWidth / 2},${size / 2})`);
      const tooltip = createTooltip(container);

      const entries = Object.entries(data.youtube_topics).map(([k, v]) => ({ topic: k, hours: v }));
      const total = d3.sum(entries, d => d.hours);

      const color = d3.scaleOrdinal()
        .domain(entries.map(d => d.topic))
        .range(['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']);

      const pie = d3.pie().value(d => d.hours).sort(null).padAngle(0.02);
      const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius - 8);

      g.selectAll('path')
        .data(pie(entries))
        .join('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.topic))
        .attr('stroke', 'rgba(8, 10, 14, 0.98)')
        .attr('stroke-width', 2)
        .on('mouseover', function (event, d) {
          d3.select(this).transition().duration(150).attr('transform', 'scale(1.04)');
          tooltip.transition().duration(150).style('opacity', 1);
          tooltip.html(`<strong>${d.data.topic}</strong><br/>${d.data.hours.toFixed(1)}h (${((d.data.hours / total) * 100).toFixed(1)}%)`)
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
        .style('font-size', '20px')
        .style('font-weight', '700')
        .text(`${total.toFixed(0)}h`);

      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '1.2em')
        .attr('fill', '#8f98a7')
        .style('font-size', '11px')
        .text('YouTube');
    }

    function renderAnimeChart() {
      clearSvg(animeRef);
      const container = animeRef.current?.parentElement;
      if (!container) return;
      const fullWidth = container.getBoundingClientRect().width;
      const margin = { top: 10, right: 50, bottom: 20, left: 160 };
      const width = fullWidth - margin.left - margin.right;
      const entries = Object.entries(data.anime_breakdown)
        .filter(([name]) => !name.startsWith('Search result'))
        .map(([name, val]) => ({ name, ...val }))
        .sort((a, b) => b.hours - a.hours);
      const barHeight = 32;
      const height = entries.length * barHeight;

      const svg = d3.select(animeRef.current)
        .attr('width', fullWidth)
        .attr('height', height + margin.top + margin.bottom);

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
      const tooltip = createTooltip(container);

      const maxVal = d3.max(entries, e => e.hours);
      const x = d3.scaleLinear().domain([0, maxVal]).range([0, width]);
      const y = d3.scaleBand().domain(entries.map(e => e.name)).range([0, height]).padding(0.25);

      const animeColors = ['#67c1b8', '#f2a65a', '#8b5cf6', '#3b82f6', '#10b981', '#818cf8', '#f59e0b', '#06b6d4'];

      entries.forEach((entry, i) => {
        const label = entry.name.length > 24 ? entry.name.slice(0, 24) + '…' : entry.name;

        g.append('rect')
          .attr('x', 0)
          .attr('y', y(entry.name))
          .attr('width', x(entry.hours))
          .attr('height', y.bandwidth())
          .attr('fill', animeColors[i % animeColors.length])
          .attr('rx', 4)
          .attr('opacity', 0.8)
          .on('mouseover', function (event) {
            d3.select(this).attr('opacity', 1);
            tooltip.transition().duration(150).style('opacity', 1);
            tooltip.html(`<strong>${entry.name}</strong><br/>${entry.hours}h · ${entry.sessions} sessions`)
              .style('left', `${event.offsetX + 12}px`)
              .style('top', `${event.offsetY - 28}px`);
          })
          .on('mouseout', function () {
            d3.select(this).attr('opacity', 0.8);
            tooltip.transition().duration(150).style('opacity', 0);
          });

        g.append('text')
          .attr('x', -8)
          .attr('y', y(entry.name) + y.bandwidth() / 2)
          .attr('dy', '0.35em')
          .attr('text-anchor', 'end')
          .attr('fill', '#e2e8f0')
          .style('font-size', '12px')
          .text(label);

        g.append('text')
          .attr('x', x(entry.hours) + 6)
          .attr('y', y(entry.name) + y.bandwidth() / 2)
          .attr('dy', '0.35em')
          .attr('fill', '#8f98a7')
          .style('font-size', '11px')
          .text(`${entry.hours}h`);
      });
    }

    function renderLateNightChart() {
      clearSvg(lateNightRef);
      const container = lateNightRef.current?.parentElement;
      if (!container) return;
      const fullWidth = container.getBoundingClientRect().width;
      const size = Math.min(fullWidth, 320);
      const radius = size / 2;
      const innerRadius = radius * 0.5;

      const svg = d3.select(lateNightRef.current)
        .attr('width', fullWidth)
        .attr('height', size);

      const g = svg.append('g').attr('transform', `translate(${fullWidth / 2},${size / 2})`);
      const tooltip = createTooltip(container);

      const entries = Object.entries(data.late_night_breakdown).map(([k, v]) => ({ type: k, ...v }));
      const total = d3.sum(entries, d => d.hours);

      const pie = d3.pie().value(d => d.hours).sort(null).padAngle(0.02);
      const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius - 8);

      g.selectAll('path')
        .data(pie(entries))
        .join('path')
        .attr('d', arc)
        .attr('fill', d => COLORS[d.data.type])
        .attr('stroke', 'rgba(8, 10, 14, 0.98)')
        .attr('stroke-width', 2)
        .on('mouseover', function (event, d) {
          d3.select(this).transition().duration(150).attr('transform', 'scale(1.04)');
          tooltip.transition().duration(150).style('opacity', 1);
          tooltip.html(`<strong>${d.data.type}</strong><br/>${d.data.hours}h (${d.data.pct}%)`)
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
        .style('font-size', '20px')
        .style('font-weight', '700')
        .text(`${total.toFixed(0)}h`);

      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '1.2em')
        .attr('fill', '#8f98a7')
        .style('font-size', '11px')
        .text('Late Night');
    }

    function renderWillpowerChart() {
      clearSvg(willpowerRef);
      const container = willpowerRef.current?.parentElement;
      if (!container) return;
      const fullWidth = container.getBoundingClientRect().width;
      const margin = { top: 20, right: 20, bottom: 40, left: 50 };
      const width = fullWidth - margin.left - margin.right;
      const height = 220 - margin.top - margin.bottom;

      const svg = d3.select(willpowerRef.current)
        .attr('width', fullWidth)
        .attr('height', 220);

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
      const tooltip = createTooltip(container);

      const bars = [
        { label: 'Morning (8-12)', value: data.willpower_depletion.morning_8_12_ent_pct },
        { label: 'Afternoon (12-17)', value: data.willpower_depletion.afternoon_12_17_ent_pct },
        { label: 'Evening (17-22)', value: data.willpower_depletion.evening_17_22_ent_pct },
      ];

      const x = d3.scaleBand().domain(bars.map(b => b.label)).range([0, width]).padding(0.35);
      const y = d3.scaleLinear().domain([0, d3.max(bars, b => b.value) * 1.2]).nice().range([height, 0]);

      g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));

      g.append('g').call(d3.axisLeft(y).ticks(4).tickFormat(d => `${d}%`));

      const barColorScale = d3.scaleLinear().domain([14, 18]).range([COLORS.Productive, COLORS.Entertainment]);

      bars.forEach(b => {
        g.append('rect')
          .attr('x', x(b.label))
          .attr('y', y(b.value))
          .attr('width', x.bandwidth())
          .attr('height', height - y(b.value))
          .attr('fill', barColorScale(b.value))
          .attr('rx', 4)
          .attr('opacity', 0.85)
          .on('mouseover', function (event) {
            d3.select(this).attr('opacity', 1);
            tooltip.transition().duration(150).style('opacity', 1);
            tooltip.html(`<strong>${b.label}</strong><br/>Entertainment: ${b.value}%`)
              .style('left', `${event.offsetX + 12}px`)
              .style('top', `${event.offsetY - 28}px`);
          })
          .on('mouseout', function () {
            d3.select(this).attr('opacity', 0.85);
            tooltip.transition().duration(150).style('opacity', 0);
          });

        g.append('text')
          .attr('x', x(b.label) + x.bandwidth() / 2)
          .attr('y', y(b.value) - 6)
          .attr('text-anchor', 'middle')
          .attr('fill', '#e2e8f0')
          .style('font-size', '13px')
          .style('font-weight', '600')
          .text(`${b.value}%`);
      });

      styleAxes(svg);
    }
  }, [data]);

  if (!data) return null;

  const productiveH = (data.activity_type_breakdown.Productive / 3600).toFixed(1);
  const entertainmentH = (data.activity_type_breakdown.Entertainment / 3600).toFixed(1);
  const totalActive = data.total_seconds - data.activity_type_breakdown.Sleep;
  const focusScore = ((data.activity_type_breakdown.Productive / totalActive) * 100).toFixed(1);
  const sleepAvg = data.sleep_consistency.mean_h.toFixed(1);
  const fragIndex = data.fragmentation_index.mean.toFixed(1);

  const topDistractions = Object.entries(data.top_distractions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const maxDistraction = topDistractions[0]?.[1] || 1;

  const transitionTypes = Object.keys(data.transition_matrix_pct);

  const driftPaths = Object.entries(data.productive_to_entertainment_paths)
    .sort((a, b) => b[1] - a[1]);

  function cleanDistTitle(title) {
    return title
      .replace(/Watch\s+/i, '')
      .replace(/\s+English Sub\/Dub online Free on HiAnime\.to/i, '')
      .replace(/\s*-\s*Audio playing/i, '')
      .replace(/\s*-\s*YouTube/i, '')
      .slice(0, 40);
  }

  return (
    <div className={styles.container}>
      {/* 1. Header */}
      <div className={styles.header}>
        <h1>Time Analysis Dashboard</h1>
        <p>
          {data.date_range.start} — {data.date_range.end} · {data.total_days} days · {(data.total_seconds / 3600).toFixed(0)}h tracked
        </p>
      </div>

      {/* 2. KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiValue} style={{ color: COLORS.Productive }}>{productiveH}h</div>
          <div className={styles.kpiLabel}>Productive Time</div>
          <div className={styles.kpiSub}>{(data.activity_type_breakdown.Productive / 3600 / data.total_days).toFixed(1)}h/day avg</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiValue} style={{ color: COLORS.Entertainment }}>{entertainmentH}h</div>
          <div className={styles.kpiLabel}>Entertainment</div>
          <div className={styles.kpiSub}>{(data.activity_type_breakdown.Entertainment / 3600 / data.total_days).toFixed(1)}h/day avg</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiValue} style={{ color: '#22d3ee' }}>{focusScore}%</div>
          <div className={styles.kpiLabel}>Focus Score</div>
          <div className={styles.kpiSub}>Productive / active time</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiValue} style={{ color: '#a78bfa' }}>{data.flow_sessions.count}</div>
          <div className={styles.kpiLabel}>Deep Work Sessions</div>
          <div className={styles.kpiSub}>{data.flow_sessions.total_hours}h total flow</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiValue} style={{ color: COLORS.Sleep }}>{sleepAvg}h</div>
          <div className={styles.kpiLabel}>Sleep Avg/Night</div>
          <div className={styles.kpiSub}>σ = {data.sleep_consistency.std_h}h</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiValue} style={{ color: '#f59e0b' }}>{fragIndex}</div>
          <div className={styles.kpiLabel}>Fragmentation Index</div>
          <div className={styles.kpiSub}>Context switches/hr</div>
        </div>
      </div>

      {/* 3. Key Findings */}
      <section>
        <h2 className={styles.sectionTitle}>Key Findings</h2>
        <div className={styles.grid}>
          <div className={styles.findingCard}>
            <span className={styles.tag + ' ' + styles.tagRed}>Fragmentation</span>
            <p>85% of productive sessions last under 2 minutes. Median session is just {data.focus_stats.productive.median_duration_min}min — attention is heavily fragmented across {data.focus_stats.productive.count.toLocaleString()} micro-sessions.</p>
          </div>
          <div className={styles.findingCard}>
            <span className={styles.tag + ' ' + styles.tagRed}>Entertainment</span>
            <p>Entertainment sessions average {data.focus_stats.entertainment.avg_duration_min}min — 3x longer than productive ones. Max single entertainment session: {data.focus_stats.entertainment.max_duration_min}min (2.8h).</p>
          </div>
          <div className={styles.findingCard}>
            <span className={styles.tag + ' ' + styles.tagRed}>Drift</span>
            <p>Coding→YouTube is the #1 drift path ({driftPaths[0]?.[1]} occurrences). AI Tools→YouTube ({driftPaths[1]?.[1]}) and Coding→Anime ({driftPaths[2]?.[1]}) follow closely.</p>
          </div>
          <div className={styles.findingCard}>
            <span className={styles.tag + ' ' + styles.tagGreen}>Sleep→Productivity</span>
            <p>Good sleep (≥4h) correlates with {data.sleep_productivity.good_sleep_avg_productive_h}h productive vs {data.sleep_productivity.bad_sleep_avg_productive_h}h on bad sleep days. Correlation: r={data.sleep_productivity.correlation_sleep_prod}.</p>
          </div>
          <div className={styles.findingCard}>
            <span className={styles.tag + ' ' + styles.tagGreen}>Best Days</span>
            <p>Monday ({data.day_of_week.Monday.productive_h}h) and Sunday ({data.day_of_week.Sunday.productive_h}h) are the most productive days. Saturday is the least productive at {data.day_of_week.Saturday.productive_h}h.</p>
          </div>
        </div>
      </section>

      {/* 4. Hourly Activity Rhythm */}
      <section>
        <h2 className={styles.sectionTitle}>Hourly Activity Rhythm</h2>
        <div className={`${styles.card} ${styles.gridFull}`}>
          <div className={styles.chartContainer}>
            <svg ref={hourlyRef} />
          </div>
          <div className={styles.legendRow}>
            {ACTIVITY_ORDER.map(t => (
              <span key={t} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: COLORS[t] }} />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 5+6: Time Allocation + Focus & Fragmentation */}
      <section>
        <div className={styles.grid2}>
          <div>
            <h2 className={styles.sectionTitle}>Time Allocation</h2>
            <div className={styles.card}>
              <div className={styles.chartContainer}>
                <svg ref={donutRef} />
              </div>
              <div className={styles.legendRow}>
                {Object.entries(data.activity_type_breakdown).filter(([k]) => k !== 'Sleep').map(([k]) => (
                  <span key={k} className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ background: COLORS[k] }} />
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h2 className={styles.sectionTitle}>Focus &amp; Fragmentation</h2>
            <div className={styles.card}>
              <div className={styles.insightItem}>
                <div className={styles.insightContent}>
                  <strong>Productive sessions:</strong> {data.focus_stats.productive.count.toLocaleString()} total, avg {data.focus_stats.productive.avg_duration_min}min, max {data.focus_stats.productive.max_duration_min}min
                </div>
              </div>
              <div className={styles.insightItem}>
                <div className={styles.insightContent}>
                  <strong>Entertainment sessions:</strong> {data.focus_stats.entertainment.count.toLocaleString()} total, avg {data.focus_stats.entertainment.avg_duration_min}min, max {data.focus_stats.entertainment.max_duration_min}min
                </div>
              </div>
              <div className={styles.insightItem}>
                <div className={styles.insightContent}>
                  <strong>Context switches peak:</strong> 17:00 ({data.context_switching['17']}/hr) — busiest hour for task-switching
                </div>
              </div>
              <div className={styles.insightItem}>
                <div className={styles.insightContent}>
                  <strong>Flow sessions:</strong> {data.flow_sessions.count} deep sessions ({data.flow_sessions.total_hours}h total), avg {data.flow_sessions.per_day}/day
                </div>
              </div>
              <div className={styles.insightItem}>
                <div className={styles.insightContent}>
                  <strong>Session profile:</strong> {data.session_duration_profile.productive.pct_under_2min}% of productive sessions &lt;2min, only {data.session_duration_profile.productive.pct_over_25min}% &gt;25min
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Top Time Sinks */}
      <section>
        <h2 className={styles.sectionTitle}>Top Time Sinks</h2>
        <div className={`${styles.card} ${styles.gridFull}`}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Activity</th>
                <th>Hours</th>
                <th style={{ width: '40%' }}></th>
              </tr>
            </thead>
            <tbody>
              {topDistractions.map(([title, secs], i) => (
                <tr key={title}>
                  <td>{i + 1}</td>
                  <td>{cleanDistTitle(title)}</td>
                  <td>{fmtHours(secs)}h</td>
                  <td>
                    <div className={styles.miniBar}>
                      <div
                        className={styles.miniBarFill}
                        style={{ width: `${(secs / maxDistraction) * 100}%`, background: COLORS.Entertainment }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 8. Circadian Focus Ratio */}
      <section>
        <h2 className={styles.sectionTitle}>Circadian Focus Ratio</h2>
        <div className={`${styles.card} ${styles.gridFull}`}>
          <p className={styles.chartSubtitle}>
            Best focus hours: {data.best_focus_hours.map(h => `${h}:00`).join(', ')}
          </p>
          <div className={styles.chartContainer}>
            <svg ref={circadianRef} />
          </div>
        </div>
      </section>

      {/* 9. Session Duration Distribution */}
      <section>
        <h2 className={styles.sectionTitle}>Session Duration Distribution</h2>
        <div className={`${styles.card} ${styles.gridFull}`}>
          <div className={styles.chartContainer}>
            <svg ref={sessionDurRef} />
          </div>
        </div>
      </section>

      {/* 10. Day-of-Week */}
      <section>
        <h2 className={styles.sectionTitle}>Day-of-Week Breakdown</h2>
        <div className={`${styles.card} ${styles.gridFull}`}>
          <div className={styles.chartContainer}>
            <svg ref={dayOfWeekRef} />
          </div>
        </div>
      </section>

      {/* 11. Transition Heatmap */}
      <section>
        <h2 className={styles.sectionTitle}>Activity Transition Heatmap</h2>
        <div className={`${styles.card} ${styles.gridFull}`}>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>From ↓ / To →</th>
                  {transitionTypes.map(t => <th key={t}>{t.slice(0, 4)}</th>)}
                </tr>
              </thead>
              <tbody>
                {transitionTypes.map(from => (
                  <tr key={from}>
                    <td><strong>{from}</strong></td>
                    {transitionTypes.map(to => {
                      const val = data.transition_matrix_pct[from][to];
                      const bg = val === 0
                        ? 'transparent'
                        : `rgba(79, 70, 229, ${Math.min(val / 70, 1)})`;
                      return (
                        <td key={to} style={{ background: bg, textAlign: 'center' }}>
                          {val > 0 ? fmtPct(val) : '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 12. Drift Paths */}
      <section>
        <h2 className={styles.sectionTitle}>Productive → Entertainment Drift Paths</h2>
        <div className={`${styles.card} ${styles.gridFull}`}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Path</th>
                <th>Occurrences</th>
                <th style={{ width: '40%' }}></th>
              </tr>
            </thead>
            <tbody>
              {driftPaths.map(([path, count]) => (
                <tr key={path}>
                  <td>{path}</td>
                  <td>{count}</td>
                  <td>
                    <div className={styles.miniBar}>
                      <div
                        className={styles.miniBarFill}
                        style={{ width: `${(count / driftPaths[0][1]) * 100}%`, background: COLORS.Entertainment }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 13+14: Stickiness + Top Categories */}
      <section>
        <div className={styles.grid2}>
          <div>
            <h2 className={styles.sectionTitle}>Distraction Stickiness</h2>
            <div className={styles.card}>
              <p className={styles.chartSubtitle}>% of time you stay in the distraction after switching to it</p>
              <div className={styles.chartContainer}>
                <svg ref={stickinessRef} />
              </div>
            </div>
          </div>
          <div>
            <h2 className={styles.sectionTitle}>Top Categories</h2>
            <div className={styles.card}>
              <div className={styles.chartContainer}>
                <svg ref={topCategoriesRef} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 15+16: YouTube Topics + Anime */}
      <section>
        <div className={styles.grid2}>
          <div>
            <h2 className={styles.sectionTitle}>YouTube Topics</h2>
            <div className={styles.card}>
              <div className={styles.chartContainer}>
                <svg ref={youtubeTopicsRef} />
              </div>
              <div className={styles.legendRow}>
                {Object.keys(data.youtube_topics).map((t, i) => (
                  <span key={t} className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ background: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'][i] }} />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div>
            <h2 className={styles.sectionTitle}>Anime Breakdown</h2>
            <div className={styles.card}>
              <div className={styles.chartContainer}>
                <svg ref={animeRef} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 17. Sleep vs Productivity */}
      <section>
        <h2 className={styles.sectionTitle}>Sleep vs Productivity</h2>
        <div className={styles.grid}>
          <div className={styles.findingCard}>
            <span className={styles.tag + ' ' + styles.tagGreen}>Sleep Stats</span>
            <p>Avg: <strong>{data.sleep_consistency.mean_h}h</strong>/night · Std: {data.sleep_consistency.std_h}h · Range: {data.sleep_consistency.min_h}h – {data.sleep_consistency.max_h}h</p>
          </div>
          <div className={styles.findingCard}>
            <span className={styles.tag + ' ' + styles.tagGreen}>Good Sleep Days</span>
            <p>≥{data.sleep_productivity.good_sleep_threshold_h}h sleep → <strong>{data.sleep_productivity.good_sleep_avg_productive_h}h</strong> productive, {data.sleep_productivity.good_sleep_avg_entertainment_h}h entertainment</p>
          </div>
          <div className={styles.findingCard}>
            <span className={styles.tag + ' ' + styles.tagRed}>Bad Sleep Days</span>
            <p>&lt;{data.sleep_productivity.good_sleep_threshold_h}h sleep → <strong>{data.sleep_productivity.bad_sleep_avg_productive_h}h</strong> productive, {data.sleep_productivity.bad_sleep_avg_entertainment_h}h entertainment</p>
          </div>
        </div>
      </section>

      {/* 18+19: Late Night + Willpower */}
      <section>
        <div className={styles.grid2}>
          <div>
            <h2 className={styles.sectionTitle}>Late Night Audit (10pm–4am)</h2>
            <div className={styles.card}>
              <div className={styles.chartContainer}>
                <svg ref={lateNightRef} />
              </div>
              <div className={styles.legendRow}>
                {Object.keys(data.late_night_breakdown).map(t => (
                  <span key={t} className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ background: COLORS[t] }} />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div>
            <h2 className={styles.sectionTitle}>Willpower Depletion</h2>
            <div className={styles.card}>
              <p className={styles.chartSubtitle}>Entertainment % by time of day</p>
              <div className={styles.chartContainer}>
                <svg ref={willpowerRef} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 20. Recommendations */}
      <section>
        <h2 className={styles.sectionTitle}>Recommendations</h2>
        <div className={styles.grid}>
          <div className={styles.recCard}>
            <h3>Block Drift Paths</h3>
            <p>Coding→YouTube accounts for {driftPaths[0]?.[1]} transitions. Use a site blocker during coding sessions between 10am–5pm to protect your peak focus hours.</p>
          </div>
          <div className={styles.recCard}>
            <h3>Build Session Depth</h3>
            <p>85% of productive sessions are under 2 minutes. Try 25-min Pomodoro blocks to build sustained attention. Target: increase &gt;25min sessions from 0.2% to 5%.</p>
          </div>
          <div className={styles.recCard}>
            <h3>Prioritize Sleep</h3>
            <p>Good sleep days yield 2x more productive hours ({data.sleep_productivity.good_sleep_avg_productive_h}h vs {data.sleep_productivity.bad_sleep_avg_productive_h}h). Aim for a consistent 7h+ schedule — current avg is only {data.sleep_consistency.mean_h}h.</p>
          </div>
          <div className={styles.recCard}>
            <h3>Cap Late Nights</h3>
            <p>29.6% of late-night time (10pm–4am) goes to entertainment. Set a hard cutoff at 11pm for entertainment to reclaim sleep and morning productivity.</p>
          </div>
          <div className={styles.recCard}>
            <h3>Leverage Best Days</h3>
            <p>Mondays and Sundays are your most productive days. Schedule deep work and important projects on these days. Protect Saturday for intentional rest.</p>
          </div>
          <div className={styles.recCard}>
            <h3>Exploit Peak Hours</h3>
            <p>Your focus peaks at 4pm–5pm and 8pm. Schedule your hardest tasks in these windows. Avoid scheduling meetings or admin work during these golden hours.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
