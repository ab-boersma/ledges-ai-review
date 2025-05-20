
import React, { useState, useEffect } from 'react';
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
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { DollarSign, Edit, Plus, Minus } from 'lucide-react';

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
  const [adjustmentMethod, setAdjustmentMethod] = useState<'hoursRate' | 'amount'>('hoursRate');
  const [adjustedHours, setAdjustedHours] = useState<string>(
    lineItem.adjusted_hours?.toString() || lineItem.hours.toString()
  );
  const [adjustedRate, setAdjustedRate] = useState<string>(
    lineItem.adjusted_rate?.toString() || lineItem.rate.toString()
  );
  const [adjustedAmount, setAdjustedAmount] = useState<string>(
    lineItem.adjusted_amount?.toString() || (lineItem.hours * lineItem.rate).toString()
  );
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');
  const [comment, setComment] = useState<string>(lineItem.reviewer_comment || '');
  
  // Calculate values based on adjustment method
  useEffect(() => {
    if (adjustmentMethod === 'hoursRate') {
      const calculatedAmount = parseFloat(adjustedHours) * parseFloat(adjustedRate);
      setAdjustedAmount(calculatedAmount.toString());
    }
  }, [adjustedHours, adjustedRate, adjustmentMethod]);
  
  if (!expanded) return null;
  
  const originalAmount = lineItem.hours * lineItem.rate;
  const currentAdjustedAmount = parseFloat(adjustedAmount);
  const savings = originalAmount - currentAdjustedAmount;
  const savingsPercentage = (savings / originalAmount) * 100;
  
  const handleSave = () => {
    const updatedLineItem: LineItem = {
      ...lineItem,
      adjusted_amount: currentAdjustedAmount,
      reviewer_comment: comment,
      status: 'adjusted'
    };
    
    // Only set hours and rate if we're adjusting by that method
    if (adjustmentMethod === 'hoursRate') {
      updatedLineItem.adjusted_hours = parseFloat(adjustedHours);
      updatedLineItem.adjusted_rate = parseFloat(adjustedRate);
    } else {
      // For direct amount adjustments, set hours to null to indicate it was a direct amount change
      updatedLineItem.adjusted_hours = null;
      updatedLineItem.adjusted_rate = null;
    }
    
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
      
      <RadioGroup 
        value={adjustmentMethod}
        onValueChange={(value) => setAdjustmentMethod(value as 'hoursRate' | 'amount')}
        className="flex space-x-4 mb-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="hoursRate" id="hoursRate" />
          <label htmlFor="hoursRate" className="text-sm font-medium cursor-pointer">
            Adjust Hours & Rate
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="amount" id="amount" />
          <label htmlFor="amount" className="text-sm font-medium cursor-pointer">
            Adjust Total Amount
          </label>
        </div>
      </RadioGroup>
      
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
          
          {adjustmentMethod === 'hoursRate' ? (
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
                  <span className="font-medium">{formatCurrency(currentAdjustedAmount)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium">Adjusted Amount</label>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 relative">
                  <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={adjustedAmount}
                    onChange={(e) => setAdjustedAmount(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => {
                      const current = parseFloat(adjustedAmount);
                      const reduction = originalAmount * 0.1; // 10% reduction
                      setAdjustedAmount((current - reduction).toFixed(2));
                    }}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => {
                      const current = parseFloat(adjustedAmount);
                      const increase = originalAmount * 0.1; // 10% increase
                      setAdjustedAmount((current + increase).toFixed(2));
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          
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
            setAdjustedAmount((lineItem.hours * lineItem.rate).toString());
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
