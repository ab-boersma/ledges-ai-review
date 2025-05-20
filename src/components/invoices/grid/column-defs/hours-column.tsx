
import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { LineItem } from '@/types';
import { Input } from '@/components/ui/input';
import { NumberFilterDropdown } from '../NumberFilterDropdown';
import { formatHours } from '../utils';
import { GetColumnsProps } from '../types';

export const hoursColumn = ({ onFilterChange, activeFilters, onBulkEdit }: GetColumnsProps): ColumnDef<LineItem> => ({
  accessorKey: 'hours',
  header: ({ column }) => (
    <NumberFilterDropdown
      column={column}
      title="Hours"
      onFilterChange={(value) => onFilterChange('hours', value)}
      activeFilter={activeFilters['hours']}
    />
  ),
  cell: ({ row }) => {
    const EditableCell = ({ value }: { value: number }) => {
      const [isEditing, setIsEditing] = useState(false);
      const [editValue, setEditValue] = useState(formatHours(value));
      
      if (isEditing) {
        return (
          <Input
            className="h-8 w-16 p-1 text-right"
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
  size: 70,
});
