'use client';

import { useEffect, useRef } from 'react';
import Navbar from '../../../../../components/Navbar';
import styles from './post.module.css';


export default function D3Demo() {
  const svgRef = useRef(null);
  const trendsRef = useRef(null);

  return (
    <>
      <Navbar />
      <article className={styles.article}>
        <h1>CEO's Affair is Great Marketing?</h1>
        <p>This article uses D3.js for a custom visualization.</p>

        <h2 style={{ marginTop: 40 }}>Google Trends Chart</h2>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img src='https://cms.explosion.fun/wp-content/uploads/2025/07/Screenshot-2025-07-24-at-9.26.37-AM.png' style={{ height: 400 }} />
        </div>
      </article>
    </>
  );
} 