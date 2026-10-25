import { ArrowRight, CheckCircle2, Clock, Copy, IndianRupee, Printer, X, Route, Sparkles } from 'lucide-react';
import type { Disruption, ScoredAlternative, RecoveryPlan } from '@/types';
import { fmtDuration, fmtTime, nextActionsFor } from '@/engine/recovery';
import { ModeIcon, MODE_LABEL } from './ModeIcon';
import { SampleDataNote } from './SampleDataNote';
import { RouteDiagram } from './RouteDiagram';

export function ResultsDashboard({
  plan,
  onSelect,
  onRestart,
  onCopy,
  copied,
}: {
  plan: RecoveryPlan;
  onSelect: (s: ScoredAlternative) => void;
  onRestart: () => void;
  onCopy: () => void;
  copied: boolean;
}) {
  const feasible = plan.scored.filter((s) => s.feasible);
  const rejected = plan.scored.filter((s) => !s.feasible);
  const selected = plan.selected ?? feasible[0];

  return (
    <div className="space-y-6">
      {/* Disrupted booking summary */}
      <section className="rounded-2xl border border-navy-100 bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slatey">Disrupted booking</p>
            <h3 className="mt-1 flex items-center gap-2 text-lg font-bold text-navy-900">
              <ModeIcon mode={plan.disruption.mode} />
              {plan.disruption.origin.name} → {plan.disruption.destination.name}
            </h3>
            <p className="mt-1 text-sm text-slatey">{plan.disruption.reason}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-red-500" />
            {plan.disruption.refunded ? 'Cancelled — refund due' : 'Cancelled'}
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Stat label="Original departure" value={fmtTime(plan.disruption.originalDeparture)} />
          <Stat label="Original arrival" value={fmtTime(plan.disruption.originalArrival)} />
          <Stat label="Original fare" value={`₹${plan.disruption.originalFare}`} />
        </div>
      </section>

      {/* Feasible alternatives */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-navy-900">
            Ranked alternatives <span className="text-sm font-normal text-slatey">({feasible.length} feasible)</span>
          </h3>
          <SampleDataNote />
        </div>

        {feasible.length === 0 ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
            No alternative fully satisfies your constraints. Try relaxing your budget or deadline and run recovery again.
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-3">
            {feasible.map((s) => (
              <AltCard key={s.alt.id} s={s} selected={selected?.alt.id === s.alt.id} onSelect={() => onSelect(s)} />
            ))}
          </div>
        )}
      </section>

      {/* Rejected (transparent) */}
      {rejected.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-slatey">Rejected options ({rejected.length})</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {rejected.map((s) => (
              <div key={s.alt.id} className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50/60 px-3 py-2 text-xs text-red-700">
                <X className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  <strong className="font-semibold">{s.alt.label}</strong> — {s.rejectionReason}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Selected recovery plan */}
      {selected && (
        <SelectedPlanCard
          s={selected}
          plan={plan}
          onCopy={onCopy}
          copied={copied}
          onRestart={onRestart}
        />
      )}
    </div>
  );
}

