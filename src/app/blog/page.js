import Navbar from '../../components/Navbar';
import BlogDeck from '../../components/BlogDeck';
import styles from './blog.module.css';
import { GRAPHQL_ENDPOINT, POSTS_QUERY } from '../../config/graphql';

const CATEGORIES = [
    "Featured",
    "Anime",
    "Review",
    "Movies",
    "Books (Fiction)",
    "Books (Non-Fiction)",
    "TV-Series",
    "Manga Reviews",
    "Shower Thoughts",
    "Uncategorized"
];

// Helper function to calculate average score
const calculateAverageScore = (scores) => {
    if (!scores) return null;
    
    const { storytelling, characters, writing, direction, sound, other } = scores;
    const sum = storytelling + characters + writing + direction + sound + other;
    return sum / 6;
};

// Fetch posts with caching
async function getPosts() {
    try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: POSTS_QUERY,
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

        // Transform WordPress data to match our structure
        const transformedPosts = data.posts.nodes.map(post => {
            return {
                title: post.title,
                description: post.excerpt,
                image: post.featuredImage?.node?.sourceUrl || '/images/blog/akira.jpg',
                slug: post.slug,
                categories: post.categories.nodes.map(cat => cat.name),
                date: post.date,
                scores: post.scores ? {
                    storytelling: parseFloat(post.scores.storyTelling) || 0,
                    characters: parseFloat(post.scores.characterDevelopment) || 0,
                    writing: parseFloat(post.scores.script) || 0,
                    direction: parseFloat(post.scores.direction) || 0,
                    sound: parseFloat(post.scores.sound) || 0,
                    other: parseFloat(post.scores.other) || 0
                } : null
            };
        });

        // Add calculated average score to each post
        const postsWithAverage = transformedPosts.map(post => ({
            ...post,
            averageScore: post.scores ? calculateAverageScore(post.scores) : null
        }));

        // Sort posts by date
        return postsWithAverage.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        return []; // Return empty array on error
    }
}

export default async function Blog() {
    const posts = await getPosts();

    // Group posts by category
    const postsByCategory = CATEGORIES.reduce((acc, category) => {
        const categoryPosts = posts.filter(post => post.categories.includes(category));
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
                        postsByCategory.map((category, index) => (
                            <BlogDeck
                                key={index}
                                title={category.title}
                                posts={category.posts}
                            />
                        ))
                    )}
                </main>
            </div>
        </>
    );
}