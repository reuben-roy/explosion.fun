import fs from 'fs/promises';
import path from 'path';
import Navbar from '@/components/Navbar';
import StarGrowthCharts from '@/components/agent-star-growth/StarGrowthCharts';
import styles from './page.module.css';

export const metadata = {
  metadataBase: new URL('https://www.explosion.fun'),
  title: 'GitHub Stars: Rise of DeepSeek Harness',
  description: 'Explore DeepSeek Harness star growth, compare stars and historical growth across 18 coding harness repositories, and model illustrative growth scenarios.',
  alternates: { canonical: '/projects/agent-star-growth' },
  openGraph: {
    title: 'GitHub Stars: Rise of DeepSeek Harness',
    description: 'DeepSeek Harness star history and projections, with switchable growth and current-star comparisons for major coding harnesses.',
    url: '/projects/agent-star-growth',
    siteName: 'explosion.fun',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'GitHub Stars: Rise of DeepSeek Harness',
    description: 'DeepSeek Harness growth, current harness star counts, and interactive projections.',
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
    name: 'GitHub stars for coding harness repositories',
    description: 'A fixed GitHub star-count snapshot across 18 coding harness repositories, with aggregate-based history estimates for 14 and original sampled histories for three.',
    temporalCoverage: data.asOf,
    dateModified: data.asOf,
    isBasedOn: [
      ...data.series.map((item) => item.url || `https://github.com/${item.repo}`),
      data.source,
      data.comparisonSource,
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
