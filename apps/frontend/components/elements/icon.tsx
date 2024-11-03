import { ClassValue } from 'clsx';

import { cn } from '@utils/shadcn';

export const Icon = ({
  icon,
  className,
}: {
  icon: string;
  className?: ClassValue;
}) => {
  return (
    <i
      className={cn(
        'text-[#000000E0] dark:text-[#FFFFFFD9]',
        className,
        'material-icons',
      )}
    >
      {icon}
    </i>
  );
};
