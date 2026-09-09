import fs from 'fs/promises';
import path from 'path';
import Navbar from '@/components/Navbar';
import EmploymentBySexExperience from '@/components/employment-by-sex/EmploymentBySexExperience';
import styles from './page.module.css';

export const metadata = {
  metadataBase: new URL('https://explosion.fun'),
  title: 'Who Got the Jobs? | U.S. Employment by Sex',
  description: 'Explore a decade of BLS payroll and labor-market data for women and men, including the August 2026 jobs headline.',
  alternates: { canonical: '/projects/employment-by-sex' },
  openGraph: {
    title: 'Who Got the Jobs?',
    description: 'Women accounted for 97.53% of the August 2026 net payroll gain. Explore what that number does—and does not—mean.',
    url: '/projects/employment-by-sex',
    siteName: 'explosion.fun',
    type: 'article',
    images: [{
      url: '/images/projects/employment-by-sex-og.png',
      width: 1200,
      height: 630,
      alt: 'U.S. employment by sex, September 2016 to August 2026',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Who Got the Jobs?',
    description: 'A decade of U.S. employment data, split by women and men.',
    images: ['/images/projects/employment-by-sex-og.png'],
  },
};

async function getEmploymentData() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'bls-employment', 'monthly.json');
  return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

export default async function EmploymentBySexPage() {
  const data = await getEmploymentData();

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'U.S. employment by sex, September 2016 to August 2026',
    description: 'Seasonally adjusted monthly BLS employment indicators for women and men.',
    temporalCoverage: '2016-09/2026-08',
    creator: { '@type': 'Organization', name: 'U.S. Bureau of Labor Statistics' },
    isBasedOn: [
      'https://data.bls.gov/timeseries/CES0000000001',
      'https://data.bls.gov/timeseries/CES0000000010',
    ],
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <EmploymentBySexExperience data={data} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
    </div>
  );
}
