import type { Alternative, City, Disruption, Mode } from '@/types';

// ---------------------------------------------------------------------------
// Sample data for TripRescue AI.
// Everything here is ILLUSTRATIVE. Schedules, fares, and availability are
// hand-authored for the demo and do NOT reflect live inventory.
// ---------------------------------------------------------------------------

export const CITIES: City[] = [
  { code: 'IXE', name: 'Mangaluru' },
  { code: 'BLR', name: 'Bengaluru' },
  { code: 'MAA', name: 'Chennai' },
  { code: 'HYD', name: 'Hyderabad' },
  { code: 'COK', name: 'Kochi' },
  { code: 'GOI', name: 'Goa' },
  { code: 'DEL', name: 'Delhi' },
  { code: 'BOM', name: 'Mumbai' },
];

export function findCity(code: string): City | undefined {
  return CITIES.find((c) => c.code === code || c.name.toLowerCase() === code.toLowerCase());
}

// Helper to build epoch ms from a "YYYY-MM-DD HH:mm" string in IST (+05:30).
function ist(date: string, time: string): number {
  return Date.parse(`${date}T${time}:00+05:30`);
}

// ---------------------------------------------------------------------------
// Flight alternatives (illustrative fares + timings).
// ---------------------------------------------------------------------------
export const FLIGHT_ALTERNATIVES: Alternative[] = [
  {
    id: 'fl-6e-2083',
    mode: 'flight',
    label: 'IndiGo 6E 2083',
    segments: [
      { mode: 'flight', label: '6E 2083', from: 'IXE', to: 'BLR', depart: ist('2026-10-25', '18:40'), arrive: ist('2026-10-25', '19:35'), farePerPax: 2950, notes: 'Non-stop' },
    ],
    farePerPax: 2950,
    departure: ist('2026-10-25', '18:40'),
    arrival: ist('2026-10-25', '19:35'),
    durationMinutes: 55,
    comfort: 88,
    tradeoffs: ['Fastest option', 'Direct flight', 'Same-evening arrival'],
  },
  {
    id: 'fl-ai-581',
    mode: 'flight',
    label: 'Air India Express IX 581',
    segments: [
      { mode: 'flight', label: 'IX 581', from: 'IXE', to: 'BLR', depart: ist('2026-10-25', '21:10'), arrive: ist('2026-10-25', '22:05'), farePerPax: 2580, notes: 'Non-stop' },
    ],
    farePerPax: 2580,
    departure: ist('2026-10-25', '21:10'),
    arrival: ist('2026-10-25', '22:05'),
    durationMinutes: 55,
    comfort: 82,
    tradeoffs: ['Late evening arrival', 'Slightly cheaper fare'],
  },
];

// ---------------------------------------------------------------------------
// Train alternatives for the Mangaluru → Bengaluru corridor.
// ---------------------------------------------------------------------------
export const TRAIN_ALTERNATIVES: Alternative[] = [
  {
    id: 'tr-16528',
    mode: 'train',
    label: 'Replacement Train 16528 (Kannur Exp.)',
    segments: [
      { mode: 'train', label: '16528 YPR Exp.', from: 'IXE', to: 'BLR', depart: ist('2026-10-25', '19:00'), arrive: ist('2026-10-26', '03:30'), farePerPax: 540, notes: 'Sleeper — confirmed berths' },
    ],
    farePerPax: 540,
    departure: ist('2026-10-25', '19:00'),
    arrival: ist('2026-10-26', '03:30'),
    durationMinutes: 510,
    comfort: 70,
    tradeoffs: ['Cheapest feasible option', 'Overnight journey', 'Arrives well before deadline'],
  },
  {
    id: 'tr-16517',
    mode: 'train',
    label: 'Train 16517 (KSR Bengaluru Exp.)',
    segments: [
      { mode: 'train', label: '16517', from: 'IXE', to: 'BLR', depart: ist('2026-10-25', '17:30'), arrive: ist('2026-10-26', '01:45'), farePerPax: 620, notes: '3AC — waitlist 12' },
    ],
    farePerPax: 620,
    departure: ist('2026-10-25', '17:30'),
    arrival: ist('2026-10-26', '01:45'),
    durationMinutes: 495,
    comfort: 64,
    tradeoffs: ['Earlier arrival', 'Waitlist risk', 'AC comfort'],
  },
];

