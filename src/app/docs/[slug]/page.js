import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { DOCS, getDocBySlug, readDoc, renderMarkdown } from '../docsContent';
import styles from '../docs.module.css';

export function generateStaticParams() {
  return DOCS.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  if (!doc) {
    return {
      title: 'Docs | explosion.fun',
    };
  }

  return {
    title: `${doc.title} | explosion.fun docs`,
    description: doc.description,
  };
}

export default async function DocsDetailPage({ params }) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  const markdown = readDoc(doc.file);

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.docsTopbar}>
          <Link href="/docs">Docs</Link>
          <span>/</span>
          <span>{doc.title}</span>
        </div>

        <div className={styles.layout}>
          <aside className={styles.sidebar} aria-label="Documentation pages">
            {DOCS.map((item) => (
              <Link
                key={item.slug}
                href={`/docs/${item.slug}`}
                className={item.slug === doc.slug ? styles.activeDocLink : undefined}
              >
                {item.title}
              </Link>
            ))}
          </aside>

          <article className={styles.content}>
            <header className={styles.sectionHeader}>
              <span>{doc.file}</span>
              <h1>{doc.title}</h1>
              <p>{doc.description}</p>
            </header>
            <div className={styles.markdown}>
              {renderMarkdown(markdown, doc.slug, styles)}
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}
