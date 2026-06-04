import type { APIRoute } from 'astro';
import crypto from 'node:crypto';
import { getRedis } from '../../lib/redis';

// On-demand endpoint (not prerendered) — needs the Node server runtime.
export const prerender = false;

const likeKey = (postId: string) => `likes:${postId}`;
const dedupKey = (postId: string, ipHash: string) => `liked:${postId}:${ipHash}`;
const DEDUP_TTL_SECONDS = 60 * 60 * 24 * 365; // one like per IP per year

// Accepts the slugs we generate plus hand-authored content ids (which may
// contain '_' or a nested path). Bounded charset + length; safe as a Redis key.
const VALID_ID = /^[a-z0-9][a-z0-9/_-]{0,120}$/i;

// In-memory fallback when REDIS_URL is unset (local dev, or a Redis-less deploy).
// Per-process and non-persistent — fine for dev; set REDIS_URL in production so
// counts persist and are shared across restarts.
const memLikes = new Map<string, number>();
const memDedup = new Map<string, Set<string>>();

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}

function ipHashOf(request: Request, clientAddress: string | undefined): string {
  // Best-effort per-client key for like dedup — NOT a security boundary
  // (X-Forwarded-For is client-supplied; worst case a determined user inflates a
  // vanity count). The original client is the left-most XFF entry.
  const xff = request.headers.get('x-forwarded-for') ?? '';
  const ip = xff.split(',')[0]?.trim() || clientAddress || 'unknown';
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

export const GET: APIRoute = async ({ url }) => {
  const postId = url.searchParams.get('postId') ?? '';
  if (!VALID_ID.test(postId)) return json({ error: 'invalid postId' }, 400);

  const redis = getRedis();
  if (!redis) {
    return json({ postId, likes: memLikes.get(postId) ?? 0, enabled: true });
  }
  try {
    const raw = await redis.get(likeKey(postId));
    return json({ postId, likes: Number(raw) || 0, enabled: true });
  } catch {
    return json({ postId, likes: 0, enabled: false });
  }
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: { postId?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    /* empty / invalid body handled below */
  }
  const postId = typeof body.postId === 'string' ? body.postId : '';
  if (!VALID_ID.test(postId)) return json({ error: 'invalid postId' }, 400);

  const ipHash = ipHashOf(request, clientAddress);
  const redis = getRedis();

  if (!redis) {
    // In-memory: idempotent per (post, ip) for the life of the process.
    let seen = memDedup.get(postId);
    if (!seen) {
      seen = new Set<string>();
      memDedup.set(postId, seen);
    }
    let counted = false;
    if (!seen.has(ipHash)) {
      seen.add(ipHash);
      memLikes.set(postId, (memLikes.get(postId) ?? 0) + 1);
      counted = true;
    }
    return json({ postId, likes: memLikes.get(postId) ?? 0, enabled: true, counted });
  }

  try {
    // Idempotent: one increment per (post, ip) via SET NX. Re-likes are no-ops.
    const fresh = await redis.set(dedupKey(postId, ipHash), '1', 'EX', DEDUP_TTL_SECONDS, 'NX');
    const likes = fresh === 'OK'
      ? await redis.incr(likeKey(postId))
      : Number(await redis.get(likeKey(postId))) || 0;
    return json({ postId, likes, enabled: true, counted: fresh === 'OK' });
  } catch {
    return json({ postId, likes: 0, enabled: false });
  }
};
