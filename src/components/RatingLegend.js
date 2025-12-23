'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './RatingLegend.module.css';

export default function RatingLegend({ className = '', theme = 'dark' }) {
    const [activeScore, setActiveScore] = useState(null);
    const legendRef = useRef(null);

    const ratings = [
        { score: 1, label: 'Abomination', description: 'An experience with no redeeming qualities, potentially unbearable or extremely unenjoyable.' },
        { score: 2, label: 'Awful', description: 'Very bad, something you might have finished but regret and wouldn\'t experience again.' },
        { score: 3, label: 'Bad', description: 'An experience you didn\'t like, with more negatives than positives.' },
        { score: 4, label: 'Below Average', description: 'Something that is tolerable but ultimately unsatisfying.' },
        { score: 5, label: 'Average', description: 'Neither good nor bad, possibly enjoyable but not memorable or something you\'d rush to experience again.' },
        { score: 6, label: 'Above Average', description: 'Better than average, with more positives than negatives.' },
        { score: 7, label: 'Good', description: 'A good experience that you would likely recommend to others.' },
        { score: 8, label: 'Great', description: 'An experience with very few flaws that you would readily recommend or revisit.' },
        { score: 9, label: 'Excellent', description: 'An almost perfect experience, with minor flaws that don\'t detract significantly from the overall enjoyment.' },
        { score: 10, label: 'Masterpiece', description: 'A virtually flawless and exceptionally enjoyable experience, a standout that you\'d recommend to everyone.' }
    ];

    const isWhiteTheme = theme === 'white';

    // Handle click outside to close tooltip on mobile
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (legendRef.current && !legendRef.current.contains(event.target)) {
                setActiveScore(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    const handleScoreInteraction = (score, event) => {
        // For touch devices, toggle the tooltip on tap
        if (event.type === 'click') {
            setActiveScore(activeScore === score ? null : score);
        }
    };

    const handleMouseEnter = (score) => {
        setActiveScore(score);
    };

    const handleMouseLeave = () => {
        setActiveScore(null);
    };

    return (
        <div ref={legendRef} className={`${styles.legend} ${isWhiteTheme ? styles.whiteTheme : ''} ${className}`.trim()}>
            <div className={styles.header}>
                <span className={styles.title}>Rating Scale</span>
            </div>
            
            <div className={styles.content}>
                <div className={styles.scaleBar}>
                    {ratings.map(({ score, label, description }) => (
                        <div
                            key={score}
                            className={`${styles.scoreItem} ${activeScore === score ? styles.active : ''}`}
                            onMouseEnter={() => handleMouseEnter(score)}
                            onMouseLeave={handleMouseLeave}
                            onClick={(e) => handleScoreInteraction(score, e)}
                        >
                            <span className={styles.score}>{score}</span>
                            {activeScore === score && (
                                <div className={styles.tooltip}>
                                    <strong>{label}</strong>
                                    <span>{description}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className={styles.labels}>
                    <span>1 = Abomination</span>
                    <span>5 = Average</span>
                    <span>10 = Masterpiece</span>
                </div>
            </div>
        </div>
    );
}