import { Bus, Plane, BedDouble, Train } from 'lucide-react';
import type { AltMode, Mode } from '@/types';

export function ModeIcon({
  mode,
  className = '',
}: {
  mode: Mode | AltMode;
  className?: string;
}) {
  const cls = `h-4 w-4 ${className}`;
  switch (mode) {
    case 'flight':
      return <Plane className={cls} />;
    case 'train':
      return <Train className={cls} />;
    case 'bus':
      return <Bus className={cls} />;
    case 'hotel':
      return <BedDouble className={cls} />;
  }
}

export const MODE_LABEL: Record<Mode | AltMode, string> = {
  flight: 'Flight',
  train: 'Train',
  bus: 'Bus',
  hotel: 'Hotel',
};
