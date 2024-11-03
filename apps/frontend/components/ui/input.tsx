import * as React from 'react';

import { cn } from '@utils/shadcn';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  affix?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, affix, ...props }, ref) => {
    return (
      <div className="relative inline-block h-9">
        <input
          type={type}
          className={cn(
            'flex w-full h-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300',
            className,
          )}
          ref={ref}
          {...props}
        />
        {affix && props.value && (
          <span className="absolute left-auto right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {affix}
          </span>
        )}
      </div>
    );
  },
);

('h-9  px-4  ');

('h-full py-1');
Input.displayName = 'Input';

export { Input };
