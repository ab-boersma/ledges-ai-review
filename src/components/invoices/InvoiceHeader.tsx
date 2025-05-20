
import React from 'react';
import { Invoice } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  Check,
  Download,
  Play,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface InvoiceHeaderProps {
  invoice: Invoice;
  onRunCompliance: () => void;
  onExport: () => void;
  onApprove: () => void;
}

const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  invoice,
  onRunCompliance,
  onExport,
  onApprove,
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Invoice {invoice.invoice_number}
          </h1>
          <p className="text-gray-500">
            {new Date(invoice.invoice_date).toLocaleDateString()} • {invoice.format} Format
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-1" 
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
            className="flex items-center gap-1" 
            onClick={onApprove}
          >
            <Check className="h-4 w-4" />
            Approve Invoice
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Original Amount</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(invoice.total_original)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Adjusted Amount</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(invoice.total_adjusted)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Savings</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(savings)} ({savingsPercentage.toFixed(1)}%)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvoiceHeader;
