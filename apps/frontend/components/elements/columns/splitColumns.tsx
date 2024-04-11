import { Split } from '@repo/types';
import { ColumnDef } from '@tanstack/react-table';

import { formatDistance, formatHeartRate, formatPace } from '@utils/formatting';

export const splitColumns = (units: Units): ColumnDef<Split | undefined>[] => {
  return [
    {
      accessorKey: 'distance',
      header: 'Distance',
      cell: ({ row }) => {
        const value = row.getValue('distance') as number;
        return formatDistance({
          meters: row.getValue('distance'),
          units: units,
          decimals: value < 950 ? 2 : 0,
        });
      },
    },
    {
      accessorKey: 'average_speed',
      header: 'Pace',
      cell: ({ row }) =>
        formatPace({
          metersPerSecond: row.getValue('average_speed'),
          units: units,
        }),
    },
    {
      accessorKey: 'average_heartrate',
      header: 'Heartrate',
      cell: ({ row }) => formatHeartRate(row.getValue('average_heartrate')),
    },
    {
      accessorKey: 'elevation_difference',
      header: 'Elevation Difference',
      cell: ({ row }) => `${row.getValue('elevation_difference')} m`,
    },
  ];
};
