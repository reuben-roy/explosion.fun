export const PRIMARY_NAV = [
  { label: 'Blog', href: '/blog' },
  { label: 'Projects', href: '/projects', mega: true },
  { label: 'Ranked', href: '/blog/ranked', optional: true },
  { label: 'Docs', href: '/docs', optional: true },
  { label: 'About', href: '/about' },
];

export const MEGA_PROJECTS = [
  {
    title: 'Auto-Apply',
    href: '/projects/auto-apply',
    description: 'An agent that applies to jobs unattended, with a confidence gate instead of blind trust.',
    tag: 'Agent',
  },
  {
    title: 'Greatness',
    href: '/projects/greatness',
    description: 'A composite score for intentional attention, built from your own browsing data.',
    tag: 'Data app',
  },
  {
    title: 'YouTube Scholar',
    href: '/projects/youtube-scholar',
    description: 'A curiosity audit of years of watch history, rabbit holes included.',
    tag: 'Visualisation',
  },
  {
    title: 'Time Management',
    href: '/projects/time-management',
    description: '31 days of screen time, dissected into focus, drift, and sleep.',
    tag: 'Dashboard',
  },
  {
    title: 'GitHub Stars',
    href: '/projects/agent-star-growth',
    description: 'Star growth across coding harnesses, with switchable projections.',
    tag: 'Charts',
  },
  {
    title: 'Who Got the Jobs?',
    href: '/projects/employment-by-sex',
    description: 'A decade of BLS employment data, split by women and men.',
    tag: 'Data story',
  },
  {
    title: 'Side-Track',
    href: '/side-track',
    description: 'A lifting tracker for iOS. Changelog, privacy, and support live here.',
    tag: 'iOS',
  },
  {
    title: 'All projects',
    href: '/projects',
    description: 'The complete index — shipped toys, experiments, and open source.',
    tag: 'Index',
  },
];

export const FOOTER_COLUMNS = [
  {
    title: 'Explore',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'Ranked reviews', href: '/blog/ranked' },
      { label: 'Projects', href: '/projects' },
      { label: 'Docs', href: '/docs' },
      { label: 'About', href: '/about' },
      { label: 'CV', href: '/cv' },
    ],
  },
  {
    title: 'Projects',
    links: [
      { label: 'Auto-Apply', href: '/projects/auto-apply' },
      { label: 'Greatness', href: '/projects/greatness' },
      { label: 'YouTube Scholar', href: '/projects/youtube-scholar' },
      { label: 'Time Management', href: '/projects/time-management' },
      { label: 'Side-Track', href: '/side-track' },
    ],
  },
  {
    title: 'Elsewhere',
    links: [
      { label: 'GitHub', href: 'https://github.com/reuben-roy', external: true },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/reuben-roy', external: true },
      { label: 'YouTube', href: 'https://www.youtube.com/@reubenroy', external: true },
      { label: 'Email', href: 'mailto:hello@explosion.fun' },
      { label: 'RSS feed', href: '/feed.xml' },
    ],
  },
];
