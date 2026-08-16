import { readFile } from 'fs/promises';
import { join } from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const filePath = join(process.cwd(), 'public', 'dictionary.json');
  const data = await readFile(filePath, 'utf-8');
  return new Response(data, {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
