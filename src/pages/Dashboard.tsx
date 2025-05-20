
import React from 'react';
import { File, PieChart, DollarSign, TrendingDown } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import StatCard from '@/components/dashboard/StatCard';
import RecentInvoices from '@/components/dashboard/RecentInvoices';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Invoice } from '@/types';

// Mock data for demonstration
const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoice_number: 'INV-2023-0123',
    invoice_date: '2023-05-15',
    vendor_id: 'LAW001',
    client_matter_id: 'CLIENT001-M47',
    total_original: 24750.50,
    total_adjusted: 22340.75,
    status: 'approved',
    created_at: '2023-05-16T14:22:31Z',
    format: '1998B',
  },
  {
    id: '2',
    invoice_number: 'INV-2023-0124',
    invoice_date: '2023-05-20',
    vendor_id: 'LAW002',
    client_matter_id: 'CLIENT002-M12',
    total_original: 18340.25,
    total_adjusted: 17200.00,
    status: 'reviewed',
    created_at: '2023-05-21T09:15:45Z',
    format: '2.0',
  },
  {
    id: '3',
    invoice_number: 'INV-2023-0125',
    invoice_date: '2023-05-22',
    vendor_id: 'LAW001',
    client_matter_id: 'CLIENT001-M48',
    total_original: 9450.00,
    total_adjusted: 9450.00,
    status: 'pending',
    created_at: '2023-05-23T11:30:22Z',
    format: '1998B',
  },
];

const Dashboard: React.FC = () => {
  // Calculate mock statistics
  const totalInvoices = mockInvoices.length;
  const totalSpend = mockInvoices.reduce((sum, invoice) => sum + invoice.total_original, 0);
  const totalSavings = mockInvoices.reduce((sum, invoice) => sum + (invoice.total_original - invoice.total_adjusted), 0);
  const savingsRate = (totalSavings / totalSpend) * 100;

  // Format currency values
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button asChild>
            <Link to="/invoices">Upload New Invoice</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Invoices" 
            value={totalInvoices}
            icon={<File className="h-5 w-5" />}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard 
            title="Total Spend" 
            value={formatCurrency(totalSpend)}
            icon={<DollarSign className="h-5 w-5" />}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard 
            title="Total Savings" 
            value={formatCurrency(totalSavings)}
            icon={<TrendingDown className="h-5 w-5" />}
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard 
            title="Savings Rate" 
            value={`${savingsRate.toFixed(1)}%`}
            icon={<PieChart className="h-5 w-5" />}
            trend={{ value: 2, isPositive: true }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RecentInvoices invoices={mockInvoices} />
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Quick Start</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="rounded-full bg-primary/10 text-primary p-2 mr-3">
                    <File className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Upload LEDES Invoice</h3>
                    <p className="text-sm text-gray-500">
                      Drag and drop your LEDES file to begin the review process.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="rounded-full bg-primary/10 text-primary p-2 mr-3">
                    <PieChart className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">AI Compliance Review</h3>
                    <p className="text-sm text-gray-500">
                      Run the AI engine to automatically flag billing issues.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="rounded-full bg-primary/10 text-primary p-2 mr-3">
                    <TrendingDown className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Adjust & Approve</h3>
                    <p className="text-sm text-gray-500">
                      Review flagged items, make adjustments, and approve final invoice.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

// Add missing imports for Card components
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

export default Dashboard;
