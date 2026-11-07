import Link from 'next/link';
import { PixelBurst, PixelArrow } from '@/components/site/PixelMark';

export const metadata = {
  title: 'Page not found',
};

export default function NotFound() {
  return (
    <div className="ef-container ef-section" style={{ minHeight: '70vh', display: 'grid', placeItems: 'center' }}>
      <div style={{ textAlign: 'center', display: 'grid', gap: '1.25rem', justifyItems: 'center' }}>
        <PixelBurst size={96} />
        <p className="ef-eyebrow">Error 404</p>
        <h1 className="ef-display">This page went up in smoke.</h1>
        <p className="ef-lede" style={{ textAlign: 'center' }}>
          The URL you followed does not exist — or it used to, and has since been rebuilt.
        </p>
        <div className="ef-row" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
          <Link href="/" className="ef-btn ef-btn--primary">
            Back home <PixelArrow size={16} />
          </Link>
          <Link href="/projects" className="ef-btn">
            Browse projects
          </Link>
        </div>
      </div>
    </div>
  );
}
