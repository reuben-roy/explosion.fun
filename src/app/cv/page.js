import { readFile } from 'node:fs/promises';
import path from 'node:path';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import styles from './cv.module.css';

export const metadata = {
  title: 'CV | Reuben Roy',
  description:
    'Reuben Roy — software engineer working on AI and agentic systems. Work history, skills, and projects, including Auto-Apply, an autonomous local-first job-application agent.',
  alternates: {
    canonical: 'https://explosion.fun/cv',
  },
};

const cvFilePath = path.join(process.cwd(), 'src', 'content', 'cv.md');

// Structured data so agents and scrapers reading /cv get the same facts as a
// human does, without having to parse the rendered markup.
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Reuben Roy',
  url: 'https://explosion.fun/cv',
  jobTitle: 'Software Engineer — AI & Agentic Systems',
  description:
    'Software engineer building autonomous, agentic systems on production-grade backends: local-first LLM pipelines, retrieval-augmented answer resolution, and long-running unattended agents with explicit confidence gates, verification, and failover.',
  sameAs: [
    'https://explosion.fun',
    'https://github.com/reuben-roy',
    'https://linkedin.com/in/reuben-roy',
  ],
  alumniOf: [
    { '@type': 'CollegeOrUniversity', name: 'Arizona State University' },
    { '@type': 'CollegeOrUniversity', name: 'National Institute of Technology, Calicut' },
  ],
  knowsAbout: [
    'Agentic AI systems',
    'LLM orchestration',
    'Local inference with Ollama',
    'Retrieval-augmented generation',
    'Semantic retrieval and embeddings',
    'Confidence gating and verification',
    'Browser automation (Playwright, Patchright, browser-use)',
    'Autonomous task queues with retry and dead-lettering',
    'Java and Spring Boot microservices',
    'Python and FastAPI',
    '.NET and C#',
    'PostgreSQL and Redis',
    'React, Next.js and React Native',
    'Data visualization with D3.js and Three.js',
  ],
  subjectOf: {
    '@type': 'SoftwareSourceCode',
    name: 'Auto-Apply',
    alternateName: 'Autonomous Job-Application Agent',
    url: 'https://explosion.fun/projects/auto-apply',
    author: { '@type': 'Person', name: 'Reuben Roy' },
    programmingLanguage: 'Python',
    applicationCategory: 'Autonomous agent',
    runtimePlatform: ['Python 3.11', 'Ollama', 'Playwright/Patchright', 'SQLite'],
    description:
      'A local-first agent that applies to jobs end-to-end unattended. The model never drives the browser and never decides whether to submit — it only answers questions. Form schemas come from each ATS public API, answers resolve in trust order (profile 1.0, answer cache 0.9, local LLM structured JSON), Playwright fills deterministically, and a mean-confidence gate decides submit versus hand-to-human. ~21,700 lines of Python across 69 modules with 724 tests; supports Greenhouse, Lever, Ashby and Workday.',
  },
};

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

// Applied after escaping, so the captured text is already HTML-safe.
function formatEmphasis(escaped) {
  return escaped
    .replaceAll(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replaceAll(/`([^`]+)`/g, '<code>$1</code>')
    .replaceAll(/(^|[\s(])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
}

function formatInline(text) {
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let result = '';
  let lastIndex = 0;
  let match;

  while ((match = linkPattern.exec(text)) !== null) {
    result += formatEmphasis(escapeHtml(text.slice(lastIndex, match.index)));
    result += `<a href="${escapeHtml(match[2])}" target="_blank" rel="noopener noreferrer">${formatEmphasis(escapeHtml(match[1]))}</a>`;
    lastIndex = match.index + match[0].length;
  }

  result += formatEmphasis(escapeHtml(text.slice(lastIndex)));
  return result;
}

// Two spaces of indent per nesting level, matching how the source markdown is written.
const INDENT_WIDTH = 2;

function cvMarkdownToHtml(markdown) {
  const lines = markdown.split('\n');
  const parts = [];
  // One entry per open <ul>, holding that list's indent level. A nested list is
  // emitted inside the <li> that introduced it, so `liOpen` tracks whether the
  // deepest list currently has an unclosed <li>.
  const openLists = [];
  let liOpen = false;

  const closeLists = () => {
    while (openLists.length > 0) {
      if (liOpen) parts.push('</li>');
      openLists.pop();
      parts.push('</ul>');
      liOpen = openLists.length > 0;
    }
    liOpen = false;
  };

  for (const line of lines) {
    const bullet = /^( *)- (.*)$/.exec(line);

    if (bullet) {
      const level = Math.floor(bullet[1].length / INDENT_WIDTH);

      while (openLists.length > 0 && openLists.at(-1) > level) {
        if (liOpen) parts.push('</li>');
        openLists.pop();
        parts.push('</ul>');
        liOpen = true;
      }

      if (openLists.length === 0 || openLists.at(-1) < level) {
        parts.push('<ul>');
        openLists.push(level);
        liOpen = false;
      } else if (liOpen) {
        parts.push('</li>');
        liOpen = false;
      }

      parts.push(`<li>${formatInline(bullet[2])}`);
      liOpen = true;
      continue;
    }

    closeLists();

    if (line.startsWith('# ')) {
      parts.push(`<h1>${formatInline(line.slice(2))}</h1>`);
    } else if (line.startsWith('## ')) {
      parts.push(`<h2>${formatInline(line.slice(3))}</h2>`);
    } else if (line.startsWith('### ')) {
      parts.push(`<h3>${formatInline(line.slice(4))}</h3>`);
    } else if (line.trim() !== '') {
      parts.push(`<p>${formatInline(line)}</p>`);
    }
  }

  closeLists();
  return parts.join('\n');
}

export default async function CvPage() {
  const markdown = await readFile(cvFilePath, 'utf8');
  const html = cvMarkdownToHtml(markdown);

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <Navbar />
      <main className={styles.main}>
        <div className={styles.toolbar}>
          <Link href="/projects/auto-apply" className={styles.toolbarPrimary}>
            Auto-Apply deep dive <span aria-hidden="true">→</span>
          </Link>
          <a href="/cv.md" className={styles.toolbarLink}>
            Machine-readable Markdown
          </a>
          <Link href="/projects" className={styles.toolbarLink}>
            All projects
          </Link>
        </div>

        <article
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>
    </div>
  );
}
