import Navbar from '@/components/Navbar';
import styles from './changelog.module.css';
import { getSideTrackPosts } from '@/lib/wordpress';
import ChangelogList from '@/components/ChangelogList';

export const metadata = {
    title: 'Changelog | Side-Track',
    description: 'Release notes and changelog for Side-Track app.',
};

export default async function ChangelogPage() {
    const posts = await getSideTrackPosts();

    return (
        <div className={styles.page}>
            <Navbar />
            <main className={styles.main}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Changelog</h1>
                    <p className={styles.subtitle}>Release Notes & Updates</p>
                </header>

                <ChangelogList posts={posts} />
            </main>
        </div>
    );
}
