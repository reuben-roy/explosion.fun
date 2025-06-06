'use client';

import { useState, useEffect } from 'react';
import styles from './HabiticaCard.module.css';

// Cache object to store user data and timestamp
const userCache = {
    data: null,
    timestamp: null,
    ttl: 30 * 60 * 1000 // 30 minutes in milliseconds
};

export default function HabiticaCard() {
    const [habiticaData, setHabiticaData] = useState({
        level: 25,
        health: { current: 45, max: 50 },
        experience: { current: 1250, max: 2000 },
        mana: { current: 30, max: 40 },
        class: 'warrior',
        name: 'Reuben Roy',
        lastUpdate: new Date().toLocaleDateString(),
        loading: true,
        error: null
    });

    const fetchHabiticaData = async () => {
        const now = Date.now();

        // Check if we have cached data that's still valid
        if (userCache.data && userCache.timestamp && (now - userCache.timestamp) < userCache.ttl) {
            updateHabiticaState(userCache.data);
            return;
        }

        try {
            setHabiticaData(prev => ({ ...prev, loading: true, error: null }));

            const headers = {
                'x-api-user': process.env.NEXT_PUBLIC_HABITICA_USER_ID,
                'x-api-key': process.env.NEXT_PUBLIC_HABITICA_API_TOKEN,
                'Content-Type': 'application/json'
            };

            const response = await fetch('https://habitica.com/api/v3/user', {
                method: "GET",
                headers: headers
            });

            if (response.status === 200) {
                const userData = await response.json();

                // Cache the data
                userCache.data = userData;
                userCache.timestamp = now;

                updateHabiticaState(userData);
            } else {
                throw new Error(`Error: ${response.status}`);
            }
        } catch (error) {
            console.error('Habitica API Error:', error);
            setHabiticaData(prev => ({
                ...prev,
                loading: false,
                error: 'Failed to load Habitica data'
            }));
        }
    };

    const updateHabiticaState = (userData) => {
        const stats = userData.data.stats;
        const data = userData.data;

        setHabiticaData({
            level: stats.lvl,
            health: {
                current: parseFloat(stats.hp.toFixed(1)),
                max: stats.maxHealth
            },
            experience: {
                current: parseFloat(stats.exp.toFixed(1)),
                max: stats.toNextLevel
            },
            mana: {
                current: parseFloat(stats.mp.toFixed(1)),
                max: stats.maxMP
            },
            class: stats.class.toUpperCase(),
            name: data.profile?.name || 'Reuben Roy',
            lastUpdate: data.auth.timestamps.loggedin.slice(0, 10),
            loading: false,
            error: null
        });
    };

    useEffect(() => {
        // Only fetch if we have the required environment variables
        if (process.env.NEXT_PUBLIC_HABITICA_USER_ID && process.env.NEXT_PUBLIC_HABITICA_API_TOKEN) {
            fetchHabiticaData();
        } else {
            setHabiticaData(prev => ({
                ...prev,
                loading: false,
                error: 'Habitica credentials not configured'
            }));
        }
    }, []);

    const getProgressPercentage = (current, max) => {
        return (current / max) * 100;
    };

    const getClassIcon = (className) => {
        const icons = {
            'WARRIOR': '⚔️',
            'MAGE': '🔮',
            'HEALER': '💚',
            'ROGUE': '🗡️'
        };
        return icons[className] || '🎮';
    };

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3>Habitica Stats</h3>
                <div className={styles.habiticaIcon}>
                    {habiticaData.loading ? '⏳' : getClassIcon(habiticaData.class)}
                </div>
            </div>

            <div className={styles.content}>
                {habiticaData.loading ? (
                    <div className={styles.loading}>Loading Habitica data...</div>
                ) : habiticaData.error ? (
                    <div className={styles.error}>
                        <p>{habiticaData.error}</p>
                        <p>Using demo data</p>
                    </div>
                ) : null}

                <div className={styles.level}>
                    {habiticaData.name} -- Level {habiticaData.level} -- {habiticaData.class}
                </div>

                <div className={styles.progressContainer}>
                    <div className={styles.statLabel}>
                        <span className={styles.healthLabel}>
                            Health: {habiticaData.health.current}/{habiticaData.health.max}
                        </span>
                    </div>
                    <progress
                        className={`${styles.progressBar} ${styles.healthProgress}`}
                        value={habiticaData.health.current}
                        max={habiticaData.health.max}
                    />

                    <div className={styles.statLabel}>
                        <span className={styles.expLabel}>
                            Experience: {habiticaData.experience.current}/{habiticaData.experience.max}
                        </span>
                    </div>
                    <progress
                        className={`${styles.progressBar} ${styles.expProgress}`}
                        value={habiticaData.experience.current}
                        max={habiticaData.experience.max}
                    />

                    <div className={styles.statLabel}>
                        <span className={styles.manaLabel}>
                            Mana: {habiticaData.mana.current}/{habiticaData.mana.max}
                        </span>
                    </div>
                    <progress
                        className={`${styles.progressBar} ${styles.manaProgress}`}
                        value={habiticaData.mana.current}
                        max={habiticaData.mana.max}
                    />
                </div>
{/* 
                <div className={styles.lastUpdate}>
                    Last check in: {habiticaData.lastUpdate}
                </div> */}
{/* 
                <a
                    href="https://habitica.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.viewProfile}
                >
                    Open Habitica →
                </a> */}
            </div>
        </div>
    );
}