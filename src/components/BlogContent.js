'use client';

import { useMemo, useState } from 'react';
import BlogCard from './BlogCard';
import styles from './BlogContent.module.css';

const PAGE_SIZE = 24;

export default function BlogContent({ allPosts, postsByCategory }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filteredPosts = useMemo(() => {
    if (!selectedCategory) return allPosts;
    return allPosts.filter((post) =>
      post.categories?.nodes?.some((cat) => cat.name === selectedCategory)
    );
  }, [allPosts, selectedCategory]);

  const selectCategory = (category) => {
    setSelectedCategory(category);
    setVisible(PAGE_SIZE);
  };

  const shownPosts = filteredPosts.slice(0, visible);
  const remaining = filteredPosts.length - shownPosts.length;

  return (
    <section className="ef-section" aria-label="Articles">
      <div className="ef-wrap">
        <div className={styles.toolbar}>
          <div className={styles.chips} role="group" aria-label="Filter by category">
            <button
              type="button"
              className={`${styles.chip} ${!selectedCategory ? styles.chipActive : ''}`}
              onClick={() => selectCategory(null)}
              aria-pressed={!selectedCategory}
            >
              All
              <span className={styles.count}>{allPosts.length}</span>
            </button>
            {postsByCategory.map((category) => (
              <button
                key={category.title}
                type="button"
                className={`${styles.chip} ${
                  selectedCategory === category.title ? styles.chipActive : ''
                }`}
                onClick={() => selectCategory(category.title)}
                aria-pressed={selectedCategory === category.title}
              >
                {category.title}
                <span className={styles.count}>{category.posts.length}</span>
              </button>
            ))}
          </div>

          <p className={styles.resultLine} aria-live="polite">
            <span className="ef-mono">
              {String(filteredPosts.length).padStart(3, '0')}
            </span>{' '}
            {filteredPosts.length === 1 ? 'article' : 'articles'}
            {selectedCategory ? ` in ${selectedCategory}` : ' on file'}
          </p>
        </div>

        {filteredPosts.length === 0 ? (
          <div className={styles.empty}>
            <p className="ef-eyebrow">Nothing here yet</p>
            <h2 className="ef-display ef-display--sm">Check back soon.</h2>
            <p className="ef-lede">New writing lands whenever a thing deserves one.</p>
          </div>
        ) : (
          <>
            <div className={styles.grid}>
              {shownPosts.map((post) => (
                <BlogCard key={post.id || post.slug} post={post} />
              ))}
            </div>

            {remaining > 0 && (
              <div className={styles.more}>
                <button
                  type="button"
                  className="ef-btn"
                  onClick={() => setVisible((value) => value + PAGE_SIZE)}
                >
                  Load {Math.min(remaining, PAGE_SIZE)} more
                  <span className="ef-mono" style={{ opacity: 0.6 }}>
                    {shownPosts.length}/{filteredPosts.length}
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
