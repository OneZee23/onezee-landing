// Pulls public product numbers into src/data/product-stats.json for the
// inventory. Sources are the products' own public dashboards and the App Store;
// the browser can't call them directly (no CORS), so this runs before a build.
//
//   npm run stats:products                   # write src/data/product-stats.json
//   node scripts/fetch-product-stats.mjs out.json
import { readFile, writeFile } from 'node:fs/promises';

const out = process.argv[2] ?? new URL('../src/data/product-stats.json', import.meta.url);

async function json(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

// Grafana anonymous Viewer proxies the public Prometheus datasource.
async function promQuery(base, datasource, query) {
  const url = `${base}/api/datasources/proxy/uid/${datasource}/api/v1/query?query=${encodeURIComponent(query)}`;
  const body = await json(url);
  const value = body?.data?.result?.[0]?.value?.[1];
  if (value === undefined) throw new Error(`no value for ${query}`);
  return Number(value);
}

async function appStore(id) {
  const body = await json(`https://itunes.apple.com/lookup?id=${id}&country=ru`);
  const app = body.results?.[0];
  if (!app) throw new Error(`no App Store result for ${id}`);
  return {
    rating: app.averageUserRating ?? null,
    ratings: app.userRatingCount ?? 0,
    version: app.version ?? null,
  };
}

// One failing source must not blank the page: keep what we got, mark the rest.
async function settle(name, fn) {
  try {
    return await fn();
  } catch (error) {
    console.warn(`${name}: ${error.message}`);
    return null;
  }
}

const teach = 'https://stats.teachtrack.ru';
const trip = 'https://stats.trip-track.app';

const [teachtrack, triptrack, lifetrack] = await Promise.all([
  settle('teachtrack', async () => ({
    teachers: await promQuery(teach, 'public-usage', 'teachtrack_teachers_total'),
    teachersSeen7d: await promQuery(teach, 'public-usage', 'teachtrack_teachers_seen_7d'),
    students: await promQuery(teach, 'public-usage', 'teachtrack_students_total'),
    lessonsCompleted: await promQuery(teach, 'public-usage', 'teachtrack_lessons_completed_total'),
    source: `${teach}/d/public-stats`,
  })),
  settle('triptrack', async () => ({
    users: await promQuery(trip, 'prometheus', 'triptrack_users_total'),
    activeUsers7d: await promQuery(trip, 'prometheus', 'triptrack_users_api_active_7d'),
    trips: await promQuery(trip, 'prometheus', 'triptrack_trips_total'),
    distanceKm: Math.round(await promQuery(trip, 'prometheus', 'triptrack_distance_km_total')),
    source: `${trip}/d/triptrack-public-stats`,
  })),
  settle('lifetrack', async () => ({
    ...(await appStore('6759284836')),
    source: 'https://apps.apple.com/app/id6759284836',
  })),
]);

// A failed source keeps its last known numbers instead of blanking the card.
let previous = {};
try {
  previous = JSON.parse(await readFile(out, 'utf8'));
} catch {}
const data = {
  updatedAt: new Date().toISOString(),
  teachtrack: teachtrack ?? previous.teachtrack ?? null,
  triptrack: triptrack ?? previous.triptrack ?? null,
  lifetrack: lifetrack ?? previous.lifetrack ?? null,
};
await writeFile(out, `${JSON.stringify(data, null, 2)}\n`);
console.log(JSON.stringify(data, null, 2));
