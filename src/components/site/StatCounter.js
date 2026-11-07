'use client';

import { useEffect, useRef, useState } from 'react';

function splitValue(value) {
  const text = String(value);
  const match = text.match(/([^\d-]*)(-?[\d,]+(?:\.\d+)?)(.*)/s);
  if (!match) return { prefix: '', number: 0, suffix: text, decimals: 0 };
  const [, prefix, digits, suffix] = match;
  const clean = digits.replace(/,/g, '');
  const decimals = clean.includes('.') ? clean.split('.')[1].length : 0;
  return { prefix, number: Number(clean), suffix, decimals };
}

/** Counts a number up once it scrolls into view. */
export default function StatCounter({ value, label, className = '' }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const { prefix, number, suffix, decimals } = splitValue(value);
    if (!Number.isFinite(number)) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value);
      return;
    }

    let raf = 0;
    let timer = 0;
    const run = () => {
      const start = performance.now();
      const duration = 1200;
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = number * eased;
        const formatted = current.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
        setDisplay(`${prefix}${formatted}${suffix}`);
        if (progress < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            timer = window.setTimeout(run, 120);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );

    setDisplay(`${prefix}0${suffix}`);
    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [value]);

  return (
    <div ref={ref} className={`ef-stat ${className}`}>
      <span className="ef-stat__value">{display}</span>
      {label && <span className="ef-stat__label">{label}</span>}
    </div>
  );
}
