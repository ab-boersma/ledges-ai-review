
import React, { useState } from 'react';
import { Column } from '@tanstack/react-table';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { isFilterActive } from './utils';

interface NumberFilterDropdownProps {
  column: Column<any, unknown>;
  title: string;
  onFilterChange: (value: any) => void;
  activeFilter: any;
}

export function NumberFilterDropdown({
  column,
  title,
  onFilterChange,
  activeFilter
}: NumberFilterDropdownProps) {
  const [range, setRange] = useState({
    min: activeFilter?.min || '',
    max: activeFilter?.max || ''
  });
  
  const handleApply = () => {
    const min = range.min !== '' ? Number(range.min) : undefined;
    const max = range.max !== '' ? Number(range.max) : undefined;
    
    if (min === undefined && max === undefined) {
      onFilterChange(null);
    } else {
      onFilterChange({ min, max });
    }
  };
  
  const handleClear = () => {
    setRange({ min: '', max: '' });
    onFilterChange(null);
  };
  
  const isActive = isFilterActive(activeFilter);
  
  return (
    <div className="flex items-center justify-between">
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
            <h4 className="text-sm font-medium">Filter by {title}</h4>
            <div>
              <label className="text-xs text-gray-500">Minimum:</label>
              <Input
                type="number"
                value={range.min}
                onChange={(e) => setRange({ ...range, min: e.target.value })}
                placeholder="Min"
                className="h-8 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Maximum:</label>
              <Input
                type="number"
                value={range.max}
                onChange={(e) => setRange({ ...range, max: e.target.value })}
                placeholder="Max"
                className="h-8 text-sm"
              />
            </div>
            <div className="flex justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={handleClear}
              >
                Clear
              </Button>
              <Button
                variant="default"
                size="sm"
                className="h-8 text-xs"
                onClick={handleApply}
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
