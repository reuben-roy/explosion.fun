'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './Hero.module.css';
import Terminal from '@/components/Terminal';
import LinkedInCard from '@/components/LinkedInCard';
import GitHubCard from '@/components/GitHubCard';
import HabiticaCard from '@/components/HabiticaCard';
import { FEATURES } from '@/config/features';

export default function Hero() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <div className={`${styles.heroLeft} ${isLoaded ? styles.loaded : ''}`}>
          <h1 className={styles.title}>
            <span className={styles.name}>explosion.fun</span>
          </h1>
          <p className={styles.description}>
            A playground of experiments, data toys &amp; ranked reviews. Poke
            around with the terminal, or just tap a card.
          </p>
          <Terminal />
        </div>

        <div className={`${styles.heroRight} ${isLoaded ? styles.loaded : ''}`}>
          <LinkedInCard />
          <GitHubCard />
          <HabiticaCard />
          <div className={styles.spotifyWrapper}>
            <div className={styles.spotifyHeader}>
              <div className={styles.spotifyIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
              </div>
              <span className={styles.spotifyTitle}>Now Playing</span>
            </div>
            <iframe
              src="https://open.spotify.com/embed/playlist/7argnm9cuFJWo9txW9OzlD?utm_source=generator&theme=0"
              width="100%"
              height="80"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className={styles.spotifyEmbed}
            />
          </div>
        </div>
      </div>

      <div className={`${styles.features} ${isLoaded ? styles.loaded : ''}`}>
        <div className={styles.featuresHeader}>
          <span className={styles.featuresPrompt}>~/explore</span>
          <h2 className={styles.featuresTitle}>Explore the site</h2>
        </div>
        <div className={styles.featureGrid}>
          {FEATURES.map((feature) => (
            <Link key={feature.command} href={feature.path} className={styles.featureCard}>
              <div className={styles.featureCardTop}>
                <span className={styles.featureCommand}>{feature.command}</span>
                <svg
                  className={styles.featureArrow}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
              <h3 className={styles.featureName}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.heroBackground}>
        <div className={styles.grid}></div>
        <div className={styles.gradient1}></div>
        <div className={styles.gradient2}></div>
      </div>
    </section>
  );
}
