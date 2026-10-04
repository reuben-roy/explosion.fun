import fs from 'fs/promises';
import path from 'path';
import Navbar from '@/components/Navbar';
import StarGrowthCharts from '@/components/agent-star-growth/StarGrowthCharts';
import styles from './page.module.css';

export const metadata = {
  metadataBase: new URL('https://www.explosion.fun'),
  title: 'GitHub Stars: The Rise of AI Agents',
  description: 'A historical comparison of GitHub star growth for OpenClaw, Hermes Agent, and DeepSeek Harness through October 3, 2026.',
  alternates: { canonical: '/projects/agent-star-growth' },
  openGraph: {
    title: 'GitHub Stars: The Rise of AI Agents',
    description: 'A fixed historical snapshot comparing star growth for OpenClaw, Hermes Agent, and DeepSeek Harness.',
    url: '/projects/agent-star-growth',
    siteName: 'explosion.fun',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'GitHub Stars: The Rise of AI Agents',
    description: 'Historical star growth for OpenClaw, Hermes Agent, and DeepSeek Harness.',
  },
};

async function getHistory() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'agent-star-growth', 'history.json');
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

export default async function AgentStarGrowthPage() {
  const data = await getHistory();
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Historical GitHub star growth for AI agent repositories',
    description: 'Approximate historical values digitized from Star History, with exact GitHub API counts on October 3, 2026.',
    temporalCoverage: '2026-01/2026-10',
    dateModified: data.asOf,
    isBasedOn: [
      'https://github.com/openclaw/openclaw',
      'https://github.com/NousResearch/hermes-agent',
      'https://github.com/deepseek-ai/deepseek-harness',
      data.source,
    ],
    distribution: {
      '@type': 'DataDownload',
      encodingFormat: 'application/json',
      contentUrl: 'https://www.explosion.fun/data/agent-star-growth/history.json',
    },
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <main>
        <StarGrowthCharts data={data} />
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
    </div>
  );
}
