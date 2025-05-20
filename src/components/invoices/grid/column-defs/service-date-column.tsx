
import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { LineItem } from '@/types';
import { DateFilterDropdown } from '../DateFilterDropdown';
import { GetColumnsProps } from '../types';

export const serviceDateColumn = ({ onFilterChange, activeFilters }: GetColumnsProps): ColumnDef<LineItem> => ({
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
    <div className="whitespace-nowrap">{new Date(row.getValue('service_date')).toLocaleDateString()}</div>
  ),
  size: 100,
});
