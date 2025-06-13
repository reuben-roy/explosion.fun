// Helper function to calculate average score based on category
export const calculateAverageScore = (post) => {
    if (!post) return null;
    
    // Get the main category (excluding 'Review')
    const mainCategory = post.categories.nodes
        .find(cat => cat.name.toLowerCase() !== 'review')?.name;
    if (!mainCategory) return null;

    let scoreFields;
    switch (mainCategory.toLowerCase()) {
        case 'anime':
            scoreFields = post.anime;
            break;
        case 'manga':
            scoreFields = post.mangacomics;
            break;
        case 'movies':
            scoreFields = post.movies;
            break;
        case 'tv-series':
            scoreFields = post.tvseries;
            break;
        case 'books-fiction':
            scoreFields = post.booksfiction;
            break;
        case 'books-non-fiction':
            scoreFields = post.booksnonfiction;
            break;
        default:
            return null;
    }

    if (!scoreFields) return null;

    // Get all numeric score fields
    const scores = Object.entries(scoreFields)
        .filter(([key, value]) => 
            key !== 'ageRestricted' && 
            key !== 'fieldGroupName' && 
            typeof value === 'number'
        )
        .map(([_, value]) => value);

    if (scores.length === 0) return null;

    const sum = scores.reduce((acc, score) => acc + score, 0);
    return sum / scores.length;
}; 