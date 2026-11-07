import { PixelMark } from './PixelMark';

/**
 * Shared inner-page masthead. Keeps every route on the same rhythm: eyebrow,
 * oversized title, lede, optional actions, and a hairline grid.
 */
export default function PageHero({
  eyebrow,
  title,
  description,
  meta,
  actions,
  aside,
  art = 'grid',
  compact = false,
  children,
}) {
  return (
    <section className={`ef-pagehead ${aside ? 'ef-pagehead--split' : ''}`}>
      <div
        className="ef-pagehead__inner"
        style={compact ? { paddingBlock: 'clamp(2rem, 4vw, 3.5rem)' } : undefined}
      >
        <div style={{ display: 'grid', gap: '1.1rem', minWidth: 0 }}>
          {eyebrow && <p className="ef-eyebrow">{eyebrow}</p>}
          <h1 className={`ef-display ${compact ? 'ef-display--sm' : ''}`}>{title}</h1>
          {description && <p className="ef-lede">{description}</p>}
          {actions && <div className="ef-row" style={{ marginTop: '0.6rem' }}>{actions}</div>}
          {meta && <div className="ef-pagehead__meta">{meta}</div>}
        </div>
        {aside && <div style={{ minWidth: 0 }}>{aside}</div>}
        {children}
      </div>

      {art === 'grid' && (
        <div className="ef-pagehead__art" aria-hidden="true">
          <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
            <defs>
              <pattern id="ef-page-grid" width="8.333" height="25" patternUnits="userSpaceOnUse">
                <path d="M 8.333 0 L 0 0 0 25" fill="none" stroke="currentColor" strokeOpacity="0.07" strokeWidth="0.18" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#ef-page-grid)" />
          </svg>
          <PixelMark
            size={44}
            className="ef-float"
          />
        </div>
      )}
      {art === 'dots' && (
        <div className="ef-pagehead__art" aria-hidden="true">
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
              backgroundSize: '18px 18px',
              color: 'var(--ef-line-strong)',
              opacity: 0.45,
              maskImage: 'linear-gradient(110deg, transparent 45%, #000 100%)',
              WebkitMaskImage: 'linear-gradient(110deg, transparent 45%, #000 100%)',
            }}
          />
        </div>
      )}
      {art === 'bars' && (
        <div className="ef-pagehead__art" aria-hidden="true" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', gap: 6, padding: '0 3vw' }}>
          {[26, 44, 64, 38, 78, 54, 92].map((h, i) => (
            <span
              key={i}
              style={{
                display: 'block',
                width: 'clamp(14px, 2.4vw, 34px)',
                height: `${h}%`,
                maxHeight: '140px',
                background: i % 2 ? 'var(--ef-tangerine)' : 'var(--ef-yellow)',
                opacity: 0.35 + i * 0.06,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
