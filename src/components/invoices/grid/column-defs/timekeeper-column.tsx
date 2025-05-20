
import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { LineItem } from '@/types';
import { TextFilterDropdown } from '../TextFilterDropdown';
import { GetColumnsProps } from '../types';

export const timekeeperColumn = ({ onFilterChange, activeFilters }: GetColumnsProps): ColumnDef<LineItem> => ({
  accessorKey: 'timekeeper_name',
  header: ({ column }) => (
    <TextFilterDropdown 
      column={column}
      title="Timekeeper"
      onFilterChange={(value) => onFilterChange('timekeeper_name', value)}
      activeFilter={activeFilters['timekeeper_name']}
    />
  ),
  cell: ({ row }) => <div className="max-w-[110px] truncate">{row.getValue('timekeeper_name')}</div>,
  size: 110,
});
