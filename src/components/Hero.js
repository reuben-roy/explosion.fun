'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Hero.module.css';
import LinkedInCard from '@/components/LinkedInCard';
import GitHubCard from '@/components/GitHubCard';
import HabiticaCard from '@/components/HabiticaCard';

const AnimatedText = ({ phrases }) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];

    if (!isDeleting && displayText === currentPhrase) {
      // Pause at the end of typing
      setTimeout(() => setIsDeleting(true), 1000);
      return;
    }

    if (isDeleting && displayText === '') {
      // Move to next phrase after deleting
      setIsDeleting(false);
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
      return;
    }

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentPhrase.slice(0, displayText.length + 1));
        setTypingSpeed(50);
      } else {
        setDisplayText(currentPhrase.slice(0, displayText.length - 1));
        setTypingSpeed(30);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentPhraseIndex, phrases]);

  return (
    <div className={styles.animatedText}>
      <span className={styles.typingText}>{displayText}</span>
      <span className={styles.cursor}>|</span>
    </div>
  );
};

export default function Hero() {
  const router = useRouter();
  const [profileData, setProfileData] = useState({
    name: "Reuben Roy",
    intro: "Generalist creating web solutions",
    designation: "Software Engineer",
    caveat: "Always learning, always building",
    intro1: "Welcome to my digital portfolio showcasing my journey in technology.",
    intro2: "Explore my projects, skills, and professional experience below."
  });

  const phrases = [
    "Full Stack Developer",
    "Arizona State University (ASU) [2024-2026]",
    "Software Engineer",
    "National Institute of Technology, Calicut (NITC) [2017-2021]",
  ];

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <div className={`${styles.heroLeft} ${isLoaded ? styles.loaded : ''}`}>
          <div className={styles.badge}>
            <span>Open to opportunities</span>
          </div>

          <h1 className={styles.title}>
            Hi, I&apos;m <span className={styles.name}>{profileData.name}</span>
          </h1>

          <div className={styles.typewriter}>
            <AnimatedText phrases={phrases} />
          </div>

          <p className={styles.description}>
            {profileData.intro}
          </p>

          <div className={styles.actions}>
            <button
              className={`${styles.button} ${styles.primary}`}
              onClick={() => router.push("/career")}
            >
              View My Work
              <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              className={`${styles.button} ${styles.secondary}`}
              onClick={() => router.push("/blog")}
            >
              Read Blog
            </button>
            <button
              className={`${styles.button} ${styles.secondary}`}
              onClick={() => router.push("/side-track")}
            >
              Side-Track App Changelogs
            </button>
          </div>
        </div>

        <div className={`${styles.heroRight} ${isLoaded ? styles.loaded : ''}`}>
            <LinkedInCard />
            <GitHubCard />
            <HabiticaCard />
            <div className={styles.spotifyWrapper}>
              <div className={styles.spotifyHeader}>
                <div className={styles.spotifyIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
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

      <div className={styles.heroBackground}>
        <div className={styles.grid}></div>
        <div className={styles.gradient1}></div>
        <div className={styles.gradient2}></div>
      </div>
    </section>
  );
}
