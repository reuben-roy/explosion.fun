import fs from 'fs/promises';
import path from 'path';
import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import { YoutubeScholarChannelsExplorer } from '@/components/youtube-scholar/YoutubeScholarExperience';
import styles from '../page.module.css';

export const metadata = {
  title: 'YouTube Scholar Channels | explosion.fun',
  description: 'Expanded channel watch-proxy explorer across years and quarters.',
};

async function getYoutubeScholarData() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'youtube-scholar.json');
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

export default async function YoutubeScholarChannelsPage() {
  const data = await getYoutubeScholarData();

  return (
    <div className={styles.page}>
      <Navbar />
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '8rem 1.5rem 5rem' }}>
        <Suspense fallback={<div>Loading channels explorer...</div>}>
          <YoutubeScholarChannelsExplorer data={data.channelWatchProxy.all} />
        </Suspense>
      </main>
    </div>
  );
}
