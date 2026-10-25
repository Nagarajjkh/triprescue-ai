import type { Alternative, Disruption, TravellerProfile } from '../types';
import { alternativesFor, CITIES, istTime } from '../data/sampleData';
import { filterAlternatives, rankAlternatives, extraCostFor, arrivesBeforeDeadline } from './recovery';

// Lightweight self-check for the engine. Run with: npx tsx src/engine/selfTest.ts
// (Only included for transparency; not required at runtime.)

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`Assertion failed: ${msg}`);
  console.log('ok -', msg);
}

const disruption: Disruption = {
  mode: 'train',
  origin: CITIES[0],
  destination: CITIES[1],
  reason: 'Train cancelled',
  originalDeparture: istTime('2026-10-25', '20:30'),
  originalArrival: istTime('2026-10-26', '05:45'),
  originalFare: 480,
  refunded: true,
};

const traveller: TravellerProfile = {
  extraBudgetInr: 1500,
  arrivalDeadline: istTime('2026-10-26', '07:00'),
  maxDelayMinutes: 90,
  pax: 1,
};

const alts: Alternative[] = alternativesFor(disruption);

// 1. Filter respects budget and deadline.
const { feasible, rejected } = filterAlternatives(alts, disruption, traveller);
assert(feasible.length >= 3, 'at least three feasible alternatives for the demo scenario');
assert(rejected.length > 0, 'some options are rejected (the late bus)');

// 2. Extra cost computation respects refund flag.
const trainAlt = feasible.find((a) => a.mode === 'train')!;
assert(extraCostFor(trainAlt, disruption, 1) === trainAlt.farePerPax, 'refunded original → extra cost equals full new fare');

// 3. Ranking is sorted descending by score.
const ranked = rankAlternatives(alts, disruption, traveller);
const feasibleScored = ranked.filter((r) => r.feasible);
for (let i = 1; i < feasibleScored.length; i++) {
  assert(feasibleScored[i].score <= feasibleScored[i - 1].score, 'ranking is monotonically non-increasing');
}

// 4. Best overall tag is on the top option.
assert(feasibleScored[0].recommendation === 'best', 'top option is labelled best overall');

// 5. Lowest-cost tag exists and matches the minimum extra cost.
const minCost = Math.min(...feasibleScored.map((s) => s.extraCost));
const cheapest = feasibleScored.find((s) => s.extraCost === minCost);
assert(!!cheapest && (cheapest.recommendation === 'lowest-cost' || cheapest.recommendation === 'best'), 'lowest-cost option is tagged');

// 6. Deadline helper is consistent.
for (const s of feasibleScored) {
  if (s.arrivesBeforeDeadline) assert(arrivesBeforeDeadline(s.alt, traveller.arrivalDeadline), 'deadline flag is consistent');
}

console.log('\nAll engine self-tests passed.');
