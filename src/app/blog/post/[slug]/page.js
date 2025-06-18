import Navbar from '../../../../components/Navbar';
import styles from './post.module.css';
import { GRAPHQL_ENDPOINT, getPostQueryByCategory } from '../../../../config/graphql';
import { calculateAverageScore } from '../../../../utils/scores';
import RatingLegend from '../../../../components/RatingLegend';
import { REVIEW_CATEGORIES } from '../../../../utils/reviewCategories';

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

function isPostInCategory(post, categorySlug) {
    return post.categories.nodes.some(category => category.slug === categorySlug);
}

// Server component for the blog post
export default async function BlogPost({ params }) {
    const { slug } = await params;
    
    try {
        // First, get the post's category
        const categoryResponse = await fetch(GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `
                    query GetPostCategory($slug: ID!) {
                        post(id: $slug, idType: SLUG) {
                            categories {
                                nodes {
                                    name
                                }
                            }
                        }
                    }
                `,
                variables: { slug }
            }),
        });

        const categoryResult = await categoryResponse.json();
        const primaryCategory = categoryResult.data?.post?.categories?.nodes?.find(category => 
            REVIEW_CATEGORIES.includes(category.name)
        )?.name || 'anime';

        // Get the appropriate query for the category
        const postQuery = getPostQueryByCategory(primaryCategory);

        // Fetch the full post data
        const response = await fetch(GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: postQuery,
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
        
        if (!data || !data.post) {
            throw new Error('Post not found');
        }

        const post = {
            ...data.post,
            averageScore: calculateAverageScore(data.post)
        };

        return (
            <>
                <Navbar />
                <article className={styles.post}>
                    <div className={styles.header}>
                        <div className={styles.meta}>
                            <div className={styles.categories}>
                                {post.categories.nodes.map((primaryCategory, index) => (
                                    <span key={index} className={styles.primaryCategory}>
                                        {primaryCategory.name}
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
                        <div className={styles.author}>By {post.author?.node?.firstName} {post.author?.node?.lastName || 'Anonymous'}</div>
                    </div>

                    {post.featuredImage?.node?.sourceUrl && (
                        <div className={styles.imageContainer}>
                            <img 
                                src={post.featuredImage.node.sourceUrl} 
                                alt={post.featuredImage.node.altText || post.title} 
                                className={styles.image} 
                            />
                        </div>
                    )}
                    
                    {post && (
                        <div className={styles.scores}>
                            <h2>Detailed Scores</h2>
                            <div className={styles.scoreGrid}>
                                {isPostInCategory(post, 'anime') && post.anime && (
                                    <>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Story</span>
                                            <span className={styles.scoreValue}>{post.anime.story}/10</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Character Development</span>
                                            <span className={styles.scoreValue}>{post.anime.characterDevelopment}/10</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Script</span>
                                            <span className={styles.scoreValue}>{post.anime.script}/10</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Direction</span>
                                            <span className={styles.scoreValue}>{post.anime.direction}/10</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Sound</span>
                                            <span className={styles.scoreValue}>{post.anime.sound}/10</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Other</span>
                                            <span className={styles.scoreValue}>{post.anime.other}/10</span>
                                        </div>
                                        {post.anime.ageRestricted && (
                                            <div className={styles.scoreItem}>
                                                <span className={styles.scoreLabel}>Age Restricted</span>
                                                <span className={styles.scoreValue}>Yes</span>
                                            </div>
                                        )}
                                    </>
                                )}
                                {isPostInCategory(post, 'manga') && post.mangacomics && (
                                    <>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Art</span>
                                            <span className={styles.scoreValue}>{post.mangacomics.art}/10</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Character Development</span>
                                            <span className={styles.scoreValue}>{post.mangacomics.characterDevelopment}/10</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Script</span>
                                            <span className={styles.scoreValue}>{post.mangacomics.script}/10</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Emotional Impact</span>
                                            <span className={styles.scoreValue}>{post.mangacomics.emotionalImpact}/10</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Meaning</span>
                                            <span className={styles.scoreValue}>{post.mangacomics.meaning}/10</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Originality</span>
                                            <span className={styles.scoreValue}>{post.mangacomics.originality}/10</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Other</span>
                                            <span className={styles.scoreValue}>{post.mangacomics.other}/10</span>
                                        </div>
                                        {post.mangacomics.ageRestricted && (
                                            <div className={styles.scoreItem}>
                                                <span className={styles.scoreLabel}>Age Restricted</span>
                                                <span className={styles.scoreValue}>Yes</span>
                                            </div>
                                        )}
                                    </>
                                )}

                                {isPostInCategory(post, 'movies') && post.movies && (
                                    <>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Story</span>
                                            <span className={styles.scoreValue}>{post.movies.storyTelling}/10</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Character Development</span>
                                            <span className={styles.scoreValue}>{post.movies.characterDevelopment}/10</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Script</span>
                                            <span className={styles.scoreValue}>{post.movies.script}/10</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Direction</span>
                                            <span className={styles.scoreValue}>{post.movies.direction}/10</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Sound</span>
                                            <span className={styles.scoreValue}>{post.movies.sound}/10</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Other</span>
                                            <span className={styles.scoreValue}>{post.movies.other}/10</span>
                                        </div>
                                        {post.movies.ageRestricted && (
                                            <div className={styles.scoreItem}>
                                                <span className={styles.scoreLabel}>Age Restricted</span>
                                                <span className={styles.scoreValue}>Yes</span>
                                            </div>
                                        )}
                                    </>
                                )}

                                {isPostInCategory(post, 'tv-series') && post.tvseries && (
                                    <>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Story</span>
                                            <span className={styles.scoreValue}>{post.tvseries.story}/10</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Character Development</span>
                                            <span className={styles.scoreValue}>{post.tvseries.characterDevelopment}/10</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Script</span>
                                            <span className={styles.scoreValue}>{post.tvseries.script}/10</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Direction</span>
                                            <span className={styles.scoreValue}>{post.tvseries.direction}/10</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Sound</span>
                                            <span className={styles.scoreValue}>{post.tvseries.sound}/10</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Other</span>
                                            <span className={styles.scoreValue}>{post.tvseries.other}/10</span>
                                        </div>
                                        {post.tvseries.ageRestricted && (
                                            <div className={styles.scoreItem}>
                                                <span className={styles.scoreLabel}>Age Restricted</span>
                                                <span className={styles.scoreValue}>Yes</span>
                                            </div>
                                        )}
                                    </>
                                )}

                                {isPostInCategory(post, 'books-fiction') && post.booksfiction && (
                                    <>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Story</span>
                                            <span className={styles.scoreValue}>{post.booksfiction.story}/10</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Character Development</span>
                                            <span className={styles.scoreValue}>{post.booksfiction.characterDevelopment}/10</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Writing</span>
                                            <span className={styles.scoreValue}>{post.booksfiction.writing}/10</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>World Building</span>
                                            <span className={styles.scoreValue}>{post.booksfiction.worldBuilding}/10</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Emotional Impact</span>
                                            <span className={styles.scoreValue}>{post.booksfiction.emotionalImpact}/10</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Other</span>
                                            <span className={styles.scoreValue}>{post.booksfiction.other}/10</span>
                                        </div>
                                    </>
                                )}

                                {isPostInCategory(post, 'books-non-fiction') && post.booksnonfiction && (
                                    <>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Content Quality</span>
                                            <span className={styles.scoreValue}>{post.booksnonfiction.contentQuality}/10</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Research</span>
                                            <span className={styles.scoreValue}>{post.booksnonfiction.research}/10</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Writing</span>
                                            <span className={styles.scoreValue}>{post.booksnonfiction.writing}/10</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Real World Impact</span>
                                            <span className={styles.scoreValue}>{post.booksnonfiction.realWorldImpact}/10</span>
                                        </div>
                                        <div className={styles.scoreItem}>
                                            <span className={styles.scoreLabel}>Other</span>
                                            <span className={styles.scoreValue}>{post.booksnonfiction.other}/10</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    <RatingLegend />

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