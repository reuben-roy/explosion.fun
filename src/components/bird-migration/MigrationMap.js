'use client';

import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { getBirdColor } from '@/utils/migrationDataParser';
import styles from './MigrationMap.module.css';

// Reference cities for context
const CITIES = [
    { name: 'Amsterdam', lat: 52.37, lon: 4.89 },
    { name: 'Paris', lat: 48.86, lon: 2.35 },
    { name: 'Madrid', lat: 40.42, lon: -3.70 },
    { name: 'Rabat', lat: 34.02, lon: -6.83 },
    { name: 'Nouakchott', lat: 18.09, lon: -15.98 },
    { name: 'Dakar', lat: 14.69, lon: -17.44 },
];

export default function MigrationMap({
    birdData,
    visibleData,
    currentPositions,
    selectedBird,
    onBirdSelect,
    autoTrack = true,
    visualizationMode = 'identity' // 'identity' | 'speed'
}) {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const zoomRef = useRef(null);
    const projectionRef = useRef(null);
    const gRef = useRef(null);
    const pathGeneratorRef = useRef(null);
    const lastCenterRef = useRef(null);
    const [worldData, setWorldData] = useState(null);

    // Load world map data
    useEffect(() => {
        fetch('/data/world-110m.json')
            .then(res => res.json())
            .then(data => {
                setWorldData(data);
            })
            .catch(err => console.error('Failed to load world map:', err));
    }, []);

    // Calculate the centroid of current bird positions for camera tracking
    const birdsCentroid = useMemo(() => {
        if (!currentPositions) return null;

        const positions = Object.values(currentPositions).filter(p => p);
        if (positions.length === 0) return null;

        const sumLat = positions.reduce((sum, p) => sum + p.lat, 0);
        const sumLon = positions.reduce((sum, p) => sum + p.lon, 0);

        return {
            lat: sumLat / positions.length,
            lon: sumLon / positions.length
        };
    }, [currentPositions]);

    // Initialize the map
    useEffect(() => {
        if (!svgRef.current || !containerRef.current || !worldData) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Clear previous content
        d3.select(svgRef.current).selectAll('*').remove();

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);

        // Create defs for filters and gradients
        const defs = svg.append('defs');

        // Glow filter for trails
        const glow = defs.append('filter')
            .attr('id', 'glow')
            .attr('x', '-100%')
            .attr('y', '-100%')
            .attr('width', '300%')
            .attr('height', '300%');

        glow.append('feGaussianBlur')
            .attr('stdDeviation', '4')
            .attr('result', 'coloredBlur');

        const glowMerge = glow.append('feMerge');
        glowMerge.append('feMergeNode').attr('in', 'coloredBlur');
        glowMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        // Soft glow for markers
        const softGlow = defs.append('filter')
            .attr('id', 'softGlow')
            .attr('x', '-50%')
            .attr('y', '-50%')
            .attr('width', '200%')
            .attr('height', '200%');

        softGlow.append('feGaussianBlur')
            .attr('stdDeviation', '2')
            .attr('result', 'blur');

        const softMerge = softGlow.append('feMerge');
        softMerge.append('feMergeNode').attr('in', 'blur');
        softMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        // Ocean gradient
        const oceanGradient = defs.append('radialGradient')
            .attr('id', 'oceanGradient')
            .attr('cx', '50%')
            .attr('cy', '50%')
            .attr('r', '70%');

        oceanGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#0f1729');

        oceanGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#050510');

        // Projection - centered on the migration path
        const projection = d3.geoMercator()
            .center([-5, 32])
            .scale(width * 1.5)
            .translate([width / 2, height / 2]);

        projectionRef.current = projection;

        // Path generator
        const pathGenerator = d3.geoPath().projection(projection);
        pathGeneratorRef.current = pathGenerator;

        // Main group that will be transformed by zoom
        const g = svg.append('g').attr('class', 'main-group');
        gRef.current = g;

        // Ocean background
        g.append('rect')
            .attr('x', -width * 3)
            .attr('y', -height * 3)
            .attr('width', width * 7)
            .attr('height', height * 7)
            .attr('fill', 'url(#oceanGradient)');

        // Graticule
        const graticule = d3.geoGraticule().step([10, 10]);
        g.append('path')
            .datum(graticule())
            .attr('d', pathGenerator)
            .attr('fill', 'none')
            .attr('stroke', 'rgba(255,255,255,0.04)')
            .attr('stroke-width', 0.5);

        // Extract countries from TopoJSON
        const countries = topojson.feature(worldData, worldData.objects.countries);
        const land = topojson.feature(worldData, worldData.objects.land);

        // Draw land masses with fill
        g.append('path')
            .datum(land)
            .attr('d', pathGenerator)
            .attr('fill', '#1a1f2e')
            .attr('stroke', 'none');

        // Draw country borders
        g.append('path')
            .datum(topojson.mesh(worldData, worldData.objects.countries, (a, b) => a !== b))
            .attr('d', pathGenerator)
            .attr('fill', 'none')
            .attr('stroke', '#2d3748')
            .attr('stroke-width', 0.5)
            .attr('stroke-linejoin', 'round');

        // Coastlines (more prominent)
        g.append('path')
            .datum(land)
            .attr('d', pathGenerator)
            .attr('fill', 'none')
            .attr('stroke', '#3d4a5c')
            .attr('stroke-width', 1);

        // Cities
        const cityGroup = g.append('g').attr('class', 'cities');
        CITIES.forEach(city => {
            const coords = projection([city.lon, city.lat]);
            if (!coords) return;
            const [x, y] = coords;

            const cityG = cityGroup.append('g');

            // City dot
            cityG.append('circle')
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', 4)
                .attr('fill', '#4a5568')
                .attr('stroke', '#64748b')
                .attr('stroke-width', 1);

            // City label
            cityG.append('text')
                .attr('x', x + 8)
                .attr('y', y + 4)
                .attr('fill', '#94a3b8')
                .attr('font-size', '11px')
                .attr('font-family', 'var(--font-geist-sans)')
                .text(city.name);
        });

        // Layers for trails and markers (added on top)
        g.append('g').attr('class', 'trails-layer');
        g.append('g').attr('class', 'markers-layer');

        // Zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.3, 10])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        svg.call(zoom);
        zoomRef.current = zoom;

        // Initial zoom to fit the migration area
        const initialTransform = d3.zoomIdentity
            .translate(width * 0.1, -height * 0.1)
            .scale(0.8);
        svg.call(zoom.transform, initialTransform);

    }, [worldData]);

    // Update trails and markers when data changes
    useEffect(() => {
        if (!gRef.current || !projectionRef.current) return;

        const g = gRef.current;
        const projection = projectionRef.current;

        const trailsLayer = g.select('.trails-layer');
        const markersLayer = g.select('.markers-layer');

        // Clear previous trails and markers
        trailsLayer.selectAll('*').remove();
        markersLayer.selectAll('*').remove();

        // Speed Scale for Heatmap
        const colorScale = d3.scaleSequential(d3.interpolateTurbo)
            .domain([0, 25]); // 0 to 25 m/s

        // Draw trails for each bird
        if (visibleData) {
            Object.entries(visibleData).forEach(([birdName, points]) => {
                if (!points || points.length < 2) return;

                const isSelected = !selectedBird || selectedBird === birdName;
                const identityColor = getBirdColor(birdName);

                // Sample points for smoother rendering (every 5th point for trails)
                const sampledPoints = points.filter((_, i) => i % 5 === 0 || i === points.length - 1);

                // Create line generator with smooth curve
                const lineGenerator = d3.line()
                    .x(d => {
                        const coords = projection([d.longitude, d.latitude]);
                        return coords ? coords[0] : 0;
                    })
                    .y(d => {
                        const coords = projection([d.longitude, d.latitude]);
                        return coords ? coords[1] : 0;
                    })
                    .curve(d3.curveCatmullRom.alpha(0.5));

                // Draw trail shadow (for depth) - always uniform
                trailsLayer.append('path')
                    .datum(sampledPoints)
                    .attr('d', lineGenerator)
                    .attr('fill', 'none')
                    .attr('stroke', 'rgba(0,0,0,0.3)')
                    .attr('stroke-width', isSelected ? 5 : 3)
                    .attr('stroke-linecap', 'round')
                    .attr('stroke-linejoin', 'round');

                if (visualizationMode === 'speed') {
                    // Heatmap Mode: Draw segments
                    // We iterate through points and draw a line segment for each pair
                    // Optimized: group consecutive points into a single path? 
                    // For simplicity and gradient accuracy, we draw segments between sampled points

                    for (let i = 0; i < sampledPoints.length - 1; i++) {
                        const p1 = sampledPoints[i];
                        const p2 = sampledPoints[i + 1];

                        // Calculate avg speed for this segment
                        const avgSpeed = (p1.speed + p2.speed) / 2;
                        const color = colorScale(avgSpeed);

                        const segmentPath = d3.line()
                            .x(d => projection([d.longitude, d.latitude])?.[0] || 0)
                            .y(d => projection([d.longitude, d.latitude])?.[1] || 0)
                            .curve(d3.curveLinear); // Linear for segments to avoid loop artifacts

                        trailsLayer.append('path')
                            .datum([p1, p2])
                            .attr('d', segmentPath)
                            .attr('fill', 'none')
                            .attr('stroke', color)
                            .attr('stroke-width', isSelected ? 3 : 2)
                            .attr('stroke-linecap', 'round')
                            .attr('stroke-linejoin', 'round')
                            .attr('opacity', isSelected ? 1 : 0.4);
                    }
                } else {
                    // Identity Mode: Single continuous path
                    trailsLayer.append('path')
                        .datum(sampledPoints)
                        .attr('d', lineGenerator)
                        .attr('fill', 'none')
                        .attr('stroke', identityColor)
                        .attr('stroke-width', isSelected ? 3 : 2)
                        .attr('stroke-linecap', 'round')
                        .attr('stroke-linejoin', 'round')
                        .attr('opacity', isSelected ? 1 : 0.25)
                        .attr('filter', 'url(#glow)')
                        .style('cursor', 'pointer')
                        .on('click', () => onBirdSelect?.(birdName === selectedBird ? null : birdName));
                }
            });
        }

        // Draw current positions
        if (currentPositions) {
            Object.entries(currentPositions).forEach(([birdName, pos]) => {
                if (!pos) return;

                const coords = projection([pos.lon, pos.lat]);
                if (!coords) return;
                const [x, y] = coords;

                const identityColor = getBirdColor(birdName);
                // In speed mode, marker color matches current speed
                const speedColor = visualizationMode === 'speed' ? colorScale(pos.speed) : identityColor;

                const isSelected = !selectedBird || selectedBird === birdName;

                const group = markersLayer.append('g')
                    .attr('transform', `translate(${x}, ${y})`)
                    .attr('opacity', isSelected ? 1 : 0.3)
                    .style('cursor', 'pointer')
                    .on('click', () => onBirdSelect?.(birdName === selectedBird ? null : birdName));

                // Outer glow ring
                group.append('circle')
                    .attr('r', 20)
                    .attr('fill', speedColor)
                    .attr('opacity', 0.1);

                // Middle ring
                group.append('circle')
                    .attr('r', 12)
                    .attr('fill', speedColor)
                    .attr('opacity', 0.25);

                // Inner ring (pulsing)
                group.append('circle')
                    .attr('r', 8)
                    .attr('fill', speedColor)
                    .attr('opacity', 0.4);

                // Main dot
                group.append('circle')
                    .attr('r', 5)
                    .attr('fill', '#ffffff')
                    .attr('stroke', speedColor)
                    .attr('stroke-width', 3);

                // Bird name label with background
                const labelG = group.append('g').attr('transform', 'translate(16, 0)');

                labelG.append('rect')
                    .attr('x', -4)
                    .attr('y', -10)
                    .attr('width', birdName.length * 8 + 8)
                    .attr('height', 20)
                    .attr('rx', 4)
                    .attr('fill', 'rgba(0,0,0,0.7)')
                    .attr('stroke', speedColor)
                    .attr('stroke-width', 1);

                labelG.append('text')
                    .attr('y', 4)
                    .attr('fill', '#ffffff')
                    .attr('font-size', '12px')
                    .attr('font-weight', '600')
                    .attr('font-family', 'var(--font-geist-sans)')
                    .text(birdName);
            });
        }
    }, [visibleData, currentPositions, selectedBird, onBirdSelect, visualizationMode]);

    // Camera tracking - smoothly follow the birds
    useEffect(() => {
        if (!autoTrack || !birdsCentroid || !svgRef.current || !zoomRef.current || !projectionRef.current) return;

        const container = containerRef.current;
        if (!container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;
        const projection = projectionRef.current;

        const targetCoords = projection([birdsCentroid.lon, birdsCentroid.lat]);
        if (!targetCoords) return;

        // Calculate how far the centroid has moved
        const lastCenter = lastCenterRef.current;
        if (lastCenter) {
            const distance = Math.sqrt(
                Math.pow(targetCoords[0] - lastCenter[0], 2) +
                Math.pow(targetCoords[1] - lastCenter[1], 2)
            );

            // Only update camera if movement is significant
            if (distance < 8) return;
        }

        lastCenterRef.current = targetCoords;

        // Calculate the transform to center on the birds
        const svg = d3.select(svgRef.current);
        const currentTransform = d3.zoomTransform(svg.node());

        // Calculate new translation to center on target
        const scale = Math.max(1.2, Math.min(currentTransform.k, 2)); // Maintain reasonable zoom
        const tx = width / 2 - targetCoords[0] * scale;
        const ty = height / 2 - targetCoords[1] * scale;

        // Smoothly transition to new position
        svg.transition()
            .duration(1000)
            .ease(d3.easeCubicOut)
            .call(
                zoomRef.current.transform,
                d3.zoomIdentity.translate(tx, ty).scale(scale)
            );

    }, [birdsCentroid, autoTrack]);

    // Handle manual zoom controls
    const handleZoomIn = useCallback(() => {
        if (!svgRef.current || !zoomRef.current) return;
        const svg = d3.select(svgRef.current);
        svg.transition().duration(300).call(zoomRef.current.scaleBy, 1.5);
    }, []);

    const handleZoomOut = useCallback(() => {
        if (!svgRef.current || !zoomRef.current) return;
        const svg = d3.select(svgRef.current);
        svg.transition().duration(300).call(zoomRef.current.scaleBy, 0.67);
    }, []);

    const handleResetView = useCallback(() => {
        if (!svgRef.current || !zoomRef.current || !containerRef.current) return;
        const svg = d3.select(svgRef.current);
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        const initialTransform = d3.zoomIdentity
            .translate(width * 0.1, -height * 0.1)
            .scale(0.8);
        svg.transition().duration(500).call(zoomRef.current.transform, initialTransform);
    }, []);

    // Show loading state while map data loads
    if (!worldData) {
        return (
            <div ref={containerRef} className={styles.container}>
                <div className={styles.loading}>Loading map...</div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className={styles.container}>
            <svg ref={svgRef} className={styles.svg} />

            {/* Zoom Controls */}
            <div className={styles.zoomControls}>
                <button
                    className={styles.zoomButton}
                    onClick={handleZoomIn}
                    title="Zoom In"
                >
                    +
                </button>
                <button
                    className={styles.zoomButton}
                    onClick={handleZoomOut}
                    title="Zoom Out"
                >
                    −
                </button>
                <button
                    className={styles.zoomButton}
                    onClick={handleResetView}
                    title="Reset View"
                >
                    ⟲
                </button>
            </div>

            {/* Instructions */}
            <div className={styles.instructions}>
                Scroll to zoom • Drag to pan • Click trails to focus
            </div>
        </div>
    );
}
