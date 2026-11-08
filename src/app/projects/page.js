import Link from 'next/link';
import PageHero from '@/components/site/PageHero';
import Reveal from '@/components/site/Reveal';
import PanelVisual from '@/components/site/PanelVisual';
import { PixelArrow } from '@/components/site/PixelMark';
import styles from './projects.module.css';

export const metadata = {
  title: 'Projects',
  description:
    'Reuben Roy’s project index: agentic AI, data visualisations, native apps, and open-source experiments.',
  alternates: { canonical: '/projects' },
};

const FEATURED = [
  {
    title: 'Auto-Apply',
    tag: 'Agentic AI',
    scene: 'lab',
    href: '/projects/auto-apply',
    description:
      'A local-first agent that applies to jobs overnight — and knows when not to. Schema-first forms, trust-ordered answers, a confidence gate, and verified submissions.',
    meta: '~21,700 lines · 724 tests · 4 ATS platforms',
  },
  {
    title: 'Greatness',
    tag: 'Data app',
    scene: 'data',
    href: '/projects/greatness',
    description:
      'Define your own Self-Actualization metrics, upload your browsing data, and get a composite score for intentional attention. Compete on the public leaderboard.',
    meta: 'Composite score · Public leaderboard',
  },
  {
    title: 'YouTube Scholar',
    tag: 'Visualisation',
    scene: 'write',
    href: '/projects/youtube-scholar',
    description:
      'An interactive D3 audit of years of watch history: curiosity velocity, channel loyalty, subscriptions, comments, and the shape of a rabbit hole.',
    meta: 'D3 · Curiosity velocity · Channels',
  },
];

const PROJECTS = [
  {
    title: 'Auto-Explosion',
    description:
      'A personal portfolio and interactive tools hub for data-driven storytelling, with D3 and Three.js visualisations.',
    href: 'https://auto.explosion.fun',
    tag: 'Interactive site',
    external: true,
  },
  {
    title: 'blistering-barnacles',
    description:
      'A real-estate CRM demo with hybrid AI onboarding, FullCalendar scheduling, and a full Learning Hub.',
    href: 'https://lofty.explosion.fun/',
    tag: 'AI CRM',
    external: true,
  },
  {
    title: 'Who Got the Jobs?',
    description:
      'A decade of BLS employment data by sex, unpacking the claim that women accounted for 97.53% of the August 2026 net payroll gain.',
    href: '/projects/employment-by-sex',
    tag: 'Data story',
  },
  {
    title: 'GitHub Stars: Rise of DeepSeek Harness',
    description:
      'Star growth across coding harnesses, switchable projections, and current-star comparisons across 18 repositories.',
    href: '/projects/agent-star-growth',
    tag: 'Charts',
  },
  {
    title: 'Time Management Analysis',
    description:
      'A D3 dashboard over 31 days of screen time — focus fragmentation, distraction gravity, circadian rhythms, and the hidden YouTube habit.',
    href: '/projects/time-management',
    tag: 'Dashboard',
  },
  {
    title: 'Side-Track',
    description:
      'A lifting tracker for iOS with a random workout picker, muscle-specific fatigue tracking, local rankings, and Apple Health integration.',
    href: '/side-track',
    tag: 'iOS app',
  },
  {
    title: 'Clackinator',
    description:
      'A native macOS menu bar utility that plays satisfying mechanical keyboard sounds as you type.',
    href: 'https://github.com/reuben-roy/clackinator',
    tag: 'macOS',
    external: true,
  },
  {
    title: 'Kali',
    description:
      'Landing page and waitlist for Kali — a fitness platform that treats physical progression like version control.',
    href: 'https://github.com/reuben-roy/kali',
    tag: 'Web',
    external: true,
  },
  {
    title: 'Kali Platform',
    description:
      'The mobile engine for Kali: a React Native fitness app with muscle-specific fatigue tracking and local-first data.',
    href: 'https://github.com/reuben-roy/Kali-Platform',
    tag: 'React Native',
    external: true,
  },
  {
    title: 'Ranker',
    description:
      'A career exploration app that maps skills, interests, and traits against a hierarchical job database to surface best-fit roles.',
    href: 'https://github.com/reuben-roy/ranker',
    tag: 'App',
    external: true,
  },
  {
    title: 'Window',
    description:
      'An Android app that watches your screen, scrapes visible UI text, and runs on-device Gemini Nano to summarise digital activity.',
    href: 'https://github.com/reuben-roy/window',
    tag: 'Android',
    external: true,
  },
  {
    title: 'Window Extension',
    description:
      'A Chrome extension that turns the browser into a focus co-pilot, connecting Google Calendar and blocking distractions.',
    href: 'https://github.com/reuben-roy/window-extension',
    tag: 'Extension',
    external: true,
  },
  {
    title: 'Switch Market',
    description:
      'A vanilla-JS shopping demo with D3 visualisations, real-time search, and CSV sales data, hosted on Firebase.',
    href: 'https://github.com/reuben-roy/switch-market',
    tag: 'Web',
    external: true,
  },
  {
    title: 'Job Answer App',
    description:
      'A single-page tool that uses OpenRouter to generate tailored job-application answers from a resume and writing rules.',
    href: 'https://github.com/reuben-roy/job-answer-app',
    tag: 'Tool',
    external: true,
  },
  {
    title: 'reuben-roy',
    description:
      'A self-maintaining GitHub profile — the contribution snake regenerates via Actions and an agent keeps the site, CV, and blog in sync.',
    href: 'https://github.com/reuben-roy/reuben-roy',
    tag: 'Automation',
    external: true,
  },
  {
    title: 'explosion.fun',
    description:
      'The repo behind this site: a Next.js publishing platform, data pipelines, and a static export that deploys anywhere.',
    href: 'https://github.com/reuben-roy/explosion.fun',
    tag: 'This site',
    external: true,
  },
];

