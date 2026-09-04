import Navbar from "../components/Navbar";
import styles from "./page.module.css";
import { SpeedInsights } from "@vercel/speed-insights/next"
import Hero from "../components/Hero";
import RankedView from "../components/RankedView";
import { getAllPosts } from '../lib/wordpress';

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <div className={styles.container}>
      <SpeedInsights />
      <Navbar />
      <Hero />
      <RankedView posts={posts} />
    </div>
  );
}