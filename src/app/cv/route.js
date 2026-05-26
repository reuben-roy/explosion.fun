import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-static';

const cvFilePath = path.join(process.cwd(), 'src', 'content', 'cv.md');

export async function GET() {
  try {
    const markdown = await readFile(cvFilePath, 'utf8');

    return new Response(markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Failed to load CV markdown:', error);

    return new Response('Unable to load CV.\n', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }
}
