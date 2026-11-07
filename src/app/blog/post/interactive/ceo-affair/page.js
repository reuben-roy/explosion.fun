import Link from 'next/link';
import PageHero from '@/components/site/PageHero';
import { PixelArrow } from '@/components/site/PixelMark';

export const metadata = {
  title: 'Interactive experiment | explosion.fun',
  description: 'A scratch space for interactive experiments.',
};

export default function D3Demo() {
  return (
    <div className="ef-page-in">
      <PageHero
        eyebrow="Interactive"
        title="Still in the workshop."
        description="This experiment has not been published yet. It exists in the repo as a sketch, and will get a proper write-up when it earns one."
        art="dots"
        compact
        actions={
          <>
            <Link href="/blog" className="ef-btn ef-btn--primary">
              Back to the blog <PixelArrow size={17} />
            </Link>
            <Link href="/projects" className="ef-btn">
              See finished projects
            </Link>
          </>
        }
      />
    </div>
  );
}
