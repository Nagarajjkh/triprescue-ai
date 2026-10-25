// Core domain types for TripRescue AI.
// All data here is illustrative sample data — nothing represents live inventory.

export type Mode = 'flight' | 'train' | 'hotel';

export interface City {
  code: string;
  name: string;
}

export interface TravellerProfile {
  /** Maximum additional rupees the traveller can spend beyond the original booking value. */
  extraBudgetInr: number;
  /** Latest acceptable arrival moment, epoch ms. */
  arrivalDeadline: number;
  /** Maximum acceptable delay beyond the original scheduled arrival, in minutes. */
  maxDelayMinutes: number;
  /** Number of travellers in the party. */
  pax: number;
  /** Configurable ranking weights, 0..1 each. Defaults are balanced. */
  weights?: Weights;
}

export interface Weights {
  budget: number; // lower extra cost is better
  arrival: number; // closer to / under deadline is better
  duration: number; // shorter total travel time is better
  destination: number; // direct match to destination is better
}

export interface Disruption {
  mode: Mode;
  origin: City;
  destination: City;
  /** Free-text reason, e.g. "Train cancelled due to derailment". */
  reason: string;
  /** Original scheduled departure, epoch ms. */
  originalDeparture: number;
  /** Original scheduled arrival, epoch ms. */
  originalArrival: number;
  /** What the traveller already paid / was charged for the original booking, INR. */
  originalFare: number;
  /** Whether the original booking is fully refunded. */
  refunded: boolean;
}

export type AltMode = 'flight' | 'train' | 'bus' | 'hotel';

export interface Alternative {
  id: string;
  mode: AltMode;
  /** Short commercial label, e.g. "Replacement Train 16528". */
  label: string;
  /** Segments for multi-leg options. For hotel, a single "stay" segment. */
  segments: Segment[];
  /** Fare per traveller, INR. */
  farePerPax: number;
  /** Departure epoch ms. */
  departure: number;
  /** Arrival epoch ms. */
  arrival: number;
  /** Total journey minutes (door-to-door where applicable). */
  durationMinutes: number;
  /** Convenience / reliability score 0..100 used as a tiebreaker. */
  comfort: number;
  /** Human-readable trade-offs. */
  tradeoffs: string[];
}

export interface Segment {
  mode: AltMode;
  label: string;
  from: string;
  to: string;
  depart: number;
  arrive: number;
  farePerPax: number;
  notes?: string;
}

export interface ScoredAlternative {
  alt: Alternative;
  feasible: boolean;
  /** 0..100 normalized score; higher is better. */
  score: number;
  extraCost: number;
  arrivesBeforeDeadline: boolean;
  delayVsOriginalMinutes: number;
  rejectionReason?: string;
  recommendation?: 'best' | 'lowest-cost';
  rationale: string;
}

export interface RecoveryPlan {
  disruption: Disruption;
  traveller: TravellerProfile;
  scored: ScoredAlternative[];
  selected?: ScoredAlternative;
  nextActions: string[];
  generatedAt: number;
}

export type AgentStepId =
  | 'assess'
  | 'segments'
  | 'filter'
  | 'rank'
  | 'itinerary';

export interface AgentStep {
  id: AgentStepId;
  label: string;
  detail: string;
  status: 'pending' | 'running' | 'done';
  startedAt?: number;
  finishedAt?: number;
}
