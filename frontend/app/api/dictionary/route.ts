import DICTIONARY from '@/public/dictionary.json';

export const runtime = 'nodejs';

export async function GET() {
  return Response.json(DICTIONARY, {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
