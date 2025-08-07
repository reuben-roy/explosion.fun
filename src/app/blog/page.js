import Navbar from '../../components/Navbar';
import BlogDeck from '../../components/BlogDeck';
import styles from './blog.module.css';
import { GRAPHQL_ENDPOINT, POSTS_LIST_QUERY } from '../../config/graphql';
import { CATEGORIES } from '../../utils/categories.js';

// Fetch posts with caching
async function getPosts() {
    try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: POSTS_LIST_QUERY,
            }),
        }, { next: { revalidate: 3600 } }); // Cache for 1 hour

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.errors) {
            console.error('GraphQL Errors:', result.errors);
            throw new Error(result.errors[0].message);
        }

        const { data } = result;

        if (!data || !data.posts || !data.posts.nodes) {
            console.error('Unexpected data structure:', data);
            throw new Error('Invalid data structure received from GraphQL');
        }
        return data.posts.nodes;
    } catch (error) {
        console.error('Error fetching posts:', error);
        return []; // Return empty array on error
    }
}

export default async function Blog() {
    const posts = await getPosts();

    // Group posts by category
    const postsByCategory = CATEGORIES.reduce((acc, category) => {
        const categoryPosts = posts.filter(post =>
            post.categories.nodes.some(cat => cat.name === category)
        );

        if (categoryPosts.length > 0) {
            acc.push({
                title: category,
                posts: categoryPosts
            });
        }
        return acc;
    }, []);

    return (
        <div className={styles.container}>
            <Navbar />

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.title}>Blog</h1>

                    <div className={styles.badgeGroup}>
                        <div className={styles.badge}>
                            <span>{posts.length} Articles</span>
                        </div>
                        <div className={styles.badge}>
                            <span>{postsByCategory.length} Categories</span>
                        </div>
                    </div>

                    <p className={styles.subtitle}>
                        Thoughts, reviews, and insights about technology, development, and other garbage
                    </p>

                    <div className={styles.categories}>
                        {postsByCategory.map((category, index) => (
                            <span key={index} className={styles.categoryTag}>
                                {category.title} ({category.posts.length})
                            </span>
                        ))}
                    </div>
                </div>
                <div className={styles.heroBackground}>
                    <div className={styles.grid}></div>
                    <div className={styles.gradient1}></div>
                    <div className={styles.gradient2}></div>
                </div>
            </section>

            {/* Content Section */}
            <section className={styles.content}>
                <div className={styles.contentWrapper}>
                    {postsByCategory.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>📝</div>
                            <h3>No posts found</h3>
                            <p>Check back soon for new articles!</p>
                        </div>
                    ) : (
                        <>
                            <div className={styles.section}>
                                <BlogDeck
                                    title="Latest Articles"
                                    posts={posts.slice(0, 20)}
                                />
                            </div>
                            {postsByCategory.map((category, index) => (
                                <div key={index} className={styles.section}>
                                    <BlogDeck
                                        title={category.title}
                                        posts={category.posts}
                                    />
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}