// ---------------------------------------------------------------------------
// Bus alternatives — KSRTC / private Volvo services.
// ---------------------------------------------------------------------------
export const BUS_ALTERNATIVES: Alternative[] = [
  {
    id: 'bus-ksrtc-volvo',
    mode: 'bus',
    label: 'KSRTC Volvo Multi-Axle',
    segments: [
      { mode: 'bus', label: 'KSRTC Volvo', from: 'IXE', to: 'BLR', depart: ist('2026-10-25', '20:30'), arrive: ist('2026-10-26', '05:30'), farePerPax: 850, notes: 'Seater-sleeper, AC' },
    ],
    farePerPax: 850,
    departure: ist('2026-10-25', '20:30'),
    arrival: ist('2026-10-26', '05:30'),
    durationMinutes: 540,
    comfort: 58,
    tradeoffs: ['Comfortable overnight ride', 'More expensive than train', 'Late arrival but feasible'],
  },
  {
    id: 'bus-private-seater',
    mode: 'bus',
    label: 'Private Seater AC (Sugama)',
    segments: [
      { mode: 'bus', label: 'Sugama Tourist', from: 'IXE', to: 'BLR', depart: ist('2026-10-25', '22:00'), arrive: ist('2026-10-26', '07:30'), farePerPax: 720, notes: 'Seater AC' },
    ],
    farePerPax: 720,
    departure: ist('2026-10-25', '22:00'),
    arrival: ist('2026-10-26', '07:30'),
    durationMinutes: 570,
    comfort: 48,
    tradeoffs: ['Cheapest after train', 'Arrival close to deadline', 'No sleeper comfort'],
  },
  {
    id: 'bus-night-nonac',
    mode: 'bus',
    label: 'Non-AC Express Bus',
    segments: [
      { mode: 'bus', label: 'KSRTC Express', from: 'IXE', to: 'BLR', depart: ist('2026-10-25', '23:15'), arrive: ist('2026-10-26', '08:30'), farePerPax: 460, notes: 'Non-AC seater' },
    ],
    farePerPax: 460,
    departure: ist('2026-10-25', '23:15'),
    arrival: ist('2026-10-26', '08:30'),
    durationMinutes: 555,
    comfort: 30,
    tradeoffs: ['Cheapest fare', 'No AC', 'Arrival after deadline window'],
  },
];

// ---------------------------------------------------------------------------
// Cabin-car / road alternatives for shorter hops.
// ---------------------------------------------------------------------------
export const CAB_ALTERNATIVES: Alternative[] = [
  {
    id: 'cab-shared',
    mode: 'bus',
    label: 'Shared Cab (Innova)',
    segments: [
      { mode: 'bus', label: 'Shared Cab', from: 'IXE', to: 'BLR', depart: ist('2026-10-25', '23:00'), arrive: ist('2026-10-26', '06:00'), farePerPax: 1100, notes: '6-seater shared' },
    ],
    farePerPax: 1100,
    departure: ist('2026-10-25', '23:00'),
    arrival: ist('2026-10-26', '06:00'),
    durationMinutes: 420,
    comfort: 55,
    tradeoffs: ['Fastest road option', 'Premium price', 'Limited seats'],
  },
];

