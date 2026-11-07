import Link from 'next/link';
import Hero from '../components/Hero';
import RankedView from '../components/RankedView';
import BlogCard from '../components/BlogCard';
import PanelVisual from '../components/site/PanelVisual';
import Reveal from '../components/site/Reveal';
import StatCounter from '../components/site/StatCounter';
import Terminal from '../components/Terminal';
import GitHubCard from '../components/GitHubCard';
import LinkedInCard from '../components/LinkedInCard';
import HabiticaCard from '../components/HabiticaCard';
import { PixelArrow, PixelMark } from '../components/site/PixelMark';
import { getAllPosts } from '../lib/wordpress';
import { calculateAverageScore } from '../utils/scores';
import styles from './page.module.css';

const TOOLBELT = [
  { name: 'Next.js', note: 'The frame' },
  { name: 'React', note: 'The surface' },
  { name: 'D3', note: 'The charts' },
  { name: 'Three.js', note: 'The depth' },
  { name: 'Supabase', note: 'The state' },
  { name: 'Python', note: 'The agents' },
];

const NODES = [
  ['01', 'Essays'],
  ['02', 'Ranked reviews'],
  ['03', 'Agentic AI'],
  ['04', 'D3 charts'],
  ['05', 'Three.js'],
  ['06', 'Native apps'],
  ['07', 'Data pipelines'],
  ['08', 'Build notes'],
];

const FEATURES = [
  {
    index: '01',
    kicker: 'The lab',
    title: 'Small software, sharp edges.',
    body: 'Agents that apply to jobs, dashboards that take your attention seriously, charts that argue with the headline. Each project ships with the reasoning attached.',
    href: '/projects',
    cta: 'Browse all projects',
    scene: 'lab',
    points: ['Auto-Apply', 'Greatness', 'Side-Track'],
  },
  {
    index: '02',
    kicker: 'The writing',
    title: 'Reviews with a point of view.',
    body: 'A decade of films, series, books, anime, and manga, graded on fixed criteria so the ranking means something a year later. Plus notes from whatever I am building.',
    href: '/blog',
    cta: 'Read the blog',
    scene: 'write',
    points: ['Essays', 'Ranked reviews', 'Build logs'],
  },
  {
    index: '03',
    kicker: 'The rankings',
    title: 'One score. Every category.',
    body: 'Every review is scored against the same rubric — story, character, script, direction, sound — and sorted into a leaderboard you can actually argue with.',
    href: '/blog/ranked',
    cta: 'Open the rankings',
    scene: 'rank',
    points: ['Anime', 'Movies & TV', 'Books & manga'],
  },
];

const PREVIEW_PROJECTS = [
  { title: 'Auto-Apply', href: '/projects/auto-apply', tag: 'Agent', scene: 'lab', tint: 'green' },
  { title: 'Greatness', href: '/projects/greatness', tag: 'Data app', scene: 'data', tint: 'mint' },
  { title: 'YouTube Scholar', href: '/projects/youtube-scholar', tag: 'Visualisation', scene: 'write', tint: 'blue' },
  { title: 'Time Management', href: '/projects/time-management', tag: 'Dashboard', scene: 'rank', tint: 'yellow' },
];

const DEEPER = [
  { index: '01', title: 'Blog', href: '/blog', desc: 'Essays, reviews, and things learned the hard way.' },
  { index: '02', title: 'Projects', href: '/projects', desc: 'The full index of shipped and half-shipped ideas.' },
  { index: '03', title: 'Docs', href: '/docs', desc: 'How this site and its data pipelines are put together.' },
  { index: '04', title: 'About', href: '/about', desc: 'Why any of this exists, and who is behind it.' },
];

function scoreOf(post) {
  return calculateAverageScore(post);
}

export const metadata = {
  title: 'Explosion.fun — A lab for things worth making',
  description:
    'Reuben Roy’s playground of essays, ranked reviews, data visualisations, and small software with strong opinions.',
  alternates: { canonical: '/' },
};

