'use client';

import Link from 'next/link';
import { useAuth } from '@/components/greatness/AuthProvider';
import styles from './page.module.css';

const FEATURES = [
  {
    title: 'Define Your Greatness',
    desc: 'Choose what Self-Actualization means to you — coding, fitness, writing, music, or anything else.',
  },
  {
    title: 'Upload Your Data',
    desc: 'Import your Google Takeout browsing history. We parse it in your browser — your data never hits our servers raw.',
  },
  {
    title: 'Track Your Score',
    desc: 'Get a composite Greatness Score based on Self-Actualization Ratio, Deep Work Density, and Drift Friction.',
  },
  {
    title: 'Rank & Compare',
    desc: 'Opt into the public leaderboard and see how you compare against others pursuing similar goals.',
  },
];

const METRICS = [
  {
    name: 'Self-Actualization Ratio',
    desc: 'What percentage of your browsing time goes toward your defined goals vs. distractions.',
    weight: '45%',
    color: '#10b981',
  },
  {
    name: 'Deep Work Density',
    desc: 'How much of your goal time happens in sustained, uninterrupted 25+ minute blocks.',
    weight: '30%',
    color: '#8b5cf6',
  },
  {
    name: 'Drift Friction',
    desc: 'How rarely you switch from a goal-oriented site to a distraction. Fewer drifts = higher friction.',
    weight: '25%',
    color: '#3b82f6',
  },
];

export default function GreatnessLanding() {
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroBadge}>Open Platform</div>
        <h1 className={styles.heroTitle}>
          Measure Your<br />
          <span className={styles.heroAccent}>Greatness</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Everyone defines greatness differently. Upload your browsing data,
          set your own goals, and get a composite score that reflects
          how you spend your attention.
        </p>
        <div className={styles.heroCta}>
          {user ? (
            <Link href="/projects/greatness/dashboard" className={styles.primaryBtn}>
              Go to Dashboard →
            </Link>
          ) : (
            <Link href="/projects/greatness/login" className={styles.primaryBtn}>
              Get Started →
            </Link>
          )}
          <Link href="/projects/greatness/leaderboard" className={styles.secondaryBtn}>
            View Leaderboard
          </Link>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <div className={styles.featureGrid}>
          {FEATURES.map((f, i) => (
            <div key={i} className={styles.featureCard}>
              <h3 className={styles.featureName}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>The Composite Score</h2>
        <p className={styles.sectionSubtitle}>
          Your Greatness Score is a weighted average of three metrics, each capturing
          a different dimension of intentional attention.
        </p>
        <div className={styles.metricList}>
          {METRICS.map((m, i) => (
            <div key={i} className={styles.metricRow}>
              <div className={styles.metricInfo}>
                <div className={styles.metricHeader}>
                  <span className={styles.metricDot} style={{ background: m.color }} />
                  <h3 className={styles.metricName}>{m.name}</h3>
                  <span className={styles.metricWeight}>{m.weight}</span>
                </div>
                <p className={styles.metricDesc}>{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>Ready to define your greatness?</h2>
        <p className={styles.ctaSubtitle}>
          It takes 2 minutes to set up. Choose your goals, upload your data, and see where you stand.
        </p>
        {user ? (
          <Link href="/projects/greatness/dashboard" className={styles.primaryBtn}>
            Go to Dashboard →
          </Link>
        ) : (
          <Link href="/projects/greatness/login" className={styles.primaryBtn}>
            Create Your Account →
          </Link>
        )}
      </section>
    </div>
  );
}
