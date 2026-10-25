# TripRescue AI — Travel Disruption Recovery Agent

**DevHack 2026 · Problem Statement PS 4.1 — AI Agent for Travel Disruption Recovery**

TripRescue AI takes a cancelled flight, train, or hotel booking and produces a ranked, budget-aware recovery plan with a revised step-by-step itinerary, a before/after comparison, and a checklist of next actions — all from local sample data, with no paid APIs or login.

> All schedules, fares, availability, and disruption records in this app are **illustrative sample data**. They are not live inventory and should not be treated as booking confirmations.

---

## Features

- **Dashboard** with hero, three-step explainer, and example disruption cards (cancelled train, delayed flight, hotel cancellation).
- **Interactive disruption form** with validation, inline errors, and a one-click "Load demo scenario" action.
- **Recovery engine** (pure TypeScript, no UI):
  - Detects the disruption and refund status.
  - Generates candidate flights, trains, buses, cabs, and hotels for the route.
  - Filters by hard constraints: extra budget, arrival deadline, max acceptable delay, corridor.
  - Ranks feasible options using configurable weights for budget, arrival, duration, and destination match.
  - Tags the **best overall** and **lowest-cost** options.
  - Explains why each option was recommended or rejected.
- **Results dashboard** with disrupted booking summary, ranked alternative cards, rejected options, before/after comparison, revised step-by-step itinerary, cost arithmetic, and a next-actions checklist.
- **Agent activity panel** showing the transparent, animated sequence of local computation steps (assess → segments → filter → rank → itinerary).
- **Export**: copy the recovery plan to clipboard, or print/save as PDF via the browser print dialog.
- **localStorage persistence** of the current demo scenario.
- **Responsive** layout: desktop two-column workspace + agent panel; mobile stacked.

## Demo scenario

A traveller's overnight train from **Mangaluru (IXE) → Bengaluru (BLR)** is cancelled. They have a maximum extra budget of ₹1,500 and must arrive before **07:00** the next morning. The engine evaluates flights, replacement trains, buses, and shared cabs, filters by budget and deadline, ranks the feasible options, and produces a revised itinerary.

Load it instantly with the **"Load demo scenario"** button in the disruption form, or the **"Try the cancelled-train demo"** button on the dashboard.

## Tech stack

- React 18 + TypeScript + Vite
- Tailwind CSS (custom midnight-navy / amber palette)
- lucide-react icons
- No paid APIs, no database, no login, no API keys

## Getting started

```bash
npm install
npm run dev        # start the dev server
npm run build      # production build
npm run typecheck  # tsc --noEmit
```

## Architecture

```
src/
  types.ts                    # Typed interfaces: Disruption, TravellerProfile, Alternative, ScoredAlternative, RecoveryPlan, AgentStep
  data/
    sampleData.ts             # Illustrative cities, fares, schedules, hotel rooms; demo scenario
  engine/
    recovery.ts               # Pure recovery logic: filter, score, rank, rationale, next actions
    selfTest.ts               # Lightweight engine self-checks (run with: npx tsx src/engine/selfTest.ts)
  components/
    Dashboard.tsx             # Landing/dashboard view
    DisruptionForm.tsx        # Validated disruption + constraints form
    AgentActivityPanel.tsx    # Transparent agent log
    ResultsDashboard.tsx      # Ranked alternatives, selected plan, before/after, itinerary
    RouteDiagram.tsx           # Decorative route visuals
    ModeIcon.tsx              # Mode iconography
    SampleDataNote.tsx        # Reusable sample-data disclaimer pill
  App.tsx                     # State machine (dashboard/form/results), agent animation, localStorage
```

Business logic lives entirely in `src/engine/recovery.ts` and is separated from all UI. The engine is deterministic and has no I/O.

### Ranking algorithm

Each feasible alternative receives a 0–100 composite score:

```
score = 100 * (wBudget * budgetScore
             + wArrival * arrivalScore
             + wDuration * durationScore
             + wDestination * destinationScore
             + 0.05 * comfort)
```

where each criterion is min-max normalized against the feasible set (lower-is-better for cost/duration/delay), `arrivalScore` is 1.0 if the option arrives before the deadline and scales down with lateness, and `comfort` is a small tiebreaker. Default weights are budget 0.35 / arrival 0.30 / duration 0.20 / destination 0.15, user-overridable via `TravellerProfile.weights`.

Hard constraints (extra budget, arrival deadline, max delay) filter options first. If the deadline wipes out everything, the engine relaxes the deadline so the traveller still sees a recovery plan with a clear warning. Rejected options are shown with reasons.

## Limitations

- All data is **illustrative**. Schedules, fares, availability, and disruption records are hand-authored for the demo and do not reflect real-time inventory.
- Recommendations are not booking confirmations. The traveller must book directly with the operator.
- No live APIs are contacted. The "agent activity" panel animates real local computation, not external calls.
- The sample catalogue focuses on the Mangaluru ↔ Bengaluru corridor plus generic flight/hotel options for other city pairs.

## Acceptance checklist

- [x] App launches and builds with no errors.
- [x] Cancelled-train demo runs end-to-end without credentials.
- [x] Form validation works with inline errors.
- [x] Alternatives are genuinely filtered and ranked by the engine.
- [x] User can select an alternative and view a revised itinerary.
- [x] Sample-data disclaimer is visible wherever fares/schedules appear.
- [x] Responsive on desktop and mobile.
- [x] Copy-to-clipboard and print/PDF export work.
- [x] README documents architecture, features, and limitations.
