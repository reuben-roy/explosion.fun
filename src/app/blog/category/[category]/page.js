import Navbar from '../../../../components/Navbar';
import BlogList from '../../../../components/BlogList';
import { GRAPHQL_ENDPOINT, POSTS_QUERY } from '../../../../config/graphql';

// Helper function to calculate average score
const calculateAverageScore = (scores) => {
    if (!scores) return null;
    
    const { storytelling, characters, writing, direction, sound, other } = scores;
    const sum = storytelling + characters + writing + direction + sound + (other + 5);
    return sum / 6;
};

// Map URL-friendly category names to display names
const CATEGORY_NAMES = {
    'anime': 'Anime',
    'movies': 'Movies',
    'tv-series': 'TV Series',
    'books-fiction': 'Books (Fiction)',
    'books-non-fiction': 'Books (Non-Fiction)',
    'manga': 'Manga Reviews',
    'shower-thoughts': 'Shower Thoughts'
};

export async function generateStaticParams() {
    return Object.keys(CATEGORY_NAMES).map(category => ({
        category: category
    }));
}

async function getPosts() {
    const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: POSTS_QUERY,
        }),
    }, { next: { revalidate: 3600 } }); // Cache for 1 hour

    const { data } = await response.json();
    
    // Transform WordPress data to match our structure
    const transformedPosts = data.posts.nodes.map(post => ({
        title: post.title,
        description: post.excerpt,
        image: post.featuredImage?.node?.sourceUrl || '/images/blog/akira.jpg',
        slug: post.slug,
        categories: post.categories.nodes.map(cat => cat.name),
        date: post.date,
        scores: post.scores ? {
            storytelling: parseFloat(post.scores.storyTelling) || 0,
            characters: parseFloat(post.scores.characterDevelopment) || 0,
            writing: parseFloat(post.scores.script) || 0,
            direction: parseFloat(post.scores.direction) || 0,
            sound: parseFloat(post.scores.sound) || 0,
            other: parseFloat(post.scores.other) || 0
        } : null
    }));

    // Add calculated average score to each post
    return transformedPosts.map(post => ({
        ...post,
        averageScore: post.scores ? calculateAverageScore(post.scores) : null
    }));
}

export default async function CategoryPage({ params }) {
    const posts = await getPosts();
    const parameters = await params;
    const categorySlug = parameters.category;
    const categoryName = CATEGORY_NAMES[categorySlug] || 'Uncategorized';

    // Filter posts by category and sort by score
    const categoryPosts = posts
        .filter(post => post.categories.includes(categoryName))
        .sort((a, b) => {
            if (a.averageScore === null) return 1;
            if (b.averageScore === null) return -1;
            return b.averageScore - a.averageScore;
        });

    return (
        <>
            <Navbar />
            <BlogList 
                posts={categoryPosts}
                title={`${categoryName} Reviews`}
            />
        </>
    );
} 