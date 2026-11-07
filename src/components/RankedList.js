'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './RankedList.module.css';
import { REVIEW_CATEGORIES } from '../utils/reviewCategories';
import OptimizedImage from './OptimizedImage';
import { stripHtml } from '../utils/plainText';

const scoreTone = (score) => {
  if (score >= 9) return 'var(--ef-green)';
  if (score >= 7.5) return 'var(--ef-yellow)';
  if (score >= 6) return 'var(--ef-tangerine)';
  return 'var(--ef-orange)';
};

export default function RankedList({ posts }) {
  // Category counts, only for categories that actually have scored posts.
  const categories = useMemo(
    () =>
      REVIEW_CATEGORIES.map((category) => ({
        name: category,
        posts: posts
          .filter(
            (post) =>
              post.averageScore !== null &&
              post.categories?.nodes?.some((c) => c.name === category)
          )
          .sort((a, b) => b.averageScore - a.averageScore),
      })).filter((category) => category.posts.length > 0),
    [posts]
  );

  const [selectedCategory, setSelectedCategory] = useState(
    () => categories[0]?.name || REVIEW_CATEGORIES[0]
  );

  const rankedPosts =
    categories.find((category) => category.name === selectedCategory)?.posts || [];

  return (
    <div className={styles.layout}>
      <aside className={styles.rail}>
        <p className={styles.railTitle}>Categories</p>
        <nav className={styles.categoryNav}>
          {categories.map((category) => (
            <button
              key={category.name}
              type="button"
              onClick={() => setSelectedCategory(category.name)}
              className={`${styles.categoryButton} ${
                selectedCategory === category.name ? styles.active : ''
              }`}
              aria-pressed={selectedCategory === category.name}
            >
              <span className={styles.categoryName}>{category.name}</span>
              <span className={styles.categoryCount}>{category.posts.length}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className={styles.content}>
        <div className={styles.contentHeader}>
          <h2 className={styles.categoryTitle}>{selectedCategory}</h2>
          <span className={styles.totalCount}>
            {rankedPosts.length} {rankedPosts.length === 1 ? 'review' : 'reviews'}
          </span>
        </div>

        {rankedPosts.length === 0 ? (
          <div className={styles.empty}>No reviews in this category yet</div>
        ) : (
          <ol className={styles.list}>
            {rankedPosts.map((post, index) => (
              <li key={post.slug}>
                <Link href={`/blog/post/${post.slug}`} className={styles.row}>
                  <span className={styles.rank}>
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <span className={styles.imageWrapper}>
                    <OptimizedImage
                      src={post?.featuredImage?.node?.sourceUrl}
                      alt={post.title}
                      className={styles.image}
                    />
                  </span>

                  <span className={styles.cardContent}>
                    <span className={styles.postTitle}>{post.title}</span>
                    <span className={styles.excerpt}>{stripHtml(post.excerpt)}</span>
                  </span>

                  <span className={styles.date}>
                    {new Date(post.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>

                  <span className={styles.scoreBox}>
                    <span
                      className={styles.scoreValue}
                      style={{ color: scoreTone(post.averageScore) }}
                    >
                      {post.averageScore.toFixed(1)}
                    </span>
                    <span className={styles.scoreLabel}>Score</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
