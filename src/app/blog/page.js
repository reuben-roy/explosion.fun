import Navbar from '../../components/Navbar';
import BlogContent from '../../components/BlogContent';
import styles from './blog.module.css';
import { GRAPHQL_ENDPOINT, POSTS_LIST_QUERY } from '../../config/graphql';
import { CATEGORIES } from '../../utils/categories.js';
import fs from 'fs';
import path from 'path';

// Fetch posts with caching
async function getPosts() {
    try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: POSTS_LIST_QUERY,
            }),
        }, { next: { revalidate: 3600 } }); // Cache for 1 hour

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.errors) {
            console.error('GraphQL Errors:', result.errors);
            throw new Error(result.errors[0].message);
        }

        const { data } = result;

        if (!data || !data.posts || !data.posts.nodes) {
            console.error('Unexpected data structure:', data);
            throw new Error('Invalid data structure received from GraphQL');
        }
        return data.posts.nodes;
    } catch (error) {
        console.error('Error fetching posts:', error);
        return []; // Return empty array on error
    }
}

// NEW: gather interactive local pages and treat them like posts
async function getInteractivePosts() {
    const root = path.join(process.cwd(), 'src', 'app', 'blog', 'post', 'interactive');
    let dirs = [];
    try {
        dirs = await fs.promises.readdir(root, { withFileTypes: true });
    } catch {
        return [];
    }

    // Map of slug -> metadata (extend here when adding more interactive pages)
    const META = {
        'solar-system': {
            title: 'Interactive 3D Solar System',
            excerpt: 'Explore an accelerated Three.js model of the solar system.',
        },
        'bird-migration': {
            title: 'Flight of the Storks',
            excerpt: 'An interactive visualization tracking the epic 4,000km migration of three white storks from the Netherlands to West Africa.',
        }
    };

    const results = [];
    for (const dirent of dirs) {
        if (!dirent.isDirectory()) continue;
        const slug = dirent.name;
        if (!META[slug]) continue;
        const pageFile = path.join(root, slug, 'page.js');
        try {
            const stat = await fs.promises.stat(pageFile);
            const modified = stat.mtime.toISOString();
            results.push({
                // Mimic WP post shape minimally
                id: `interactive-${slug}`,
                slug: `interactive/${slug}`,          // so /blog/post/${slug} => /blog/post/interactive/solar-system
                title: META[slug].title,
                excerpt: META[slug].excerpt,
                date: modified,
                modified,
                categories: { nodes: [{ name: 'Interactive' }] }
            });
        } catch {
            continue;
        }
    }
    return results;
}

export default async function Blog() {
    const [wpPosts, interactivePosts] = await Promise.all([
        getPosts(),
        getInteractivePosts()
    ]);

    // Filter out Side-Track posts
    const filteredWpPosts = wpPosts.filter(post =>
        !post.categories?.nodes?.some(cat => cat.name === 'Side-Track')
    );

    // Combine & sort by modified / date desc
    const allPosts = [...filteredWpPosts, ...interactivePosts].sort((a, b) =>
        new Date(b.modified || b.date) - new Date(a.modified || a.date)
    );

    // Ensure Interactive category considered even if not in original CATEGORIES
    const categoriesList = Array.from(new Set([...CATEGORIES, 'Interactive']));

    // Group posts by category
    const postsByCategory = categoriesList.reduce((acc, category) => {
        const categoryPosts = allPosts.filter(post =>
            post.categories?.nodes?.some(cat => cat.name === category)
        );
        if (categoryPosts.length > 0) {
            acc.push({
                title: category,
                posts: categoryPosts
            });
        }
        return acc;
    }, []);

    return (
        <div className={styles.container}>
            <Navbar />

            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.title}>Blog</h1>

                    <div className={styles.badgeGroup}>
                        <div className={styles.badge}>
                            <span>{allPosts.length} Articles</span>
                        </div>
                        <div className={styles.badge}>
                            <span>{postsByCategory.length} Categories</span>
                        </div>
                    </div>

                    <p className={styles.subtitle}>
                        Thoughts, reviews, and insights about technology, development, and other garbage
                    </p>
                </div>
                <div className={styles.heroBackground}>
                    <div className={styles.grid}></div>
                    <div className={styles.gradient1}></div>
                    <div className={styles.gradient2}></div>
                </div>
            </section>

            <BlogContent allPosts={allPosts} postsByCategory={postsByCategory} />
        </div>
    );
}