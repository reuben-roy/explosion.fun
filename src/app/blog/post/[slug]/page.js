import Link from 'next/link';
import styles from './post.module.css';
import { GRAPHQL_ENDPOINT, getPostQueryByCategory } from '../../../../config/graphql';
import { getAllPostSlugs } from '../../../../lib/wordpress';
import { calculateAverageScore } from '../../../../utils/scores';
import RatingLegend from '../../../../components/RatingLegend';
import { REVIEW_CATEGORIES } from '../../../../utils/reviewCategories';
import { PixelArrow } from '../../../../components/site/PixelMark';

// Generate static params for all posts
export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();

  console.log(`Generated ${slugs.length} static params`);

  return slugs.map((slug) => ({ slug }));
}

function isPostInCategory(post, categorySlug) {
  return post.categories.nodes.some((category) => category.slug === categorySlug);
}

// Every review category shares the same rendering shape: a list of named
// criteria mapped onto the GraphQL field names, plus optional age flag.
const SCORE_SETS = [
  {
    category: 'anime',
    key: 'anime',
    fields: [
      ['Story', 'story'],
      ['Character Development', 'characterDevelopment'],
      ['Script', 'script'],
      ['Direction', 'direction'],
      ['Sound', 'sound'],
      ['Other', 'other'],
    ],
    ageRestricted: true,
  },
  {
    category: 'manga',
    key: 'mangacomics',
    fields: [
      ['Art', 'art'],
      ['Character Development', 'characterDevelopment'],
      ['Script', 'script'],
      ['Emotional Impact', 'emotionalImpact'],
      ['Meaning', 'meaning'],
      ['Originality', 'originality'],
      ['Other', 'other'],
    ],
    ageRestricted: true,
  },
  {
    category: 'movies',
    key: 'movies',
    fields: [
      ['Story', 'storyTelling'],
      ['Character Development', 'characterDevelopment'],
      ['Script', 'script'],
      ['Direction', 'direction'],
      ['Sound', 'sound'],
      ['Other', 'other'],
    ],
    ageRestricted: true,
  },
  {
    category: 'tv-series',
    key: 'tvseries',
    fields: [
      ['Story', 'story'],
      ['Character Development', 'characterDevelopment'],
      ['Script', 'script'],
      ['Direction', 'direction'],
      ['Sound', 'sound'],
      ['Other', 'other'],
    ],
    ageRestricted: true,
  },
  {
    category: 'books-fiction',
    key: 'booksfiction',
    fields: [
      ['Story', 'story'],
      ['Character Development', 'characterDevelopment'],
      ['Writing', 'writing'],
      ['World Building', 'worldBuilding'],
      ['Emotional Impact', 'emotionalImpact'],
      ['Other', 'other'],
    ],
    ageRestricted: false,
  },
  {
    category: 'books-non-fiction',
    key: 'booksnonfiction',
    fields: [
      ['Content Quality', 'contentQuality'],
      ['Research', 'research'],
      ['Writing', 'writing'],
      ['Real World Impact', 'realWorldImpact'],
      ['Other', 'other'],
    ],
    ageRestricted: false,
  },
];

const scoreTone = (score) => {
  if (score >= 9) return 'var(--ef-green)';
  if (score >= 7.5) return 'var(--ef-yellow)';
  if (score >= 6) return 'var(--ef-tangerine)';
  return 'var(--ef-orange)';
};

