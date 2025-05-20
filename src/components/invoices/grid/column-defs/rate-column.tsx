
import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { LineItem } from '@/types';
import { NumberFilterDropdown } from '../NumberFilterDropdown';
import { formatCurrency } from '../utils';
import { GetColumnsProps } from '../types';

export const rateColumn = ({ onFilterChange, activeFilters }: GetColumnsProps): ColumnDef<LineItem> => ({
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
  size: 90,
});
