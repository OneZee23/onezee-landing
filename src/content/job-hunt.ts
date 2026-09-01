// Typed view + derived metrics over the public job-hunt data.
// Raw, AI-maintained: src/data/job-hunt.json (aggregate only — see that file's note).
import raw from '../data/job-hunt.json';
import type { Locale } from './site';

export type ChannelKey = 'hh' | 'linkedin' | 'referral';
export type L10n = Record<Locale, string>;

export interface Channel {
  key: ChannelKey;
  label: string;
}

export interface FunnelStage {
  key: string;
  label: L10n;
  counts: Record<ChannelKey, number>;
  /** a sub-status of "applied" (still in flight), not a depth step */
  note?: boolean;
  /** a terminal outcome shown to the side of the funnel */
  terminal?: boolean;
}

export interface Snapshot {
  date: string;
  applied: number;
  interviews: number;
  offer: number;
  rejected: number;
}

/**
 * The networking channel. Deliberately NOT a funnel: aggregate reach and a count of
 * conversations, with no stage ladder and no conversion percentages — the people in it
 * are people, not leads, and some of them read this page.
 */
export interface Network {
  /** ONE number on purpose — see the note in the data file. Do not add stages or a ratio. */
  conversations: number;
  label: L10n;
  note: L10n;
  why: L10n;
}

export interface VisaBlock {
  title: L10n;
  intro: L10n;
  points: L10n[];
  sourcesLabel: L10n;
  sources: string;
  checkedAt: string;
}

export interface Phase {
  label: L10n;
  since: string;
  note: L10n;
}

export interface Benchmark {
  /** false until the people whose numbers these are have consented. Respect it. */
  show: boolean;
  applied: number;
  offers: number;
  profile: L10n;
  via: L10n;
}

export interface JobHuntData {
  meta: {
    role: string;
    target: string;
    startDate: string;
    updated: string;
    metric: L10n;
    channels: Channel[];
  };
  phase: Phase;
  funnel: FunnelStage[];
  network: Network;
  visa: VisaBlock;
  snapshots: Snapshot[];
  benchmark: Benchmark;
}

export const jobHunt = raw as unknown as JobHuntData;

export const CHANNEL_KEYS: ChannelKey[] = ['hh', 'linkedin', 'referral'];

export const stageTotal = (s: FunnelStage): number =>
  CHANNEL_KEYS.reduce((sum, k) => sum + (s.counts[k] ?? 0), 0);

export const stageByKey = (key: string): FunnelStage | undefined =>
  jobHunt.funnel.find((s) => s.key === key);

const total = (key: string): number => {
  const s = stageByKey(key);
  return s ? stageTotal(s) : 0;
};

export interface JobHuntMetrics {
  applied: number;
  /** the metric that actually steers the search */
  firstCalls: number;
  offers: number;
  rejected: number;
  appliedToCall: number; // 0..1
  rejectRate: number; // 0..1
  conversations: number;
}

export function metrics(): JobHuntMetrics {
  const applied = total('applied');
  const firstCalls = total('call1');
  return {
    applied,
    firstCalls,
    offers: total('offer'),
    rejected: total('rejected'),
    appliedToCall: applied ? firstCalls / applied : 0,
    rejectRate: applied ? total('rejected') / applied : 0,
    conversations: jobHunt.network.conversations,
  };
}

/** "6%" style percent from a 0..1 ratio. */
export const pct = (ratio: number, digits = 0): string =>
  `${(ratio * 100).toFixed(digits)}%`;

/** Funnel rows excluding the "pending" sub-status (depth steps only). */
export const depthFunnel = (): FunnelStage[] =>
  jobHunt.funnel.filter((s) => !s.note && !s.terminal);