function ScoreBreakdown({ post }) {
  const sets = SCORE_SETS.filter(
    (set) => isPostInCategory(post, set.category) && post[set.key]
  );

  if (sets.length === 0) return null;

  return (
    <section className={styles.breakdown} aria-labelledby="score-breakdown">
      <div className={styles.breakdownHead}>
        <h2 id="score-breakdown" className={styles.sectionTitle}>
          Detailed scores
        </h2>
        <span className={styles.sectionNote}>Fixed rubric · 1–10</span>
      </div>

      {sets.map((set) => {
        const data = post[set.key];
        const fields = set.fields.filter(([, field]) => data[field] != null);

        return (
          <div key={set.key} className={styles.scoreList}>
            {fields.map(([label, field]) => {
              const value = Number(data[field]);
              return (
                <div key={field} className={styles.scoreRow}>
                  <span className={styles.scoreLabel}>{label}</span>
                  <span className={styles.scoreTrack} aria-hidden="true">
                    <span
                      className={styles.scoreFill}
                      style={{
                        width: `${Math.max(0, Math.min(100, value * 10))}%`,
                        background: scoreTone(value),
                      }}
                    />
                  </span>
                  <span className={styles.scoreNumber}>
                    {data[field]}
                    <span className={styles.scoreOutOf}>/10</span>
                  </span>
                </div>
              );
            })}
            {set.ageRestricted && data.ageRestricted && (
              <div className={styles.ageFlag}>
                <span className={styles.ageBadge}>Age restricted</span>
                <span className={styles.ageNote}>Contains mature content</span>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}

// Server component for the blog post
export default async function BlogPost({ params }) {
  const { slug } = await params;

  try {
    // First, get the post's category
    const categoryResponse = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
                    query GetPostCategory($slug: ID!) {
                        post(id: $slug, idType: SLUG) {
                            categories {
                                nodes {
                                    name
                                }
                            }
                        }
                    }
                `,
        variables: { slug },
      }),
    });

    const categoryResult = await categoryResponse.json();
    const primaryCategory =
      categoryResult.data?.post?.categories?.nodes?.find((category) =>
        REVIEW_CATEGORIES.includes(category.name)
      )?.name || '';

    const isReviewCategory = REVIEW_CATEGORIES.includes(primaryCategory);

    // Get the appropriate query for the category
    const postQuery = getPostQueryByCategory(primaryCategory);

    // Fetch the full post data
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: postQuery,
        variables: { slug },
      }),
      next: { revalidate: 3600 }, // Cache for 1 hour (ISR)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    const { data } = result;

    if (!data || !data.post) {
      throw new Error('Post not found');
    }

    // Ensure averageScore is either a finite number or null
    const avg = calculateAverageScore(data.post);
    const post = {
      ...data.post,
      averageScore: Number.isFinite(avg) ? avg : null,
    };

    const hasImage = Boolean(post.featuredImage?.node?.sourceUrl);
    const author = [post.author?.node?.firstName, post.author?.node?.lastName]
      .filter(Boolean)
      .join(' ') || 'Anonymous';

    return (
      <div className={styles.page}>
        <header className={styles.hero}>
          <div className="ef-wrap">
            <div className={styles.eyebrowRow}>
              {post.categories.nodes.map((category, index) => (
                <span key={index} className={styles.chip}>
                  {category.name}
                </span>
              ))}
              {isReviewCategory && (
                <span className={`${styles.chip} ${styles.chipScore}`}>
                  Score{' '}
                  {Number.isFinite(post.averageScore)
                    ? post.averageScore.toFixed(1)
                    : 'N/A'}
                </span>
              )}
            </div>

            <h1 className={styles.title}>{post.title}</h1>

            <div className={styles.heroMeta}>
              <span>
                <span className={styles.metaLabel}>Published</span>
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span>
                <span className={styles.metaLabel}>By</span>
                {author}
              </span>
              {isReviewCategory && (
                <span>
                  <span className={styles.metaLabel}>Verdict</span>
                  {Number.isFinite(post.averageScore)
                    ? `${post.averageScore.toFixed(1)} / 10`
                    : 'Not scored'}
                </span>
              )}
            </div>
          </div>
        </header>

        {hasImage && (
          <figure className={styles.imageBand}>
            <img
              src={post.featuredImage.node.sourceUrl}
              alt={post.featuredImage.node.altText || post.title}
              className={styles.image}
            />
          </figure>
        )}

        <div className={`ef-wrap ${styles.body}`}>
          <article className={styles.main}>
            {isReviewCategory && Number.isFinite(post.averageScore) && (
              <div className={styles.verdictBanner}>
                <div className={styles.verdictScore}>
                  {post.averageScore.toFixed(1)}
                </div>
                <div className={styles.verdictText}>
                  <p className="ef-eyebrow">Average score</p>
                  <p className={styles.verdictLine}>
                    Graded against the same named criteria as every other review
                    in this category.
                  </p>
                </div>
                <Link href="/blog/ranked" className={styles.verdictLink}>
                  See the leaderboard <PixelArrow size={15} />
                </Link>
              </div>
            )}

            <div
              className={`ef-prose ${styles.prose}`}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {isReviewCategory && <ScoreBreakdown post={post} />}
          </article>

          <aside className={styles.aside}>
            <div className={styles.asideCard}>
              <p className="ef-eyebrow">In this review</p>
              <ul className={styles.asideList}>
                <li>
                  <span>Category</span>
                  <strong>{primaryCategory || 'Uncategorised'}</strong>
                </li>
                <li>
                  <span>Published</span>
                  <strong>
                    {new Date(post.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </strong>
                </li>
                <li>
                  <span>Author</span>
                  <strong>{author}</strong>
                </li>
                <li>
                  <span>Score</span>
                  <strong>
                    {Number.isFinite(post.averageScore)
                      ? `${post.averageScore.toFixed(1)} / 10`
                      : 'N/A'}
                  </strong>
                </li>
              </ul>
              <Link href="/blog" className={styles.asideLink}>
                ← All writing
              </Link>
            </div>

            {isReviewCategory && (
              <div className={styles.asideLegend}>
                <RatingLegend theme="light" />
              </div>
            )}
          </aside>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching post:', error);
    return (
      <div className={styles.errorPage}>
        <p className="ef-eyebrow">Missing page</p>
        <h1 className="ef-display ef-display--sm">This post could not load.</h1>
        <p className={styles.errorText}>{error.message}</p>
        <Link href="/blog" className="ef-btn ef-btn--primary">
          Back to the blog <PixelArrow size={17} />
        </Link>
      </div>
    );
  }
}
