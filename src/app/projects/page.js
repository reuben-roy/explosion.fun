import Navbar from '@/components/Navbar';
import Link from 'next/link';
import styles from './projects.module.css';

export const metadata = {
    title: 'Projects | explosion.fun',
    description: 'My personal projects and apps.',
};

const projects = [
    {
        title: 'Time Management Analysis',
        description: 'A deep-dive D3.js dashboard analyzing 31 days of tracked screen time — focus fragmentation, distraction gravity, circadian rhythms, sleep-productivity correlations, and the hidden YouTube habit.',
        link: '/projects/time-management',
        linkText: 'View Dashboard'
    },
    {
        title: 'Chief Information Aggregator & YouTube Scholar',
        description: 'An interactive D3.js case study that turns my YouTube Takeout history into a dark-theme research dashboard about curiosity, learning loops, and rabbit holes.',
        link: '/projects/youtube-scholar',
        linkText: 'View Experience'
    },
    {
        title: 'Side-Track',
        description: 'A task tracking app designed to help you stay focused and manage your time effectively. Check out the changelog and release notes.',
        link: '/side-track',
        linkText: 'View Release Notes'
    },

    {
        title: "Kali",
        description: "Landing page and waitlist for Kali — a fitness platform that treats physical progression like version control.",
        link: "https://github.com/reuben-roy/Kali",
        linkText: "View on GitHub"
    },
    {
        title: "Side-Track",
        description: "A React Native iOS weight-training app with a random workout picker, muscle-specific fatigue tracking, local leaderboard rankings, and Apple Health integration.",
        link: "/side-track",
        linkText: "View Project"
    },
    {
        title: "Window",
        description: "An Android app that watches your screen — tracking app usage, scraping visible UI text, and running on-device Gemini Nano AI to summarize your digital activity.",
        link: "https://github.com/reuben-roy/Window",
        linkText: "View on GitHub"
    },
    {
        title: "Window-Extension",
        description: "A Chrome extension that transforms your browser into an intelligent productivity co-pilot — connecting to Google Calendar, blocking distractions during focus sessions, and running an OpenClaw-powered...",
        link: "https://github.com/reuben-roy/Window-Extension",
        linkText: "View on GitHub"
    },
];


export default function ProjectsPage() {
    return (
        <div className={styles.page}>
            <Navbar />
            <main className={styles.main}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Projects</h1>
                    <p className={styles.subtitle}>Things I&apos;ve built and am working on.</p>
                </header>

                <div className={styles.grid}>
                    {projects.map((project, index) => (
                        <div key={index} className={styles.card}>
                            <h2 className={styles.cardTitle}>{project.title}</h2>
                            <p className={styles.cardDescription}>{project.description}</p>
                            <Link href={project.link} className={styles.cardLink}>
                                {project.linkText} <span>→</span>
                            </Link>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
