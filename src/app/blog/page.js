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
        <>
            <Navbar />
            <div className={styles.page}>
                <main className={styles.main}>
                    <h1 className={styles.title}>Blog</h1>
                    {postsByCategory.length === 0 ? (
                        <div className={styles.loading}>No posts found</div>
                    ) : (
                        <>
                            <BlogDeck
                                title="Latest Articles"
                                posts={posts.slice(0, 20)}
                            />
                            {postsByCategory.map((category, index) => (
                                <BlogDeck
                                    key={index}
                                    title={category.title}
                                    posts={category.posts}
                                />
                            ))}
                        </>
                    )}
                </main>
            </div>
        </>
    );
}