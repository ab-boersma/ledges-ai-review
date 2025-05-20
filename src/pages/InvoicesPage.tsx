
import React, { useState } from 'react';
import { toast } from 'sonner';
import MainLayout from '@/components/layout/MainLayout';
import FileUploader from '@/components/invoices/FileUploader';
import { LEDESFormat } from '@/types';

const InvoicesPage: React.FC = () => {
  const [fileUploaded, setFileUploaded] = useState(false);
  
  const handleFileProcessed = (data: {
    format: LEDESFormat;
    lineCount: number;
    invoiceData: any;
  }) => {
    console.log('File processed:', data);
    setFileUploaded(true);
    
    // Simulate navigation to invoice detail (mock for now)
    setTimeout(() => {
      window.location.href = '/invoices/mock-invoice-id';
    }, 1000);
  };
  
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Upload LEDES Invoice</h1>
        <p className="text-gray-500 mb-6">
          Upload your LEDES invoice file to begin the review process. We support LEDES 1998B, 2.0, and 2.1 formats.
        </p>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <FileUploader onFileProcessed={handleFileProcessed} />
          
          {fileUploaded && (
            <div className="mt-4 px-4 py-2 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
              File uploaded successfully. Redirecting to review page...
            </div>
          )}
        </div>
        
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">Requirements</h2>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-lg font-medium mb-2">File Format</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>ASCII or UTF-8 encoded text file</li>
              <li>Standard LEDES 1998B, 2.0, or 2.1 format</li>
              <li>All mandatory fields required for chosen format</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-lg font-medium mb-2">Data Privacy</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>All data is processed locally by default</li>
              <li>No sensitive information is sent to external services</li>
              <li>SOC-2 compliant processing and storage</li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default InvoicesPage;
