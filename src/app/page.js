import Navbar from "../components/Navbar";
import styles from "./page.module.css";
import { SpeedInsights } from "@vercel/speed-insights/next"
import Hero from "../components/Hero";
import RankedView from "../components/RankedView";
import { GRAPHQL_ENDPOINT, POSTS_LIST_QUERY } from '../config/graphql';

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
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      console.error('GraphQL Errors:', result.errors);
      return [];
    }

    return result.data?.posts?.nodes || [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export default async function Home() {
  const posts = await getPosts();

  return (
    <div className={styles.container}>
      <SpeedInsights />
      <Navbar />
      <Hero />
      <RankedView posts={posts} />
    </div>
  );
}