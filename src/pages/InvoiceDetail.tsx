
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

import MainLayout from '@/components/layout/MainLayout';
import InvoiceHeader from '@/components/invoices/InvoiceHeader';
import InvoiceGrid from '@/components/invoices/InvoiceGrid';
import { Invoice, LineItem } from '@/types';

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

  useEffect(() => {
    // Simulate API call to load invoice data
    setLoading(true);
    
    setTimeout(() => {
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
    if (['hours', 'rate', 'amount', 'adjusted_hours', 'adjusted_rate', 'adjusted_amount'].includes(fieldName)) {
      recalculateInvoiceTotals(updatedItems);
    }
  };

  const recalculateInvoiceTotals = (items: LineItem[]) => {
    const originalTotal = items.reduce((sum, item) => sum + item.amount, 0);
    
    // Calculate adjusted total based on status
    const adjustedTotal = items.reduce((sum, item) => {
      if (item.status === 'approved') {
        return sum + item.amount;
      } else if (item.status === 'adjusted' && item.adjusted_amount !== null) {
        return sum + item.adjusted_amount;
      } else if (item.status === 'rejected') {
        return sum;
      }
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
          
          return {
            ...item,
            ai_score: parseFloat((randomScore * 100).toFixed(2)),
            ai_action: aiAction,
            status: aiAction === 'approve' ? 'approved' : aiAction === 'adjust' ? 'adjusted' : aiAction === 'reject' ? 'rejected' : item.status
          };
        }
        return item;
      });
      
      setLineItems(updatedItems);
      recalculateInvoiceTotals(updatedItems);
      
      toast.success('Compliance check complete. Found issues in 35 line items.');
    }, 2000);
  };

  const handleExport = () => {
    toast.success('Invoice exported successfully');
  };

  const handleApprove = () => {
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
      <div className="space-y-6">
        <InvoiceHeader 
          invoice={invoice}
          onRunCompliance={handleRunCompliance}
          onExport={handleExport}
          onApprove={handleApprove}
        />
        
        <div className="bg-white rounded-lg border shadow-sm p-4">
          <InvoiceGrid 
            data={lineItems}
            onBulkEdit={handleBulkEdit}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default InvoiceDetail;
