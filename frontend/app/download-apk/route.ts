import { NextResponse } from 'next/server';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { join } from 'path';
import { Readable } from 'stream';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const filePath = join(process.cwd(), 'public', 'signaction.apk');
    const fileStats = await stat(filePath);

    if (fileStats.size > 10240) {
      const nodeStream = createReadStream(filePath);
      const webStream = Readable.toWeb(nodeStream) as ReadableStream;
      return new NextResponse(webStream, {
        headers: {
          'Content-Type': 'application/vnd.android.package-archive',
          'Content-Disposition': 'attachment; filename="signaction.apk"',
          'Content-Length': fileStats.size.toString(),
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    return NextResponse.redirect(new URL('/signaction.apk', req.url), 302);
  } catch {
    return NextResponse.redirect(new URL('/signaction.apk', req.url), 302);
  }
}
