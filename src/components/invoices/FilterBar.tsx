
import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Sliders, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import {
  Checkbox
} from '@/components/ui/checkbox';

interface FilterBarProps {
  onFilterChange: (filters: Record<string, any>) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({
    search: '',
    status: '',
    minAmount: '',
    maxAmount: '',
    taskCode: '',
    showAdjusted: false,
    showRejected: false,
    showAccepted: false,
    hasAmountChanges: false,
  });
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce function to avoid too many updates while typing
  useEffect(() => {
    const handler = setTimeout(() => {
      onFilterChange(filters);
      setIsSearching(false);
    }, 300); // 300ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [filters, onFilterChange]);

  const handleFilterChange = (key: string, value: any) => {
    // Convert 'all' values to empty string for filtering logic
    const normalizedValue = value === 'all' ? '' : value;
    
    // Set searching state if changing search
    if (key === 'search') {
      setIsSearching(true);
    }
    
    const updatedFilters = { ...filters, [key]: normalizedValue };
    setFilters(updatedFilters);
    
    // Update active filters list for badge display
    const active = Object.entries(updatedFilters)
      .filter(([key, val]) => {
        // Handle checkbox filters differently
        if (typeof val === 'boolean') {
          return val === true;
        }
        return val !== '';
      })
      .map(([key, _]) => key);
    setActiveFilters(active);
  };

  const clearFilters = () => {
    const emptyFilters = Object.keys(filters).reduce((acc, key) => {
      // Set boolean values to false, others to empty string
      if (typeof filters[key] === 'boolean') {
        acc[key] = false;
      } else {
        acc[key] = '';
      }
      return acc;
    }, {} as Record<string, any>);
    
    setFilters(emptyFilters);
    setActiveFilters([]);
    onFilterChange(emptyFilters);
  };

  const getFilterLabel = (key: string): string => {
    const labels: Record<string, string> = {
      search: 'Search',
      status: 'Status',
      minAmount: 'Min Amount',
      maxAmount: 'Max Amount',
      taskCode: 'Task Code',
      showAdjusted: 'Adjusted Items',
      showRejected: 'Rejected Items',
      showAccepted: 'Accepted Items',
      hasAmountChanges: 'Amount Changes'
    };
    return labels[key] || key;
  };

  const getBadgeColor = (key: string): string => {
    const colors: Record<string, string> = {
      showAdjusted: 'bg-amber-50 text-amber-700 border-amber-200',
      showRejected: 'bg-red-50 text-red-700 border-red-200',
      showAccepted: 'bg-green-50 text-green-700 border-green-200',
      hasAmountChanges: 'bg-purple-50 text-purple-700 border-purple-200',
      status: 'bg-blue-50 text-blue-700 border-blue-200',
      search: 'bg-blue-50 text-blue-700 border-blue-200',
    };
    return colors[key] || 'bg-blue-50 text-blue-700 border-blue-200';
  };

  return (
    <div className="space-y-2 mb-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className={`absolute left-2.5 top-2.5 h-4 w-4 ${isSearching ? 'text-blue-500 animate-pulse' : 'text-gray-500'}`} />
          <Input
            placeholder="Search by timekeeper or narrative..."
            className="pl-9"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>
        
        <Select 
          value={filters.status || 'all'} 
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="adjusted">Adjusted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="compliance_accepted">Compliance Accepted</SelectItem>
          </SelectContent>
        </Select>
        
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              More Filters
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="bg-gray-50 p-4 rounded-md mt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount Range</label>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Min"
                    type="number"
                    value={filters.minAmount}
                    onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                  />
                  <span>to</span>
                  <Input
                    placeholder="Max"
                    type="number"
                    value={filters.maxAmount}
                    onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Code</label>
                <Select 
                  value={filters.taskCode || 'all'} 
                  onValueChange={(value) => handleFilterChange('taskCode', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select task code" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value="A101">A101 - Plan and prepare</SelectItem>
                    <SelectItem value="A102">A102 - Research</SelectItem>
                    <SelectItem value="A103">A103 - Draft/Revise</SelectItem>
                    <SelectItem value="A104">A104 - Review/Analyze</SelectItem>
                    <SelectItem value="B110">B110 - Communicate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">AI Actions</label>
                <Select 
                  value={filters.aiAction || 'all'} 
                  onValueChange={(value) => handleFilterChange('aiAction', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by AI action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="approve">Approved by AI</SelectItem>
                    <SelectItem value="adjust">Flagged for Adjustment</SelectItem>
                    <SelectItem value="reject">Recommended Rejection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* New filter options section */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-3 flex items-center">
                <Sliders className="h-4 w-4 mr-2" /> 
                Item Status Filters
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="showAdjusted" 
                    checked={filters.showAdjusted}
                    onCheckedChange={(checked) => handleFilterChange('showAdjusted', checked)}
                  />
                  <label htmlFor="showAdjusted" className="text-sm cursor-pointer flex items-center">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block mr-1"></span>
                    Adjusted Items
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="showRejected" 
                    checked={filters.showRejected}
                    onCheckedChange={(checked) => handleFilterChange('showRejected', checked)}
                  />
                  <label htmlFor="showRejected" className="text-sm cursor-pointer flex items-center">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block mr-1"></span>
                    Rejected Items
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="showAccepted" 
                    checked={filters.showAccepted} 
                    onCheckedChange={(checked) => handleFilterChange('showAccepted', checked)}
                  />
                  <label htmlFor="showAccepted" className="text-sm cursor-pointer flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-1"></span>
                    Accepted Items
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="hasAmountChanges" 
                    checked={filters.hasAmountChanges}
                    onCheckedChange={(checked) => handleFilterChange('hasAmountChanges', checked)}
                  />
                  <label htmlFor="hasAmountChanges" className="text-sm cursor-pointer flex items-center">
                    <span className="w-2 h-2 rounded-full bg-purple-500 inline-block mr-1"></span>
                    Amount Changes
                  </label>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <Badge key={filter} variant="outline" className={getBadgeColor(filter)}>
                {getFilterLabel(filter)}
                <XCircle 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => {
                    if (typeof filters[filter] === 'boolean') {
                      handleFilterChange(filter, false);
                    } else {
                      handleFilterChange(filter, '');
                    }
                  }}
                />
              </Badge>
            ))}
            <Button 
              variant="link" 
              className="text-sm h-auto p-0 text-gray-500" 
              onClick={clearFilters}
            >
              Clear all
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
