import { ColumnDef } from '@tanstack/react-table';

type PaceZoneData = {
  name: string;
  min: string;
  max: string;
};

export const paceZoneColumns: ColumnDef<PaceZoneData>[] = [
  {
    accessorKey: 'name',
    header: 'Zone',
  },
  {
    accessorKey: 'min',
    header: 'From',
  },
  {
    accessorKey: 'max',
    header: 'To',
  },
];
