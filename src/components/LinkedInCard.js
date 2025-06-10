'use client';

import { useState, useEffect } from 'react';
import styles from './LinkedInCard.module.css';

export default function LinkedInCard() {
  const [linkedInData, setLinkedInData] = useState({
    name: "Reuben Roy",
    title: "Full Stack Developer",
    company: "Tech Company",
    connections: "500+",
    posts: "25"
  });

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>LinkedIn Profile</h3>
        <div className={styles.linkedinIcon}>💼</div>
      </div>
      <div className={styles.content}>
        <h4>{linkedInData.name}</h4>
        <p>{linkedInData.title}</p>
        <p>{linkedInData.company}</p>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.number}>{linkedInData.connections}</span>
            <span className={styles.label}>Connections</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.number}>{linkedInData.posts}</span>
            <span className={styles.label}>Posts</span>
          </div>
        </div>
        <a 
          href="https://linkedin.com/in/reuben-roy" 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.viewProfile}
        >
          View Profile
        </a>
      </div>
    </div>
  );
}