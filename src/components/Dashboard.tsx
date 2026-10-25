import { Train, Plane, BedDouble, Wand2, Gauge, Route as RouteIcon, ListChecks } from 'lucide-react';
import { SampleDataNote } from './SampleDataNote';

const SCENARIOS = [
  {
    id: 'train',
    icon: Train,
    title: 'Cancelled Train',
    desc: 'Mangaluru → Bengaluru overnight train cancelled. Recover within budget and a 7:00 AM deadline.',
    tone: 'red',
  },
  {
    id: 'flight',
    icon: Plane,
    title: 'Delayed Flight',
    desc: 'Connecting flight delayed 4+ hours, risking a meeting. Find an alternate routing that lands in time.',
    tone: 'amber',
  },
  {
    id: 'hotel',
    icon: BedDouble,
    title: 'Hotel Cancellation',
    desc: 'Property overbooked at check-in. Suggest comparable nearby stays and adjust the itinerary.',
    tone: 'amber',
  },
] as const;

const STEPS = [
  { icon: Gauge, title: 'Assess the disruption', desc: 'Identify the affected booking, segments, and refund status.' },
  { icon: RouteIcon, title: 'Generate alternatives', desc: 'Surface illustrative flights, trains, buses, and stays for the route.' },
  { icon: ListChecks, title: 'Rank & recover', desc: 'Filter by budget and deadline, rank by your priorities, ship a revised itinerary.' },
];

export function Dashboard({
  onRecover,
  onScenario,
}: {
  onRecover: () => void;
  onScenario: (id: string) => void;
}) {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="route-bg relative overflow-hidden rounded-3xl border border-navy-700 bg-navy-900 px-6 py-10 text-white shadow-card sm:px-10 sm:py-14">
        <div className="route-line absolute inset-x-0 top-0 h-1 opacity-30" />
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-amber-300">
            <Wand2 className="h-3.5 w-3.5" /> TripRescue AI · DevHack 2026 PS 4.1
          </span>
          <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
            When travel breaks, we find your way forward.
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-navy-100 sm:text-base">
            An AI recovery agent that turns cancelled flights, trains, and hotels into ranked, budget-aware
            alternative plans — with a transparent step-by-step itinerary you can act on immediately.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={onRecover}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-navy-900 shadow-glow transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              <Wand2 className="h-4 w-4" /> Recover my trip
            </button>
            <button
              onClick={() => onScenario('train')}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Train className="h-4 w-4" /> Try the cancelled-train demo
            </button>
          </div>
          <div className="mt-5">
            <SampleDataNote className="border-white/15 bg-white/5 text-amber-200" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section>
        <h2 className="text-lg font-bold text-navy-900">How recovery works</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="rounded-2xl border border-navy-100 bg-white p-4 shadow-card">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-amber-300">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slatey">Step {i + 1}</span>
                </div>
                <h3 className="mt-3 text-sm font-bold text-navy-900">{s.title}</h3>
                <p className="mt-1 text-sm text-slatey">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Scenario cards */}
      <section>
        <h2 className="text-lg font-bold text-navy-900">Example disruptions</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {SCENARIOS.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                onClick={() => onScenario(c.id)}
                className={`flex flex-col gap-3 rounded-2xl border bg-white p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-glow ${
                  c.tone === 'red' ? 'border-red-100' : 'border-amber-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-xl ${
                      c.tone === 'red' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slatey">Demo</span>
                </div>
                <h3 className="text-sm font-bold text-navy-900">{c.title}</h3>
                <p className="text-sm text-slatey">{c.desc}</p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
