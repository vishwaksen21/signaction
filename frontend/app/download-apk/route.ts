import { NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public', 'signaction.apk');
    const fileStats = await stat(filePath);

    if (fileStats.size > 10240) {
      const fileBuffer = await readFile(filePath);
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'application/vnd.android.package-archive',
          'Content-Disposition': 'attachment; filename="signaction.apk"',
          'Content-Length': fileBuffer.length.toString(),
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    return NextResponse.redirect('/signaction.apk', 302);
  } catch {
    return NextResponse.redirect('/signaction.apk', 302);
  }
}
