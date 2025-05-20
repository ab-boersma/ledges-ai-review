
import React from 'react';
import { Link } from 'react-router-dom';
import { Invoice } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RecentInvoicesProps {
  invoices: Invoice[];
}

const RecentInvoices: React.FC<RecentInvoicesProps> = ({ invoices }) => {
  // Format currency values
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Recent Invoices</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/invoices">View all</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {invoices.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">No recent invoices found.</p>
          ) : (
            invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex flex-col">
                  <Link to={`/invoices/${invoice.id}`} className="font-medium hover:text-primary">
                    {invoice.invoice_number}
                  </Link>
                  <span className="text-xs text-gray-500">
                    {new Date(invoice.invoice_date).toLocaleDateString()} • {invoice.client_matter_id}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(invoice.total_original)}</div>
                    {invoice.status !== 'pending' && (
                      <div className="text-xs text-green-600">
                        -{formatCurrency(invoice.total_original - invoice.total_adjusted)}
                      </div>
                    )}
                  </div>
                  <div>
                    <StatusBadge status={invoice.status} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let statusClass = '';
  
  switch(status) {
    case 'approved':
      statusClass = 'status-approved';
      break;
    case 'reviewed':
      statusClass = 'status-review';
      break;
    case 'rejected':
      statusClass = 'status-rejected';
      break;
    default:
      statusClass = 'bg-gray-100 text-gray-800';
  }
  
  return (
    <span className={`status-badge ${statusClass}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default RecentInvoices;
