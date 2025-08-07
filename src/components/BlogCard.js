import Link from 'next/link';
import styles from './BlogCard.module.css';
import OptimizedImage from './OptimizedImage';
import { calculateAverageScore } from '../utils/scores';

// Function to strip HTML tags
const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
};

// Function to truncate text to a specific length
const truncateText = (text, maxLength = 120) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
};

export default function BlogCard({ post }) {
    const averageScore = calculateAverageScore(post);
    const cleanExcerpt = stripHtml(post.excerpt);
    const truncatedExcerpt = truncateText(cleanExcerpt);

    // Format date more elegantly
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <Link href={`/blog/post/${post.slug}`} className={styles.card}>
            <div className={styles.imageContainer}>
                <OptimizedImage
                    src={post.featuredImage?.node?.sourceUrl || '/images/blog/filler.webp'}
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
                    {post.categories.nodes.slice(0, 3).map((category, index) => (
                        <span key={index} className={styles.category}>
                            {category.name}
                        </span>
                    ))}
                </div>
                <h2 className={styles.title}>{post.title}</h2>
                <p className={styles.description}>{truncatedExcerpt}</p>
                <div className={styles.date}>{formatDate(post.date)}</div>
            </div>
        </Link>
    );
}