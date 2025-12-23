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
        class: 'WARRIOR',
        loading: true,
        error: null
    });

    const fetchHabiticaData = async () => {
        const now = Date.now();

        if (userCache.data && userCache.timestamp && (now - userCache.timestamp) < userCache.ttl) {
            updateHabiticaState(userCache.data);
            return;
        }

        try {
            setHabiticaData(prev => ({ ...prev, loading: true, error: null }));

            const headers = {
                'x-api-user': process.env.NEXT_PUBLIC_HABITICA_USER_ID,
                'x-api-key': process.env.NEXT_PUBLIC_HABITICA_API_TOKEN,
                'Content-Type': 'application/json',
                'x-client': process.env.NEXT_PUBLIC_HABITICA_Client
            };

            const response = await fetch('https://habitica.com/api/v3/user', {
                method: "GET",
                headers: headers
            });

            if (response.status === 200) {
                const userData = await response.json();
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
                error: 'Failed to load'
            }));
        }
    };

    const updateHabiticaState = (userData) => {
        const stats = userData.data.stats;
        setHabiticaData({
            level: stats.lvl,
            health: {
                current: parseFloat(stats.hp.toFixed(0)),
                max: stats.maxHealth
            },
            experience: {
                current: parseFloat(stats.exp.toFixed(0)),
                max: stats.toNextLevel
            },
            mana: {
                current: parseFloat(stats.mp.toFixed(0)),
                max: stats.maxMP
            },
            class: stats.class.toUpperCase(),
            loading: false,
            error: null
        });
    };

    useEffect(() => {
        if (process.env.NEXT_PUBLIC_HABITICA_USER_ID && process.env.NEXT_PUBLIC_HABITICA_API_TOKEN) {
            fetchHabiticaData();
        } else {
            setHabiticaData(prev => ({ ...prev, loading: false }));
        }
    }, []);

    const healthPercent = (habiticaData.health.current / habiticaData.health.max) * 100;
    const expPercent = (habiticaData.experience.current / habiticaData.experience.max) * 100;
    const manaPercent = (habiticaData.mana.current / habiticaData.mana.max) * 100;

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.iconWrapper}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                    </svg>
                </div>
                <span className={styles.title}>Habitica</span>
                <span className={styles.level}>Lvl {habiticaData.level}</span>
            </div>
            <div className={styles.stats}>
                <div className={styles.statRow}>
                    <span className={styles.statIcon} style={{ color: '#ff6b6b' }}>HP</span>
                    <div className={styles.barContainer}>
                        <div className={styles.barFill} style={{ width: `${healthPercent}%`, background: 'linear-gradient(90deg, #ff6b6b, #ff8e8e)' }} />
                    </div>
                    <span className={styles.statValue}>{habiticaData.health.current}</span>
                </div>
                <div className={styles.statRow}>
                    <span className={styles.statIcon} style={{ color: '#ffd93d' }}>XP</span>
                    <div className={styles.barContainer}>
                        <div className={styles.barFill} style={{ width: `${expPercent}%`, background: 'linear-gradient(90deg, #ffd93d, #ffe066)' }} />
                    </div>
                    <span className={styles.statValue}>{habiticaData.experience.current}</span>
                </div>
                <div className={styles.statRow}>
                    <span className={styles.statIcon} style={{ color: '#45b7d1' }}>MP</span>
                    <div className={styles.barContainer}>
                        <div className={styles.barFill} style={{ width: `${manaPercent}%`, background: 'linear-gradient(90deg, #45b7d1, #67d1e8)' }} />
                    </div>
                    <span className={styles.statValue}>{habiticaData.mana.current}</span>
                </div>
            </div>
        </div>
    );
}