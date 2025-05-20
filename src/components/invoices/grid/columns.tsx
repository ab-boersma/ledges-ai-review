
import React, { useState } from 'react';
import { LineItem } from '@/types';
import { ColumnDef, FilterFn } from '@tanstack/react-table';
import { Check, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, formatHours } from './utils';
import { StatusFilterDropdown } from './StatusFilterDropdown';
import { AmountFilterDropdown } from './AmountFilterDropdown';
import { TextFilterDropdown } from './TextFilterDropdown';
import { DateFilterDropdown } from './DateFilterDropdown';
import { NumberFilterDropdown } from './NumberFilterDropdown';

interface GetColumnsProps {
  onBulkEdit: (lineItems: LineItem[], fieldName: string, value: any) => void;
  onFilterChange: (columnId: string, value: any) => void;
  activeFilters: Record<string, any>;
  columnFilterFns: Record<string, FilterFn<any>>;
}

export const getColumns = ({
  onBulkEdit,
  onFilterChange,
  activeFilters,
  columnFilterFns
}: GetColumnsProps): ColumnDef<LineItem>[] => {
  return [
    {
      id: 'selection',
      header: ({ table }) => (
        <div className="px-1">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            checked={
              table.getIsAllRowsSelected() ||
              (table.getIsSomeRowsSelected() ? true : false)
            }
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="px-1">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        </div>
      ),
      enableSorting: false,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const lineItem = row.original;
        const isRejected = lineItem.status === 'rejected';
        const isApproved = lineItem.status === 'approved';
        
        const handleQuickAccept = (lineItem: LineItem) => {
          onBulkEdit([lineItem], 'status', 'approved');
        };
        
        return (
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className={`p-0 h-8 w-8 ${isApproved ? 'text-green-500' : 'text-gray-400 hover:text-green-500'}`}
              onClick={() => handleQuickAccept(lineItem)}
              disabled={isApproved}
              title={isApproved ? 'Already approved' : 'Approve this item'}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`p-0 h-8 w-8 ${isRejected ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
              onClick={() => onBulkEdit([lineItem], 'status', 'rejected')}
              disabled={isRejected}
              title={isRejected ? 'Already rejected' : 'Reject this item'}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        );
      }
    },
    {
      accessorKey: 'timekeeper_name',
      header: ({ column }) => (
        <TextFilterDropdown 
          column={column}
          title="Timekeeper"
          onFilterChange={(value) => onFilterChange('timekeeper_name', value)}
          activeFilter={activeFilters['timekeeper_name']}
        />
      ),
      cell: ({ row }) => <div className="max-w-[150px] truncate">{row.getValue('timekeeper_name')}</div>
    },
    {
      accessorKey: 'service_date',
      header: ({ column }) => (
        <DateFilterDropdown
          column={column}
          title="Date"
          onFilterChange={(value) => onFilterChange('service_date', value)}
          activeFilter={activeFilters['service_date']}
        />
      ),
      cell: ({ row }) => (
        <div>{new Date(row.getValue('service_date')).toLocaleDateString()}</div>
      ),
    },
    {
      accessorKey: 'task_code',
      header: ({ column }) => (
        <TextFilterDropdown
          column={column}
          title="Task Code"
          onFilterChange={(value) => onFilterChange('task_code', value)}
          activeFilter={activeFilters['task_code']}
        />
      ),
      cell: ({ row }) => <div className="text-center">{row.getValue('task_code')}</div>
    },
    {
      accessorKey: 'activity_code',
      header: ({ column }) => (
        <TextFilterDropdown
          column={column}
          title="Activity"
          onFilterChange={(value) => onFilterChange('activity_code', value)}
          activeFilter={activeFilters['activity_code']}
        />
      ),
      cell: ({ row }) => <div className="text-center">{row.getValue('activity_code')}</div>
    },
    {
      accessorKey: 'hours',
      header: ({ column }) => (
        <NumberFilterDropdown
          column={column}
          title="Hours"
          onFilterChange={(value) => onFilterChange('hours', value)}
          activeFilter={activeFilters['hours']}
        />
      ),
      cell: ({ row, column, cell }) => {
        const EditableCell = ({ value }: { value: number }) => {
          const [isEditing, setIsEditing] = useState(false);
          const [editValue, setEditValue] = useState(formatHours(value));
          
          if (isEditing) {
            return (
              <Input
                className="h-8 w-20 p-1 text-right"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => {
                  onBulkEdit([row.original], 'hours', parseFloat(editValue) || 0);
                  setIsEditing(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onBulkEdit([row.original], 'hours', parseFloat(editValue) || 0);
                    setIsEditing(false);
                  } else if (e.key === 'Escape') {
                    setIsEditing(false);
                  }
                }}
                autoFocus
              />
            );
          }
          
          return (
            <div 
              className="text-right cursor-pointer hover:bg-gray-100"
              onClick={() => {
                setIsEditing(true);
                setEditValue(formatHours(value));
              }}
            >
              {formatHours(value)}
            </div>
          );
        };
        
        return <EditableCell value={row.getValue('hours')} />;
      },
    },
    {
      accessorKey: 'rate',
      header: ({ column }) => (
        <NumberFilterDropdown
          column={column}
          title="Rate"
          onFilterChange={(value) => onFilterChange('rate', value)}
          activeFilter={activeFilters['rate']}
        />
      ),
      cell: ({ row }) => <div className="text-right">{formatCurrency(row.getValue('rate'))}</div>,
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <AmountFilterDropdown
          column={column}
          title="Amount"
          onFilterChange={(value) => onFilterChange('amount', value)}
          activeFilter={activeFilters['amount']}
        />
      ),
      cell: ({ row }) => {
        const amount = row.getValue('amount') as number;
        const adjustedAmount = row.original.adjusted_amount;
        const hasAdjustedAmount = adjustedAmount !== null && adjustedAmount !== amount;
        
        if (hasAdjustedAmount) {
          return (
            <div className="text-right font-medium bg-purple-50 rounded px-1">
              <span className="line-through text-gray-400 text-xs">
                {formatCurrency(amount)}
              </span>
              <div className="text-blue-600">
                {formatCurrency(adjustedAmount as number)}
              </div>
            </div>
          );
        }
        
        return <div className="text-right font-medium">{formatCurrency(amount)}</div>;
      },
    },
    {
      accessorKey: 'narrative',
      header: ({ column }) => (
        <TextFilterDropdown
          column={column}
          title="Narrative"
          onFilterChange={(value) => onFilterChange('narrative', value)}
          activeFilter={activeFilters['narrative']}
        />
      ),
      cell: ({ row }) => {
        const narrative: string = row.getValue('narrative');
        return (
          <div className="max-w-[400px] truncate" title={narrative}>
            {narrative}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <StatusFilterDropdown
          column={column}
          title="Status"
          onFilterChange={(value) => onFilterChange('status', value)}
          activeFilter={activeFilters['status']}
        />
      ),
      cell: ({ row }) => {
        const status: string = row.getValue('status');
        let statusClass = '';
        
        switch(status) {
          case 'approved':
            statusClass = 'status-approved';
            break;
          case 'adjusted':
            statusClass = 'status-review';
            break;
          case 'rejected':
            statusClass = 'status-rejected';
            break;
          default:
            statusClass = 'bg-gray-100 text-gray-800';
        }
        
        return (
          <div className="flex justify-center">
            <span className={`status-badge ${statusClass}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        );
      }
    },
  ];
};
