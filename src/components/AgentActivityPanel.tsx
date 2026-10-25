import { useEffect, useRef } from 'react';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';
import type { AgentStep } from '@/types';

// Animated, transparent log of the recovery agent's local computation steps.
// The status reflects actual engine work driven by the parent, not fake API calls.
export function AgentActivityPanel({ steps }: { steps: AgentStep[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [steps]);

  return (
    <aside className="flex h-full flex-col rounded-2xl border border-navy-100 bg-navy-900 text-navy-50 shadow-card">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">Agent activity</h2>
          <p className="text-[11px] text-navy-200">Local computation log · no external APIs</p>
        </div>
        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
          Live
        </span>
      </div>
      <div ref={scrollRef} className="thin-scroll flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {steps.length === 0 && (
          <p className="text-sm text-navy-200">The agent log will appear here once recovery starts.</p>
        )}
        {steps.map((s) => (
          <div key={s.id} className="flex gap-2.5">
            <div className="mt-0.5">
              {s.status === 'done' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : s.status === 'running' ? (
                <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
              ) : (
                <Circle className="h-4 w-4 text-navy-400" />
              )}
            </div>
            <div className="min-w-0">
              <p className={`text-sm font-medium ${s.status === 'pending' ? 'text-navy-300' : 'text-white'}`}>
                {s.label}
              </p>
              <p className="text-[11px] leading-snug text-navy-200">{s.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
