import { terminateOrchestrator } from '@services/orchestrator/terminate';
import { purgeOrchestrator } from '@services/orchestrator/purge';
import { ListOrchestratorData } from '@services/orchestrator/list';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@ui/badge';
import { formatDateTime } from '@utils/formatting';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@ui/dropdown-menu';
import { toast } from 'sonner';
import { Loader2, XCircle, CheckCircle2 } from 'lucide-react';

export const orchestratorColumns: ColumnDef<ListOrchestratorData>[] = [
  {
    accessorKey: 'runtimeStatus',
    header: 'Status',
    cell({ row }) {
      const value = row.getValue('runtimeStatus');
      switch (value) {
        case 'Completed':
          return (
            <Badge variant="success" className="text-xs">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              {value}
            </Badge>
          );
        case 'Failed':
          return (
            <Badge variant="error" className="text-xs">
              <XCircle className="h-4 w-4 mr-1" />
              {value}
            </Badge>
          );
        case 'Suspended':
        case 'Terminated':
          return (
            <Badge variant="warning" className="text-xs">
              <XCircle className="h-4 w-4 mr-1" />
              {value}
            </Badge>
          );
        case 'Running':
        case 'Pending':
          return (
            <Badge variant="processing" className="text-xs">
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
              {value}
            </Badge>
          );
      }
    },
  },
  {
    accessorKey: 'output.ActivitiesAdded',
    header: 'Activities added',
  },
  {
    accessorKey: 'createdTime',
    header: 'Created Time',
    cell: ({ row }) => formatDateTime(row.getValue('createdTime') as string),
  },
  {
    header: 'Last Updated Time',
    accessorKey: 'lastUpdatedTime',
    cell: ({ row }) =>
      formatDateTime(row.getValue('lastUpdatedTime') as string),
  },
  {
    header: 'Instance ID',
    accessorKey: 'instanceId',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const data = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={async () => {
                await navigator.clipboard.writeText(data.instanceId);
                toast('Instance ID copied to clipboard');
              }}
            >
              Copy instance ID
            </DropdownMenuItem>
            {(data.runtimeStatus === 'Running' ||
              data.runtimeStatus === 'Pending') && (
              <DropdownMenuItem
                onClick={async () => {
                  await terminateOrchestrator({
                    query: {
                      instanceId: data.instanceId,
                    },
                  });
                }}
              >
                Terminate instance
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={async () => {
                await purgeOrchestrator({
                  query: {
                    instanceId: data.instanceId,
                  },
                });
              }}
            >
              Purge instance
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
