'use client';

import { useState, useEffect } from 'react';
import styles from './GitHubCard.module.css';

export default function GitHubCard() {
    const [githubData, setGithubData] = useState({
        username: "reuben-roy",
        name: "reuben-roy",
        bio: "Spring Boot/Java, Python3, PostgreSQL, ReactJS, JavaScript, HTML, CSS, CMS Wordpress, Redis",
        profilePic: "https://avatars.githubusercontent.com/u/83647134?v=4",
        profileUrl: "https://github.com/reuben-roy",
        repositories: "42",
        followers: "150",
        following: "80"
    });

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3>GitHub Profile</h3>
                <div className={styles.githubIcon}>
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                    </svg>
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.profileSection}>
                    <img
                        src={githubData.profilePic}
                        alt="GitHub Profile Picture"
                        className={styles.profilePic}
                        width={80}
                        height={80}
                    />
                    <div className={styles.profileInfo}>
                        <h4 className={styles.username}>@{githubData.username}</h4>
                        <p className={styles.bio}>{githubData.bio}</p>
                    </div>
                </div>

                <a
                    href={githubData.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.viewProfile}
                >
                    View GitHub Profile →
                </a>
            </div>
        </div>
    );
}