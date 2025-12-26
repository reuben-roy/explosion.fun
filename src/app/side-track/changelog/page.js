import Navbar from '@/components/Navbar';
import styles from './changelog.module.css';
import { GRAPHQL_ENDPOINT, SIDETRACK_POSTS_QUERY } from '@/config/graphql';
import ChangelogList from '@/components/ChangelogList';

export const metadata = {
    title: 'Changelog | Side-Track',
    description: 'Release notes and changelog for Side-Track app.',
};

async function getChangelogPosts() {
    try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: SIDETRACK_POSTS_QUERY,
            }),
        }, { next: { revalidate: 3600 } });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.errors) {
            console.error('GraphQL Errors:', result.errors);
            return [];
        }

        return result.data?.posts?.nodes || [];
    } catch (error) {
        console.error('Error fetching changelog:', error);
        return [];
    }
}

export default async function ChangelogPage() {
    const posts = await getChangelogPosts();

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
