
import React, { useState } from 'react';
import { Column } from '@tanstack/react-table';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { isFilterActive } from './utils';

interface DateFilterDropdownProps {
  column: Column<any, unknown>;
  title: string;
  onFilterChange: (value: any) => void;
  activeFilter: any;
}

export function DateFilterDropdown({
  column,
  title,
  onFilterChange,
  activeFilter
}: DateFilterDropdownProps) {
  const [date, setDate] = useState<Date | undefined>(
    activeFilter ? new Date(activeFilter) : undefined
  );
  
  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    onFilterChange(selectedDate || null);
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
        <PopoverContent className="w-auto p-0 bg-white" align="end">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
          />
          {isActive && (
            <div className="border-t p-2 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => {
                  setDate(undefined);
                  onFilterChange(null);
                }}
              >
                Clear Date Filter
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
