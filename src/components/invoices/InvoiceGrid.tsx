
import React, { useState, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
  ColumnDef,
} from '@tanstack/react-table';
import { LineItem } from '@/types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface InvoiceGridProps {
  data: LineItem[];
  onBulkEdit: (lineItems: LineItem[], fieldName: string, value: any) => void;
}

const InvoiceGrid: React.FC<InvoiceGridProps> = ({ data, onBulkEdit }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  // Format currency values
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  // Format hours with 2 decimal places
  const formatHours = (value: number): string => {
    return value.toFixed(2);
  };

  // Define columns
  const columns = useMemo<ColumnDef<LineItem>[]>(() => [
    {
      id: 'selection',
      header: ({ table }) => (
        <div className="px-1">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            checked={
              table.getIsAllRowsSelected() ||
              (table.getIsSomeRowsSelected() ? true : false) // Fix type error by ensuring boolean
            }
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="px-1">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'timekeeper_name',
      header: 'Timekeeper',
      cell: ({ row }) => <div className="max-w-[150px] truncate">{row.getValue('timekeeper_name')}</div>
    },
    {
      accessorKey: 'service_date',
      header: 'Date',
      cell: ({ row }) => (
        <div>{new Date(row.getValue('service_date')).toLocaleDateString()}</div>
      ),
    },
    {
      accessorKey: 'task_code',
      header: 'Task Code',
      cell: ({ row }) => <div className="text-center">{row.getValue('task_code')}</div>
    },
    {
      accessorKey: 'activity_code',
      header: 'Activity',
      cell: ({ row }) => <div className="text-center">{row.getValue('activity_code')}</div>
    },
    {
      accessorKey: 'hours',
      header: 'Hours',
      cell: ({ row, column, cell }) => {
        const isEditing = 
          editingCell?.rowId === row.id && 
          editingCell?.columnId === column.id;

        const value = row.getValue('hours');
        
        if (isEditing) {
          return (
            <Input
              className="h-8 w-20 p-1 text-right"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => {
                onBulkEdit([row.original], 'hours', parseFloat(editValue) || 0);
                setEditingCell(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onBulkEdit([row.original], 'hours', parseFloat(editValue) || 0);
                  setEditingCell(null);
                } else if (e.key === 'Escape') {
                  setEditingCell(null);
                }
              }}
              autoFocus
            />
          );
        }
        
        return (
          <div 
            className="text-right cursor-pointer hover:bg-gray-100"
            onClick={() => {
              setEditingCell({ rowId: row.id, columnId: column.id });
              setEditValue(formatHours(value as number));
            }}
          >
            {formatHours(value as number)}
          </div>
        );
      },
    },
    {
      accessorKey: 'rate',
      header: 'Rate',
      cell: ({ row }) => <div className="text-right">{formatCurrency(row.getValue('rate'))}</div>,
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => <div className="text-right font-medium">{formatCurrency(row.getValue('amount'))}</div>,
    },
    {
      accessorKey: 'narrative',
      header: 'Narrative',
      cell: ({ row }) => {
        const narrative: string = row.getValue('narrative');
        return (
          <div className="max-w-[400px] truncate" title={narrative}>
            {narrative}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status: string = row.getValue('status');
        let statusClass = '';
        
        switch(status) {
          case 'approved':
            statusClass = 'status-approved';
            break;
          case 'adjusted':
            statusClass = 'status-review';
            break;
          case 'rejected':
            statusClass = 'status-rejected';
            break;
          default:
            statusClass = 'bg-gray-100 text-gray-800';
        }
        
        return (
          <div className="flex justify-center">
            <span className={`status-badge ${statusClass}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        );
      }
    },
  ], [editingCell, editValue, onBulkEdit]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      }
    }
  });

  const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);

  return (
    <div className="space-y-4">
      {selectedRows.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-center space-x-4">
          <span className="text-sm font-medium text-blue-700">
            {selectedRows.length} line item{selectedRows.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-blue-600">Bulk actions:</span>
            <Button
              variant="outline"
              size="sm"
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
              onClick={() => onBulkEdit(selectedRows, 'status', 'approved')}
            >
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:text-amber-800"
              onClick={() => onBulkEdit(selectedRows, 'status', 'adjusted')}
            >
              Adjust
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
              onClick={() => onBulkEdit(selectedRows, 'status', 'rejected')}
            >
              Reject
            </Button>
          </div>
        </div>
      )}
      
      <div className="rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No line items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
        
        <span className="text-sm text-gray-700">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </span>
        
        <select
          className="h-8 px-2 text-sm border rounded-md"
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
        >
          {[10, 25, 50, 100].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default InvoiceGrid;
