import Link from 'next/link';
import FooterBands from './FooterBands';
import { PixelArrow, PixelMark } from './PixelMark';
import { GitHubIcon, LinkedInIcon, YouTubeIcon } from './Icons';
import { FOOTER_COLUMNS } from '@/config/navigation';

const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/reuben-roy', Icon: GitHubIcon },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/reuben-roy', Icon: LinkedInIcon },
  { label: 'YouTube', href: 'https://www.youtube.com/@reubenroy', Icon: YouTubeIcon },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="ef-footer">
      <div className="ef-container ef-footer__cta">
        <div>
          <p className="ef-eyebrow">Open inbox</p>
          <h2 className="ef-display ef-display--sm" style={{ marginTop: '0.8rem' }}>
            Have a strange idea?
            <br />
            Let&apos;s build it.
          </h2>
        </div>
        <div className="ef-stack" style={{ alignItems: 'flex-start' }}>
          <a className="ef-footer__email" href="mailto:hello@explosion.fun">
            hello@explosion.fun
          </a>
          <p className="ef-small">
            Projects, essays, data toys, or a note about something on this site — all welcome.
          </p>
          <div className="ef-row" style={{ gap: '0.5rem' }}>
            {SOCIALS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="ef-btn ef-btn--outline ef-btn--sm"
                aria-label={label}
              >
                <Icon size={15} /> {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="ef-container ef-footer__cols" style={{ paddingInline: 0 }}>
        <div className="ef-footer__col">
          <div className="ef-row" style={{ gap: '0.55rem' }}>
            <PixelMark size={28} />
            <span className="ef-header__word">
              explosion<em>.fun</em>
            </span>
          </div>
          <p className="ef-small" style={{ marginTop: '0.5rem', maxWidth: '30ch' }}>
            Reuben Roy&apos;s publishing and project lab. Essays, ranked reviews, data
            visualisations, and open experiments.
          </p>
          <span className="ef-tag" style={{ marginTop: '0.75rem', width: 'fit-content' }}>
            <span className="ef-dot ef-dot--live" /> Building in public
          </span>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title} className="ef-footer__col">
            <span className="ef-footer__col-title">{column.title}</span>
            {column.links.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  className="ef-footer__link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label} ↗
                </a>
              ) : (
                <Link key={link.label} href={link.href} className="ef-footer__link">
                  {link.label}
                </Link>
              )
            )}
          </div>
        ))}
      </div>

      <div className="ef-footer__legal">
        <span>© {year} Reuben Roy / explosion.fun</span>
        <span className="ef-row" style={{ gap: '1rem' }}>
          <Link href="/side-track/privacy" className="ef-footer__link">
            Privacy
          </Link>
          <Link href="/side-track/terms" className="ef-footer__link">
            Terms
          </Link>
          <Link href="/docs" className="ef-footer__link">
            Docs
          </Link>
          <a href="/feed.xml" className="ef-footer__link">
            RSS
          </a>
        </span>
        <span className="ef-row" style={{ gap: '0.35rem' }}>
          Hand-built with Next.js <PixelArrow size={12} />
        </span>
      </div>

      <FooterBands />
    </footer>
  );
}
