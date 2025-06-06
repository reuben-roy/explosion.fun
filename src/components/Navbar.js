'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Navbar.module.css';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.navContainer}>
                <Link href="/" className={styles.navLogo}>
                    <Image
                        src="/logo.png"
                        alt="Logo"
                        width={150}
                        height={40}
                    />
                </Link>

                <div
                    className={styles.navToggle}
                    onClick={toggleMobileMenu}
                    aria-label="Toggle navigation menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                <ul className={`${styles.navMenu} ${isMenuOpen ? styles.active : ''}`}>
                    <li className={styles.navItem}>
                        <Link href="/" className={styles.navLink}>
                            Home
                        </Link>
                    </li>
                    <li className={styles.navItem}>
                        <Link href="/profession" className={styles.navLink}>
                            Professional
                        </Link>
                    </li>
                    <li className={styles.navItem}>
                        <Link href="/blog" className={styles.navLink}>
                            Blog
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}