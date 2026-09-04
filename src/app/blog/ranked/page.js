import Navbar from '../../../components/Navbar';
import RatingLegend from '../../../components/RatingLegend';
import RankedList from '../../../components/RankedList';
import { getAllPosts } from '../../../lib/wordpress';
import { calculateAverageScore } from '../../../utils/scores';
import styles from './page.module.css';

async function getRankedPosts() {
    const posts = await getAllPosts();

    return posts.map(post => ({
        ...post,
        averageScore: calculateAverageScore(post)
    }));
}

export const metadata = {
    title: 'Ranked Reviews | Explosion.fun',
    description: 'Browse all ranked reviews by category - Anime, Movies, TV Series, Books, and Manga'
};

export default async function RankedPage() {
    const posts = await getRankedPosts();

    return (
        <div className={styles.page}>
            <Navbar />
            <main className={styles.main}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Ranked Reviews</h1>
                    <p className={styles.subtitle}>All my rated experiences, sorted by score</p>
                </div>
                <RatingLegend className={styles.ratingLegend} theme="dark" />
                <RankedList posts={posts} />
            </main>
        </div>
    );
}
