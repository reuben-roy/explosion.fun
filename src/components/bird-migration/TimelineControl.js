'use client';

import { useCallback, useEffect, useRef } from 'react';
import { formatDate } from '@/utils/migrationDataParser';
import styles from './TimelineControl.module.css';

export default function TimelineControl({
    timeRange,
    currentTime,
    onTimeChange,
    isPlaying,
    onPlayPause,
    playbackSpeed,
    onSpeedChange,
    autoTrack,
    onAutoTrackChange,
    visualizationMode,
    onVisualizationModeChange
}) {
    const animationRef = useRef(null);
    const lastUpdateRef = useRef(Date.now());
    const accumulatedTimeRef = useRef(0);

    // Handle playback animation with throttling to reduce jitter
    useEffect(() => {
        if (!isPlaying || !timeRange) return;

        const targetFPS = 30; // Reduce to 30fps for smoother visual updates
        const frameInterval = 1000 / targetFPS;
        let lastFrameTime = performance.now();

        const animate = (currentFrameTime) => {
            const deltaFrame = currentFrameTime - lastFrameTime;

            // Only update if enough time has passed (throttle to target FPS)
            if (deltaFrame >= frameInterval) {
                lastFrameTime = currentFrameTime - (deltaFrame % frameInterval);

                // Calculate time increment based on playback speed
                // At 1x, advance ~30 minutes per real second
                const timeIncrement = deltaFrame * playbackSpeed * 1800; // ms of simulation time

                accumulatedTimeRef.current += timeIncrement;

                // Only update state every 500ms of simulation time to reduce jitter
                if (accumulatedTimeRef.current >= 900000) { // 15 minutes simulation time
                    const newTime = new Date(currentTime.getTime() + accumulatedTimeRef.current);
                    accumulatedTimeRef.current = 0;

                    if (newTime >= timeRange.end) {
                        onTimeChange(timeRange.end);
                        onPlayPause(); // Stop at end
                        return;
                    } else {
                        onTimeChange(newTime);
                    }
                }
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            accumulatedTimeRef.current = 0;
        };
    }, [isPlaying, currentTime, timeRange, playbackSpeed, onTimeChange, onPlayPause]);

    // Handle slider change
    const handleSliderChange = useCallback((e) => {
        if (!timeRange) return;

        const progress = parseFloat(e.target.value);
        const totalMs = timeRange.end.getTime() - timeRange.start.getTime();
        const newTime = new Date(timeRange.start.getTime() + (progress * totalMs));
        onTimeChange(newTime);
    }, [timeRange, onTimeChange]);

    // Calculate current progress
    const getProgress = useCallback(() => {
        if (!timeRange) return 0;
        const totalMs = timeRange.end.getTime() - timeRange.start.getTime();
        const currentMs = currentTime.getTime() - timeRange.start.getTime();
        return Math.max(0, Math.min(1, currentMs / totalMs));
    }, [timeRange, currentTime]);

    // Jump to key moments
    const jumpToDate = useCallback((date) => {
        onTimeChange(date);
    }, [onTimeChange]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT') return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    onPlayPause();
                    break;
                case 'ArrowLeft':
                    if (timeRange) {
                        const newTime = new Date(currentTime.getTime() - 86400000 * 3); // -3 days
                        onTimeChange(new Date(Math.max(newTime.getTime(), timeRange.start.getTime())));
                    }
                    break;
                case 'ArrowRight':
                    if (timeRange) {
                        const newTime = new Date(currentTime.getTime() + 86400000 * 3); // +3 days
                        onTimeChange(new Date(Math.min(newTime.getTime(), timeRange.end.getTime())));
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onPlayPause, currentTime, timeRange, onTimeChange]);

    if (!timeRange) return null;

    const formatTimeOfDay = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            hour: '2-digit',
            hour12: true
        });
    };

    return (
        <div className={styles.container}>
            {/* Current Date Display */}
            <div className={styles.dateDisplay}>
                <div className={styles.currentDate}>{formatDate(currentTime)}</div>
                <div className={styles.currentTime}>{formatTimeOfDay(currentTime)}</div>
            </div>

            {/* Timeline Slider */}
            <div className={styles.timelineTrack}>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.0001"
                    value={getProgress()}
                    onChange={handleSliderChange}
                    className={styles.slider}
                />
                <div className={styles.dateLabels}>
                    <span className={styles.dateLabel}>{formatDate(timeRange.start)}</span>
                    <span className={styles.dateLabel}>{formatDate(timeRange.end)}</span>
                </div>
            </div>

            {/* Playback Controls */}
            <div className={styles.playbackControls}>
                {/* Jump buttons */}
                <div className={styles.jumpButtons}>
                    <button
                        className={styles.jumpButton}
                        onClick={() => jumpToDate(timeRange.start)}
                        title="Jump to start"
                    >
                        ⏮ Start
                    </button>
                    <button
                        className={styles.jumpButton}
                        onClick={() => jumpToDate(new Date('2013-10-01'))}
                        title="Jump to October (mid-migration)"
                    >
                        🌍 Oct
                    </button>
                    <button
                        className={styles.jumpButton}
                        onClick={() => jumpToDate(new Date('2013-12-01'))}
                        title="Jump to December (arrival)"
                    >
                        🏖 Dec
                    </button>
                </div>

                {/* Play/Pause */}
                <button
                    className={`${styles.playButton} ${isPlaying ? styles.playing : ''}`}
                    onClick={onPlayPause}
                    title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                >
                    {isPlaying ? '⏸' : '▶'}
                </button>

                {/* Speed Controls */}
                <div className={styles.speedControls}>
                    {[1, 2, 5, 10].map(speed => (
                        <button
                            key={speed}
                            className={`${styles.speedButton} ${playbackSpeed === speed ? styles.active : ''}`}
                            onClick={() => onSpeedChange(speed)}
                            title={`${speed}x speed`}
                        >
                            {speed}x
                        </button>
                    ))}
                </div>

                {/* Auto-track toggle */}
                <button
                    className={`${styles.trackButton} ${autoTrack ? styles.active : ''}`}
                    onClick={() => onAutoTrackChange?.(!autoTrack)}
                    title={autoTrack ? 'Camera following birds (click to disable)' : 'Camera fixed (click to follow birds)'}
                >
                    {autoTrack ? '🎯 Moving' : '🔒 Fixed'}
                </button>

                {/* Mode Toggle */}
                <div className={styles.modeToggle}>
                    <button
                        className={`${styles.modeButton} ${visualizationMode === 'identity' ? styles.active : ''}`}
                        onClick={() => onVisualizationModeChange && onVisualizationModeChange('identity')}
                        title="Color by Bird Identity"
                    >
                        🐦
                    </button>
                    <button
                        className={`${styles.modeButton} ${visualizationMode === 'speed' ? styles.active : ''}`}
                        onClick={() => onVisualizationModeChange && onVisualizationModeChange('speed')}
                        title="Color by Flight Speed"
                    >
                        ⚡️
                    </button>
                </div>
            </div>
        </div>
    );
}
