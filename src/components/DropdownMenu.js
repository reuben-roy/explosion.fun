'use client';

import Link from 'next/link';
import styles from './DropdownMenu.module.css';

export default function DropdownMenu() {
    return (
        <Link href="/blog/ranked" className={styles.rankedLink}>
            Ranked View
        </Link>
    );
} 