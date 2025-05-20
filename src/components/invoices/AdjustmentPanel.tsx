
import React, { useState } from 'react';
import { LineItem } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AdjustmentPanelProps {
  lineItem: LineItem;
  onSave: (updatedLineItem: LineItem) => void;
  expanded: boolean;
}

const AdjustmentPanel: React.FC<AdjustmentPanelProps> = ({ 
  lineItem, 
  onSave,
  expanded 
}) => {
  const [adjustedHours, setAdjustedHours] = useState<string>(
    lineItem.adjusted_hours?.toString() || lineItem.hours.toString()
  );
  const [adjustedRate, setAdjustedRate] = useState<string>(
    lineItem.adjusted_rate?.toString() || lineItem.rate.toString()
  );
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');
  const [comment, setComment] = useState<string>(lineItem.reviewer_comment || '');
  
  if (!expanded) return null;
  
  const originalAmount = lineItem.hours * lineItem.rate;
  const adjustedAmount = parseFloat(adjustedHours) * parseFloat(adjustedRate);
  const savings = originalAmount - adjustedAmount;
  const savingsPercentage = (savings / originalAmount) * 100;
  
  const handleSave = () => {
    const updatedLineItem: LineItem = {
      ...lineItem,
      adjusted_hours: parseFloat(adjustedHours),
      adjusted_rate: parseFloat(adjustedRate),
      adjusted_amount: adjustedAmount,
      reviewer_comment: comment,
      status: 'adjusted'
    };
    
    onSave(updatedLineItem);
  };
  
  // Format currency values
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md mt-2">
      <h4 className="font-medium text-sm mb-3">Make Adjustments</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Original Values</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <div className="bg-white rounded border p-2 text-center">
                <span className="text-xs text-gray-500 block">Hours</span>
                <span className="font-medium">{lineItem.hours.toFixed(2)}</span>
              </div>
              <div className="bg-white rounded border p-2 text-center">
                <span className="text-xs text-gray-500 block">Rate</span>
                <span className="font-medium">{formatCurrency(lineItem.rate)}</span>
              </div>
              <div className="bg-white rounded border p-2 text-center">
                <span className="text-xs text-gray-500 block">Amount</span>
                <span className="font-medium">{formatCurrency(originalAmount)}</span>
              </div>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Adjusted Values</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <div>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={adjustedHours}
                  onChange={(e) => setAdjustedHours(e.target.value)}
                  className="text-center"
                />
              </div>
              <div>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={adjustedRate}
                  onChange={(e) => setAdjustedRate(e.target.value)}
                  className="text-center"
                />
              </div>
              <div className="bg-blue-50 text-blue-700 rounded border border-blue-200 p-2 text-center">
                <span className="text-xs text-blue-600 block">New Amount</span>
                <span className="font-medium">{formatCurrency(adjustedAmount)}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Savings:</span>
              <span className="text-green-700 font-medium">
                {formatCurrency(savings)} ({savingsPercentage.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Reason for Adjustment</label>
            <Select 
              value={adjustmentReason} 
              onValueChange={setAdjustmentReason}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excessive_time">Excessive Time</SelectItem>
                <SelectItem value="rate_exceeds_guidelines">Rate Exceeds Guidelines</SelectItem>
                <SelectItem value="duplicate_work">Duplicate Work</SelectItem>
                <SelectItem value="inadequate_description">Inadequate Description</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Comments</label>
            <Textarea
              placeholder="Add comments about this adjustment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-1"
              rows={4}
            />
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <Button
          variant="outline"
          className="mr-2"
          onClick={() => {
            setAdjustedHours(lineItem.hours.toString());
            setAdjustedRate(lineItem.rate.toString());
          }}
        >
          Reset
        </Button>
        <Button onClick={handleSave}>
          Save Adjustment
        </Button>
      </div>
    </div>
  );
};

export default AdjustmentPanel;
