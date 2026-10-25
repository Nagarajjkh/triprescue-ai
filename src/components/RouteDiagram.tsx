import { Clock, MapPin } from 'lucide-react';
import type { City } from '@/types';

// Decorative route diagram used on the dashboard hero and result cards.
// Renders an animated dashed line between origin and destination nodes.
export function RouteDiagram({
  origin,
  destination,
  dark = true,
}: {
  origin: City;
  destination: City;
  dark?: boolean;
}) {
  const stroke = dark ? 'rgba(255,255,255,0.55)' : 'rgba(15,29,58,0.45)';
  const node = dark ? '#f4a633' : '#e89020';
  return (
    <svg viewBox="0 0 240 64" className="h-12 w-full max-w-xs" aria-hidden="true">
      <line
        x1="20"
        y1="32"
        x2="220"
        y2="32"
        stroke={stroke}
        strokeWidth="2"
        strokeDasharray="6 6"
        className="animate-route-dash"
      />
      <circle cx="20" cy="32" r="6" fill={node} />
      <circle cx="220" cy="32" r="6" fill={node} />
      <text x="20" y="54" fontSize="9" fill={dark ? '#a3b6e3' : '#5b6680'} textAnchor="middle">
        {origin.code}
      </text>
      <text x="220" y="54" fontSize="9" fill={dark ? '#a3b6e3' : '#5b6680'} textAnchor="middle">
        {destination.code}
      </text>
    </svg>
  );
}

export function DisruptionBadge({ reason }: { reason: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200">
      <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-red-500" />
      {reason}
    </span>
  );
}

export function TimelineClock({ time }: { time: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-navy-700">
      <Clock className="h-3 w-3" />
      {time}
    </span>
  );
}

export { MapPin };
