import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

// Called server-to-server by the Django backend (see apps/products/signals.py
// + tasks.trigger_revalidation_task) whenever a Product or Category is
// created, updated, or deleted. Without this, a slug that didn't exist at the
// last `next build` gets its first request cached as a permanent 404 by
// Next.js's ISR layer — the root cause of ~140 dead product URLs found in a
// 2026-07-11 SEO audit. The shared secret is REVALIDATE_SECRET in .env, read
// identically by both containers via docker-compose's env_file.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const secret = body?.secret
  const paths: unknown = body?.paths

  const expected = process.env.REVALIDATE_SECRET
  if (!expected || secret !== expected) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  if (!Array.isArray(paths) || paths.some((p) => typeof p !== 'string')) {
    return NextResponse.json({ error: 'paths must be a string array' }, { status: 400 })
  }

  for (const path of paths as string[]) {
    revalidatePath(path)
  }

  return NextResponse.json({ revalidated: true, paths })
}
