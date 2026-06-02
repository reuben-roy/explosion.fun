'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import styles from './GreatnessNav.module.css';

export default function GreatnessNav() {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();

  const links = [
    { href: '/projects/greatness', label: 'Home' },
    ...(user ? [
      { href: '/projects/greatness/onboarding', label: 'Goals' },
      { href: '/projects/greatness/upload', label: 'Upload' },
      { href: '/projects/greatness/dashboard', label: 'Dashboard' },
    ] : []),
    { href: '/projects/greatness/leaderboard', label: 'Leaderboard' },
  ];

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <Image
            src="/logo.png"
            alt="Logo"
            width={150}
            height={40}
          />
        </Link>
        <div className={styles.links}>
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.link} ${pathname === link.href ? styles.active : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className={styles.auth}>
          {user ? (
            <div className={styles.userSection}>
              <span className={styles.userName}>{profile?.display_name || user.email}</span>
              <button onClick={signOut} className={styles.signOutBtn}>Sign Out</button>
            </div>
          ) : (
            <Link href="/projects/greatness/login" className={styles.signInBtn}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
