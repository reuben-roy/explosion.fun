import {
    GRAPHQL_ENDPOINT,
    POSTS_LIST_QUERY,
    POST_SLUGS_QUERY,
    SIDETRACK_POSTS_QUERY,
} from '../config/graphql';

// WPGraphQL refuses to return more than 100 nodes for a single request
// (graphql_connection_max_query_amount), so anything that wants "all posts"
// has to walk the cursor instead of asking for one big page.
const PAGE_SIZE = 100;

// Stop runaway loops if the CMS ever reports hasNextPage forever.
const MAX_PAGES = 50;

const REVALIDATE_SECONDS = 3600;

/**
 * POST a query to WPGraphQL and return its `data`, or null if the request failed.
 * Never throws: a CMS hiccup should degrade a page, not break the build.
 */
export async function fetchGraphQL(query, variables = {}) {
    try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, variables }),
            next: { revalidate: REVALIDATE_SECONDS },
        });

        if (!response.ok) {
            console.error(`WPGraphQL HTTP error! status: ${response.status}`);
            return null;
        }

        const result = await response.json();

        if (result.errors) {
            console.error('WPGraphQL errors:', result.errors);
            // Partial data is still worth using when only some fields failed.
            return result.data ?? null;
        }

        return result.data ?? null;
    } catch (error) {
        console.error('Error querying WPGraphQL:', error);
        return null;
    }
}

/**
 * Walk every page of a `posts` connection and return the combined nodes.
 * The query must accept ($first: Int!, $after: String) and select pageInfo.
 */
async function fetchAllPosts(query, variables = {}) {
    const nodes = [];
    let after = null;

    for (let page = 0; page < MAX_PAGES; page++) {
        const data = await fetchGraphQL(query, { ...variables, first: PAGE_SIZE, after });
        const posts = data?.posts;

        if (!posts?.nodes) {
            if (page === 0) console.error('Unexpected data structure from WPGraphQL:', data);
            break;
        }

        nodes.push(...posts.nodes);

        // No cursor means there is nothing left to ask for, whatever hasNextPage says.
        if (!posts.pageInfo?.hasNextPage || !posts.pageInfo?.endCursor) break;
        after = posts.pageInfo.endCursor;
    }

    return nodes;
}

/** Every published post, newest first, with the review score fields attached. */
export function getAllPosts() {
    return fetchAllPosts(POSTS_LIST_QUERY);
}

/** Slugs for every published post - used by generateStaticParams. */
export async function getAllPostSlugs() {
    const posts = await fetchAllPosts(POST_SLUGS_QUERY);
    return posts.map((post) => post.slug).filter(Boolean);
}

/** Every post in the Side-Track category, newest first. */
export function getSideTrackPosts() {
    return fetchAllPosts(SIDETRACK_POSTS_QUERY);
}
