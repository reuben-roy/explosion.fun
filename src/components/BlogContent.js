'use client';

import { useState, useRef, useEffect } from 'react';
import BlogDeck from './BlogDeck';
import styles from './BlogContent.module.css';

export default function BlogContent({ allPosts, postsByCategory }) {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleCategorySelect = (categoryTitle) => {
        setSelectedCategory(categoryTitle);
        setIsOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter posts based on selected category
    const filteredPosts = selectedCategory
        ? allPosts.filter(post =>
            post.categories?.nodes?.some(cat => cat.name === selectedCategory)
        )
        : allPosts;

    const currentLabel = selectedCategory 
        ? `${selectedCategory} (${filteredPosts.length})`
        : `All Categories (${allPosts.length})`;

    return (
        <>
            {/* Category Dropdown */}
            <div className={styles.dropdownWrapper} ref={dropdownRef}>
                <button 
                    className={styles.dropdownToggle}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span>{currentLabel}</span>
                    <span className={`${styles.chevron} ${isOpen ? styles.open : ''}`}>▾</span>
                </button>
                
                {isOpen && (
                    <div className={styles.dropdownMenu}>
                        <button
                            className={`${styles.dropdownItem} ${!selectedCategory ? styles.active : ''}`}
                            onClick={() => handleCategorySelect(null)}
                        >
                            All Categories ({allPosts.length})
                        </button>
                        {postsByCategory.map((category, index) => (
                            <button
                                key={index}
                                className={`${styles.dropdownItem} ${selectedCategory === category.title ? styles.active : ''}`}
                                onClick={() => handleCategorySelect(category.title)}
                            >
                                {category.title} ({category.posts.length})
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Content Section */}
            <section className={styles.content}>
                <div className={styles.contentWrapper}>
                    {filteredPosts.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>📝</div>
                            <h3>No posts found</h3>
                            <p>Check back soon for new articles!</p>
                        </div>
                    ) : (
                        <>
                            {selectedCategory ? (
                                // Show only the selected category
                                <div className={styles.section}>
                                    <BlogDeck
                                        title={selectedCategory}
                                        posts={filteredPosts}
                                    />
                                </div>
                            ) : (
                                // Show all categories
                                <>
                                    <div className={styles.section}>
                                        <BlogDeck
                                            title="Latest Articles"
                                            posts={allPosts.slice(0, 20)}
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
                        </>
                    )}
                </div>
            </section>
        </>
    );
}