function AltCard({
  s,
  selected,
  onSelect,
}: {
  s: ScoredAlternative;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex flex-col gap-3 rounded-2xl border p-4 text-left transition ${
        selected
          ? 'border-amber-400 bg-amber-50/60 shadow-glow'
          : 'border-navy-100 bg-white hover:border-navy-300 hover:shadow-card'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy-900 text-amber-300">
            <ModeIcon mode={s.alt.mode} />
          </span>
          <div>
            <p className="text-sm font-semibold text-navy-900">{s.alt.label}</p>
            <p className="text-[11px] uppercase tracking-wide text-slatey">{MODE_LABEL[s.alt.mode]}</p>
          </div>
        </div>
        <ScoreBadge score={s.score} />
      </div>

      <div className="flex items-center justify-between text-xs text-navy-700">
        <span className="font-medium">{fmtTime(s.alt.departure)}</span>
        <ArrowRight className="h-3 w-3 text-slatey" />
        <span className="font-medium">{fmtTime(s.alt.arrival)}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <Mini label="Extra" value={`₹${s.extraCost}`} />
        <Mini label="Duration" value={fmtDuration(s.alt.durationMinutes)} />
        <Mini label="Delay" value={`${s.delayVsOriginalMinutes > 0 ? '+' : ''}${s.delayVsOriginalMinutes}m`} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {s.recommendation === 'best' && (
          <Tag color="amber" icon={<Sparkles className="h-3 w-3" />}>Best overall</Tag>
        )}
        {s.recommendation === 'lowest-cost' && (
          <Tag color="emerald" icon={<IndianRupee className="h-3 w-3" />}>Lowest cost</Tag>
        )}
        {s.arrivesBeforeDeadline && <Tag color="navy">Before deadline</Tag>}
      </div>

      <p className="text-[11px] leading-snug text-slatey">{s.rationale}</p>

      {selected && (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white">
          <CheckCircle2 className="h-3 w-3" /> Selected
        </span>
      )}
    </button>
  );
}

function SelectedPlanCard({
  s,
  plan,
  onCopy,
  copied,
  onRestart,
}: {
  s: ScoredAlternative;
  plan: RecoveryPlan;
  onCopy: () => void;
  copied: boolean;
  onRestart: () => void;
}) {
  const actions = nextActionsFor(s, plan.disruption, plan.traveller);
  return (
    <section className="print-area rounded-2xl border border-navy-100 bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slatey">Revised itinerary</p>
          <h3 className="mt-1 flex items-center gap-2 text-lg font-bold text-navy-900">
            <ModeIcon mode={s.alt.mode} />
            {s.alt.label}
          </h3>
        </div>
        <div className="flex flex-wrap gap-2 no-print">
          <button
            onClick={onCopy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-800 hover:border-navy-300"
          >
            {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy itinerary'}
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-navy-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-800 hover:border-navy-300"
          >
            <Printer className="h-3.5 w-3.5" /> Print / PDF
          </button>
          <button
            onClick={onRestart}
            className="inline-flex items-center gap-1.5 rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-navy-800"
          >
            New recovery
          </button>
        </div>
      </div>

      {/* Before / after comparison */}
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <ComparisonCard title="Original" disruption={plan.disruption} tone="muted" />
        <ComparisonCard title="Revised" disruption={plan.disruption} alt={s} tone="accent" />
      </div>

      {/* Step-by-step itinerary */}
      <div className="mt-5">
        <h4 className="mb-2 text-sm font-semibold text-navy-900">Step-by-step itinerary</h4>
        <ol className="space-y-2">
          {s.alt.segments.map((seg, i) => (
            <li key={i} className="flex items-start gap-3 rounded-xl border border-navy-100 bg-navy-50/50 px-3 py-2.5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-navy-900 text-xs font-bold text-amber-300">
                {i + 1}
              </span>
              <div className="flex-1 text-sm">
                <p className="font-semibold text-navy-900">
                  {MODE_LABEL[seg.mode]} · {seg.label}
                </p>
                <p className="text-xs text-slatey">
                  {seg.from} → {seg.to} · {fmtTime(seg.depart)} – {fmtTime(seg.arrive)} · {fmtDuration(
                    Math.round((seg.arrive - seg.depart) / 60000)
                  )}
                </p>
                {seg.notes && <p className="mt-0.5 text-[11px] text-slatey">{seg.notes}</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Cost arithmetic */}
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Stat label="Extra cost vs original" value={`₹${s.extraCost}`} tone="amber" />
        <Stat
          label="Time vs original"
          value={`${s.delayVsOriginalMinutes > 0 ? '+' : ''}${fmtDuration(Math.abs(s.delayVsOriginalMinutes))}`}
          tone={s.delayVsOriginalMinutes > 0 ? 'red' : 'emerald'}
        />
        <Stat
          label="Deadline"
          value={s.arrivesBeforeDeadline ? 'Met' : 'Missed'}
          tone={s.arrivesBeforeDeadline ? 'emerald' : 'red'}
        />
      </div>

      {/* Next actions checklist */}
      <div className="mt-5">
        <h4 className="mb-2 text-sm font-semibold text-navy-900">Recommended next actions</h4>
        <ul className="space-y-1.5">
          {actions.map((a, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-navy-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              {a}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <SampleDataNote />
      </div>
    </section>
  );
}

function ComparisonCard({
  title,
  disruption,
  alt,
  tone,
}: {
  title: string;
  disruption: Disruption;
  alt?: ScoredAlternative;
  tone: 'muted' | 'accent';
}) {
  const depart = alt ? alt.alt.departure : disruption.originalDeparture;
  const arrive = alt ? alt.alt.arrival : disruption.originalArrival;
  const fare = alt ? alt.extraCost : 0;
  return (
    <div
      className={`rounded-xl border p-4 ${
        tone === 'accent' ? 'border-amber-300 bg-amber-50/60' : 'border-navy-100 bg-navy-50/40'
      }`}
    >
      <p className={`mb-2 text-xs font-semibold uppercase tracking-wide ${tone === 'accent' ? 'text-amber-700' : 'text-slatey'}`}>
        {title}
      </p>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-navy-900">{disruption.origin.code}</span>
        <div className="flex-1">
          <RouteDiagram origin={disruption.origin} destination={disruption.destination} dark={false} />
        </div>
        <span className="text-sm font-semibold text-navy-900">{disruption.destination.code}</span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1 text-navy-700">
          <Clock className="h-3 w-3" /> {fmtTime(depart)}
        </div>
        <div className="flex items-center justify-end gap-1 text-navy-700">
          <Route className="h-3 w-3" /> {fmtTime(arrive)}
        </div>
        <div className="text-slatey">Fare impact:</div>
        <div className="text-right font-semibold text-navy-900">
          {alt ? `+ ₹${fare}` : `₹${disruption.originalFare}`}
        </div>
      </div>
    </div>
  );
}

// --- small primitives ---

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'amber' | 'emerald' | 'red';
}) {
  const toneCls =
    tone === 'amber'
      ? 'text-amber-700'
      : tone === 'emerald'
      ? 'text-emerald-700'
      : tone === 'red'
      ? 'text-red-700'
      : 'text-navy-900';
  return (
    <div className="rounded-xl border border-navy-100 bg-navy-50/40 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-slatey">{label}</p>
      <p className={`mt-0.5 text-sm font-bold ${toneCls}`}>{value}</p>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-navy-50 px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-wide text-slatey">{label}</p>
      <p className="text-xs font-bold text-navy-900">{value}</p>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-navy-900 px-2 py-0.5 text-[11px] font-bold text-amber-300">
      {score}
    </span>
  );
}

function Tag({
  color,
  children,
  icon,
}: {
  color: 'amber' | 'emerald' | 'navy';
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  const cls =
    color === 'amber'
      ? 'bg-amber-100 text-amber-700'
      : color === 'emerald'
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-navy-100 text-navy-700';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
      {icon}
      {children}
    </span>
  );
}
