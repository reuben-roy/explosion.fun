'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from './ProjectsDropdown.module.css';

export default function ProjectsDropdown({ onClose }) {
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

    const handleLinkClick = () => {
        setIsOpen(false);
        if (onClose) onClose();
    };

    return (
        <div className={styles.dropdown} ref={dropdownRef}>
            <button 
                className={styles.dropdownButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                Projects
                <span className={`${styles.arrow} ${isOpen ? styles.up : styles.down}`}>▼</span>
            </button>
            {isOpen && (
                <div className={styles.menu}>
                    <Link
                        href="/projects/youtube-scholar"
                        className={styles.menuItem}
                        onClick={handleLinkClick}
                    >
                        YouTube Scholar
                    </Link>
                    <Link
                        href="/side-track"
                        className={styles.menuItem}
                        onClick={handleLinkClick}
                    >
                        Side-Track
                    </Link>
                    <Link
                        href="/projects/time-management"
                        className={styles.menuItem}
                        onClick={handleLinkClick}
                    >
                        Time Management Analysis
                    </Link>
                    <Link
                        href="/projects"
                        className={styles.menuItem}
                        onClick={handleLinkClick}
                    >
                        All Projects
                    </Link>
                </div>
            )}
        </div>
    );
}
