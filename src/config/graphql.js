export const GRAPHQL_ENDPOINT = 'https://cms.explosion.fun/graphql';

export const POSTS_QUERY = `
    query GetPosts {
        posts {
            nodes {
                title
                slug
                date
                excerpt
                content
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
                    }
                }
                scores {
                    storyTelling
                    characterDevelopment
                    script
                    direction
                    sound
                    other
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