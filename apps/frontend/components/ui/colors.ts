export type ChartColor =
  | 'blue'
  | 'red'
  | 'orange'
  | 'green'
  | 'purple'
  | 'fuchsia'
  | 'rose'
  | 'teal'
  | 'amber'
  | 'lime'
  | 'violet'
  | 'pink'
  | 'cyan'
  | 'yellow'
  | 'emerald'
  | 'indigo'
  | 'sky';

export const chartColorsList: ChartColor[] = [
  'blue',
  'red',
  'orange',
  'green',
  'purple',
  'fuchsia',
  'rose',
  'teal',
  'amber',
  'lime',
  'violet',
  'pink',
  'cyan',
  'yellow',
  'emerald',
  'indigo',
  'sky',
];

export const chartColorsMap: { [key in ChartColor]: string } = {
  blue: '#3b82f6',
  red: '#ef4444',
  orange: '#f97316',
  green: '#22c55e',
  purple: '#a855f7',
  fuchsia: '#d946ef',
  rose: '#f43f5e',
  teal: '#14b8a6',
  amber: '#f59e0b',
  lime: '#84cc16',
  violet: '#8b5cf6',
  pink: '#ec4899',
  cyan: '#06b6d4',
  yellow: '#eab308',
  emerald: '#10b981',
  indigo: '#6366f1',
  sky: '#0ea5e9',
};
