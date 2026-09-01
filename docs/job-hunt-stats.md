# Job-hunt stats — how to maintain

The public page at **onezee.dev/job-hunt** (and `/ru/job-hunt`) is driven by one file:

```
src/data/job-hunt.json
```

Everything else — the page, the homepage teaser, every derived percentage — reads from it.
You edit that JSON, commit, push to `master`; GitHub Actions builds the image, the server pulls it.

## ⛔ Privacy rules (non-negotiable)

This repo is **public**. `job-hunt.json` holds **aggregate data only**:

- ✅ counts per channel, funnel stages, aggregate networking numbers, the visa block
- ❌ NEVER: company names, role identifiers, salaries, **names of anyone you talk to**,
  recruiter names, health, finances.

The private tracker with company names and people lives outside this repo at
`onezee-workspace/job-search/funnel.md` and never leaves it. This JSON is its sanitized derivative.

### Two rules that are easy to get wrong

**1. The networking block is deliberately NOT a funnel.** It carries three numbers —
conversations, accepted, invitations — with no stage ladder and no conversion percentages.
The reason is not privacy, it is decency: the people in that number are the ones whose
referrals are the whole strategy, and some of them will read this page. A person who finds
himself rendered as a step in a conversion rate stops being a person you had a conversation
with. Do not add stages, do not add a percentage, do not rename it to "pipeline".

**2. `benchmark.show` is `false` and stays false until consent.** Those numbers belong to
people who shared them privately to help. Publishing them, even anonymised, is a consent
question, not a privacy one — they can recognise themselves. Flip it to `true` only after
they have said yes, and fix the figures at the same time (the seeded 300 → 1 does not match
the numbers collected in August).

## Updating the funnel (the routine)

1. Get the aggregate from the private tracker:
   ```bash
   awk -f job-search/funnel.awk job-search/funnel.md
   ```
2. Update `funnel[].counts` in the JSON. Stage keys mirror the private tracker:
   `applied` · `call1` · `call2` · `final` · `offer` · `rejected`, plus `pending`
   (a sub-status of applied, not a depth step).
3. Update `network` — conversations / accepted / invites — from the tracker's `## contacts`
   and `## invites` sections.
4. Bump `meta.updated`.
5. **Append** a new entry to `snapshots` (date + applied / interviews / offer / rejected).
   Append only — never rewrite past snapshots. That array is the time series.
6. Commit `chore: job-hunt stats <date>`, push to `master`.

Derived metrics (applied→call %, reject rate) are computed in `src/content/job-hunt.ts`.
Never hand-write a percentage into the JSON.

## The visa block

`visa.points` answers the question that otherwise surfaces after a first call and quietly ends
things. Every figure in it is sourced — see `visa.sources` and `visa.checkedAt`.

⚠️ **Two things gate it:**
- The wording says *"my university is listed in anabin with status H+"*, not *"my degree is
  verified"*. Those are different claims. Do not strengthen it until the anabin printout covers
  all three entries (institution status, degree type, field of study).
- The €50,700 threshold is the **2026** figure. It is recalculated every 1 January from the
  pension-insurance ceiling and published in the Bundesanzeiger by 31 December.
  **Recheck in October 2026** and update the number here and in `job-search/visa-facts.md`.

## Analytics (separate concern)

Self-hosted Umami — see `deploy/umami/README.md`. The tag is injected by
`src/components/BaseHead.astro` only when `PUBLIC_UMAMI_SRC` + `PUBLIC_UMAMI_WEBSITE_ID` are set
at build time.
