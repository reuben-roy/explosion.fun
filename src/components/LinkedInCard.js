'use client';

import { useState } from 'react';
import styles from './LinkedInCard.module.css';

export default function LinkedInCard() {
  return (
    <a 
      href="https://linkedin.com/in/reuben-roy" 
      target="_blank" 
      rel="noopener noreferrer"
      className={styles.card}
    >
      <div className={styles.iconWrapper}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      </div>
      <div className={styles.content}>
        <span className={styles.title}>LinkedIn</span>
        <span className={styles.subtitle}>Reuben Roy</span>
      </div>
      <svg className={styles.arrow} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M7 17L17 7M17 7H7M17 7V17"/>
      </svg>
    </a>
  );
}