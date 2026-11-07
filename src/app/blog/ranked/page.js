import Link from 'next/link';
import PageHero from '@/components/site/PageHero';
import RatingLegend from '@/components/RatingLegend';
import RankedList from '@/components/RankedList';
import { PixelArrow } from '@/components/site/PixelMark';
import { getAllPosts } from '@/lib/wordpress';
import { calculateAverageScore } from '@/utils/scores';

async function getRankedPosts() {
  const posts = await getAllPosts();

  return posts.map((post) => ({
    ...post,
    averageScore: calculateAverageScore(post),
  }));
}

export const metadata = {
  title: 'Ranked Reviews | Explosion.fun',
  description:
    'Browse all ranked reviews by category — Anime, Movies, TV Series, Books, and Manga.',
};

export default async function RankedPage() {
  const posts = await getRankedPosts();
  const scored = posts.filter((post) => post.averageScore !== null);
  const top = scored.reduce(
    (best, post) => (post.averageScore > (best?.averageScore ?? 0) ? post : best),
    null
  );

  return (
    <div className="ef-page-in">
      <PageHero
        eyebrow="Ranked"
        title={
          <>
            Everything,
            <br />
            by the numbers.
          </>
        }
        description="Every rated experience on the site, sorted by score within its category. The rubric is fixed, so the order means something."
        art="bars"
        meta={
          <>
            <span>
              <strong>{scored.length}</strong> scored reviews
            </span>
            <span>
              Highest: <strong>{top ? top.averageScore.toFixed(1) : '—'}</strong>
            </span>
            <span>
              Scale <strong>1–10</strong>
            </span>
          </>
        }
        actions={
          <Link href="/blog" className="ef-btn">
            Browse all writing <PixelArrow size={17} />
          </Link>
        }
      />

      <section className="ef-section">
        <div className="ef-wrap">
          <RatingLegend className="ef-legend" theme="light" />
          <div style={{ marginTop: 'clamp(2rem, 4vw, 3rem)' }}>
            <RankedList posts={posts} />
          </div>
        </div>
      </section>
    </div>
  );
}
