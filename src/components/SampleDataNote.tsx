import { ShieldCheck } from 'lucide-react';

// Small reusable "sample data" disclaimer pill used wherever we show
// illustrative fares, schedules, or availability.
export function SampleDataNote({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 ${className}`}
      title="Schedules, fares, and availability shown here are illustrative sample data and are not live booking inventory."
    >
      <ShieldCheck className="h-3 w-3" />
      Illustrative sample data
    </span>
  );
}
