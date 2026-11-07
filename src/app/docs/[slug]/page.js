import { notFound } from 'next/navigation';
import Link from 'next/link';
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
    <div className="ef-page-in">
      <header className={styles.detailHead}>
        <div className="ef-wrap">
          <div className={styles.breadcrumb}>
            <Link href="/docs">Docs</Link>
            <span aria-hidden="true">/</span>
            <span>{doc.title}</span>
            <span aria-hidden="true">·</span>
            <span>{doc.file}</span>
          </div>
          <h1 className={styles.detailTitle}>{doc.title}</h1>
          <p className={styles.detailDescription}>{doc.description}</p>
        </div>
      </header>

      <div className="ef-wrap">
        <div className={styles.layout}>
          <aside className={styles.sidebar} aria-label="Documentation pages">
            {DOCS.map((item) => (
              <Link
                key={item.slug}
                href={`/docs/${item.slug}`}
                className={item.slug === doc.slug ? styles.activeDocLink : undefined}
                aria-current={item.slug === doc.slug ? 'page' : undefined}
              >
                {item.title}
              </Link>
            ))}
          </aside>

          <article className={styles.content}>
            <div className={styles.markdown}>
              {renderMarkdown(markdown, doc.slug, styles)}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
