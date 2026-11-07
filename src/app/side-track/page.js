import Link from 'next/link';
import PageHero from '@/components/site/PageHero';
import { PixelArrow } from '@/components/site/PixelMark';
import styles from './side-track.module.css';

export const metadata = {
  title: 'Side-Track | explosion.fun',
  description:
    'Side-Track — your workout tracking companion. Track exercises, set personal records, and compete on leaderboards.',
};

const links = [
  {
    title: 'Changelog',
    description: 'Release notes and everything that changed, version by version.',
    href: '/side-track/changelog',
  },
  {
    title: 'Support',
    description: 'Get help, report a bug, or ask for a feature.',
    href: '/side-track/support',
  },
  {
    title: 'Privacy Policy',
    description: 'What the app stores, where it lives, and what never leaves your device.',
    href: '/side-track/privacy',
  },
  {
    title: 'Terms of Service',
    description: 'The terms and conditions that come with using the app.',
    href: '/side-track/terms',
  },
];

export default function SideTrackPage() {
  return (
    <div className="ef-page-in">
      <PageHero
        eyebrow="Side-Track"
        title={
          <>
            Keep the streak.
            <br />
            Skip the spreadsheet.
          </>
        }
        description="A workout tracking companion for exercises, personal records, and friendly leaderboards. Local-first by default: your training data stays on your device."
        art="bars"
        meta={
          <>
            <span>
              <strong>Local-first</strong> data
            </span>
            <span>
              <strong>iOS</strong> · Android
            </span>
            <span>
              Built by <strong>Reuben Roy</strong>
            </span>
          </>
        }
        actions={
          <a href="mailto:contact@cms.explosion.fun" className="ef-btn ef-btn--primary">
            Contact support <PixelArrow size={17} />
          </a>
        }
      />

      <section className="ef-section">
        <div className="ef-wrap">
          <div className={styles.linksGrid}>
            {links.map((link, index) => (
              <Link key={link.href} href={link.href} className={styles.linkCard}>
                <span className={styles.linkIndex}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className={styles.linkContent}>
                  <span className={styles.linkTitle}>{link.title}</span>
                  <span className={styles.linkDescription}>{link.description}</span>
                </span>
                <span className={styles.arrow} aria-hidden="true">
                  <PixelArrow size={20} />
                </span>
              </Link>
            ))}
          </div>

          <footer className={styles.footer}>
            <p>
              Questions?{' '}
              <a href="mailto:contact@cms.explosion.fun">contact@cms.explosion.fun</a>
            </p>
          </footer>
        </div>
      </section>
    </div>
  );
}
