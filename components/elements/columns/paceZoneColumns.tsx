import { formatPace } from '@utils/formatting';
import { ColumnDef } from '@tanstack/react-table';

type PaceZoneData = {
  name: string;
  min: number;
  max: number;
};

export const paceZoneColumns: ColumnDef<PaceZoneData>[] = [
  {
    accessorKey: 'name',
    header: 'Zone',
  },
  {
    accessorKey: 'min',
    header: 'From',
    cell: ({ row }) =>
      formatPace({ metersPerSecond: row.getValue('min'), units: 'metric' }),
  },
  {
    accessorKey: 'max',
    header: 'To',
    cell: ({ row }) =>
      formatPace({ metersPerSecond: row.getValue('max'), units: 'metric' }),
  },
];
