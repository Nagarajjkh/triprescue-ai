import { forwardRef, useEffect, useState } from 'react';
import { AlertCircle, Bus, Plane, BedDouble, Train, Wand2, RotateCcw } from 'lucide-react';
import type { Disruption, Mode, TravellerProfile } from '@/types';
import { CITIES, DISRUPTION_REASONS, SAMPLE_DISRUPTION, SAMPLE_TRAVELLER, istTime } from '@/data/sampleData';

export interface FormState {
  mode: Mode;
  originCode: string;
  destinationCode: string;
  reason: string;
  depDate: string;
  depTime: string;
  arrDate: string;
  arrTime: string;
  originalFare: number;
  extraBudgetInr: number;
  maxDelayMinutes: number;
  deadlineDate: string;
  deadlineTime: string;
  pax: number;
  refunded: boolean;
}

const MODES: { id: Mode; label: string; icon: typeof Plane }[] = [
  { id: 'train', label: 'Train', icon: Train },
  { id: 'flight', label: 'Flight', icon: Plane },
  { id: 'hotel', label: 'Hotel', icon: BedDouble },
];

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

// Format an epoch ms into the {date,time} strings an <input type=date/time> expects,
// pinned to IST so the value round-trips correctly through istTime() regardless of
// the browser's local timezone.
function toLocalInput(ts: number): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(ts));
  const get = (t: string): string => parts.find((p) => p.type === t)?.value ?? '00';
  // Intl can emit "24" as the hour for midnight in some engines; normalise to "00".
  const hour = get('hour') === '24' ? '00' : get('hour');
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${hour}:${get('minute')}` };
}

export function buildDemoFormState(): FormState {
  const dep = toLocalInput(SAMPLE_DISRUPTION.originalDeparture);
  const arr = toLocalInput(SAMPLE_DISRUPTION.originalArrival);
  const dl = toLocalInput(SAMPLE_TRAVELLER.arrivalDeadline);
  return {
    mode: 'train',
    originCode: 'IXE',
    destinationCode: 'BLR',
    reason: 'Train cancelled',
    depDate: dep.date,
    depTime: dep.time,
    arrDate: arr.date,
    arrTime: arr.time,
    originalFare: SAMPLE_DISRUPTION.originalFare,
    extraBudgetInr: SAMPLE_TRAVELLER.extraBudgetInr,
    maxDelayMinutes: SAMPLE_TRAVELLER.maxDelayMinutes,
    deadlineDate: dl.date,
    deadlineTime: dl.time,
    pax: SAMPLE_TRAVELLER.pax,
    refunded: true,
  };
}

const EMPTY_FORM: FormState = {
  mode: 'train',
  originCode: 'IXE',
  destinationCode: 'BLR',
  reason: '',
  depDate: '2026-10-25',
  depTime: '20:30',
  arrDate: '2026-10-26',
  arrTime: '05:45',
  originalFare: 480,
  extraBudgetInr: 1500,
  maxDelayMinutes: 90,
  deadlineDate: '2026-10-26',
  deadlineTime: '07:00',
  pax: 1,
  refunded: true,
};

interface Errors {
  [k: string]: string | undefined;
}

export const DisruptionForm = forwardRef<
  HTMLFormElement,
  {
    initial: FormState;
    onSubmit: (d: Disruption, p: TravellerProfile) => void;
    onLoadDemo: () => void;
    onReset: () => void;
  }
>(function DisruptionForm({ initial, onSubmit, onLoadDemo, onReset }, ref) {
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<Errors>({});

  // Sync local form state when the parent pushes a new scenario via `initial`
  // (Load demo scenario, scenario cards, Reset). useState(initial) only reads
  // the prop on first mount, so without this effect those buttons would appear
  // to do nothing while the user is already on the form.
  useEffect(() => {
    setForm(initial);
    setErrors({});
  }, [initial]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(): Errors {
    const e: Errors = {};
    if (!form.originCode) e.originCode = 'Origin is required.';
    if (!form.destinationCode) e.destinationCode = 'Destination is required.';
    if (form.originCode === form.destinationCode) {
      if (form.mode !== 'hotel') e.destinationCode = 'Origin and destination must differ for travel.';
    }
    if (!form.reason.trim()) e.reason = 'Disruption reason is required.';
    if (!form.depDate || !form.depTime) e.depDate = 'Original departure is required.';
    if (!form.arrDate || !form.arrTime) e.arrDate = 'Original arrival is required.';
    if (!form.deadlineDate || !form.deadlineTime) e.deadlineDate = 'Arrival deadline is required.';
    if (form.originalFare < 0) e.originalFare = 'Fare cannot be negative.';
    if (form.extraBudgetInr < 0) e.extraBudgetInr = 'Budget cannot be negative.';
    if (form.pax < 1) e.pax = 'At least one traveller.';
    if (form.maxDelayMinutes < 0) e.maxDelayMinutes = 'Delay cannot be negative.';
    // Deadline sanity: must be after original departure.
    const depTs = Date.parse(`${form.depDate}T${form.depTime}:00`);
    const arrTs = Date.parse(`${form.arrDate}T${form.arrTime}:00`);
    const dlTs = Date.parse(`${form.deadlineDate}T${form.deadlineTime}:00`);
    if (depTs && arrTs && arrTs < depTs) e.arrDate = 'Arrival cannot be before departure.';
    if (depTs && dlTs && dlTs < depTs) e.deadlineDate = 'Deadline must be after original departure.';
    return e;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    const d: Disruption = {
      mode: form.mode,
      origin: CITIES.find((c) => c.code === form.originCode)!,
      destination: CITIES.find((c) => c.code === form.destinationCode)!,
      reason: form.reason.trim(),
      originalDeparture: istTime(form.depDate, form.depTime),
      originalArrival: istTime(form.arrDate, form.arrTime),
      originalFare: Number(form.originalFare),
      refunded: form.refunded,
    };
    const p: TravellerProfile = {
      extraBudgetInr: Number(form.extraBudgetInr),
      arrivalDeadline: istTime(form.deadlineDate, form.deadlineTime),
      maxDelayMinutes: Number(form.maxDelayMinutes),
      pax: Number(form.pax),
    };
    onSubmit(d, p);
  }

  const reasons = DISRUPTION_REASONS[form.mode];

  return (
    <form ref={ref} onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Mode */}
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-navy-900">Disruption type</legend>
        <div className="grid grid-cols-3 gap-2">
          {MODES.map((m) => {
            const active = form.mode === m.id;
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  set('mode', m.id);
                  set('reason', DISRUPTION_REASONS[m.id][0]);
                }}
                aria-pressed={active}
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'border-amber-400 bg-amber-50 text-navy-900 shadow-glow'
                    : 'border-navy-100 bg-white text-navy-700 hover:border-navy-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {m.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Origin / Destination */}
      {form.mode === 'hotel' ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="City" error={errors.originCode}>
            <select
              className={inputCls(errors.originCode)}
              value={form.originCode}
              onChange={(e) => {
                set('originCode', e.target.value);
                set('destinationCode', e.target.value);
              }}
            >
              {CITIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </Field>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Origin" error={errors.originCode}>
            <select
              className={inputCls(errors.originCode)}
              value={form.originCode}
              onChange={(e) => set('originCode', e.target.value)}
            >
              {CITIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Destination" error={errors.destinationCode}>
            <select
              className={inputCls(errors.destinationCode)}
              value={form.destinationCode}
              onChange={(e) => set('destinationCode', e.target.value)}
            >
              {CITIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </Field>
        </div>
      )}

      {/* Reason */}
      <Field label="Disruption reason" error={errors.reason}>
        <select
          className={inputCls(errors.reason)}
          value={form.reason}
          onChange={(e) => set('reason', e.target.value)}
        >
          <option value="">Select a reason…</option>
          {reasons.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </Field>

      {/* Original departure / arrival */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Original departure" error={errors.depDate}>
          <div className="flex gap-2">
            <input
              type="date"
              className={inputCls(errors.depDate)}
              value={form.depDate}
              onChange={(e) => set('depDate', e.target.value)}
            />
            <input
              type="time"
              className={inputCls(errors.depDate) + ' w-32'}
              value={form.depTime}
              onChange={(e) => set('depTime', e.target.value)}
            />
          </div>
        </Field>
        <Field label="Original arrival" error={errors.arrDate}>
          <div className="flex gap-2">
            <input
              type="date"
              className={inputCls(errors.arrDate)}
              value={form.arrDate}
              onChange={(e) => set('arrDate', e.target.value)}
            />
            <input
              type="time"
              className={inputCls(errors.arrDate) + ' w-32'}
              value={form.arrTime}
              onChange={(e) => set('arrTime', e.target.value)}
            />
          </div>
        </Field>
      </div>

      {/* Budget + deadline + delay + pax */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Maximum extra budget (₹)" error={errors.extraBudgetInr}>
          <input
            type="number"
            min={0}
            step={50}
            className={inputCls(errors.extraBudgetInr)}
            value={form.extraBudgetInr}
            onChange={(e) => set('extraBudgetInr', Number(e.target.value))}
          />
        </Field>
        <Field label="Required arrival deadline" error={errors.deadlineDate}>
          <div className="flex gap-2">
            <input
              type="date"
              className={inputCls(errors.deadlineDate)}
              value={form.deadlineDate}
              onChange={(e) => set('deadlineDate', e.target.value)}
            />
            <input
              type="time"
              className={inputCls(errors.deadlineDate) + ' w-32'}
              value={form.deadlineTime}
              onChange={(e) => set('deadlineTime', e.target.value)}
            />
          </div>
        </Field>
        <Field label="Max acceptable delay (minutes)" error={errors.maxDelayMinutes}>
          <input
            type="number"
            min={0}
            step={5}
            className={inputCls(errors.maxDelayMinutes)}
            value={form.maxDelayMinutes}
            onChange={(e) => set('maxDelayMinutes', Number(e.target.value))}
          />
        </Field>
        <Field label="Number of travellers" error={errors.pax}>
          <input
            type="number"
            min={1}
            max={9}
            className={inputCls(errors.pax)}
            value={form.pax}
            onChange={(e) => set('pax', Number(e.target.value))}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Original fare paid (₹)" error={errors.originalFare}>
          <input
            type="number"
            min={0}
            step={10}
            className={inputCls(errors.originalFare)}
            value={form.originalFare}
            onChange={(e) => set('originalFare', Number(e.target.value))}
          />
        </Field>
        <label className="flex items-end gap-2 text-sm text-navy-700">
          <input
            type="checkbox"
            checked={form.refunded}
            onChange={(e) => set('refunded', e.target.checked)}
            className="h-4 w-4 rounded border-navy-300 text-amber-500 focus:ring-amber-400"
          />
          Original booking fully refunded
        </label>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-navy-900 shadow-glow transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
        >
          <Wand2 className="h-4 w-4" />
          Recover my trip
        </button>
        <button
          type="button"
          onClick={onLoadDemo}
          className="inline-flex items-center gap-2 rounded-xl border border-navy-200 bg-white px-4 py-3 text-sm font-semibold text-navy-800 transition hover:border-navy-300"
        >
          Load demo scenario
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-xl border border-navy-200 bg-white px-4 py-3 text-sm font-semibold text-navy-800 transition hover:border-navy-300"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Please fix the highlighted fields and try again.</span>
        </div>
      )}
    </form>
  );
});

function inputCls(err?: string): string {
  return `w-full rounded-lg border bg-white px-3 py-2 text-sm text-navy-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200 ${
    err ? 'border-red-300 bg-red-50' : 'border-navy-200'
  }`;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-navy-900">{label}</span>
      {children}
      {error && (
        <span className="mt-1 flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="h-3 w-3" />
          {error}
        </span>
      )}
    </label>
  );
}

export { EMPTY_FORM };
