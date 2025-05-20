
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

import MainLayout from '@/components/layout/MainLayout';
import InvoiceHeader from '@/components/invoices/InvoiceHeader';
import EnhancedInvoiceGrid from '@/components/invoices/EnhancedInvoiceGrid';
import FilterBar from '@/components/invoices/FilterBar';
import { Invoice, LineItem } from '@/types';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { 
  Steps,
  Step
} from '@/components/ui/steps';

// Mock data for demonstration
const generateMockLineItems = (count: number): LineItem[] => {
  const items: LineItem[] = [];
  
  const taskCodes = ['A101', 'A102', 'A103', 'A104', 'B110', 'B120', 'B130', 'L100', 'L110', 'L120'];
  const activityCodes = ['T01', 'T02', 'T03', 'T04', 'T05', 'T06', 'T07', 'T08', 'T09', 'T10'];
  const timekeeperNames = [
    'John Smith', 'Jane Doe', 'Robert Johnson', 'Emily Brown', 
    'Michael Davis', 'Sarah Miller', 'David Wilson', 'Jennifer Moore'
  ];
  const timekeeperClassifications = ['P', 'A', 'C', 'PL'];
  const narratives = [
    'Review and analyze documents related to case strategy',
    'Prepare and draft motion for summary judgment',
    'Conference call with client regarding case developments',
    'Research legal precedent for upcoming hearing',
    'Attend deposition of opposing party witness',
    'Draft and revise settlement agreement terms',
    'Review and analyze discovery responses',
    'Prepare for and attend client meeting',
    'Draft and revise complaint',
    'Review court filings and prepare response strategy'
  ];
  
  const startDate = new Date('2023-01-01');
  const endDate = new Date('2023-05-31');
  
  for (let i = 0; i < count; i++) {
    const hours = Math.random() * 8 + 0.5; // Between 0.5 and 8.5
    const rate = Math.floor(Math.random() * 500) + 200; // Between 200 and 700
    const amount = hours * rate;
    
    const randomTimestampInRange = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
    const serviceDate = new Date(randomTimestampInRange).toISOString().split('T')[0];
    
    items.push({
      id: `line-${i + 1}`,
      invoice_id: 'mock-invoice-id',
      ledes_row_num: i + 1,
      task_code: taskCodes[Math.floor(Math.random() * taskCodes.length)],
      activity_code: activityCodes[Math.floor(Math.random() * activityCodes.length)],
      expense_code: null,
      hours: parseFloat(hours.toFixed(2)),
      rate: rate,
      amount: parseFloat(amount.toFixed(2)),
      narrative: narratives[Math.floor(Math.random() * narratives.length)],
      tax: 0,
      status: 'pending',
      ai_score: null,
      ai_action: null,
      adjusted_hours: null,
      adjusted_rate: null,
      adjusted_amount: null,
      reviewer_comment: null,
      timekeeper_id: `TK-${Math.floor(Math.random() * 100) + 1}`,
      timekeeper_name: timekeeperNames[Math.floor(Math.random() * timekeeperNames.length)],
      timekeeper_classification: timekeeperClassifications[Math.floor(Math.random() * timekeeperClassifications.length)],
      service_date: serviceDate
    });
  }
  
  return items;
};

const mockInvoice: Invoice = {
  id: 'mock-invoice-id',
  vendor_id: 'LAW001',
  client_matter_id: 'CLIENT001-M47',
  invoice_number: 'INV-2023-0123',
  invoice_date: '2023-05-15',
  total_original: 98765.43,
  total_adjusted: 92340.21,
  status: 'pending',
  created_at: '2023-05-16T14:22:31Z',
  format: '1998B',
};

const InvoiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice>(mockInvoice);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeStep, setActiveStep] = useState(1);
  const [filters, setFilters] = useState<Record<string, any>>({});

  // Calculate the stats for displaying in the header
  const stats = useMemo(() => {
    const adjustedCount = lineItems.filter(item => item.status === 'adjusted').length;
    const rejectedCount = lineItems.filter(item => item.status === 'rejected').length;
    const hasAdjustments = adjustedCount > 0 || rejectedCount > 0;
    
    return {
      adjustedCount,
      rejectedCount,
      hasAdjustments
    };
  }, [lineItems]);

  useEffect(() => {
    // Simulate API call to load invoice data
    setLoading(true);
    
    setTimeout(() => {
      // Update the generateMockLineItems call to use the new status values
      const mockItems = generateMockLineItems(347);
      setLineItems(mockItems);
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleBulkEdit = (items: LineItem[], fieldName: string, value: any) => {
    // Update the line items in state
    const updatedItems = lineItems.map(item => {
      if (items.some(selectedItem => selectedItem.id === item.id)) {
        return { ...item, [fieldName]: value };
      }
      return item;
    });
    
    setLineItems(updatedItems);
    
    // Show success message
    toast.success(`Updated ${items.length} line item(s)`);
    
    // Recalculate invoice totals if necessary
    if (['hours', 'rate', 'amount', 'adjusted_hours', 'adjusted_rate', 'adjusted_amount', 'status'].includes(fieldName)) {
      recalculateInvoiceTotals(updatedItems);
    }
  };

  const handleLineItemUpdate = (updatedItem: LineItem) => {
    // Update the single line item in state
    const updatedItems = lineItems.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    
    setLineItems(updatedItems);
    recalculateInvoiceTotals(updatedItems);
    
    toast.success('Line item adjusted successfully');
  };

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };

  const recalculateInvoiceTotals = (items: LineItem[]) => {
    const originalTotal = items.reduce((sum, item) => sum + item.amount, 0);
    
    // Calculate adjusted total based on status
    const adjustedTotal = items.reduce((sum, item) => {
      if (item.status === 'compliance_accepted' || item.status === 'reviewed' || item.status === 'pending') {
        // For items that are compliance accepted, reviewed or pending, use original amount
        return sum + item.amount;
      } else if (item.status === 'adjusted' && item.adjusted_amount !== null) {
        // For adjusted items, use the adjusted amount
        return sum + item.adjusted_amount;
      } else if (item.status === 'rejected') {
        // For rejected items, don't count the amount
        return sum;
      }
      // For other statuses, use original amount
      return sum + item.amount;
    }, 0);
    
    setInvoice(prev => ({
      ...prev,
      total_original: parseFloat(originalTotal.toFixed(2)),
      total_adjusted: parseFloat(adjustedTotal.toFixed(2))
    }));
  };

  const handleRunCompliance = () => {
    toast.info('Running compliance check on all line items...');
    setActiveStep(2);
    
    // Simulate AI compliance check
    setTimeout(() => {
      // Update some line items with compliance flags
      const updatedItems = lineItems.map((item, index) => {
        // Flag about 10% of items randomly
        if (index % 10 === 0) {
          const randomScore = Math.random();
          let aiAction: 'approve' | 'adjust' | 'reject' | null = null;
          
          if (randomScore < 0.4) {
            aiAction = 'approve';
          } else if (randomScore < 0.8) {
            aiAction = 'adjust';
          } else {
            aiAction = 'reject';
          }
          
          // Apply adjustment if needed
          let adjustedHours = null;
          let adjustedRate = null;
          let adjustedAmount = null;
          let newStatus: 'compliance_accepted' | 'adjusted' | 'rejected' | 'pending' = 'pending';
          
          if (aiAction === 'approve') {
            newStatus = 'compliance_accepted';
          } else if (aiAction === 'adjust') {
            // Reduce hours or rate by 10-30%
            const reductionFactor = 0.7 + Math.random() * 0.2;
            adjustedHours = parseFloat((item.hours * reductionFactor).toFixed(2));
            adjustedRate = item.rate;
            adjustedAmount = parseFloat((adjustedHours * adjustedRate).toFixed(2));
            newStatus = 'adjusted';
          } else if (aiAction === 'reject') {
            newStatus = 'rejected';
          }
          
          return {
            ...item,
            ai_score: parseFloat((randomScore * 100).toFixed(2)),
            ai_action: aiAction,
            adjusted_hours: aiAction === 'adjust' ? adjustedHours : null,
            adjusted_rate: aiAction === 'adjust' ? adjustedRate : null,
            adjusted_amount: aiAction === 'adjust' ? adjustedAmount : null,
            status: newStatus
          } as LineItem;
        }
        return item;
      });
      
      setLineItems(updatedItems);
      recalculateInvoiceTotals(updatedItems);
      
      toast.success('Compliance check complete. Found issues in 35 line items.');
    }, 2000);
  };

  const handleExport = () => {
    setActiveStep(4);
    toast.success('Invoice exported successfully');
  };

  const handleApprove = () => {
    setActiveStep(3);
    setInvoice(prev => ({
      ...prev,
      status: 'approved'
    }));
    
    toast.success('Invoice has been approved');
  };
  
  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-t-primary border-gray-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading invoice data...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Review Invoice Workflow</h2>
            <Steps activeStep={activeStep} className="mb-6">
              <Step title="Upload" description="File uploaded" />
              <Step title="Compliance" description="Run AI check" />
              <Step title="Review" description="Approve or adjust" />
              <Step title="Export" description="Generate report" />
            </Steps>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
              <h3 className="text-blue-800 font-medium mb-1">Invoice Review Instructions</h3>
              <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                <li>Run the Compliance Check to identify potential issues</li>
                <li>Use filters to find specific line items or issues</li>
                <li>Click on the expand button to see AI commentary and adjustment options</li>
                <li>Select multiple items to perform bulk actions</li>
                <li>Use the quick reject button to reject line items immediately</li>
                <li>Approve the invoice when review is complete</li>
              </ol>
            </div>
          
            <InvoiceHeader 
              invoice={invoice}
              onRunCompliance={handleRunCompliance}
              onExport={handleExport}
              onApprove={handleApprove}
              hasAdjustments={stats.hasAdjustments}
              rejectedCount={stats.rejectedCount}
              adjustedCount={stats.adjustedCount}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <FilterBar onFilterChange={handleFilterChange} />
            <EnhancedInvoiceGrid 
              data={lineItems}
              filters={filters}
              onBulkEdit={handleBulkEdit}
              onLineItemUpdate={handleLineItemUpdate}
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default InvoiceDetail;
