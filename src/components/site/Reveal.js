'use client';

import { useEffect, useRef } from 'react';

/**
 * Scroll reveal wrapper. Content is server-rendered, then lifted into place the
 * first time it enters the viewport. Falls back to visible when JS is off via
 * the <noscript> rule in the root layout, and to instantly visible when the
 * visitor prefers reduced motion.
 */
export default function Reveal({
  children,
  as: Tag = 'div',
  className = '',
  delay = 0,
  variant = 'up',
  once = true,
  threshold = 0.08,
  ...rest
}) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      node.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            entry.target.classList.remove('is-visible');
          }
        });
      },
      { threshold, rootMargin: '0px 0px -6% 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once, threshold]);

  const variantClass =
    variant === 'left'
      ? 'ef-reveal--left'
      : variant === 'right'
        ? 'ef-reveal--right'
        : variant === 'scale'
          ? 'ef-reveal--scale'
          : '';

  return (
    <Tag
      ref={ref}
      className={`ef-reveal ${variantClass} ${className}`}
      style={{ '--ef-delay': `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
