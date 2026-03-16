import fs from 'fs/promises';
import path from 'path';
import Navbar from '@/components/Navbar';
import CuriosityVelocityExperience from '@/components/youtube-scholar/CuriosityVelocityExperience';
import styles from '../page.module.css';

export const metadata = {
  title: 'Curiosity Velocity | explosion.fun',
  description: 'A sequence-aware breakdown of how YouTube interests broaden, narrow, deepen, and pivot over time.',
};

async function getYoutubeScholarData() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'youtube-curiosity-velocity.json');
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

export default async function CuriosityVelocityPage() {
  const data = await getYoutubeScholarData();

  return (
    <div className={styles.page}>
      <Navbar />
      <CuriosityVelocityExperience data={data} />
    </div>
  );
}
