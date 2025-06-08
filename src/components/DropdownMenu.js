'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from './DropdownMenu.module.css';

const CATEGORIES = [
    { slug: 'anime', name: 'Anime' },
    { slug: 'movies', name: 'Movies' },
    { slug: 'tv-series', name: 'TV Series' },
    { slug: 'books-fiction', name: 'Books (Fiction)' },
    { slug: 'books-non-fiction', name: 'Books (Non-Fiction)' },
    { slug: 'manga', name: 'Manga' },
    { slug: 'shower-thoughts', name: 'Shower Thoughts' }
];

export default function DropdownMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={styles.dropdown} ref={dropdownRef}>
            <button 
                className={styles.dropdownButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                Ranked View
                <span className={`${styles.arrow} ${isOpen ? styles.up : styles.down}`}>▼</span>
            </button>
            {isOpen && (
                <div className={styles.menu}>
                    {CATEGORIES.map((category) => (
                        <Link
                            key={category.slug}
                            href={`/blog/category/${category.slug}`}
                            className={styles.menuItem}
                            onClick={() => setIsOpen(false)}
                        >
                            {category.name}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
} 