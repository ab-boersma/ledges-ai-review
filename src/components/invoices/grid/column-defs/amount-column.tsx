
import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { LineItem } from '@/types';
import { AmountFilterDropdown } from '../AmountFilterDropdown';
import { formatCurrency } from '../utils';
import { GetColumnsProps } from '../types';

export const amountColumn = ({ onFilterChange, activeFilters }: GetColumnsProps): ColumnDef<LineItem> => ({
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
  size: 100,
});
