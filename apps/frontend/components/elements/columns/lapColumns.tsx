import { Laps } from '@repo/types';
import { ColumnDef } from '@tanstack/react-table';

import {
  formatCadence,
  formatDistance,
  formatHeartRate,
  formatPace,
} from '@utils/formatting';

export const lapColumns = (units: Units): ColumnDef<Laps | undefined>[] => {
  return [
    {
      accessorKey: 'distance',
      header: 'Distance',
      cell: ({ row }) =>
        formatDistance({
          meters: row.getValue('distance'),
          units: units,
        }),
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
      accessorKey: 'average_cadence',
      header: 'Cadence',
      cell: ({ row }) => formatCadence(row.getValue('average_cadence')),
    },
  ];
};
