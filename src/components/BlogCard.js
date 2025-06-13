import Link from 'next/link';
import styles from './BlogCard.module.css';
import OptimizedImage from './OptimizedImage';
import { calculateAverageScore } from '../utils/scores';

// Function to strip HTML tags
const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
};

export default function BlogCard({ post }) {
    const averageScore = calculateAverageScore(post);
    
    return (
        <Link href={`/blog/post/${post.slug}`} className={styles.card}>
            <div className={styles.imageContainer}>
                <OptimizedImage
                    src={post.featuredImage?.node?.sourceUrl || '/images/blog/akira.jpg'}
                    alt={post.featuredImage?.node?.altText || post.title}
                    className={styles.image}
                />
                {averageScore !== null && (
                    <div className={styles.score}>
                        {averageScore.toFixed(1)}
                    </div>
                )}
            </div>
            <div className={styles.content}>
                <div className={styles.categories}>
                    {post.categories.nodes.map((category, index) => (
                        <span key={index} className={styles.category}>
                            {category.name}
                        </span>
                    ))}
                </div>
                <h2 className={styles.title}>{post.title}</h2>
                <p className={styles.description}>{stripHtml(post.excerpt)}</p>
                <div className={styles.date}>{new Date(post.date).toLocaleDateString()}</div>
            </div>
        </Link>
    );
} 