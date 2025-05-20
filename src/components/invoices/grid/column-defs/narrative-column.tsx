
import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { LineItem } from '@/types';
import { TextFilterDropdown } from '../TextFilterDropdown';
import { GetColumnsProps } from '../types';

export const narrativeColumn = ({ onFilterChange, activeFilters }: GetColumnsProps): ColumnDef<LineItem> => ({
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
      <div className="max-w-[200px] min-w-[150px] truncate" title={narrative}>
        {narrative}
      </div>
    );
  },
  size: 200,
});
