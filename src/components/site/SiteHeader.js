'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { PixelArrow, PixelChevron, PixelMark } from './PixelMark';
import { CloseIcon, MenuIcon } from './Icons';
import ThemeToggle from './ThemeToggle';
import { MEGA_PROJECTS, PRIMARY_NAV } from '@/config/navigation';
import styles from './SiteHeader.module.css';

function isActive(pathname, href) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const closeTimer = useRef(null);
  const megaRef = useRef(null);

  useEffect(() => {
    setOpen(false);
    setMegaOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle('ef-menu-open', open);
    return () => document.body.classList.remove('ef-menu-open');
  }, [open]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setMegaOpen(false);
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const openMega = () => {
    clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };

  const closeMegaSoon = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaOpen(false), 160);
  };

  return (
    <>
      <header className="ef-header" data-open={open || megaOpen}>
        <div className={`ef-header__inner ${styles.inner}`} data-open={open || megaOpen}>
          <Link href="/" className={`${styles.logo} ef-header__logo`} aria-label="explosion.fun home">
            <PixelMark size={24} />
            <span className={`ef-header__word ${styles.word}`}>
              explosion<em>.fun</em>
            </span>
          </Link>

          <nav className="ef-header__nav" aria-label="Primary">
            {PRIMARY_NAV.map((item) =>
              item.mega ? (
                <button
                  key={item.href}
                  type="button"
                  className={`ef-header__link ef-header__link--button ${item.optional ? 'ef-header__link--optional' : ''}`}
                  data-active={isActive(pathname, item.href) || megaOpen}
                  aria-expanded={megaOpen}
                  aria-controls="projects-mega"
                  onMouseEnter={openMega}
                  onMouseLeave={closeMegaSoon}
                  onFocus={openMega}
                  onClick={() => setMegaOpen((value) => !value)}
                >
                  {item.label}
                  <PixelChevron className={styles.chevron} size={12} />
                </button>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`ef-header__link ${item.optional ? 'ef-header__link--optional' : ''}`}
                  data-active={isActive(pathname, item.href)}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <div className="ef-header__spacer" />

          <div className="ef-header__actions">
            <ThemeToggle />
            <a className={`${styles.hideSmall} ef-header__action`} href="mailto:hello@explosion.fun">
              Say hello
            </a>
            <Link href="/cv" className="ef-header__cta">
              <span className={styles.ctaLabel}>View CV</span>
              <PixelArrow size={16} />
            </Link>
            <button
              type="button"
              className="ef-header__burger"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => {
                setOpen((value) => !value);
                setMegaOpen(false);
              }}
            >
              {open ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
        <div className={styles.progress} style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      </header>

      {megaOpen && (
        <div
          id="projects-mega"
          className="ef-mega"
          ref={megaRef}
          onMouseEnter={openMega}
          onMouseLeave={closeMegaSoon}
        >
          <div className="ef-mega__grid">
            {MEGA_PROJECTS.map((project, index) => (
              <Link key={project.href} href={project.href} className="ef-mega__item" onClick={() => setMegaOpen(false)}>
                <span className="ef-mega__num">{String(index + 1).padStart(2, '0')} / {project.tag}</span>
                <span className="ef-mega__title">{project.title}</span>
                <span className="ef-mega__desc">{project.description}</span>
              </Link>
            ))}
            <div className="ef-mega__foot">
              <span>Small site. Large surface area.</span>
              <Link href="/projects" className="ef-link-arrow" onClick={() => setMegaOpen(false)}>
                Browse the index <PixelArrow size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {open && (
        <div className="ef-header__menu" role="dialog" aria-modal="true" aria-label="Menu">
          <nav aria-label="Mobile">
            <Link href="/" className="ef-header__menu-link" onClick={() => setOpen(false)}>
              Home <PixelArrow size={18} />
            </Link>
            {PRIMARY_NAV.map((item) => (
              <Link key={item.href} href={item.href} className="ef-header__menu-link" onClick={() => setOpen(false)}>
                {item.label} <PixelArrow size={18} />
              </Link>
            ))}
            <Link href="/side-track" className="ef-header__menu-link" onClick={() => setOpen(false)}>
              Side-Track <PixelArrow size={18} />
            </Link>
          </nav>
          <div className={styles.mobileProjects}>
            <span className="ef-eyebrow">Selected projects</span>
            <div className={styles.mobileProjectList}>
              {MEGA_PROJECTS.slice(0, 4).map((project) => (
                <Link key={project.href} href={project.href} className={styles.mobileProject} onClick={() => setOpen(false)}>
                  <span>{project.title}</span>
                  <PixelArrow size={16} />
                </Link>
              ))}
            </div>
          </div>
          <div className={styles.mobileFoot}>
            <ThemeToggle className={styles.mobileTheme} />
            <a href="mailto:hello@explosion.fun" className="ef-btn ef-btn--primary ef-btn--block">
              Say hello <PixelArrow size={16} />
            </a>
          </div>
        </div>
      )}
    </>
  );
}
