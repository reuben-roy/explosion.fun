'use client';

import { useEffect, useState } from 'react';
import FencingScene from './FencingScene';
import styles from './FooterBands.module.css';

const VARIANTS = [
  { id: 'ember', label: 'Ember' },
  { id: 'signal', label: 'Signal' },
  { id: 'dusk', label: 'Dusk' },
  { id: 'mono', label: 'Mono' },
];

const IS_DEV = process.env.NODE_ENV !== 'production';
const LAST_VARIANT_KEY = 'ef-footer-last-variant';

function randomVariant() {
  let previous = null;

  try {
    previous = window.sessionStorage.getItem(LAST_VARIANT_KEY);
  } catch {
    // Storage can be unavailable in private contexts; true random still works.
  }

  const pool = VARIANTS.filter((item) => item.id !== previous);
  const next = pool[Math.floor(Math.random() * pool.length)].id;

  try {
    window.sessionStorage.setItem(LAST_VARIANT_KEY, next);
  } catch {
    // Ignore storage failures.
  }

  return next;
}

export default function FooterBands() {
  const [variant, setVariant] = useState('ember');

  useEffect(() => {
    setVariant(randomVariant());
  }, []);

  const chooseVariant = (id) => {
    setVariant(id);

    try {
      window.sessionStorage.setItem(LAST_VARIANT_KEY, id);
    } catch {
      // Ignore storage failures.
    }
  };

  return (
    <div className={`ef-bands ${styles.bands}`} data-variant={variant}>
      <div className={styles.stripes} aria-hidden="true">
        <span className={styles.stripe} />
        <span className={styles.stripe} />
        <span className={styles.stripe} />
        <span className={styles.stripe} />
      </div>

      <FencingScene />

      {IS_DEV && (
        <div className={styles.picker} role="group" aria-label="Footer band colour variants">
          {VARIANTS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={styles.pickerButton}
              data-active={variant === item.id}
              data-variant={item.id}
              aria-label={`${item.label} band colours`}
              title={`${item.label} band colours`}
              onClick={() => chooseVariant(item.id)}
            >
              <span className={styles.swatch} aria-hidden="true" />
              <span className={styles.pickerLabel}>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
