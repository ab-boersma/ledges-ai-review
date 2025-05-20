
import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LineItem } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { GetColumnsProps } from '../types';

export const actionsColumn = ({ onBulkEdit }: GetColumnsProps): ColumnDef<LineItem> => ({
  id: 'actions',
  header: '',
  cell: ({ row }) => {
    const lineItem = row.original;
    const isRejected = lineItem.status === 'rejected';
    const isApproved = lineItem.status === 'approved';
    
    const handleQuickAccept = (lineItem: LineItem) => {
      onBulkEdit([lineItem], 'status', 'approved');
    };
    
    return (
      <div className="flex space-x-1">
        <Button
          variant="ghost"
          size="sm"
          className={`p-0 h-8 w-8 ${isApproved ? 'text-green-500' : 'text-gray-400 hover:text-green-500'}`}
          onClick={() => handleQuickAccept(lineItem)}
          disabled={isApproved}
          title={isApproved ? 'Already approved' : 'Approve this item'}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`p-0 h-8 w-8 ${isRejected ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
          onClick={() => onBulkEdit([lineItem], 'status', 'rejected')}
          disabled={isRejected}
          title={isRejected ? 'Already rejected' : 'Reject this item'}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </Button>
      </div>
    );
  },
  size: 80,
});
