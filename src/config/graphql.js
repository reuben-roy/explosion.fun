export const GRAPHQL_ENDPOINT = 'https://cms.explosion.fun/graphql';

// Base post fields that are common across all categories
const BASE_POST_FIELDS = `
  title
  content
  date
  slug
  author {
    node {
      name
      firstName
      lastName
    }
  }
  featuredImage {
    node {
      sourceUrl
      altText
    }
  }
  categories {
    nodes {
      name
      slug
    }
  }
`;

// Category-specific score fields
const ANIME_FIELDS = `
  anime {
      ageRestricted
      story
      sound
      script
      other
      fieldGroupName
      direction
      characterDevelopment
    }
`;

const MANGA_FIELDS = `
  mangacomics {
    ageRestricted
    art
    characterDevelopment
    emotionalImpact
    meaning
    originality
    other
    script
    story
    worldBuilding
  }
`;

const MOVIE_FIELDS = `
  movies {
      ageRestricted
      characterDevelopment
      direction
      other
      script
      sound
      storyTelling
    }
`;

const TV_SERIES_FIELDS = `
  tvseries {
      ageRestricted
      other
      script
      sound
      story
      characterDevelopment
      direction
    }
`;

const BOOK_FICTION_FIELDS = `
  booksfiction {
      characterDevelopment
      emotionalImpact
      meaning
      originality
      other
      script
      story
      worldBuilding
    }
`;

const BOOK_NON_FICTION_FIELDS = `
    booksnonfiction {
      clarityReadability
      contentPracticality
      meaning
      originality
      other
      realWorldImpact
    }
`;

// Category-specific queries
export const ANIME_POST_QUERY = `
  query GetAnimePost($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      ${BASE_POST_FIELDS}
      ${ANIME_FIELDS}
    }
  }
`;

export const MOVIE_POST_QUERY = `
  query GetMoviePost($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      ${BASE_POST_FIELDS}
      ${MOVIE_FIELDS}
    }
  }
`;

export const TV_SERIES_POST_QUERY = `
  query GetTVSeriesPost($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      ${BASE_POST_FIELDS}
      ${TV_SERIES_FIELDS}
    }
  }
`;

export const BOOK_FICTION_POST_QUERY = `
  query GetFictionBookPost($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      ${BASE_POST_FIELDS}
      ${BOOK_FICTION_FIELDS}
    }
  }
`;

export const BOOK_NON_FICTION_POST_QUERY = `
  query GetNonFictionBookPost($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      ${BASE_POST_FIELDS}
      ${BOOK_NON_FICTION_FIELDS}
    }
  }
`;

// Query for listing posts
export const POSTS_LIST_QUERY = `
  query GetPosts {
    posts {
      nodes {
        ${BASE_POST_FIELDS}
        ${ANIME_FIELDS}
        ${MANGA_FIELDS}
        ${MOVIE_FIELDS}
        ${TV_SERIES_FIELDS}
        ${BOOK_FICTION_FIELDS}
        ${BOOK_NON_FICTION_FIELDS}
      }
    }
  }
`;

// Helper function to get the appropriate query for a single post
export const getPostQueryByCategory = (category) => {
    switch (category.toLowerCase()) {
        case 'anime':
            return ANIME_POST_QUERY;
        case 'movies':
            return MOVIE_POST_QUERY;
        case 'tv-series':
            return TV_SERIES_POST_QUERY;
        case 'books-fiction':
            return BOOK_FICTION_POST_QUERY;
        case 'books-non-fiction':
            return BOOK_NON_FICTION_POST_QUERY;
        default:
            return ANIME_POST_QUERY; // Default fallback
    }
}; 