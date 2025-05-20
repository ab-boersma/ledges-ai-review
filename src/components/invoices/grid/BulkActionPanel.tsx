
import React from 'react';
import { LineItem } from '@/types';
import { Button } from '@/components/ui/button';

interface BulkActionPanelProps {
  selectedRows: LineItem[];
  onBulkEdit: (lineItems: LineItem[], fieldName: string, value: any) => void;
}

export function BulkActionPanel({ selectedRows, onBulkEdit }: BulkActionPanelProps) {
  if (selectedRows.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-center space-x-4">
      <span className="text-sm font-medium text-blue-700">
        {selectedRows.length} line item{selectedRows.length !== 1 ? 's' : ''} selected
      </span>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-blue-600">Bulk actions:</span>
        <Button
          variant="outline"
          size="sm"
          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
          onClick={() => onBulkEdit(selectedRows, 'status', 'approved')}
        >
          Approve
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:text-amber-800"
          onClick={() => onBulkEdit(selectedRows, 'status', 'adjusted')}
        >
          Adjust
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
          onClick={() => onBulkEdit(selectedRows, 'status', 'rejected')}
        >
          Reject
        </Button>
      </div>
    </div>
  );
}
