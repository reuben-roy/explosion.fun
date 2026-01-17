'use client';

import { useMemo } from 'react';
import { getBirdColor, calculateDistance } from '@/utils/migrationDataParser';
import styles from './BirdCard.module.css';

export default function BirdCard({
    birdName,
    currentPosition,
    visiblePoints,
    isSelected,
    onClick
}) {
    const color = getBirdColor(birdName);

    // Calculate stats
    const stats = useMemo(() => {
        if (!visiblePoints || visiblePoints.length === 0) {
            return {
                distance: 0,
                altitude: 0,
                speed: 0,
                maxAltitude: 500 // Default max for meter
            };
        }

        const distance = calculateDistance(visiblePoints);
        const maxAltitude = Math.max(...visiblePoints.map(p => p.altitude), 500);

        return {
            distance,
            altitude: currentPosition?.altitude || 0,
            speed: currentPosition?.speed || 0,
            maxAltitude
        };
    }, [visiblePoints, currentPosition]);

    // Speed level (1-5)
    const speedLevel = useMemo(() => {
        const speed = stats.speed;
        if (speed < 2) return 1;
        if (speed < 5) return 2;
        if (speed < 10) return 3;
        if (speed < 15) return 4;
        return 5;
    }, [stats.speed]);

    // Altitude percentage for meter
    const altitudePercent = useMemo(() => {
        return Math.min(100, (stats.altitude / stats.maxAltitude) * 100);
    }, [stats.altitude, stats.maxAltitude]);

    const cardClass = `${styles.card} ${isSelected === true ? styles.selected : ''} ${isSelected === false ? styles.dimmed : ''}`;

    return (
        <div
            className={cardClass}
            style={{ '--bird-color': color }}
            onClick={onClick}
        >
            {/* Header */}
            <div className={styles.cardHeader}>
                <div className={styles.avatar}>🦢</div>
                <span className={styles.birdName}>{birdName}</span>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                {/* Distance */}
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Distance</span>
                    <span className={styles.statValue}>
                        <span className={styles.distanceValue}>
                            {stats.distance.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </span>
                        <span className={styles.distanceUnit}>km</span>
                    </span>
                </div>

                {/* Speed */}
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Speed</span>
                    <div className={styles.speedIndicator}>
                        <span className={styles.statValue}>{stats.speed.toFixed(1)}m/s</span>
                        <div className={styles.speedDots}>
                            {[1, 2, 3, 4, 5].map(level => (
                                <div
                                    key={level}
                                    className={`${styles.speedDot} ${level <= speedLevel ? styles.active : ''}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Altitude Meter */}
                <div className={styles.altitudeMeter}>
                    <div className={styles.meterLabel}>
                        <span className={styles.statLabel}>Altitude</span>
                        <span className={`${styles.statValue} ${styles.highlight}`}>
                            {stats.altitude.toFixed(0)}m
                        </span>
                    </div>
                    <div className={styles.meterBar}>
                        <div
                            className={styles.meterFill}
                            style={{ width: `${altitudePercent}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
