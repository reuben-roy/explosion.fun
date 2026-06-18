import fs from 'fs';
import path from 'path';
import Navbar from '@/components/Navbar';
import styles from './docs.module.css';

export const metadata = {
  title: 'Developer Docs | explosion.fun',
  description: 'Developer documentation for the explosion.fun publishing and personal-data platform.',
};

const DOCS = [
  {
    id: 'overview',
    title: 'Overview',
    file: 'README.md',
  },
  {
    id: 'developer-guide',
    title: 'Developer Guide',
    file: 'developer-guide.md',
  },
  {
    id: 'data-pipelines',
    title: 'Data Pipelines',
    file: 'data-pipelines.md',
  },
  {
    id: 'customization',
    title: 'Customization',
    file: 'customization.md',
  },
];

function docsDirectory() {
  return path.join(process.cwd(), 'docs');
}

function readDoc(file) {
  return fs.readFileSync(path.join(docsDirectory(), file), 'utf8');
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseInline(text) {
  const nodes = [];
  const pattern = /(`[^`]+`|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('`')) {
      nodes.push(<code key={`${match.index}-code`}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith('[')) {
      const href = match[3].endsWith('.md')
        ? `#${slugify(match[2])}`
        : match[3];
      nodes.push(
        <a key={`${match.index}-link`} href={href}>
          {match[2]}
        </a>
      );
    } else if (token.startsWith('**')) {
      nodes.push(<strong key={`${match.index}-strong`}>{match[4]}</strong>);
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function renderTable(lines, keyPrefix) {
  const rows = lines
    .filter((line) => line.trim().startsWith('|'))
    .map((line) =>
      line
        .trim()
        .replace(/^\||\|$/g, '')
        .split('|')
        .map((cell) => cell.trim())
    );

  if (rows.length < 2) return null;

  const header = rows[0];
  const body = rows.slice(2);

  return (
    <div className={styles.tableWrap} key={`${keyPrefix}-table`}>
      <table>
        <thead>
          <tr>
            {header.map((cell, index) => (
              <th key={index}>{parseInline(cell)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{parseInline(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderMarkdown(markdown, docId) {
  const lines = markdown.split('\n');
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith('```')) {
      const language = trimmed.slice(3).trim();
      const code = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        code.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push(
        <pre key={`${docId}-code-${index}`} className={styles.codeBlock}>
          {language && <span className={styles.codeLanguage}>{language}</span>}
          <code>{code.join('\n')}</code>
        </pre>
      );
      continue;
    }

    if (trimmed.startsWith('|') && lines[index + 1]?.trim().startsWith('|')) {
      const tableLines = [];
      while (index < lines.length && lines[index].trim().startsWith('|')) {
        tableLines.push(lines[index]);
        index += 1;
      }
      blocks.push(renderTable(tableLines, `${docId}-${index}`));
      continue;
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2];
      const Tag = level === 1 ? 'h2' : level === 2 ? 'h3' : 'h4';
      blocks.push(
        <Tag id={slugify(text)} key={`${docId}-heading-${index}`}>
          {parseInline(text)}
        </Tag>
      );
      index += 1;
      continue;
    }

    if (trimmed.startsWith('- ')) {
      const items = [];
      while (index < lines.length && lines[index].trim().startsWith('- ')) {
        items.push(lines[index].trim().slice(2));
        index += 1;
      }
      blocks.push(
        <ul key={`${docId}-list-${index}`}>
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{parseInline(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ''));
        index += 1;
      }
      blocks.push(
        <ol key={`${docId}-ordered-${index}`}>
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{parseInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    const paragraph = [trimmed];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].trim().startsWith('#') &&
      !lines[index].trim().startsWith('- ') &&
      !/^\d+\.\s+/.test(lines[index].trim()) &&
      !lines[index].trim().startsWith('|') &&
      !lines[index].trim().startsWith('```')
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(
      <p key={`${docId}-paragraph-${index}`}>
        {parseInline(paragraph.join(' '))}
      </p>
    );
  }

  return blocks;
}

export default function DocsPage() {
  const docs = DOCS.map((doc) => ({
    ...doc,
    content: readDoc(doc.file),
  }));

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

        <div className={styles.layout}>
          <aside className={styles.sidebar} aria-label="Documentation sections">
            {docs.map((doc) => (
              <a key={doc.id} href={`#${doc.id}`}>
                {doc.title}
              </a>
            ))}
          </aside>

          <div className={styles.content}>
            {docs.map((doc) => (
              <section key={doc.id} id={doc.id} className={styles.section}>
                <div className={styles.sectionHeader}>
                  <span>{doc.file}</span>
                  <h2>{doc.title}</h2>
                </div>
                <div className={styles.markdown}>
                  {renderMarkdown(doc.content, doc.id)}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
