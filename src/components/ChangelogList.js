'use client';

import { useState } from 'react';
import styles from './ChangelogList.module.css';

export default function ChangelogList({ posts }) {
    const [openIndex, setOpenIndex] = useState(0);

    const toggle = (index) => {
        setOpenIndex(openIndex === index ? -1 : index);
    };

    return (
        <div className={styles.list}>
            {posts.map((post, index) => (
                <div key={index} className={`${styles.item} ${openIndex === index ? styles.open : ''}`}>
                    <button 
                        className={styles.header}
                        onClick={() => toggle(index)}
                        aria-expanded={openIndex === index}
                    >
                        <div className={styles.headerContent}>
                            <div className={styles.versionInfo}>
                                <span className={styles.version}>{post.title}</span>
                                <span className={styles.date}>
                                    {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                            </div>
                            {post.excerpt && (
                                <div 
                                    className={styles.excerpt}
                                    dangerouslySetInnerHTML={{ __html: post.excerpt }} 
                                />
                            )}
                        </div>
                        <span className={styles.arrow}>▼</span>
                    </button>
                    <div className={styles.contentWrapper}>
                        <div className={styles.content}>
                            <div>
                                <div dangerouslySetInnerHTML={{ __html: post.content }} />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
             {posts.length === 0 && (
                <p className={styles.empty}>No release notes found.</p>
            )}
        </div>
    );
}
