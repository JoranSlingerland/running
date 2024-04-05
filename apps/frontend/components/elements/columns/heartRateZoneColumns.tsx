import { ColumnDef } from '@tanstack/react-table';

import { formatHeartRate } from '@utils/formatting';

type HeartRateZoneData = {
  name: string;
  min: number;
  max: number;
};

export const heartRateZoneColumns: ColumnDef<HeartRateZoneData>[] = [
  {
    accessorKey: 'name',
    header: 'Zone',
  },
  {
    accessorKey: 'min',
    header: 'From',
    cell: ({ row }) => formatHeartRate(row.getValue('min')),
  },
  {
    accessorKey: 'max',
    header: 'To',
    cell: ({ row }) => formatHeartRate(row.getValue('max')),
  },
];
