'use client';

import React, { useEffect, useState, useRef } from 'react';
import Navbar from "../components/Navbar";
import styles from "./page.module.css";
import LinkedInCard from '@/components/LinkedInCard';
import GitHubCard from '@/components/GitHubCard';
import HabiticaCard from '@/components/HabiticaCard';

export default function Home() {
  const [profileData, setProfileData] = useState({
    name: "Reuben Roy",
    title: "Full Stack Developer",
    intro: "Passionate developer creating innovative web solutions",
    designation: "Software Engineer",
    caveat: "Always learning, always building",
    intro1: "Welcome to my digital portfolio showcasing my journey in technology.",
    intro2: "Explore my projects, skills, and professional experience below."
  });

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

    let scrollSpeed = 1; // Adjust speed as needed
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
    <>
      <Navbar />

      {/* Main Content */}
      <div className={styles.page}>
        <main className={styles.main}>
          <section id="hero" className={`${styles.section} ${styles.heroSection}`}>
            <div className={`${styles.textBox} ${isLoaded ? styles.loaded : ''}`}>
              <h1 className={styles.name}>{profileData.name}</h1>
              <h2 className={styles.title}>{profileData.title}</h2>
              <p className={styles.intro}>{profileData.intro}</p>
              <p className={styles.caveat}>{profileData.caveat}</p>
              <div className={styles.introText}>
                <p>{profileData.intro1}</p>
                <p>{profileData.intro2}</p>
              </div>
              <div className={styles.buttonGroup}>
                <button
                  className={styles.ctaButton}
                  onClick={() => scrollToSection('portfolio')}
                >
                  Skills and Work
                </button>
                <button
                  className={`${styles.ctaButton} ${styles.secondaryButton}`}
                  onClick={() => scrollToSection('contact')}
                >
                  Blog
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Infinite Scrolling Cards Section */}
      <section className={styles.cardsSection}>
        <div className={styles.scrollContainer} ref={scrollRef}>
          <div className={styles.scrollContent}>
            {/* First set of cards */}
            {cardComponents}
            {/* Duplicate set for seamless loop */}
            {cardComponents.map((card, index) =>
              React.cloneElement(card, { key: `${card.key}-duplicate` })
            )}
          </div>
        </div>
      </section>
    </>
  );
}