import Link from 'next/link';
import styles from './BlogCard.module.css';
import OptimizedImage from './OptimizedImage';

export default function BlogCard({ title, description, image, slug, categories, date, averageScore }) {
    return (
        <Link href={`/blog/post/${slug}`} className={styles.card}>
            <div className={styles.imageContainer}>
                <OptimizedImage
                    src={image}
                    alt={title}
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
                    {categories.map((category, index) => (
                        <span key={index} className={styles.category}>
                            {category}
                        </span>
                    ))}
                </div>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.description}>{description}</p>
                <div className={styles.date}>{new Date(date).toLocaleDateString()}</div>
            </div>
        </Link>
    );
} 