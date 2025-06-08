'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import styles from './Navbar.module.css';
import DropdownMenu from './DropdownMenu';

export default function Navbar() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <Image
                        src="/logo.png"
                        alt="Logo"
                        width={150}
                        height={40}
                    />
                </Link>
                <button 
                    className={`${styles.menuButton} ${isMenuOpen ? styles.active : ''}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <div className={`${styles.links} ${isMenuOpen ? styles.active : ''}`}>
                    <Link 
                        href="/blog" 
                        className={`${styles.link} ${pathname === '/blog' ? styles.active : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Blog
                    </Link>
                    <DropdownMenu onClose={() => setIsMenuOpen(false)} />
                    <Link 
                        href="/career" 
                        className={`${styles.link} ${pathname === '/career' ? styles.active : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Career
                    </Link>
                    <Link 
                        href="/about" 
                        className={`${styles.link} ${pathname === '/about' ? styles.active : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        About
                    </Link>
                </div>
            </div>
        </nav>
    );
}