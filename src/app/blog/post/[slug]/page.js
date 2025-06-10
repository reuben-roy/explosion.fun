import Navbar from '../../../../components/Navbar';
import styles from './post.module.css';
import { GRAPHQL_ENDPOINT } from '../../../../config/graphql';

// Helper function to calculate average score
const calculateAverageScore = (scores) => {
    if (!scores) return null;
    
    const { storytelling, characters, writing, direction, sound, other } = scores;
    const sum = storytelling + characters + writing + direction + sound + other;
    return sum / 6;
};

// GraphQL query for a single post
const POST_QUERY = `
    query GetPost($slug: String!) {
        postBy(slug: $slug) {
            title
            date
            content
            author {
                node {
                    name
                }
            }
            categories {
                nodes {
                    name
                }
            }
            featuredImage {
                node {
                    sourceUrl
                    altText
                }
            }
            scores {
                storyTelling
                characterDevelopment
                script
                direction
                sound
                other
            }
        }
    }
`;

// GraphQL query to get all post slugs
const ALL_POSTS_QUERY = `
    query GetAllPosts {
        posts {
            nodes {
                slug
            }
        }
    }
`;

// Generate static params for all posts
export async function generateStaticParams() {
    try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: ALL_POSTS_QUERY,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.errors) {
            throw new Error(result.errors[0].message);
        }

        const { data } = result;
        
        if (!data || !data.posts || !data.posts.nodes) {
            throw new Error('Invalid data structure received from GraphQL');
        }

        return data.posts.nodes.map((post) => ({
            slug: post.slug,
        }));
    } catch (error) {
        console.error('Error generating static params:', error);
        return [];
    }
}

// Server component for the blog post
export default async function BlogPost({ params }) {
    const { slug } = await params;

    try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: POST_QUERY,
                variables: { slug }
            }),
        }, { next: { revalidate: 3600 } }); // Cache for 1 hour

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.errors) {
            throw new Error(result.errors[0].message);
        }

        const { data } = result;
        
        if (!data || !data.postBy) {
            throw new Error('Post not found');
        }

        // Transform WordPress data to match our structure
        const post = {
            title: data.postBy.title,
            date: data.postBy.date,
            author: data.postBy.author?.node?.name || 'Anonymous',
            categories: data.postBy.categories.nodes.map(cat => cat.name),
            content: data.postBy.content,
            image: data.postBy.featuredImage?.node?.sourceUrl || '/images/blog/akira.jpg',
            imageAlt: data.postBy.featuredImage?.node?.altText || data.postBy.title,
            scores: data.postBy.scores ? {
                storytelling: parseFloat(data.postBy.scores.storyTelling) || 0,
                characters: parseFloat(data.postBy.scores.characterDevelopment) || 0,
                writing: parseFloat(data.postBy.scores.script) || 0,
                direction: parseFloat(data.postBy.scores.direction) || 0,
                sound: parseFloat(data.postBy.scores.sound) || 0,
                other: parseFloat(data.postBy.scores.other) || 0
            } : null
        };

        // Calculate average score
        post.averageScore = post.scores ? calculateAverageScore(post.scores) : null;

        return (
            <>
                <Navbar />
                <article className={styles.post}>
                    <div className={styles.header}>
                        <div className={styles.meta}>
                            <div className={styles.categories}>
                                {post.categories.map((category, index) => (
                                    <span key={index} className={styles.category}>
                                        {category}
                                    </span>
                                ))}
                            </div>
                            <div className={styles.metaInfo}>
                                <span className={styles.date}>{new Date(post.date).toLocaleDateString()}</span>
                                {post.averageScore && (
                                    <span className={styles.score}>
                                        Average Score: {post.averageScore.toFixed(1)}/10
                                    </span>
                                )}
                            </div>
                        </div>
                        <h1 className={styles.title}>{post.title}</h1>
                        <div className={styles.author}>By {post.author}</div>
                    </div>

                    {post.image && (
                        <div className={styles.imageContainer}>
                            <img 
                                src={post.image} 
                                alt={post.imageAlt} 
                                className={styles.image} 
                            />
                        </div>
                    )}

                    {post.scores && (
                        <div className={styles.scores}>
                            <h2>Detailed Scores</h2>
                            <div className={styles.scoreGrid}>
                                <div className={styles.scoreItem}>
                                    <span className={styles.scoreLabel}>Storytelling/Plot</span>
                                    <span className={styles.scoreValue}>{post.scores.storytelling}/10</span>
                                </div>
                                <div className={styles.scoreItem}>
                                    <span className={styles.scoreLabel}>Character Development</span>
                                    <span className={styles.scoreValue}>{post.scores.characters}/10</span>
                                </div>
                                <div className={styles.scoreItem}>
                                    <span className={styles.scoreLabel}>Writing/Script</span>
                                    <span className={styles.scoreValue}>{post.scores.writing}/10</span>
                                </div>
                                <div className={styles.scoreItem}>
                                    <span className={styles.scoreLabel}>Direction</span>
                                    <span className={styles.scoreValue}>{post.scores.direction}/10</span>
                                </div>
                                <div className={styles.scoreItem}>
                                    <span className={styles.scoreLabel}>Sound and Music</span>
                                    <span className={styles.scoreValue}>{post.scores.sound}/10</span>
                                </div>
                                <div className={styles.scoreItem}>
                                    <span className={styles.scoreLabel}>Other</span>
                                    <span className={styles.scoreValue}>{post.scores.other}/5</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div 
                        className={styles.content}
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </article>
            </>
        );
    } catch (error) {
        console.error('Error fetching post:', error);
        return (
            <>
                <Navbar />
                <div className={styles.error}>{error.message}</div>
            </>
        );
    }
}