import { useCallback, useEffect, useState } from 'react';
import { Compass, Github, HeartPulse, ArrowLeft } from 'lucide-react';
import type { AgentStep, Disruption, RecoveryPlan, ScoredAlternative, TravellerProfile } from '@/types';
import { alternativesFor } from '@/data/sampleData';
import { rankAlternatives, nextActionsFor } from '@/engine/recovery';
import { Dashboard } from '@/components/Dashboard';
import { DisruptionForm, buildDemoFormState, type FormState } from '@/components/DisruptionForm';
import { AgentActivityPanel } from '@/components/AgentActivityPanel';
import { ResultsDashboard } from '@/components/ResultsDashboard';

type View = 'dashboard' | 'form' | 'results';

const STORAGE_KEY = 'triprescue.demo.v1';

const AGENT_STEPS: Omit<AgentStep, 'status'>[] = [
  { id: 'assess', label: 'Assessing disruption', detail: 'Reading the cancelled booking and refund status.' },
  { id: 'segments', label: 'Identifying affected segments', detail: 'Locating origin → destination segments in your itinerary.' },
  { id: 'filter', label: 'Filtering against constraints', detail: 'Applying budget, deadline, and delay limits to candidate options.' },
  { id: 'rank', label: 'Ranking feasible alternatives', detail: 'Scoring options on budget, arrival, duration, and destination.' },
  { id: 'itinerary', label: 'Generating recovery itinerary', detail: 'Composing revised step-by-step itinerary and next actions.' },
];

function emptySteps(): AgentStep[] {
  return AGENT_STEPS.map((s) => ({ ...s, status: 'pending' as const }));
}

