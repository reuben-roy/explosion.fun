// Publishes the CV markdown source at /cv.md so agents and scrapers can read the
// same content the /cv page renders, without parsing HTML.
// Single source of truth: src/content/cv.md. Run automatically before `next build`.
import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const source = path.join(root, 'src', 'content', 'cv.md');
const destination = path.join(root, 'public', 'cv.md');

await mkdir(path.dirname(destination), { recursive: true });
await copyFile(source, destination);
console.log(`sync-cv: ${path.relative(root, source)} → ${path.relative(root, destination)}`);
