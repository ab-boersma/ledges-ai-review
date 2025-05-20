
import React from 'react';
import { Invoice } from '@/types';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Check,
  Download,
  Play,
  TrendingDown,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InvoiceHeaderProps {
  invoice: Invoice;
  onRunCompliance: () => void;
  onExport: () => void;
  onApprove: () => void;
  hasAdjustments: boolean;
  rejectedCount: number;
  adjustedCount: number;
}

const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  invoice,
  onRunCompliance,
  onExport,
  onApprove,
  hasAdjustments = false,
  rejectedCount = 0,
  adjustedCount = 0,
}) => {
  // Format currency values
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Calculate savings if adjusted amount is available
  const savings = invoice.total_original - invoice.total_adjusted;
  const savingsPercentage = invoice.total_original > 0 
    ? (savings / invoice.total_original) * 100 
    : 0;
  
  // Determine if we have adjustments to show
  const showAdjustments = hasAdjustments || savings > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-lg">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Invoice {invoice.invoice_number}
          </h1>
          <div className="flex items-center gap-2 text-gray-500">
            <span>{new Date(invoice.invoice_date).toLocaleDateString()}</span>
            <span className="text-gray-300">•</span>
            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded">{invoice.format} Format</span>
            <span className="text-gray-300">•</span>
            <span>Matter: {invoice.client_matter_id}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-1 bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700" 
            onClick={onRunCompliance}
          >
            <Play className="h-4 w-4" />
            Run Compliance
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-1" 
            onClick={onExport}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          
          <Button 
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700" 
            onClick={onApprove}
          >
            <Check className="h-4 w-4" />
            Approve Invoice
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Original Amount Card */}
        <Card className="border-none shadow-sm transition-all hover:shadow-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Original Amount</p>
              <p className="text-2xl font-bold text-amber-600">{formatCurrency(invoice.total_original)}</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Current Amount Card - Renamed from Adjusted Amount */}
        <Card className={`border-none shadow-sm transition-all hover:shadow-md ${showAdjustments ? 'bg-gradient-to-br from-green-50 to-white' : ''}`}>
          <CardContent className="pt-6">
            <div className="text-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm text-gray-500 mb-1 flex items-center justify-center gap-1">
                      Current Amount
                      {showAdjustments && <DollarSign className="h-3 w-3 text-green-600" />}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Amount after all adjustments and rejections</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className="text-2xl font-bold text-primary">{formatCurrency(invoice.total_adjusted)}</p>
              
              {showAdjustments && (
                <div className="mt-1 text-xs">
                  <span className={`${adjustedCount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'} px-2 py-0.5 rounded mr-1`}>
                    {adjustedCount} adjusted
                  </span>
                  <span className={`${rejectedCount > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'} px-2 py-0.5 rounded`}>
                    {rejectedCount} rejected
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Savings Card */}
        <Card className={`border-none shadow-sm transition-all ${showAdjustments ? 'bg-gradient-to-br from-green-50 to-white animate-fade-in' : ''}`}>
          <CardContent className="pt-6">
            <div className="text-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm text-gray-500 mb-1 flex items-center justify-center gap-1">
                      Savings
                      {savings > 0 && <TrendingDown className="h-3 w-3 text-green-600" />}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total money saved through adjustments and rejections</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <p className={`text-2xl font-bold ${showAdjustments ? 'text-green-600' : 'text-gray-400'}`}>
                {formatCurrency(savings)} ({savingsPercentage.toFixed(1)}%)
              </p>
              
              {savings > 0 && (
                <div className="mt-2">
                  <Progress value={savingsPercentage} className="h-2" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvoiceHeader;
