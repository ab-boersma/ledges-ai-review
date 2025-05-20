
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { Upload, File, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LEDESFormat } from '@/types';

interface FileUploaderProps {
  onFileProcessed: (data: {
    format: LEDESFormat;
    lineCount: number;
    invoiceData: any;
  }) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileProcessed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Mock processing function
  const processLEDESFile = (file: File) => {
    return new Promise<{
      format: LEDESFormat;
      lineCount: number;
      invoiceData: any;
    }>((resolve) => {
      setProcessing(true);
      
      // Simulate file processing with progress updates
      let progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      // Mock successful processing after 2 seconds
      setTimeout(() => {
        clearInterval(progressInterval);
        setProgress(100);
        
        // Mock data that would come from actual LEDES parsing
        const mockData = {
          format: '1998B' as LEDESFormat,
          lineCount: 347,
          invoiceData: {
            invoice_number: 'INV-2023-0123',
            invoice_date: '2023-05-15',
            vendor_id: 'LAW001',
            client_matter_id: 'CLIENT001-M47',
            // More invoice data would be here in real implementation
          }
        };
        
        setProcessing(false);
        resolve(mockData);
      }, 2000);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const uploadedFile = acceptedFiles[0];
    
    // Check file extension (basic validation)
    if (!uploadedFile.name.toLowerCase().endsWith('.txt') && 
        !uploadedFile.name.toLowerCase().endsWith('.csv') &&
        !uploadedFile.name.toLowerCase().endsWith('.ledes')) {
      toast.error('Invalid file format. Please upload a LEDES file (.txt, .csv, or .ledes)');
      return;
    }
    
    setFile(uploadedFile);
    
    try {
      const result = await processLEDESFile(uploadedFile);
      toast.success(`Successfully parsed ${result.lineCount} line items (${result.format} format)`);
      onFileProcessed(result);
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process LEDES file. Please check the file format.');
      setFile(null);
    }
  }, [onFileProcessed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'application/octet-stream': ['.ledes']
    },
    disabled: processing
  });

  return (
    <div className="w-full">
      {!file ? (
        <div 
          {...getRootProps()} 
          className={`file-drop-area ${isDragActive ? 'active' : ''} hover:bg-gray-50 cursor-pointer`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-lg font-medium mb-1">Drag & drop LEDES file here</p>
          <p className="text-sm text-gray-500 mb-3">Or click to browse</p>
          <p className="text-xs text-gray-400">Supports LEDES 1998B, 2.0, and 2.1 formats</p>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center mb-2">
            <File className="h-5 w-5 text-primary mr-2" />
            <span className="font-medium mr-auto">{file.name}</span>
            <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
          </div>
          
          {processing ? (
            <div className="space-y-2">
              <Progress value={progress} className="w-full h-2" />
              <p className="text-xs text-gray-500">Processing file...</p>
            </div>
          ) : (
            <div className="flex items-center text-sm">
              <Check className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">File processed successfully</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-auto text-xs"
                onClick={() => {
                  setFile(null);
                  setProgress(0);
                }}
              >
                Upload another
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
