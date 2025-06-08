'use client';

import { useRef } from 'react';
import styles from './BlogDeck.module.css';
import BlogCard from './BlogCard';

export default function BlogDeck({ title, posts }) {
    const scrollContainerRef = useRef(null);

    const handleScroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 400;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className={styles.deckContainer}>
            <h2 className={styles.deckTitle}>{title}</h2>
            <div className={styles.scrollContainer}>
                <button 
                    className={`${styles.scrollButton} ${styles.leftButton}`}
                    onClick={() => handleScroll('left')}
                    aria-label="Scroll left"
                >
                    ←
                </button>
                <div className={styles.cardsContainer} ref={scrollContainerRef}>
                    {posts.map((post, index) => (
                        <BlogCard
                            key={index}
                            image={post.image}
                            title={post.title}
                            description={post.description}
                            slug={post.slug}
                            categories={post.categories}
                            date={post.date}
                            averageScore={post.averageScore}
                        />
                    ))}
                </div>
                <button 
                    className={`${styles.scrollButton} ${styles.rightButton}`}
                    onClick={() => handleScroll('right')}
                    aria-label="Scroll right"
                >
                    →
                </button>
            </div>
        </div>
    );
} 