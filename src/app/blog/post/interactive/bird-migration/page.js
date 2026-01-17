'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import MigrationMap from '@/components/bird-migration/MigrationMap';
import TimelineControl from '@/components/bird-migration/TimelineControl';
import BirdCard from '@/components/bird-migration/BirdCard';
import {
    parseCSV,
    processLiteData,
    groupByBird,
    getTimeRange,
    getDataUpToTime,
    getCurrentPositions,
    BIRD_COLORS
} from '@/utils/migrationDataParser';
import styles from './bird-migration.module.css';

export default function BirdMigrationPage() {
    // Data states
    const [rawData, setRawData] = useState(null);
    const [birdData, setBirdData] = useState(null);
    const [timeRange, setTimeRange] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Visualization states
    const [currentTime, setCurrentTime] = useState(null);
    const [selectedBird, setSelectedBird] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(2);
    const [autoTrack, setAutoTrack] = useState(true);
    const [visualizationMode, setVisualizationMode] = useState('identity'); // 'identity' | 'speed'

    // Load CSV data
    useEffect(() => {
        async function loadData() {
            try {
                setIsLoading(true);
                const response = await fetch('/data/migration_lite.json');

                if (!response.ok) {
                    throw new Error('Failed to load migration data');
                }

                const jsonData = await response.json();
                const parsed = processLiteData(jsonData);
                const grouped = groupByBird(parsed);
                const range = getTimeRange(parsed);

                setRawData(parsed);
                setBirdData(grouped);
                setTimeRange(range);
                setCurrentTime(range.start);
                setIsLoading(false);
            } catch (err) {
                console.error('Error loading data:', err);
                setError(err.message);
                setIsLoading(false);
            }
        }

        loadData();
    }, []);

    // Compute visible data based on current time
    const visibleData = useMemo(() => {
        if (!birdData || !currentTime) return null;
        return getDataUpToTime(birdData, currentTime);
    }, [birdData, currentTime]);

    // Compute current positions
    const currentPositions = useMemo(() => {
        if (!birdData || !currentTime) return null;
        return getCurrentPositions(birdData, currentTime);
    }, [birdData, currentTime]);

    // Handle time change from timeline
    const handleTimeChange = useCallback((newTime) => {
        setCurrentTime(newTime);
    }, []);

    // Handle play/pause
    const handlePlayPause = useCallback(() => {
        setIsPlaying(prev => !prev);
    }, []);

    // Handle speed change
    const handleSpeedChange = useCallback((speed) => {
        setPlaybackSpeed(speed);
    }, []);

    // Handle bird selection
    const handleBirdSelect = useCallback((birdName) => {
        setSelectedBird(birdName);
    }, []);

    // Calculate total stats
    const totalStats = useMemo(() => {
        if (!rawData) return { dataPoints: 0, birds: 0, daysTracked: 0 };

        const birds = Object.keys(birdData || {}).length;
        const daysTracked = timeRange
            ? Math.ceil((timeRange.end - timeRange.start) / (1000 * 60 * 60 * 24))
            : 0;

        return {
            dataPoints: rawData.length.toLocaleString(),
            birds,
            daysTracked
        };
    }, [rawData, birdData, timeRange]);

    // Loading state
    if (isLoading) {
        return (
            <div className={styles.page}>
                <Navbar />
                <main className={styles.main}>
                    <header className={styles.header}>
                        <h1 className={styles.title}>Flight of the Storks</h1>
                        <p className={styles.subtitle}>
                            Tracking the epic migration of white storks from the Netherlands to West Africa
                        </p>
                    </header>
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingSpinner} />
                        <p className={styles.loadingText}>Loading migration data...</p>
                    </div>
                </main>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={styles.page}>
                <Navbar />
                <main className={styles.main}>
                    <header className={styles.header}>
                        <h1 className={styles.title}>Flight of the Storks</h1>
                    </header>
                    <div className={styles.loadingContainer}>
                        <p className={styles.loadingText}>Error: {error}</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <Navbar />
            <main className={styles.main}>
                {/* Header */}
                <header className={styles.header}>
                    <h1 className={styles.title}>Flight of the Storks</h1>
                    <p className={styles.subtitle}>
                        Follow Eric, Nico, and Sanne on their remarkable 4,000km journey from the Netherlands to Mauritania
                    </p>
                </header>

                <div className={styles.visualizationContainer}>
                    {/* Map */}
                    <div className={styles.mapContainer}>
                        <div className={styles.mapWrapper}>
                            <MigrationMap
                                birdData={birdData}
                                visibleData={visibleData}
                                currentPositions={currentPositions}
                                selectedBird={selectedBird}
                                onBirdSelect={handleBirdSelect}
                                autoTrack={autoTrack && isPlaying}
                                visualizationMode={visualizationMode}
                            />
                        </div>

                        {/* Legend */}
                        <div className={styles.legend}>
                            {visualizationMode === 'identity' ? (
                                Object.entries(BIRD_COLORS).map(([name, color]) => (
                                    <div key={name} className={styles.legendItem}>
                                        <div
                                            className={`${styles.legendDot} ${styles[name.toLowerCase()]}`}
                                            style={{ background: color, color }}
                                        />
                                        <span>{name}</span>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.legendGradient}>
                                    <span>Slow (0 m/s)</span>
                                    <div className={styles.speedGradientBar} />
                                    <span>Fast (25 m/s)</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Controls Section */}
                    <div className={styles.controlsSection}>
                        {/* Timeline */}
                        <div className={styles.timelineContainer}>
                            <TimelineControl
                                timeRange={timeRange}
                                currentTime={currentTime}
                                onTimeChange={handleTimeChange}
                                isPlaying={isPlaying}
                                onPlayPause={handlePlayPause}
                                playbackSpeed={playbackSpeed}
                                onSpeedChange={handleSpeedChange}
                                autoTrack={autoTrack}
                                onAutoTrackChange={setAutoTrack}
                                visualizationMode={visualizationMode}
                                onVisualizationModeChange={setVisualizationMode}
                            />
                        </div>

                        {/* Bird Cards */}
                        <div className={styles.birdCardsGrid}>
                            {birdData && Object.keys(birdData).map(birdName => (
                                <BirdCard
                                    key={birdName}
                                    birdName={birdName}
                                    currentPosition={currentPositions?.[birdName]}
                                    visiblePoints={visibleData?.[birdName]}
                                    isSelected={selectedBird === null ? null : selectedBird === birdName}
                                    onClick={() => handleBirdSelect(selectedBird === birdName ? null : birdName)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Info Panel */}
                    <div className={styles.infoPanel}>
                        <h3 className={styles.infoPanelTitle}>About This Data</h3>
                        <p className={styles.infoPanelText}>
                            This visualization shows <strong>real GPS tracking data</strong> from three white storks
                            (Ciconia ciconia) equipped with solar-powered GPS transmitters. The data was collected
                            as part of a research study tracking the birds&apos; annual migration from breeding grounds
                            in the Netherlands to wintering areas in West Africa.
                        </p>
                        <div className={styles.statsRow}>
                            <div className={styles.stat}>
                                <span className={styles.statLabel}>Data Points</span>
                                <span className={styles.statValue}>{totalStats.dataPoints}</span>
                            </div>
                            <div className={styles.stat}>
                                <span className={styles.statLabel}>Birds Tracked</span>
                                <span className={styles.statValue}>{totalStats.birds}</span>
                            </div>
                            <div className={styles.stat}>
                                <span className={styles.statLabel}>Days Covered</span>
                                <span className={styles.statValue}>{totalStats.daysTracked}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
