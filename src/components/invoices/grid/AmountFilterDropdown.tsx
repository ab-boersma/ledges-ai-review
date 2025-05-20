
import React from 'react';
import { Column } from '@tanstack/react-table';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { isFilterActive } from './utils';

interface AmountFilterDropdownProps {
  column: Column<any, unknown>;
  title: string;
  onFilterChange: (value: any) => void;
  activeFilter: any;
}

export function AmountFilterDropdown({
  column,
  title,
  onFilterChange,
  activeFilter
}: AmountFilterDropdownProps) {
  const showAmountChanges = activeFilter?.showChangesOnly || false;
  
  const isActive = isFilterActive(activeFilter);
  
  return (
    <div className="flex items-center justify-end">
      <span className="mr-2">{title}</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-6 w-6 hover:bg-gray-100 ${isActive ? 'bg-blue-100 text-blue-800' : ''}`}
          >
            <Filter className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3 bg-white" align="end">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Filter by Amount</h4>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="amountFilter"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mr-2"
                checked={showAmountChanges}
                onChange={() => onFilterChange({ showChangesOnly: !showAmountChanges })}
              />
              <label htmlFor="amountFilter" className="text-sm">Show amount changes only</label>
            </div>
            {showAmountChanges && (
              <p className="text-xs text-gray-500 mt-1">
                Showing only items with adjusted amounts
              </p>
            )}
            {isActive && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 h-8 text-xs"
                onClick={() => onFilterChange(null)}
              >
                Clear Filter
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
