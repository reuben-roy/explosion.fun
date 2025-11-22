import styles from './RatingLegend.module.css';

export default function RatingLegend({ className = '', theme = 'dark' }) {
    const ratings = [
        {
            score: 1,
            label: 'Abomination',
            description: 'An experience with no redeeming qualities, potentially unbearable or extremely unenjoyable.'
        },
        {
            score: 2,
            label: 'Awful',
            description: 'Very bad, something you might have finished but regret and wouldn\'t experience again.'
        },
        {
            score: 3,
            label: 'Bad',
            description: 'An experience you didn\'t like, with more negatives than positives.'
        },
        {
            score: 4,
            label: 'Below Average',
            description: 'Something that is tolerable but ultimately unsatisfying.'
        },
        {
            score: 5,
            label: 'Average',
            description: 'Neither good nor bad, possibly enjoyable but not memorable or something you\'d rush to experience again.'
        },
        {
            score: 6,
            label: 'Above Average',
            description: 'Better than average, with more positives than negatives.'
        },
        {
            score: 7,
            label: 'Good',
            description: 'A good experience that you would likely recommend to others.'
        },
        {
            score: 8,
            label: 'Great',
            description: 'An experience with very few flaws that you would readily recommend or revisit.'
        },
        {
            score: 9,
            label: 'Excellent',
            description: 'An almost perfect experience, with minor flaws that don\'t detract significantly from the overall enjoyment.'
        },
        {
            score: 10,
            label: 'Masterpiece',
            description: 'A virtually flawless and exceptionally enjoyable experience, a standout that you\'d recommend to everyone.'
        }
    ];

    const themeStyles = theme === 'white'
        ? {
            container: { backgroundColor: '#ffffff', color: '#111827' },
            title: { color: '#0f172a' },
            rating: { borderColor: '#e5e7eb' },
            score: { backgroundColor: '#f3f4f6', color: '#111827' },
            label: { color: '#374151' }
        }
        : null;

    return (
        <div
            className={`${styles.legend} ${className}`.trim()}
            style={themeStyles?.container}
        >
            <h3 className={styles.title} style={themeStyles?.title}>Rating Scale</h3>
            <div className={styles.scale}>
                <div className={styles.ratings}>
                    {ratings.map(({ score, label, description }) => (
                        <div
                            key={score}
                            className={styles.rating}
                            style={themeStyles?.rating}
                        >
                            <div
                                className={styles.score}
                                title={description}
                                style={themeStyles?.score}
                            >
                                {score}
                            </div>
                            <div className={styles.label} style={themeStyles?.label}>
                                {label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}