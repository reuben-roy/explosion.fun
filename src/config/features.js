// Shared list of the site's non-career features.
// Consumed by both the interactive Terminal (`ls`/command navigation) and the
// clickable feature-card grid on the home page, so the two never drift apart.
export const FEATURES = [
  {
    command: 'blog',
    title: 'Blog',
    path: '/blog',
    description: 'Ranked reviews of anime, manga, games, books & more.',
  },
  {
    command: 'greatness',
    title: 'Greatness',
    path: '/projects/greatness',
    description: 'Score how intentionally you actually spend your time.',
  },
  {
    command: 'youtube-scholar',
    aliases: ['scholar'],
    title: 'YouTube Scholar',
    path: '/projects/youtube-scholar',
    description: 'Visualize your YouTube curiosity and its rabbit-holes.',
  },
  {
    command: 'time-management',
    aliases: ['time'],
    title: 'Time Management',
    path: '/projects/time-management',
    description: '31 days of screen-time tracking, fully dissected.',
  },
  {
    command: 'side-track',
    aliases: ['sidetrack'],
    title: 'Side-Track',
    path: '/side-track',
    description: 'A lifting tracker — changelogs, privacy & support.',
  },
  {
    command: 'projects',
    aliases: ['all'],
    title: 'All Projects',
    path: '/projects',
    description: 'Everything I have built, in one place.',
  },
];
