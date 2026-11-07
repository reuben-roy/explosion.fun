import Link from 'next/link';
import BlogContent from '../../components/BlogContent';
import PageHero from '@/components/site/PageHero';
import { PixelArrow } from '@/components/site/PixelMark';
import { getAllPosts } from '../../lib/wordpress';
import { CATEGORIES } from '../../utils/categories.js';
import fs from 'fs';
import path from 'path';

export const metadata = {
  title: 'Blog',
  description:
    'Thoughts, reviews, and build notes about technology, development, and other garbage.',
};

// Gather interactive local pages and treat them like posts
async function getInteractivePosts() {
  const root = path.join(process.cwd(), 'src', 'app', 'blog', 'post', 'interactive');
  let dirs = [];
  try {
    dirs = await fs.promises.readdir(root, { withFileTypes: true });
  } catch {
    return [];
  }

  // Map of slug -> metadata (extend here when adding more interactive pages)
  const META = {
    'solar-system': {
      title: 'Interactive 3D Solar System',
      excerpt: 'Explore an accelerated Three.js model of the solar system.',
    },
    'bird-migration': {
      title: 'Flight of the Storks',
      excerpt:
        'An interactive visualization tracking the epic 4,000km migration of three white storks from the Netherlands to West Africa.',
    },
  };

  const results = [];
  for (const dirent of dirs) {
    if (!dirent.isDirectory()) continue;
    const slug = dirent.name;
    if (!META[slug]) continue;
    const pageFile = path.join(root, slug, 'page.js');
    try {
      const stat = await fs.promises.stat(pageFile);
      const modified = stat.mtime.toISOString();
      results.push({
        // Mimic WP post shape minimally
        id: `interactive-${slug}`,
        slug: `interactive/${slug}`, // so /blog/post/${slug} => /blog/post/interactive/solar-system
        title: META[slug].title,
        excerpt: META[slug].excerpt,
        date: modified,
        modified,
        categories: { nodes: [{ name: 'Interactive' }] },
      });
    } catch {
      continue;
    }
  }
  return results;
}

export default async function Blog() {
  const [wpPosts, interactivePosts] = await Promise.all([
    getAllPosts(),
    getInteractivePosts(),
  ]);

  // Filter out Side-Track posts
  const filteredWpPosts = wpPosts.filter(
    (post) => !post.categories?.nodes?.some((cat) => cat.name === 'Side-Track')
  );

  // Combine & sort by modified / date desc
  const allPosts = [...filteredWpPosts, ...interactivePosts].sort(
    (a, b) => new Date(b.modified || b.date) - new Date(a.modified || a.date)
  );

  // Ensure Interactive category considered even if not in original CATEGORIES
  const categoriesList = Array.from(new Set([...CATEGORIES, 'Interactive']));

  // Group posts by category
  const postsByCategory = categoriesList.reduce((acc, category) => {
    const categoryPosts = allPosts.filter((post) =>
      post.categories?.nodes?.some((cat) => cat.name === category)
    );
    if (categoryPosts.length > 0) {
      acc.push({ title: category, posts: categoryPosts });
    }
    return acc;
  }, []);

  return (
    <div className="ef-page-in">
      <PageHero
        eyebrow="Writing"
        title={
          <>
            Notes from
            <br />
            the lab.
          </>
        }
        description="Thoughts, reviews, and build notes about technology, development, and other garbage — written down before the details evaporate."
        art="bars"
        meta={
          <>
            <span>
              <strong>{allPosts.length}</strong> articles
            </span>
            <span>
              <strong>{postsByCategory.length}</strong> categories
            </span>
            <span>
              <strong>Weekly-ish</strong> cadence
            </span>
          </>
        }
        actions={
          <Link href="/blog/ranked" className="ef-btn ef-btn--primary">
            See the ranked reviews <PixelArrow size={17} />
          </Link>
        }
      />

      <BlogContent allPosts={allPosts} postsByCategory={postsByCategory} />
    </div>
  );
}
