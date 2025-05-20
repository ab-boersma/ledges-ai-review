
import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { LineItem } from '@/types';
import { TextFilterDropdown } from '../TextFilterDropdown';
import { GetColumnsProps } from '../types';

export const activityCodeColumn = ({ onFilterChange, activeFilters }: GetColumnsProps): ColumnDef<LineItem> => ({
  accessorKey: 'activity_code',
  header: ({ column }) => (
    <TextFilterDropdown
      column={column}
      title="Activity"
      onFilterChange={(value) => onFilterChange('activity_code', value)}
      activeFilter={activeFilters['activity_code']}
    />
  ),
  cell: ({ row }) => <div className="text-center">{row.getValue('activity_code')}</div>,
  size: 70,
});
