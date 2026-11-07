import Link from 'next/link';
import PageHero from '@/components/site/PageHero';
import Reveal from '@/components/site/Reveal';
import { PixelArrow, PixelMark } from '@/components/site/PixelMark';
import styles from './about.module.css';

export const metadata = {
  title: 'About',
  description:
    'Why explosion.fun exists: a review system with fixed criteria, a project lab, and a place to publish the working-out.',
};

const NOW = [
  ['Building', 'Auto-Apply — an agent that applies to jobs unattended'],
  ['Writing', 'Ranked reviews and build notes, whenever a thing deserves one'],
  ['Reading', 'Whatever is on the shelf, plus a dangerous number of browser tabs'],
  ['Based in', 'The internet, most likely near a terminal'],
];

const PRINCIPLES = [
  {
    index: '01',
    title: 'Fixed rubrics beat vibes',
    body: 'A score is only useful if it survives the mood that produced it. Every review is graded against the same named criteria, and the score stays put unless a rewatch earns a change.',
  },
  {
    index: '02',
    title: 'Show the working',
    body: 'Charts carry their source. Agents carry their failure modes. Essays say what changed my mind. The interesting part is rarely the conclusion — it is the machinery under it.',
  },
  {
    index: '03',
    title: 'Ship small, publish early',
    body: 'This is a lab, not a launchpad. Projects are allowed to be unfinished, odd, or useful to exactly one person. Writing them down is part of finishing them.',
  },
];

export default function AboutPage() {
  return (
    <div className="ef-page-in">
      <PageHero
        eyebrow="About"
        title={
          <>
            A small site about
            <br />
            paying attention.
          </>
        }
        description="explosion.fun is part review archive, part project lab, and part public notebook. It exists because memory is unreliable and because making things is more fun when you show your work."
        actions={
          <>
            <a href="mailto:hello@explosion.fun" className="ef-btn ef-btn--primary">
              Say hello <PixelArrow size={17} />
            </a>
            <Link href="/projects" className="ef-btn">
              See the work <PixelArrow size={17} />
            </Link>
          </>
        }
        aside={
          <div className={styles.profileCard}>
            <div className={styles.profileTop}>
              <PixelMark size={44} />
              <span className="ef-tag">
                <span className="ef-dot ef-dot--live" /> Open to good ideas
              </span>
            </div>
            <div className={styles.profileRows}>
              <div>
                <span className="ef-mono">Made by</span>
                <strong>Reuben Roy</strong>
              </div>
              <div>
                <span className="ef-mono">Role</span>
                <strong>Engineer / writer</strong>
              </div>
              <div>
                <span className="ef-mono">Since</span>
                <strong>2020</strong>
              </div>
              <div>
                <span className="ef-mono">Status</span>
                <strong>Building in public</strong>
              </div>
            </div>
          </div>
        }
      />

      <section className="ef-section">
        <div className="ef-container">
          <div className={styles.origin}>
            <Reveal className={styles.originQuote}>
              <p className="ef-eyebrow">The origin</p>
              <blockquote className="ef-h2">
                “I randomly decided to rank every piece of media I consumed.”
              </blockquote>
              <span className="ef-mono">Lockdown, sometime in 2020</span>
            </Reveal>
            <Reveal className="ef-prose" delay={100}>
              <p>
                It started during the Covid-19 lockdowns. There wasn&apos;t a grand plan — I
                just enjoyed debating why Series A was better than Series B. Over time the
                list became hard to maintain. I found myself ranking new shows on fleeting
                feelings rather than consistent criteria. My memory faded, and I could not
                recall why I had placed a series so high a year prior.
              </p>
              <p>
                I needed a better system, one that did not rely on fickle emotions. That is why
                I built <strong>explosion.fun</strong>: a review and ranking site where every
                piece of media is graded against set parameters. Once a score is set, it stays —
                unless a significant rewatch warrants a change. That constraint makes objective
                comparisons possible, even when the final ranking does not match my immediate
                gut.
              </p>
              <p>
                The site is also a creative playground: a place to build data toys, experiments,
                and small software, and to write down what I learn while making them.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="ef-section">
        <div className="ef-container">
          <Reveal>
            <p className="ef-eyebrow">What lives here</p>
            <h2 className="ef-h1">Four kinds of curiosity.</h2>
          </Reveal>
          <div className={`${styles.livingGrid} ef-mt-4`}>
            {[
              ['Ranked reviews', 'Films, series, books, anime, and manga — scored on the same rubric, sorted into a leaderboard.'],
              ['Data toys', 'Interactive charts built from personal data and public datasets. Sources attached, assumptions visible.'],
              ['Build notes', 'How things work, what broke, and the decisions that seemed clever at the time.'],
              ['Experiments', 'Small software, 3D scenes, and web odds and ends that exist because they were fun to make.'],
            ].map(([title, body], index) => (
              <Reveal key={title} delay={index * 60}>
                <div className={styles.livingCard}>
                  <span className={styles.livingIndex}>{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="ef-h3">{title}</h3>
                  <p className="ef-card__body">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="ef-section">
        <div className="ef-container">
          <Reveal>
            <p className="ef-eyebrow">How I work</p>
            <h2 className="ef-h1">Three rules, loosely held.</h2>
          </Reveal>
          <div className={`${styles.principles} ef-mt-4`}>
            {PRINCIPLES.map((principle, index) => (
              <Reveal key={principle.index} delay={index * 70}>
                <div className={styles.principle}>
                  <span className={styles.principleIndex}>{principle.index}</span>
                  <div>
                    <h3 className="ef-h3">{principle.title}</h3>
                    <p className="ef-body">{principle.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="ef-section ef-section--dark">
        <div className="ef-container">
          <div className={styles.nowGrid}>
            <Reveal>
              <p className="ef-eyebrow">Now</p>
              <h2 className="ef-h1">What is on the bench.</h2>
              <p className="ef-lede">
                A rough snapshot, updated when something changes. No streaks, no public
                productivity score.
              </p>
            </Reveal>
            <Reveal delay={80} className={styles.nowList}>
              {NOW.map(([label, value]) => (
                <div key={label} className={styles.nowRow}>
                  <span className="ef-mono">{label}</span>
                  <span>{value}</span>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      <section className="ef-section ef-section--tight">
        <div className="ef-container ef-row" style={{ justifyContent: 'space-between' }}>
          <p className="ef-h3">Built by Reuben Roy. Suggestions welcome.</p>
          <div className="ef-row">
            <a href="mailto:hello@explosion.fun" className="ef-btn ef-btn--primary">
              Email me <PixelArrow size={17} />
            </a>
            <Link href="/cv" className="ef-btn">
              View CV
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
