import type { APIRoute } from 'astro';
import crypto from 'node:crypto';
import { getRedis } from '../../lib/redis';

// On-demand endpoint (not prerendered).
export const prerender = false;

const viewKey = (postId: string) => `views:${postId}`;
const dedupKey = (postId: string, ipHash: string, day: string) => `viewed:${postId}:${ipHash}:${day}`;
const VALID_ID = /^[a-z0-9][a-z0-9/_-]{0,120}$/i;

// In-memory fallback when REDIS_URL is unset (dev / no-Redis deploys).
const memViews = new Map<string, number>();
const memSeen = new Set<string>();

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}

function ipHashOf(request: Request, clientAddress: string | undefined): string {
  const xff = request.headers.get('x-forwarded-for') ?? '';
  const ip = xff.split(',')[0]?.trim() || clientAddress || 'unknown';
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

const todayUTC = () => new Date().toISOString().slice(0, 10);

export const GET: APIRoute = async ({ url }) => {
  const postId = url.searchParams.get('postId') ?? '';
  if (!VALID_ID.test(postId)) return json({ error: 'invalid postId' }, 400);

  const redis = getRedis();
  if (!redis) return json({ postId, views: memViews.get(postId) ?? 0 });
  try {
    return json({ postId, views: Number(await redis.get(viewKey(postId))) || 0 });
  } catch {
    return json({ postId, views: 0 });
  }
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: { postId?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    /* handled below */
  }
  const postId = typeof body.postId === 'string' ? body.postId : '';
  if (!VALID_ID.test(postId)) return json({ error: 'invalid postId' }, 400);

  const ipHash = ipHashOf(request, clientAddress);
  const dk = dedupKey(postId, ipHash, todayUTC());
  const redis = getRedis();

  if (!redis) {
    let views = memViews.get(postId) ?? 0;
    if (!memSeen.has(dk)) {
      memSeen.add(dk);
      views += 1;
      memViews.set(postId, views);
    }
    return json({ postId, views });
  }

  try {
    // Count at most one view per IP per UTC day (cheap bot/refresh dampening).
    const fresh = await redis.set(dk, '1', 'EX', 60 * 60 * 24, 'NX');
    const views = fresh === 'OK'
      ? await redis.incr(viewKey(postId))
      : Number(await redis.get(viewKey(postId))) || 0;
    return json({ postId, views });
  } catch {
    return json({ postId, views: 0 });
  }
};
