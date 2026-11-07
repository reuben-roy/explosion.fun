import Link from 'next/link';
import PixelCanvas from './site/PixelCanvas';
import { PixelArrow, PixelMark } from './site/PixelMark';
import styles from './Hero.module.css';

const SIGNALS = [
  'Essays',
  'Ranked reviews',
  'Agentic AI',
  'Data visualisation',
  'Three.js',
  'Native apps',
  'Build notes',
  'Open source',
];

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={`ef-container ${styles.inner}`}>
        <div className={styles.top}>
          <span className="ef-eyebrow">Reuben Roy · Independent engineer</span>
          <span className={`ef-mono ${styles.status}`}>
            <span className="ef-dot ef-dot--live" /> Est. 2021 / still shipping
          </span>
        </div>

        <div className={styles.center}>
          <div className={styles.mark} aria-hidden="true">
            <PixelMark size={40} />
            <span className="ef-mono">explosion.fun</span>
          </div>

          <h1 className={`ef-display ${styles.title}`}>
            A lab for things
            <br />
            <span className={styles.titleAccent}>worth making.</span>
          </h1>

          <p className={`ef-lede ${styles.lede}`}>
            Essays, ranked reviews, data toys, and small software with strong opinions.
            One person, a lot of curiosity, no feed to scroll.
          </p>

          <div className={`ef-row ${styles.actions}`}>
            <Link href="/projects" className="ef-btn ef-btn--primary ef-btn--lg">
              Explore the projects <PixelArrow size={18} />
            </Link>
            <Link href="/blog" className="ef-btn ef-btn--lg">
              Read the blog <PixelArrow size={18} />
            </Link>
          </div>

          <div className={styles.meta}>
            <span className="ef-mono">12 projects</span>
            <span className={styles.metaSep} />
            <span className="ef-mono">Ranked reviews since 2020</span>
            <span className={styles.metaSep} />
            <span className="ef-mono">Built in public</span>
          </div>
        </div>

        <div className={styles.band}>
          <PixelCanvas variant="burst" cell={16} />
          <div className={styles.bandGrad} aria-hidden="true" />
          <div className={`${styles.bandLabel} ${styles.bandLabelLeft}`}>
            <span className="ef-mono">01 / experiments</span>
          </div>
          <div className={`${styles.bandLabel} ${styles.bandLabelRight}`}>
            <span className="ef-mono">click the pixels →</span>
          </div>
        </div>
      </div>

      <div className={`ef-marquee ${styles.marquee}`} aria-label="What lives here">
        <div className="ef-marquee__track" style={{ animationDuration: '44s' }}>
          {[...SIGNALS, ...SIGNALS].map((signal, index) => (
            <span
              key={`${signal}-${index}`}
              className="ef-marquee__item"
              aria-hidden={index >= SIGNALS.length}
            >
              {signal}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
