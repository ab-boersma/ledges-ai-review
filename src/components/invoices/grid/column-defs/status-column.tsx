
import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { LineItem } from '@/types';
import { StatusFilterDropdown } from '../StatusFilterDropdown';
import { GetColumnsProps } from '../types';

export const statusColumn = ({ onFilterChange, activeFilters }: GetColumnsProps): ColumnDef<LineItem> => ({
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
  },
  size: 100,
});
