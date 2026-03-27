import fs from 'fs/promises';
import path from 'path';
import Navbar from '@/components/Navbar';
import TimeManagementDashboard from '@/components/time-management/TimeManagementDashboard';
import styles from './page.module.css';

export const metadata = {
    title: 'Time Management Analysis | explosion.fun',
    description: 'An interactive D3.js dashboard analyzing 31 days of tracked time usage — focus patterns, distraction gravity, circadian rhythms, and sleep-productivity correlations.',
};

async function getAnalysisData() {
    const filePath = path.join(process.cwd(), 'public', 'data', 'time-management', 'analysis.json');
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
}

export default async function TimeManagementPage() {
    const data = await getAnalysisData();

    return (
        <div className={styles.page}>
            <Navbar />
            <TimeManagementDashboard data={data} />
        </div>
    );
}
