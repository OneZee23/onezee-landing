// Typed view over the public job-hunt data.
// Raw data: src/data/job-hunt.json - GENERATED, never hand-edited.
// Source of truth is onezee-workspace/job-search/funnel.md via to-public.py.
import raw from '../data/job-hunt.json';
import type { Locale } from './site';

export type L10n = Record<Locale, string>;

export interface Meta {
  role: string;
  target: string;
  startDate: string;
  updated: string;
  thesis: L10n;
}

/** The one headline: first calls out of applications. Not applications. */
export interface Headline {
  calls: number;
  applied: number;
  /** null when the denominator is under 10 - then we print counts only. */
  callRatePct: number | null;
}

export type StageKey = 'applied' | 'call1' | 'call2' | 'final' | 'offer';
export interface LadderStep {
  key: StageKey;
  n: number;
}

export interface Outcomes {
  rejected: number;
  /** rejections stopped being logged after 5 June - the number is a floor */
  rejectedIsFloor: boolean;
  awaiting: number;
}

export interface TimelinePoint {
  date: string;
  applied: number;
}

/** The stretch with no records at all. Rendered as a labelled gap, never interpolated. */
export interface Gap {
  from: string;
  to: string;
}

/** One logged day. Absent keys mean the event did not happen; absent days mean nothing was logged. */
export interface LogDay {
  date: string;
  applied?: number;
  invites?: number;
  acc?: number;
  reply?: number;
  msg?: number;
  ref?: number;
  /** Приходит по чужому решению, не по моему действию - в график «отправил»
   *  не идёт, но день без него исчезал бы из лога целиком. */
  rejected?: number;
}

/**
 * ONE number by design. People are not a funnel: no stage ladder, no conversion
 * rate, no per-batch tallies. Do not add fields here without re-reading that rule.
 */
export interface Platform {
  key: string;
  applied: number;
  call1: number;
  rejected: number;
}

export interface Network {
  conversations: number;
  referralOffers: number;
}

export interface VisaBlock {
  title: L10n;
  intro: L10n;
  points: L10n[];
  sourcesLabel: L10n;
  sources: string;
  checkedAt: string;
}

export interface Method {
  title: L10n;
  points: L10n[];
}

export interface JobHuntData {
  meta: Meta;
  headline: Headline;
  ladder: LadderStep[];
  channels: { hh: number; boards: number; referral: number };
  outcomes: Outcomes;
  timeline: TimelinePoint[];
  gap: Gap;
  log: LogDay[];
  network: Network;
  platforms: Platform[];
  visa: VisaBlock;
  method: Method;
}

export const jobHunt = raw as unknown as JobHuntData;

export const stage = (k: StageKey): number =>
  jobHunt.ladder.find((s) => s.key === k)?.n ?? 0;

/** "7%" - only ever called with a denominator we already checked. */
export const pct = (v: number): string => `${v}%`;

/** Days between two ISO dates, for labelling the gap honestly. */
export const weeksBetween = (a: string, b: string): number =>
  Math.round((Date.parse(b) - Date.parse(a)) / (7 * 864e5));

/**
 * Russian numeral agreement: 1 отклик / 2 отклика / 5 откликов.
 * Generated sentences carry counts, so the form has to be computed, not guessed.
 */
export const plural = (n: number, one: string, few: string, many: string): string => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
};

/** Every calendar day from a to b inclusive, as ISO strings. For the coverage strip. */
export const daySpan = (a: string, b: string): string[] => {
  const out: string[] = [];
  for (let t = Date.parse(a); t <= Date.parse(b); t += 864e5) {
    out.push(new Date(t).toISOString().slice(0, 10));
  }
  return out;
};

export type Grain = 'day' | 'week' | 'month';
export interface Bucket {
  key: string;
  showLabel: boolean;
  from: string;
  to: string;
  sent: number;
  got: number;
}

const mondayOf = (iso: string): string => {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
};

/**
 * The page is static HTML with no hydration, so there is no day/week/month control to
 * offer the reader. The grain is chosen at build time from how long the search has run:
 * daily columns stay legible to about eight weeks, weekly to about eight months, then
 * monthly. Labels thin out on a stride rather than colliding.
 *
 * An empty bucket keeps its slot and draws no bar. A zero is never drawn as a mark.
 */
export const bucketDays = (
  days: { date: string; sent: number; got: number }[],
): { grain: Grain; buckets: Bucket[] } => {
  // Switch points are picked so the new grain never starts out sparse: 8 weeks of days
  // becomes 8 weekly columns, and ~34 weeks becomes ~8 monthly ones.
  const grain: Grain = days.length <= 56 ? 'day' : days.length <= 240 ? 'week' : 'month';
  const keyOf = (iso: string) =>
    grain === 'day' ? iso : grain === 'week' ? mondayOf(iso) : iso.slice(0, 7) + '-01';

  const acc = new Map<string, Bucket>();
  for (const d of days) {
    const key = keyOf(d.date);
    const b = acc.get(key);
    if (b) { b.sent += d.sent; b.got += d.got; b.to = d.date; }
    else acc.set(key, {
      key, from: d.date, to: d.date, sent: d.sent, got: d.got, showLabel: false,
    });
  }

  const buckets = [...acc.values()];
  const stride = Math.max(1, Math.ceil(buckets.length / 12));
  buckets.forEach((b, i) => {
    // Anchor the stride to the end so the newest column is always labelled.
    b.showLabel = (buckets.length - 1 - i) % stride === 0;
  });
  return { grain, buckets };
};
