import { ClassValue } from 'clsx';

import { cn } from './shadcn';

export function selectedClassName(
  key: string | number | boolean,
  current: string | number | boolean,
  className?: ClassValue,
) {
  return cn(
    'flex items-center transition-colors',
    key === current
      ? 'bg-zinc-100 text-zinc-900 shadow-sm hover:bg-zinc-100/80 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-800/80'
      : 'hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50',
    className,
  );
}
