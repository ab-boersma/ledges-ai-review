
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
  Check,
  Filter,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface InvoiceGridProps {
  data: LineItem[];
  onBulkEdit: (lineItems: LineItem[], fieldName: string, value: any) => void;
}

const InvoiceGrid: React.FC<InvoiceGridProps> = ({ data, onBulkEdit }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  
  // Filter state
  const [statusFilters, setStatusFilters] = useState({
    approved: false,
    adjusted: false,
    rejected: false,
  });
  
  const [showAmountChanges, setShowAmountChanges] = useState(false);

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

  // Quick accept handler
  const handleQuickAccept = (lineItem: LineItem) => {
    onBulkEdit([lineItem], 'status', 'approved');
  };

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Status filters
      const statusFilterActive = statusFilters.approved || statusFilters.adjusted || statusFilters.rejected;
      if (statusFilterActive) {
        if ((statusFilters.approved && item.status === 'approved') ||
            (statusFilters.adjusted && item.status === 'adjusted') ||
            (statusFilters.rejected && item.status === 'rejected')) {
          // Pass status filter
        } else {
          return false;
        }
      }
      
      // Amount changes filter
      if (showAmountChanges) {
        const hasAdjustedAmount = item.adjusted_amount !== null && item.adjusted_amount !== item.amount;
        if (!hasAdjustedAmount) {
          return false;
        }
      }
      
      return true;
    });
  }, [data, statusFilters, showAmountChanges]);

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
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const lineItem = row.original;
        const isRejected = lineItem.status === 'rejected';
        const isApproved = lineItem.status === 'approved';
        
        return (
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className={`p-0 h-8 w-8 ${isApproved ? 'text-green-500' : 'text-gray-400 hover:text-green-500'}`}
              onClick={() => handleQuickAccept(lineItem)}
              disabled={isApproved}
              title={isApproved ? 'Already approved' : 'Approve this item'}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`p-0 h-8 w-8 ${isRejected ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
              onClick={() => onBulkEdit([lineItem], 'status', 'rejected')}
              disabled={isRejected}
              title={isRejected ? 'Already rejected' : 'Reject this item'}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        );
      }
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
      header: () => (
        <div className="flex items-center justify-end">
          <span className="mr-2">Amount</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-gray-100">
                <Filter className="h-3.5 w-3.5 text-gray-500" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3" align="end">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Filter by Amount</h4>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="amountFilter"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mr-2"
                    checked={showAmountChanges}
                    onChange={() => setShowAmountChanges(!showAmountChanges)}
                  />
                  <label htmlFor="amountFilter" className="text-sm">Show amount changes only</label>
                </div>
                {showAmountChanges && (
                  <p className="text-xs text-gray-500 mt-1">
                    Showing only items with adjusted amounts
                  </p>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      ),
      cell: ({ row }) => {
        const amount = row.getValue('amount') as number;
        const adjustedAmount = row.original.adjusted_amount;
        const hasAdjustedAmount = adjustedAmount !== null && adjustedAmount !== amount;
        
        if (hasAdjustedAmount) {
          return (
            <div className="text-right font-medium bg-purple-50 rounded px-1">
              <span className="line-through text-gray-400 text-xs">
                {formatCurrency(amount)}
              </span>
              <div className="text-blue-600">
                {formatCurrency(adjustedAmount as number)}
              </div>
            </div>
          );
        }
        
        return <div className="text-right font-medium">{formatCurrency(amount)}</div>;
      },
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
      header: () => (
        <div className="flex items-center justify-center">
          <span className="mr-2">Status</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-gray-100">
                <Filter className="h-3.5 w-3.5 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <div className="p-2">
                <h4 className="text-sm font-medium mb-2">Filter by Status</h4>
                <div className="space-y-1">
                  <DropdownMenuCheckboxItem
                    checked={statusFilters.approved}
                    onCheckedChange={(checked) =>
                      setStatusFilters({ ...statusFilters, approved: !!checked })
                    }
                    className="cursor-pointer"
                  >
                    <div className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                      Approved
                    </div>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={statusFilters.adjusted}
                    onCheckedChange={(checked) =>
                      setStatusFilters({ ...statusFilters, adjusted: !!checked })
                    }
                    className="cursor-pointer"
                  >
                    <div className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-amber-500 mr-2"></span>
                      Adjusted
                    </div>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={statusFilters.rejected}
                    onCheckedChange={(checked) =>
                      setStatusFilters({ ...statusFilters, rejected: !!checked })
                    }
                    className="cursor-pointer"
                  >
                    <div className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                      Rejected
                    </div>
                  </DropdownMenuCheckboxItem>
                </div>
                {(statusFilters.approved || statusFilters.adjusted || statusFilters.rejected) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 h-8 text-xs"
                    onClick={() => setStatusFilters({ approved: false, adjusted: false, rejected: false })}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
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
  ], [editingCell, editValue, onBulkEdit, statusFilters, showAmountChanges]);

  const table = useReactTable({
    data: filteredData,
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

  // Add some CSS for styling
  const activeFilterStyle = "flex items-center space-x-2 bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs";

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
      
      {/* Active filters area */}
      {(statusFilters.approved || statusFilters.adjusted || statusFilters.rejected || showAmountChanges) && (
        <div className="flex flex-wrap gap-2 py-2">
          <span className="text-sm text-gray-500 py-1">Active filters:</span>
          
          {statusFilters.approved && (
            <div className={activeFilterStyle}>
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              <span>Approved</span>
              <button 
                className="ml-1 text-blue-600" 
                onClick={() => setStatusFilters({...statusFilters, approved: false})}
              >
                &times;
              </button>
            </div>
          )}
          
          {statusFilters.adjusted && (
            <div className={activeFilterStyle}>
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              <span>Adjusted</span>
              <button 
                className="ml-1 text-blue-600" 
                onClick={() => setStatusFilters({...statusFilters, adjusted: false})}
              >
                &times;
              </button>
            </div>
          )}
          
          {statusFilters.rejected && (
            <div className={activeFilterStyle}>
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              <span>Rejected</span>
              <button 
                className="ml-1 text-blue-600" 
                onClick={() => setStatusFilters({...statusFilters, rejected: false})}
              >
                &times;
              </button>
            </div>
          )}
          
          {showAmountChanges && (
            <div className={activeFilterStyle}>
              <span>Amount Changes</span>
              <button 
                className="ml-1 text-blue-600" 
                onClick={() => setShowAmountChanges(false)}
              >
                &times;
              </button>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="text-sm text-gray-500 hover:text-gray-700"
            onClick={() => {
              setStatusFilters({ approved: false, adjusted: false, rejected: false });
              setShowAmountChanges(false);
            }}
          >
            Clear all filters
          </Button>
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
