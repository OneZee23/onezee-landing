import type { APIRoute } from 'astro';

// Matches the existing Kubernetes probe path (/health/check).
export const prerender = false;

export const GET: APIRoute = () =>
  new Response('healthy\n', {
    status: 200,
    headers: { 'content-type': 'text/plain', 'cache-control': 'no-store' },
  });
