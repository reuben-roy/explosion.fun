import PageHero from '@/components/site/PageHero';
import { getSideTrackPosts } from '@/lib/wordpress';
import ChangelogList from '@/components/ChangelogList';

export const metadata = {
  title: 'Changelog | Side-Track',
  description: 'Release notes and changelog for Side-Track app.',
};

export default async function ChangelogPage() {
  const posts = await getSideTrackPosts();

  return (
    <div className="ef-page-in">
      <PageHero
        eyebrow="Side-Track"
        title="Changelog"
        description="Release notes and updates, newest first. Every fix, tweak, and questionable design decision, written down."
        art="grid"
        compact
        meta={
          <span>
            <strong>{posts.length}</strong> releases on file
          </span>
        }
      />

      <section className="ef-section">
        <div className="ef-wrap">
          <ChangelogList posts={posts} />
        </div>
      </section>
    </div>
  );
}
