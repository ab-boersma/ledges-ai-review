
import React from 'react';
import { Button } from '@/components/ui/button';
import { ActiveFilterBadge } from './utils';

interface ActiveFiltersProps {
  activeFilters: Record<string, any>;
  onClearFilter: (columnId: string) => void;
  onClearAllFilters: () => void;
}

export function ActiveFilters({ 
  activeFilters, 
  onClearFilter, 
  onClearAllFilters 
}: ActiveFiltersProps) {
  const hasActiveFilters = Object.keys(activeFilters).length > 0;
  
  if (!hasActiveFilters) {
    return null;
  }
  
  const getFilterLabel = (columnId: string, value: any): string => {
    switch (columnId) {
      case 'status':
        if (typeof value === 'object') {
          const statuses = [];
          if (value.approved) statuses.push('Approved');
          if (value.adjusted) statuses.push('Adjusted');
          if (value.rejected) statuses.push('Rejected');
          return `Status: ${statuses.join(', ')}`;
        }
        return `Status: ${value}`;
        
      case 'amount':
        return 'Amount: Changes Only';
        
      case 'hours':
      case 'rate':
        const range = [];
        if (value.min !== undefined) range.push(`Min: ${value.min}`);
        if (value.max !== undefined) range.push(`Max: ${value.max}`);
        return `${columnId.charAt(0).toUpperCase() + columnId.slice(1)}: ${range.join(', ')}`;
        
      case 'service_date':
        return `Date: ${new Date(value).toLocaleDateString()}`;
        
      default:
        return `${columnId.charAt(0).toUpperCase() + columnId.slice(1)}: ${value}`;
    }
  };
  
  return (
    <div className="flex flex-wrap gap-2 py-2">
      <span className="text-sm text-gray-500 py-1">Active filters:</span>
      
      {Object.entries(activeFilters).map(([columnId, value]) => (
        <ActiveFilterBadge
          key={columnId}
          label={getFilterLabel(columnId, value)}
          onClear={() => onClearFilter(columnId)}
        />
      ))}
      
      <Button
        variant="ghost"
        size="sm"
        className="text-sm text-gray-500 hover:text-gray-700"
        onClick={onClearAllFilters}
      >
        Clear all filters
      </Button>
    </div>
  );
}
