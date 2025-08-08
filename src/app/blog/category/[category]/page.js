import Navbar from '../../../../components/Navbar';
import BlogList from '../../../../components/BlogList';
import { GRAPHQL_ENDPOINT, POSTS_LIST_QUERY } from '../../../../config/graphql';
import { calculateAverageScore } from '../../../../utils/scores';
import RatingLegend from '../../../../components/RatingLegend';
import styles from './page.module.css';
import { REVIEW_CATEGORIES } from '@/utils/reviewCategories';

// Map URL-friendly category names to display names
const CATEGORY_NAMES = {
    'anime': 'Anime',
    'movies': 'Movies',
    'tv-series': 'TV Series',
    'books-fiction': 'Books (Fiction)',
    'books-non-fiction': 'Books (Non-Fiction)',
    'manga': 'Manga Reviews',
    'shower-thoughts': 'Shower Thoughts',
    'documenting': 'Documenting',
    'experiment': 'Experiment',
    'debate': 'Debate',
    'drama': 'Drama',
    'geopolitics': 'Geopolitics',
    'history': 'History',
    'philosophy': 'Philosophy',
    'psychology': 'Psychology',
    'science': 'Science',
    'technology': 'Technology',
    'travel': 'Travel',
    'news': 'News',
    'religion': 'Religion',
    'review': 'Review',
    'uncategorized': 'Uncategorized'
};

export async function generateStaticParams() {
    return Object.keys(CATEGORY_NAMES).map(category => ({
        category: category
    }));
}

async function getPosts() {
    const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: POSTS_LIST_QUERY,
        }),
    }, { next: { revalidate: 3600 } }); // Cache for 1 hour

    const { data } = await response.json();

    // Add calculated average score to each post
    return data.posts.nodes.map(post => ({
        ...post,
        averageScore: calculateAverageScore(post)
    }));
}

export default async function CategoryPage({ params }) {
    const posts = await getPosts();
    const parameters = await params;
    const categorySlug = parameters.category;
    const categoryName = CATEGORY_NAMES[categorySlug] || 'Uncategorized';

    // Filter posts by category and sort by score
    const categoryPosts = posts
        .filter(post => post.categories.nodes.some(cat => cat.name === categoryName))
        .sort((a, b) => {
            if (a.averageScore === null) return 1;
            if (b.averageScore === null) return -1;
            return b.averageScore - a.averageScore;
        });

    return (
        <div className={styles.page}>
            <Navbar />
            <RatingLegend className={styles.ratinglegend} />
            {REVIEW_CATEGORIES.includes(categoryName) && <div className={styles.container}>
                <BlogList
                    posts={categoryPosts}
                    title={`${categoryName} Ranked`}
                />
            </div>}
        </div>
    );
}