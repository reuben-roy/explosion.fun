export const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://cms.explosion.fun/graphql';

export const POSTS_QUERY = `
  query GetPosts {
    posts(first: 100) {
      nodes {
        title
        slug
        date
        excerpt
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
        scores {
          characterDevelopment
          direction
          other
          script
          sound
          storyTelling
        }
      }
    }
  }
`;

export const POST_QUERY = `
  query GetPost($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      title
      content
      date
      author {
        node {
          name
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
      scores {
        characterDevelopment
        direction
        other
        script
        sound
        storyTelling
      }
    }
  }
`; 