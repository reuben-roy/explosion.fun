import Navbar from '@/components/Navbar';
import styles from './side-track.module.css';
import Link from 'next/link';

export const metadata = {
    title: 'Side-Track | explosion.fun',
    description: 'Side-Track - Your workout tracking companion. Track exercises, set personal records, and compete on leaderboards.',
};

const links = [
    {
        title: 'Changelog',
        description: 'View release notes and app updates',
        href: '/side-track/changelog',
    },
    {
        title: 'Support',
        description: 'Get help and contact us',
        href: '/side-track/support',
    },
    {
        title: 'Privacy Policy',
        description: 'How we handle your data',
        href: '/side-track/privacy',
    },
    {
        title: 'Terms of Service',
        description: 'Terms and conditions of use',
        href: '/side-track/terms',
    },
];

export default function SideTrackPage() {
    return (
        <div className={styles.page}>
            <Navbar />
            <main className={styles.main}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Side-Track</h1>
                    <p className={styles.subtitle}>Your Workout Tracking Companion</p>
                    <p className={styles.description}>
                        Track your exercises, set personal records, and compete on global leaderboards.
                    </p>
                </header>

                <nav className={styles.linksGrid}>
                    {links.map((link) => (
                        <Link key={link.href} href={link.href} className={styles.linkCard}>
                            <div className={styles.linkContent}>
                                <h2 className={styles.linkTitle}>{link.title}</h2>
                                <p className={styles.linkDescription}>{link.description}</p>
                            </div>
                            <span className={styles.arrow}>→</span>
                        </Link>
                    ))}
                </nav>

                <footer className={styles.footer}>
                    <p>Questions? Contact us at <a href="mailto:contact@cms.explosion.fun">contact@cms.explosion.fun</a></p>
                </footer>
            </main>
        </div>
    );
}
