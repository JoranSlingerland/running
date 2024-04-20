import { BestEfforts } from '@repo/types';
import { ColumnDef } from '@tanstack/react-table';

import { formatPace } from '@utils/formatting';

export const bestEffortColumns = (
  units: Units,
): ColumnDef<BestEfforts | undefined>[] => {
  return [
    {
      accessorKey: 'name',
      header: 'Distance',
    },
    {
      accessorKey: 'elapsed_time',
      header: 'Pace',
      cell: ({ row }) => {
        const elapsedTime = row.original?.elapsed_time;
        const distance = row.original?.distance;
        if (!distance || !elapsedTime) {
          return '';
        }
        return formatPace({
          metersPerSecond: distance / elapsedTime,
          units: units,
        });
      },
    },
  ];
};
