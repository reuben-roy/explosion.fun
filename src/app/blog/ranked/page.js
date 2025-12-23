import Navbar from '../../../components/Navbar';
import RatingLegend from '../../../components/RatingLegend';
import RankedList from '../../../components/RankedList';
import { GRAPHQL_ENDPOINT, POSTS_LIST_QUERY } from '../../../config/graphql';
import { calculateAverageScore } from '../../../utils/scores';
import styles from './page.module.css';

async function getPosts() {
    const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: POSTS_LIST_QUERY,
        }),
    }, { next: { revalidate: 3600 } });

    const { data } = await response.json();

    return data.posts.nodes.map(post => ({
        ...post,
        averageScore: calculateAverageScore(post)
    }));
}

export const metadata = {
    title: 'Ranked Reviews | Explosion.fun',
    description: 'Browse all ranked reviews by category - Anime, Movies, TV Series, Books, and Manga'
};

export default async function RankedPage() {
    const posts = await getPosts();

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
