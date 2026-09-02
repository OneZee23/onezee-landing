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
}

/**
 * ONE number by design. People are not a funnel: no stage ladder, no conversion
 * rate, no per-batch tallies. Do not add fields here without re-reading that rule.
 */
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
