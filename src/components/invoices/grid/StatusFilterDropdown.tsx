
import React from 'react';
import { Column } from '@tanstack/react-table';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { isFilterActive } from './utils';

interface StatusFilterDropdownProps {
  column: Column<any, unknown>;
  title: string;
  onFilterChange: (value: any) => void;
  activeFilter: any;
}

export function StatusFilterDropdown({
  column,
  title,
  onFilterChange,
  activeFilter
}: StatusFilterDropdownProps) {
  const statusFilters = activeFilter || { approved: false, adjusted: false, rejected: false };
  
  const handleCheckedChange = (status: string, checked: boolean) => {
    const updatedFilters = {
      ...statusFilters,
      [status]: checked
    };
    onFilterChange(updatedFilters);
  };
  
  const isActive = isFilterActive(activeFilter);
  
  return (
    <div className="flex items-center justify-center">
      <span className="mr-2">{title}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-6 w-6 hover:bg-gray-100 ${isActive ? 'bg-blue-100 text-blue-800' : ''}`}
          >
            <Filter className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 bg-white">
          <div className="p-2">
            <h4 className="text-sm font-medium mb-2">Filter by Status</h4>
            <div className="space-y-1">
              <DropdownMenuCheckboxItem
                checked={statusFilters.approved}
                onCheckedChange={(checked) =>
                  handleCheckedChange('approved', !!checked)
                }
                className="cursor-pointer"
              >
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                  Approved
                </div>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilters.adjusted}
                onCheckedChange={(checked) =>
                  handleCheckedChange('adjusted', !!checked)
                }
                className="cursor-pointer"
              >
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-amber-500 mr-2"></span>
                  Adjusted
                </div>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilters.rejected}
                onCheckedChange={(checked) =>
                  handleCheckedChange('rejected', !!checked)
                }
                className="cursor-pointer"
              >
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                  Rejected
                </div>
              </DropdownMenuCheckboxItem>
            </div>
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
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
