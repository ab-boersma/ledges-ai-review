
import React from 'react';

// Format currency values
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);
};

// Format hours with 2 decimal places
export const formatHours = (value: number): string => {
  return value.toFixed(2);
};

// Helper to determine if a filter should be shown as active
export const isFilterActive = (value: any): boolean => {
  if (value === undefined || value === null) return false;
  
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return Object.keys(value).length > 0 && Object.values(value).some(v => !!v);
  }
  
  if (typeof value === 'string') return value.trim() !== '';
  
  return true;
};

// CSS class for active filter buttons
export const activeFilterButtonClass = "flex items-center space-x-2 bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs";

// Generate an active filter badge
export const ActiveFilterBadge = ({ 
  label, 
  onClear 
}: { 
  label: string, 
  onClear: () => void 
}) => (
  <div className={activeFilterButtonClass}>
    <span>{label}</span>
    <button 
      className="ml-1 text-blue-600" 
      onClick={onClear}
    >
      &times;
    </button>
  </div>
);
