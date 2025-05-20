
import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { LineItem } from '@/types';
import { TextFilterDropdown } from '../TextFilterDropdown';
import { GetColumnsProps } from '../types';

export const taskCodeColumn = ({ onFilterChange, activeFilters }: GetColumnsProps): ColumnDef<LineItem> => ({
  accessorKey: 'task_code',
  header: ({ column }) => (
    <TextFilterDropdown
      column={column}
      title="Task"
      onFilterChange={(value) => onFilterChange('task_code', value)}
      activeFilter={activeFilters['task_code']}
    />
  ),
  cell: ({ row }) => <div className="text-center">{row.getValue('task_code')}</div>,
  size: 70,
});
