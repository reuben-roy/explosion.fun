import Navbar from '@/components/Navbar';
import Link from 'next/link';
import styles from './projects.module.css';

export const metadata = {
    title: 'Projects | explosion.fun',
    description: 'My personal projects and apps.',
};

const projects = [
    {
        title: 'Side-Track',
        description: 'A task tracking app designed to help you stay focused and manage your time effectively. Check out the changelog and release notes.',
        link: '/side-track',
        linkText: 'View Release Notes'
    }
];

export default function ProjectsPage() {
    return (
        <div className={styles.page}>
            <Navbar />
            <main className={styles.main}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Projects</h1>
                    <p className={styles.subtitle}>Things I've built and am working on.</p>
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