export default function ProjectsPage() {
  return (
    <div className="ef-page-in">
      <PageHero
        eyebrow="Project index"
        title={
          <>
            Shipped, half-shipped,
            <br />
            and worth a look.
          </>
        }
        description="Small, sharp software and data toys. Some have a business case. Most have a question they were built to answer."
        meta={
          <>
            <span className="ef-tag">16 projects</span>
            <span className="ef-tag">Agents · data · native apps</span>
            <span className="ef-tag">All source on GitHub</span>
          </>
        }
        actions={
          <a href="https://github.com/reuben-roy" target="_blank" rel="noopener noreferrer" className="ef-btn ef-btn--primary">
            GitHub profile <PixelArrow size={17} />
          </a>
        }
      />

      <section className="ef-section">
        <div className="ef-container">
          <Reveal>
            <p className="ef-eyebrow">Selected work</p>
            <h2 className="ef-h1">Three worth starting with.</h2>
          </Reveal>

          <div className={`${styles.featuredGrid} ef-mt-4`}>
            {FEATURED.map((project, index) => (
              <Reveal key={project.href} delay={index * 70}>
                <Link href={project.href} className={styles.featuredCard}>
                  <div className={styles.featuredVisual}>
                    <PanelVisual scene={project.scene} />
                  </div>
                  <div className={styles.featuredBody}>
                    <div className={styles.featuredTop}>
                      <span className="ef-tag">{project.tag}</span>
                      <PixelArrow size={17} />
                    </div>
                    <h3 className="ef-h2">{project.title}</h3>
                    <p className="ef-body">{project.description}</p>
                    <span className="ef-mono">{project.meta}</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="ef-section">
        <div className="ef-container">
          <div className="ef-between">
            <Reveal>
              <p className="ef-eyebrow">The drawer</p>
              <h2 className="ef-h1">Everything else.</h2>
            </Reveal>
            <p className="ef-small" style={{ maxWidth: '34ch' }}>
              Open-source experiments, older builds, and things kept around because they still
              do something useful.
            </p>
          </div>

          <div className={`${styles.projectGrid} ef-mt-4`}>
            {PROJECTS.map((project, index) => {
              const inner = (
                <>
                  <div className={styles.projectTop}>
                    <span className="ef-mono">{String(index + 1).padStart(2, '0')} / {project.tag}</span>
                    <PixelArrow size={16} />
                  </div>
                  <h3 className="ef-h3">{project.title}</h3>
                  <p className="ef-card__body">{project.description}</p>
                  <span className={styles.projectLink}>
                    {project.external ? 'View repository' : 'Open project'}
                    {project.external ? ' ↗' : ''}
                  </span>
                </>
              );

              return (
                <Reveal key={project.title} delay={(index % 3) * 50}>
                  {project.external ? (
                    <a href={project.href} target="_blank" rel="noopener noreferrer" className={styles.projectCard}>
                      {inner}
                    </a>
                  ) : (
                    <Link href={project.href} className={styles.projectCard}>
                      {inner}
                    </Link>
                  )}
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="ef-section ef-section--dark">
        <div className="ef-container ef-row" style={{ justifyContent: 'space-between' }}>
          <div>
            <p className="ef-eyebrow">Have a brief?</p>
            <h2 className="ef-h2" style={{ marginTop: '0.6rem' }}>
              I like problems with a sharp edge.
            </h2>
          </div>
          <a href="mailto:hello@explosion.fun" className="ef-btn ef-btn--invert">
            Start a conversation <PixelArrow size={17} />
          </a>
        </div>
      </section>
    </div>
  );
}