export default async function Home() {
  const posts = await getAllPosts();
  const latest = posts.slice(0, 3);
  const reviewCount = posts.filter((post) => Boolean(scoreOf(post))).length;

  return (
    <div className={`${styles.home} ef-page-in`}>
      <Hero />

      <section className="ef-section ef-section--tight" aria-label="Tools behind the site">
        <div className="ef-container">
          <div className={`ef-grid ef-grid--3 ${styles.toolbelt}`}>
            {TOOLBELT.map((tool) => (
              <div key={tool.name} className={styles.tool}>
                <span className={styles.toolName}>{tool.name}</span>
                <span className="ef-mono">{tool.note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ef-section">
        <div className="ef-container">
          <Reveal className={styles.manifesto}>
            <p className="ef-eyebrow">Why this exists</p>
            <h2 className="ef-h1">
              No algorithm. No feed.
              <br />
              Just things worth making.
            </h2>
            <p className="ef-lede">
              explosion.fun started as a way to rank everything I watched without
              forgetting why. It turned into a place to publish the experiments,
              arguments, and small tools that followed.
            </p>
          </Reveal>

          <Reveal className={styles.nodeField} delay={120}>
            <div className={styles.nodeLines} aria-hidden="true" />
            {NODES.map(([index, label], position) => (
              <span
                key={label}
                className={`${styles.node} ${position % 4 === 1 || position % 4 === 2 ? styles.nodeTint : ''}`}
              >
                <span className={styles.nodeIndex}>{index}</span>
                {label}
              </span>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="ef-section ef-section--flush" aria-label="What is on the site">
        <div className="ef-container">
          {FEATURES.map((feature) => (
            <div key={feature.index} className={styles.featureRow}>
              <Reveal className={styles.featureCopy}>
                <span className="ef-eyebrow">
                  {feature.index} — {feature.kicker}
                </span>
                <h2 className="ef-h1">{feature.title}</h2>
                <p className="ef-body">{feature.body}</p>
                <Link href={feature.href} className="ef-btn ef-btn--primary">
                  {feature.cta} <PixelArrow size={17} />
                </Link>
                <ul className={styles.points}>
                  {feature.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </Reveal>
              <Reveal className={styles.featureVisual} delay={100} variant="scale">
                <Link href={feature.href} className={`${styles.visualLink} ef-media`} aria-label={feature.cta}>
                  <PanelVisual scene={feature.scene} />
                  <span className={styles.visualCorner}>
                    <PixelArrow size={16} />
                  </span>
                </Link>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      <section className="ef-section ef-section--tight" aria-label="Site numbers">
        <div className="ef-container">
          <div className={`ef-grid ef-grid--4 ${styles.stats}`}>
            <StatCounter value="12" label="Projects in the index" />
            <StatCounter value="5" label="Years of ranking things" />
            <StatCounter value={`${posts.length}`} label="Posts published" />
            <StatCounter value={`${reviewCount || posts.length}`} label="Scored reviews" />
          </div>
        </div>
      </section>

      <section className="ef-section">
        <div className="ef-container">
          <div className="ef-between">
            <Reveal>
              <p className="ef-eyebrow">Recently written</p>
              <h2 className="ef-h1">The latest from the desk.</h2>
            </Reveal>
            <Reveal delay={80}>
              <Link href="/blog" className="ef-link-arrow">
                All posts <PixelArrow size={17} />
              </Link>
            </Reveal>
          </div>

          {latest.length > 0 ? (
            <div className={`${styles.postGrid} ef-mt-4`}>
              {latest.map((post, index) => (
                <Reveal key={post.slug} delay={index * 70}>
                  <BlogCard post={post} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className={`ef-card ef-mt-4 ${styles.empty}`}>
              <PixelMark size={32} />
              <h3 className="ef-h3">The blog is between posts.</h3>
              <p className="ef-body">Browse the ranked archive while the next one is being written.</p>
              <Link href="/blog/ranked" className="ef-btn">
                Open the rankings <PixelArrow size={16} />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="ef-section ef-section--tight" aria-label="Featured projects">
        <div className="ef-container">
          <div className="ef-between">
            <Reveal>
              <p className="ef-eyebrow">Selected work</p>
              <h2 className="ef-h1">Built to be poked at.</h2>
            </Reveal>
            <Reveal delay={80}>
              <Link href="/projects" className="ef-link-arrow">
                Every project <PixelArrow size={17} />
              </Link>
            </Reveal>
          </div>

          <div className={`${styles.projectGrid} ef-mt-4`}>
            {PREVIEW_PROJECTS.map((project, index) => (
              <Reveal key={project.href} delay={index * 60}>
                <Link href={project.href} className={styles.projectCard}>
                  <div className={styles.projectTitleRow}>
                    <span className="ef-mono">{project.tag}</span>
                    <PixelArrow size={16} />
                  </div>
                  <h3 className="ef-h3">{project.title}</h3>
                  <div className={styles.projectVisual}>
                    <PanelVisual scene={project.scene} />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="ef-section" aria-label="Ranked reviews">
        <div className="ef-container">
          <div className="ef-between">
            <Reveal>
              <p className="ef-eyebrow">The leaderboard</p>
              <h2 className="ef-h1">Everything, ranked.</h2>
            </Reveal>
            <Reveal delay={80}>
              <Link href="/blog/ranked" className="ef-link-arrow">
                Full rankings <PixelArrow size={17} />
              </Link>
            </Reveal>
          </div>
          <Reveal className="ef-mt-4">
            <RankedView posts={posts} limit={5} />
          </Reveal>
        </div>
      </section>

      <section className="ef-section ef-section--tight" aria-label="Live signals">
        <div className="ef-container">
          <div className="ef-between">
            <Reveal>
              <p className="ef-eyebrow">Live signals</p>
              <h2 className="ef-h2">What I am up to.</h2>
            </Reveal>
            <p className="ef-small" style={{ maxWidth: '38ch' }}>
              Small, live reads from the places I actually keep up with — no dashboard, no metrics theatre.
            </p>
          </div>
          <div className={`${styles.signalGrid} ef-mt-4`}>
            <div className={styles.signalStack}>
              <LinkedInCard />
              <GitHubCard />
            </div>
            <HabiticaCard />
            <div className={styles.spotify}>
              <div className={styles.spotifyHeader}>
                <span className="ef-mono">Now playing</span>
                <span className="ef-dot ef-dot--live" />
              </div>
              <iframe
                title="Spotify playlist"
                src="https://open.spotify.com/embed/playlist/7argnm9cuFJWo9txW9OzlD?utm_source=generator&theme=0"
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className={styles.spotifyFrame}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="ef-section ef-section--dark" aria-label="Terminal">
        <div className="ef-container">
          <div className={styles.terminalGrid}>
            <Reveal>
              <p className="ef-eyebrow">Try it yourself</p>
              <h2 className="ef-h1">Poke around the terminal.</h2>
              <p className="ef-lede">
                A real shell, sort of. Type <code className="ef-code-inline">help</code> to see
                the map, <code className="ef-code-inline">ls</code> to list the site, or jump
                straight to a project with <code className="ef-code-inline">cd blog</code>.
              </p>
              <div className={styles.terminalHints}>
                <span className="ef-tag ef-tag--dark">help</span>
                <span className="ef-tag ef-tag--dark">ls</span>
                <span className="ef-tag ef-tag--dark">cd projects</span>
                <span className="ef-tag ef-tag--dark">whoami</span>
              </div>
            </Reveal>
            <Reveal delay={100} variant="scale">
              <Terminal />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="ef-section" aria-label="Go deeper">
        <div className="ef-container">
          <Reveal>
            <p className="ef-eyebrow">Go deeper</p>
            <h2 className="ef-h1">The rest of the site.</h2>
          </Reveal>
          <div className={`ef-grid ef-grid--4 ef-mt-4 ${styles.deeper}`}>
            {DEEPER.map((item, index) => (
              <Reveal key={item.href} delay={index * 60}>
                <Link href={item.href} className={styles.deeperCard}>
                  <span className={styles.deeperIndex}>{item.index}</span>
                  <h3 className="ef-h3">{item.title}</h3>
                  <p className="ef-card__body">{item.desc}</p>
                  <span className={styles.deeperArrow}>
                    <PixelArrow size={17} />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
