'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../../components/Navbar';
import styles from './post.module.css';

// Helper function to calculate average score
const calculateAverageScore = (scores) => {
    if (!scores) return null;
    
    const { storytelling, characters, writing, direction, sound, other } = scores;
    const sum = storytelling + characters + writing + direction + sound + other; // Adjust other to be 0-10
    return sum / 6;
};

export default function BlogPost() {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Replace with actual GraphQL query
        const fetchPost = async () => {
            try {
                // Example structure - replace with actual GraphQL query
                const mockPost = {
                    title: "Akira",
                    date: "March 10, 2024",
                    author: "John Doe",
                    categories: ["Movie Reviews", "Anime Reviews"],
                    scores: {
                        storytelling: 9.0,
                        characters: 8.5,
                        writing: 9.0,
                        direction: 10,
                        sound: 10,
                        other: 3
                    },
                    content: `
                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                        
                        <h2>Visual Masterpiece</h2>
                        <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                        
                        <h2>Story and Themes</h2>
                        <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
                        
                        <h2>Legacy and Impact</h2>
                        <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                    `,
                    image: "/images/blog/akira.jpg"
                };

                // Calculate average score
                mockPost.averageScore = calculateAverageScore(mockPost.scores);

                setPost(mockPost);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching post:', error);
                setLoading(false);
            }
        };

        fetchPost();
    }, [slug]);

    if (loading) {
        return (
            <>
                <Navbar />
                <div className={styles.loading}>Loading...</div>
            </>
        );
    }

    if (!post) {
        return (
            <>
                <Navbar />
                <div className={styles.error}>Post not found</div>
            </>
        );
    }

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
                            <span className={styles.date}>{post.date}</span>
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
                        <img src={post.image} alt={post.title} className={styles.image} />
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
} 