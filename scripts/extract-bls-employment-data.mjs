import fs from 'node:fs/promises';
import path from 'node:path';

const [sourcePath, outputPath] = process.argv.slice(2);

if (!sourcePath || !outputPath) {
  console.error('Usage: node scripts/extract-bls-employment-data.mjs <source-html> <output-json>');
  process.exit(1);
}

const html = await fs.readFile(sourcePath, 'utf8');
const match = html.match(/const rows = (\[[\s\S]*?\])\.map\(d =>/);

if (!match) {
  throw new Error('Could not find the embedded BLS rows in the source visualization.');
}

const rows = JSON.parse(match[1]);

if (rows.length !== 120 || rows[0].date !== '2016-09-01' || rows.at(-1).date !== '2026-08-01') {
  throw new Error('Unexpected BLS data window; expected 120 rows from 2016-09 through 2026-08.');
}

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(rows)}\n`);
console.log(`Wrote ${rows.length} monthly observations to ${outputPath}`);
