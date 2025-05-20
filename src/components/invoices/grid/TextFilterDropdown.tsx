
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

interface TextFilterDropdownProps {
  column: Column<any, unknown>;
  title: string;
  onFilterChange: (value: any) => void;
  activeFilter: string | null;
}

export function TextFilterDropdown({
  column,
  title,
  onFilterChange,
  activeFilter
}: TextFilterDropdownProps) {
  const [value, setValue] = useState(activeFilter || '');
  
  const handleApplyFilter = () => {
    onFilterChange(value || null);
  };
  
  const handleClearFilter = () => {
    setValue('');
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
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
              className="h-8 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleApplyFilter();
                }
              }}
            />
            <div className="flex justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={handleClearFilter}
              >
                Clear
              </Button>
              <Button
                variant="default"
                size="sm"
                className="h-8 text-xs"
                onClick={handleApplyFilter}
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
