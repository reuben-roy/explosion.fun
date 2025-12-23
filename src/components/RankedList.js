'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './RankedList.module.css';
import { REVIEW_CATEGORIES } from '../utils/reviewCategories';
import OptimizedImage from './OptimizedImage';

export default function RankedList({ posts }) {
    const [selectedCategory, setSelectedCategory] = useState(REVIEW_CATEGORIES[0]);

    // Filter posts that have a score and belong to a review category
    const getPostsForCategory = (category) => {
        return posts
            .filter(post => {
                const hasCategory = post.categories?.nodes?.some(c => c.name === category);
                return post.averageScore !== null && hasCategory;
            })
            .sort((a, b) => b.averageScore - a.averageScore);
    };

    const rankedPosts = getPostsForCategory(selectedCategory);

    // Get count per category
    const getCategoryCount = (category) => {
        return posts.filter(post => {
            const hasCategory = post.categories?.nodes?.some(c => c.name === category);
            return post.averageScore !== null && hasCategory;
        }).length;
    };

    // Helper to strip HTML tags
    const stripHtml = (html) => {
        if (!html) return '';
        return html.replace(/<[^>]*>/g, '').trim();
    };

    return (
        <div className={styles.container}>
            {/* Sidebar with categories */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarTitle}>Categories</div>
                <nav className={styles.categoryNav}>
                    {REVIEW_CATEGORIES.map(category => {
                        const count = getCategoryCount(category);
                        if (count === 0) return null;
                        return (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`${styles.categoryButton} ${selectedCategory === category ? styles.active : ''}`}
                            >
                                <span className={styles.categoryName}>{category}</span>
                                <span className={styles.categoryCount}>{count}</span>
                            </button>
                        );
                    })}
                </nav>
            </aside>

            {/* Main content - ranked list */}
            <div className={styles.content}>
                <div className={styles.contentHeader}>
                    <h2 className={styles.categoryTitle}>{selectedCategory}</h2>
                    <span className={styles.totalCount}>{rankedPosts.length} reviews</span>
                </div>

                {rankedPosts.length === 0 ? (
                    <div className={styles.empty}>No reviews in this category yet</div>
                ) : (
                    <div className={styles.list}>
                        {rankedPosts.map((post, index) => (
                            <Link href={`/blog/post/${post.slug}`} key={post.slug} className={styles.card}>
                                <div className={styles.rankBadge}>
                                    <span className={styles.rankNumber}>#{index + 1}</span>
                                </div>
                                
                                <div className={styles.imageWrapper}>
                                    <OptimizedImage
                                        src={post?.featuredImage?.node?.sourceUrl}
                                        alt={post.title}
                                        className={styles.image}
                                    />
                                </div>

                                <div className={styles.cardContent}>
                                    <h3 className={styles.postTitle}>{post.title}</h3>
                                    <p className={styles.excerpt}>{stripHtml(post.excerpt)}</p>
                                    <div className={styles.meta}>
                                        <span className={styles.date}>
                                            {new Date(post.date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.scoreBox}>
                                    <span className={styles.scoreValue}>{post.averageScore.toFixed(1)}</span>
                                    <span className={styles.scoreLabel}>Score</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
