import Link from 'next/link';
import PageHero from '@/components/site/PageHero';
import { PixelArrow } from '@/components/site/PixelMark';
import { DOCS } from './docsContent';
import styles from './docs.module.css';

export const metadata = {
  title: 'Developer Docs | explosion.fun',
  description:
    'Developer documentation for the explosion.fun publishing and personal-data platform.',
};

export default function DocsIndexPage() {
  return (
    <div className="ef-page-in">
      <PageHero
        eyebrow="Developer docs"
        title={
          <>
            Build notes
            <br />
            for the platform.
          </>
        }
        description="How the publishing platform, data pipelines, and customization path behind this site actually work — kept close to the code they describe."
        art="grid"
        meta={
          <>
            <span>
              <strong>{DOCS.length}</strong> documents
            </span>
            <span>
              Static export, <strong>no server</strong>
            </span>
            <span>
              Source in <strong>/docs</strong>
            </span>
          </>
        }
        actions={
          <Link href="/docs/overview" className="ef-btn ef-btn--primary">
            Start with the overview <PixelArrow size={17} />
          </Link>
        }
      />

      <section className="ef-section">
        <div className="ef-wrap">
          <div className={styles.cardGrid} aria-label="Documentation pages">
            {DOCS.map((doc, index) => (
              <Link
                key={doc.slug}
                href={`/docs/${doc.slug}`}
                className={styles.docCard}
              >
                <span className={styles.docIndex}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className={styles.docFile}>{doc.file}</span>
                <h2>{doc.title}</h2>
                <p>{doc.description}</p>
                <span className={styles.docArrow} aria-hidden="true">
                  <PixelArrow size={18} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