// ---------------------------------------------------------------------------
// Hotel alternatives (illustrative).
// ---------------------------------------------------------------------------
export const HOTEL_ALTERNATIVES: Alternative[] = [
  {
    id: 'ho-park-inn',
    mode: 'hotel',
    label: 'Park Inn by Radisson',
    segments: [
      { mode: 'hotel', label: 'Park Inn — Standard King', from: 'BLR', to: 'BLR', depart: ist('2026-10-25', '14:00'), arrive: ist('2026-10-26', '11:00'), farePerPax: 4200, notes: '2 km from original venue' },
    ],
    farePerPax: 4200,
    departure: ist('2026-10-25', '14:00'),
    arrival: ist('2026-10-26', '11:00'),
    durationMinutes: 1260,
    comfort: 86,
    tradeoffs: ['Closest to original venue', 'Premium comfort', 'Highest rate'],
  },
  {
    id: 'ho-fortune',
    mode: 'hotel',
    label: 'Fortune Select Trinity',
    segments: [
      { mode: 'hotel', label: 'Fortune — Deluxe Twin', from: 'BLR', to: 'BLR', depart: ist('2026-10-25', '14:00'), arrive: ist('2026-10-26', '11:00'), farePerPax: 3400, notes: '5 km from venue, free breakfast' },
    ],
    farePerPax: 3400,
    departure: ist('2026-10-25', '14:00'),
    arrival: ist('2026-10-26', '11:00'),
    durationMinutes: 1260,
    comfort: 78,
    tradeoffs: ['Good value', 'Free breakfast', 'Slightly farther out'],
  },
  {
    id: 'ho-oyster',
    mode: 'hotel',
    label: 'OYO Townhouse JP Nagar',
    segments: [
      { mode: 'hotel', label: 'OYO Townhouse — Classic', from: 'BLR', to: 'BLR', depart: ist('2026-10-25', '14:00'), arrive: ist('2026-10-26', '11:00'), farePerPax: 2100, notes: 'Budget stay, 7 km from venue' },
    ],
    farePerPax: 2100,
    departure: ist('2026-10-25', '14:00'),
    arrival: ist('2026-10-26', '11:00'),
    durationMinutes: 1260,
    comfort: 60,
    tradeoffs: ['Lowest rate', 'Farther from venue', 'No on-site dining'],
  },
];

// ---------------------------------------------------------------------------
// Catalog accessors — return all options for a given disruption mode/route.
// ---------------------------------------------------------------------------
export function alternativesFor(disruption: Disruption): Alternative[] {
  if (disruption.mode === 'hotel') return HOTEL_ALTERNATIVES;

  const isDemoRoute =
    disruption.origin.code === 'IXE' && disruption.destination.code === 'BLR';

  if (isDemoRoute) {
    return [
      ...FLIGHT_ALTERNATIVES,
      ...TRAIN_ALTERNATIVES,
      ...BUS_ALTERNATIVES,
      ...CAB_ALTERNATIVES,
    ];
  }
  // For non-demo routes, still surface flights + buses as generic options.
  return [...FLIGHT_ALTERNATIVES, ...BUS_ALTERNATIVES];
}

export const DISRUPTION_REASONS: Record<Mode, string[]> = {
  flight: ['Flight cancelled by airline', 'Weather delay over 4 hours', 'Missed connection', 'Operational cancellation'],
  train: ['Train cancelled', 'Track obstruction', 'Engine failure', 'Signal failure'],
  hotel: ['Overbooked by property', 'Booking not found at check-in', 'Property closed unexpectedly'],
};

export const SAMPLE_DISRUPTION: Disruption = {
  mode: 'train',
  origin: CITIES[0], // Mangaluru
  destination: CITIES[1], // Bengaluru
  reason: 'Train cancelled',
  originalDeparture: ist('2026-10-25', '20:30'),
  originalArrival: ist('2026-10-26', '05:45'),
  originalFare: 480,
  refunded: true,
};

export const SAMPLE_TRAVELLER = {
  extraBudgetInr: 1500,
  arrivalDeadline: ist('2026-10-26', '07:00'),
  maxDelayMinutes: 90,
  pax: 1,
};

export function istTime(date: string, time: string): number {
  return ist(date, time);
}