interface PersistedState {
  view: View;
  form: FormState;
  disruption?: Disruption;
  traveller?: TravellerProfile;
  plan?: RecoveryPlan;
}

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [form, setForm] = useState<FormState>(() => buildDemoFormState());
  const [disruption, setDisruption] = useState<Disruption | null>(null);
  const [traveller, setTraveller] = useState<TravellerProfile | null>(null);
  const [plan, setPlan] = useState<RecoveryPlan | null>(null);
  const [steps, setSteps] = useState<AgentStep[]>(emptySteps);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  // Hydrate from localStorage.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as PersistedState;
      if (data.form) setForm(data.form);
      if (data.disruption) setDisruption(data.disruption);
      if (data.traveller) setTraveller(data.traveller);
      if (data.plan) setPlan(data.plan);
      if (data.view) setView(data.view);
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  // Persist.
  useEffect(() => {
    const payload: PersistedState = { view, form, disruption: disruption ?? undefined, traveller: traveller ?? undefined, plan: plan ?? undefined };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* ignore */
    }
  }, [view, form, disruption, traveller, plan]);

  const startRecovery = useCallback(
    async (d: Disruption, p: TravellerProfile) => {
      setDisruption(d);
      setTraveller(p);
      setView('results');
      setRunning(true);
      setPlan(null);
      setSteps(emptySteps());

      // Run the agent steps with small delays to show real progress.
      // Each step toggles state that reflects actual local computation.
      const stepList = emptySteps();
      setSteps([...stepList]);

      const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

      // Step 1: assess
      stepList[0].status = 'running';
      stepList[0].startedAt = Date.now();
      setSteps([...stepList]);
      await delay(450);
      stepList[0].status = 'done';
      stepList[0].finishedAt = Date.now();
      setSteps([...stepList]);

      // Step 2: segments
      stepList[1].status = 'running';
      setSteps([...stepList]);
      await delay(500);
      stepList[1].status = 'done';
      setSteps([...stepList]);

      // Step 3: filter (compute candidates)
      stepList[2].status = 'running';
      setSteps([...stepList]);
      const candidates = alternativesFor(d);
      await delay(600);
      stepList[2].status = 'done';
      stepList[2].detail = `Evaluated ${candidates.length} candidate options for ${d.origin.code} → ${d.destination.code}.`;
      setSteps([...stepList]);

      // Step 4: rank
      stepList[3].status = 'running';
      setSteps([...stepList]);
      const scored = rankAlternatives(candidates, d, p);
      await delay(600);
      const feasibleCount = scored.filter((s) => s.feasible).length;
      stepList[3].status = 'done';
      stepList[3].detail = `${feasibleCount} feasible of ${scored.length} options, ranked by your priorities.`;
      setSteps([...stepList]);

      // Step 5: itinerary
      stepList[4].status = 'running';
      setSteps([...stepList]);
      const best = scored.find((s) => s.feasible);
      const selected = best ?? scored[0];
      const actions = selected ? nextActionsFor(selected, d, p) : [];
      const newPlan: RecoveryPlan = {
        disruption: d,
        traveller: p,
        scored,
        selected,
        nextActions: actions,
        generatedAt: Date.now(),
      };
      await delay(450);
      stepList[4].status = 'done';
      setSteps([...stepList]);
      setPlan(newPlan);
      setRunning(false);
    },
    []
  );

  const handleSelect = useCallback(
    (s: ScoredAlternative) => {
      if (!plan || !disruption || !traveller) return;
      setPlan({ ...plan, selected: s });
    },
    [plan, disruption, traveller]
  );

  const handleLoadDemo = useCallback(() => {
    const demo = buildDemoFormState();
    setForm(demo);
    setView('form');
  }, []);

  const handleReset = useCallback(() => {
    setForm(buildDemoFormState());
    setDisruption(null);
    setTraveller(null);
    setPlan(null);
    setSteps(emptySteps());
    setView('form');
  }, []);

  const handleScenario = useCallback(
    (id: string) => {
      const demo = buildDemoFormState();
      if (id === 'flight') {
        demo.mode = 'flight';
        demo.reason = 'Weather delay over 4 hours';
      } else if (id === 'hotel') {
        demo.mode = 'hotel';
        demo.reason = 'Overbooked by property';
      } else {
        demo.mode = 'train';
        demo.reason = 'Train cancelled';
      }
      setForm(demo);
      setView('form');
    },
    []
  );

  const handleRestart = useCallback(() => {
    setDisruption(null);
    setTraveller(null);
    setPlan(null);
    setSteps(emptySteps());
    setView('form');
  }, []);

  const handleCopy = useCallback(async () => {
    if (!plan?.selected) return;
    const lines = buildClipboardText(plan);
    try {
      await navigator.clipboard.writeText(lines);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback for browsers without clipboard permission.
      const ta = document.createElement('textarea');
      ta.value = lines;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }, [plan]);

  const showAgent = view === 'results';

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-navy-900">
      <Header view={view} onHome={() => setView('dashboard')} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {view === 'dashboard' && (
          <div className="animate-fade-in">
            <Dashboard onRecover={() => setView('form')} onScenario={handleScenario} />
          </div>
        )}

        {view === 'form' && (
          <div className="mx-auto max-w-3xl animate-fade-in">
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setView('dashboard')}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slatey hover:text-navy-900"
              >
                <ArrowLeft className="h-4 w-4" /> Back to dashboard
              </button>
            </div>
            <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card">
              <h2 className="text-lg font-bold text-navy-900">Describe the disruption</h2>
              <p className="mt-1 text-sm text-slatey">
                Enter the cancelled booking and your constraints. The recovery agent will rank feasible alternatives.
              </p>
              <div className="mt-5">
                <DisruptionForm
                  initial={form}
                  onSubmit={startRecovery}
                  onLoadDemo={handleLoadDemo}
                  onReset={handleReset}
                />
              </div>
            </div>
          </div>
        )}

        {view === 'results' && (
          <div className="grid animate-fade-in gap-6 lg:grid-cols-[1fr_320px]">
            <div>
              {plan && disruption && traveller ? (
                <ResultsDashboard
                  plan={plan}
                  onSelect={handleSelect}
                  onRestart={handleRestart}
                  onCopy={handleCopy}
                  copied={copied}
                />
              ) : (
                <EmptyResults running={running} />
              )}
            </div>
            <div className="lg:sticky lg:top-24 lg:h-[520px]">
              <AgentActivityPanel steps={steps} />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function Header({ view, onHome }: { view: View; onHome: () => void }) {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-navy-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <button onClick={onHome} className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-900 text-amber-300 shadow-card">
            <Compass className="h-5 w-5" />
          </span>
          <div className="text-left">
            <p className="text-sm font-extrabold tracking-tight text-navy-900">TripRescue AI</p>
            <p className="-mt-0.5 text-[10px] uppercase tracking-wider text-slatey">Disruption Recovery Agent</p>
          </div>
        </button>
        <nav className="flex items-center gap-2 text-sm">
          <NavBtn active={view === 'dashboard'} onClick={onHome}>Dashboard</NavBtn>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-slatey hover:text-navy-900 sm:inline-flex"
          >
            <Github className="h-4 w-4" /> Source
          </a>
        </nav>
      </div>
    </header>
  );
}

function NavBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 font-medium transition ${
        active ? 'bg-navy-900 text-amber-300' : 'text-slatey hover:text-navy-900'
      }`}
    >
      {children}
    </button>
  );
}

function EmptyResults({ running }: { running: boolean }) {
  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-10 text-center shadow-card">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-navy-50">
        <HeartPulse className={`h-6 w-6 text-amber-500 ${running ? 'animate-pulse-soft' : ''}`} />
      </div>
      <p className="mt-4 text-sm font-semibold text-navy-900">
        {running ? 'The recovery agent is working…' : 'No recovery plan yet.'}
      </p>
      <p className="mt-1 text-sm text-slatey">
        {running
          ? 'Watch the agent activity panel for live progress.'
          : 'Describe a disruption and run recovery to see ranked alternatives here.'}
      </p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="no-print mx-auto max-w-7xl px-4 py-8 text-center text-xs text-slatey sm:px-6 lg:px-8">
      TripRescue AI · DevHack 2026 PS 4.1 · All schedules, fares, and availability are illustrative sample data and
      do not represent live booking inventory.
    </footer>
  );
}

// Build a plain-text clipboard version of the recovery plan.
function buildClipboardText(plan: RecoveryPlan): string {
  const s = plan.selected;
  if (!s) return 'No alternative selected.';
  const d = plan.disruption;
  const lines: string[] = [
    'TripRescue AI — Recovery Plan',
    '================================',
    `Disruption: ${d.mode.toUpperCase()} ${d.origin.name} → ${d.destination.name} — ${d.reason}`,
    `Selected: ${s.alt.label}`,
    `Departure: ${new Date(s.alt.departure).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
    `Arrival:   ${new Date(s.alt.arrival).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
    `Extra cost: ₹${s.extraCost}`,
    `Time vs original: ${s.delayVsOriginalMinutes > 0 ? '+' : ''}${s.delayVsOriginalMinutes} min`,
    `Deadline: ${s.arrivesBeforeDeadline ? 'Met' : 'Missed'}`,
    '',
    'Next actions:',
    ...plan.nextActions.map((a, i) => `${i + 1}. ${a}`),
    '',
    'Note: All fares/schedules are illustrative sample data. Confirm bookings directly with the operator.',
  ];
  return lines.join('\n');
}


