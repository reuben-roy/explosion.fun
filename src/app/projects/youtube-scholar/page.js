import fs from 'fs/promises';
import path from 'path';
import Navbar from '@/components/Navbar';
import YoutubeScholarExperience from '@/components/youtube-scholar/YoutubeScholarExperience';
import styles from './page.module.css';

export const metadata = {
  title: 'Chief Information Aggregator & YouTube Scholar | explosion.fun',
  description: 'An interactive D3.js audit of YouTube search, subscriptions, playlists, comments, and rabbit holes.',
};

async function getYoutubeScholarData() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'youtube-scholar.json');
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

export default async function YoutubeScholarPage() {
  const data = await getYoutubeScholarData();

  return (
    <div className={styles.page}>
      <Navbar />
      <YoutubeScholarExperience data={data} />
    </div>
  );
}
