'use client';

import React, { useEffect, useState, useRef } from 'react';
import Navbar from "../components/Navbar";
import styles from "./page.module.css";
import LinkedInCard from '@/components/LinkedInCard';
import GitHubCard from '@/components/GitHubCard';
import HabiticaCard from '@/components/HabiticaCard';
import { SpeedInsights } from "@vercel/speed-insights/next"

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

export default function Home() {
  const [profileData, setProfileData] = useState({
    name: "Reuben Roy",
    intro: "Passionate developer creating innovative web solutions",
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
  const scrollRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Infinite scroll effect
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollSpeed = 1.5; // Adjust speed as needed
    let isPaused = false;

    const scroll = () => {
      if (!isPaused && scrollContainer) {
        scrollContainer.scrollLeft += scrollSpeed;

        // Reset scroll when reaching the end of first set
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
          scrollContainer.scrollLeft = 0;
        }
      }
      requestAnimationFrame(scroll);
    };

    // Pause on hover
    const handleMouseEnter = () => { isPaused = true; };
    const handleMouseLeave = () => { isPaused = false; };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);

    // Start the animation
    scroll();

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
        scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  // Create array of cards to duplicate for infinite effect
  const cardComponents = [
    <LinkedInCard key="linkedin-1" />,
    <GitHubCard key="github-1" />,
    <HabiticaCard key="habitica-1" />,
    <div key="spotify-1" className={styles.spotifyWrapper}>
      <iframe
        style={{ borderRadius: '12px' }}
        src="https://open.spotify.com/embed/playlist/7argnm9cuFJWo9txW9OzlD?utm_source=generator&theme=0"
        width="300"
        height="152"
        frameBorder="0"
        allowFullScreen=""
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    </div>
  ];

  return (
    <div className={styles.container}>
      <SpeedInsights />
      <Navbar />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={`${styles.heroCard} ${isLoaded ? styles.loaded : ''}`}>
            <div className={styles.badge}>
              <span>Open to opportunities</span>
            </div>

            <h1 className={styles.title}>
              Hi, I'm <span className={styles.name}>{profileData.name}</span>
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
                onClick={() => window.location.href = "/career"}
              >
                View My Work
                <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                className={`${styles.button} ${styles.secondary}`}
                onClick={() => window.location.href = "/blog"}
              >
                Read Blog
              </button>
            </div>
          </div>
        </div>

        <div className={styles.heroBackground}>
          <div className={styles.grid}></div>
          <div className={styles.gradient1}></div>
          <div className={styles.gradient2}></div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.featuresContent}>
          <div className={styles.sectionHeader}>
            <h2>Connect & Explore</h2>
            <p>Discover my journey across different platforms and projects</p>
          </div>

          <div className={styles.cardGrid} ref={scrollRef}>
            <div className={styles.cardTrack}>
              {cardComponents}
              {cardComponents.map((card, index) =>
                React.cloneElement(card, { key: `${card.key}-duplicate` })
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}