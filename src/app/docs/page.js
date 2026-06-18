import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { DOCS } from './docsContent';
import styles from './docs.module.css';

export const metadata = {
  title: 'Developer Docs | explosion.fun',
  description: 'Developer documentation for the explosion.fun publishing and personal-data platform.',
};

export default function DocsIndexPage() {
  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <header className={styles.header}>
          <p className={styles.kicker}>Developer documentation</p>
          <h1>explosion.fun docs</h1>
          <p>
            Build notes for the publishing platform, data pipelines, and customization path behind this site.
          </p>
        </header>

        <section className={styles.cardGrid} aria-label="Documentation pages">
          {DOCS.map((doc) => (
            <Link key={doc.slug} href={`/docs/${doc.slug}`} className={styles.docCard}>
              <span>{doc.file}</span>
              <h2>{doc.title}</h2>
              <p>{doc.description}</p>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
