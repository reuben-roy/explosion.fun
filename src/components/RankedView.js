'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './RankedView.module.css';
import { calculateAverageScore } from '../utils/scores';
import { REVIEW_CATEGORIES } from '../utils/reviewCategories';

export default function RankedView({ posts }) {
    const [selectedCategory, setSelectedCategory] = useState(REVIEW_CATEGORIES[0]);

    // Filter posts that have a score and sort by score
    const rankedPosts = posts
        .map(post => ({
            ...post,
            score: calculateAverageScore(post),
            reviewCategory: post.categories?.nodes?.find(c => 
                REVIEW_CATEGORIES.includes(c.name)
            )?.name || null
        }))
        .filter(post => post.score !== null && post.reviewCategory !== null)
        .filter(post => post.reviewCategory === selectedCategory)
        .sort((a, b) => b.score - a.score);

    // Helper to strip HTML tags from excerpt
    const stripHtml = (html) => {
        if (!html) return '';
        return html.replace(/<[^>]*>/g, '').trim();
    };

    // Get count per category for display
    const getCategoryCount = (category) => {
        return posts.filter(post => {
            const score = calculateAverageScore(post);
            const hasCategory = post.categories?.nodes?.some(c => c.name === category);
            return score !== null && hasCategory;
        }).length;
    };

    return (
        <section className={styles.container}>
            <div className={styles.header}>
                <h2>Ranked Reviews</h2>
                <p>Browse my rated experiences by category</p>
            </div>
            
            <div className={styles.content}>
                {/* Desktop sidebar / Mobile category selector */}
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

                {/* Ranked list */}
                <div className={styles.listContainer}>
                    {rankedPosts.length === 0 ? (
                        <div className={styles.empty}>No reviews in this category yet</div>
                    ) : (
                        <div className={styles.list}>
                            {rankedPosts.map((post, index) => (
                                <Link href={`/blog/post/${post.slug}`} key={post.slug} className={styles.card}>
                                    <div className={styles.rank}>#{index + 1}</div>
                                    <div className={styles.cardContent}>
                                        <div className={styles.cardTop}>
                                            <span className={styles.category}>{post.reviewCategory}</span>
                                            <span className={styles.date}>
                                                {new Date(post.date).toLocaleDateString('en-US', { 
                                                    month: 'short', 
                                                    year: 'numeric' 
                                                })}
                                            </span>
                                        </div>
                                        <h3 className={styles.title}>{post.title}</h3>
                                        <p className={styles.excerpt}>{stripHtml(post.excerpt)}</p>
                                    </div>
                                    <div className={styles.scoreBox}>
                                        <span className={styles.scoreValue}>{post.score.toFixed(1)}</span>
                                        <span className={styles.scoreLabel}>Score</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
