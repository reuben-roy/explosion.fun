import Link from 'next/link';
import styles from './BlogList.module.css';
import OptimizedImage from './OptimizedImage';

export default function BlogList({ posts, title }) {
    return (
        <div className={styles.container}>
            <div className={styles.span}>
                <h1 className={styles.title}>{title}</h1>
                <div className={styles.list}>
                    {posts.map((post, index) => (
                        <Link href={`/blog/post/${post.slug}`} key={post.slug} className={styles.item}>
                            <div className={styles.rank}>
                                #{index + 1}
                            </div>
                            <div className={styles.imageContainer}>
                                <OptimizedImage
                                    src={post?.featuredImage?.node?.sourceUrl}
                                    alt={post.title}
                                    className={styles.image}
                                />
                            </div>
                            <h2 className={styles.postTitle}>{post.title}</h2>
                            <div className={styles.meta}>
                                {post.averageScore !== null && (
                                    <div className={styles.score}>
                                        Score: {post.averageScore.toFixed(1)}
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
} 