
import React, { useState, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
  FilterFn,
  getFilteredRowModel,
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

// Import our refactored components
import { getColumns } from './grid/columns';
import { ActiveFilters } from './grid/ActiveFilters';
import { BulkActionPanel } from './grid/BulkActionPanel';
import { Pagination } from './grid/Pagination';
import { isFilterActive } from './grid/utils';

// Define custom filter functions
const filterFunctions: Record<string, FilterFn<any>> = {
  text: (row, columnId, filterValue) => {
    const value = String(row.getValue(columnId)).toLowerCase();
    return filterValue ? value.includes(filterValue.toLowerCase()) : true;
  },
  
  number: (row, columnId, filterValue) => {
    if (!filterValue) return true;
    
    const value = Number(row.getValue(columnId));
    const { min, max } = filterValue;
    
    if (min !== undefined && max !== undefined) {
      return value >= min && value <= max;
    } else if (min !== undefined) {
      return value >= min;
    } else if (max !== undefined) {
      return value <= max;
    }
    
    return true;
  },
  
  date: (row, columnId, filterValue) => {
    if (!filterValue) return true;
    
    const rowDate = new Date(row.getValue(columnId));
    const filterDate = new Date(filterValue);
    
    return (
      rowDate.getFullYear() === filterDate.getFullYear() &&
      rowDate.getMonth() === filterDate.getMonth() &&
      rowDate.getDate() === filterDate.getDate()
    );
  },
  
  status: (row, columnId, filterValue) => {
    if (!filterValue || !Object.values(filterValue).some(Boolean)) return true;
    
    const status = String(row.getValue(columnId));
    return filterValue[status] === true;
  },
  
  amount: (row, columnId, filterValue) => {
    if (!filterValue) return true;
    
    if (filterValue.showChangesOnly) {
      const amount = row.getValue(columnId);
      const adjustedAmount = row.original.adjusted_amount;
      return adjustedAmount !== null && adjustedAmount !== amount;
    }
    
    return true;
  }
};

interface InvoiceGridProps {
  data: LineItem[];
  onBulkEdit: (lineItems: LineItem[], fieldName: string, value: any) => void;
}

const InvoiceGrid: React.FC<InvoiceGridProps> = ({ data, onBulkEdit }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<Record<string, any>>({});
  
  // Handle filter changes
  const handleFilterChange = (columnId: string, value: any) => {
    if (value === null) {
      const newFilters = { ...columnFilters };
      delete newFilters[columnId];
      setColumnFilters(newFilters);
    } else {
      setColumnFilters(prev => ({
        ...prev,
        [columnId]: value
      }));
    }
  };
  
  // Clear a single filter
  const handleClearFilter = (columnId: string) => {
    const newFilters = { ...columnFilters };
    delete newFilters[columnId];
    setColumnFilters(newFilters);
  };
  
  // Clear all filters
  const handleClearAllFilters = () => {
    setColumnFilters({});
  };
  
  // Apply the filters in the table
  const columnFilterFns = useMemo(() => ({
    timekeeper_name: filterFunctions.text,
    service_date: filterFunctions.date,
    task_code: filterFunctions.text,
    activity_code: filterFunctions.text,
    hours: filterFunctions.number,
    rate: filterFunctions.number,
    amount: filterFunctions.amount,
    narrative: filterFunctions.text,
    status: filterFunctions.status,
  }), []);
  
  // Get columns with filter props
  const columns = useMemo(() => getColumns({
    onBulkEdit,
    onFilterChange: handleFilterChange,
    activeFilters: columnFilters,
    columnFilterFns  // Added the missing fourth argument
  }), [onBulkEdit, columnFilters, columnFilterFns]);
  
  // Initialize table
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    filterFns: columnFilterFns,
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
    },
    getFilteredRowModel: getFilteredRowModel(),
    meta: {
      filterValues: columnFilters
    }
  });

  // Get filtered rows based on column filters
  const filteredData = useMemo(() => {
    let result = [...data];
    
    // Apply column filters
    Object.entries(columnFilters).forEach(([columnId, filterValue]) => {
      const filterFn = columnFilterFns[columnId as keyof typeof columnFilterFns];
      if (filterFn && filterValue !== null) {
        result = result.filter((row) => {
          return filterFn({ getValue: () => row[columnId as keyof LineItem] } as any, columnId, filterValue);
        });
      }
    });
    
    return result;
  }, [data, columnFilters, columnFilterFns]);

  // Update the table's data
  React.useEffect(() => {
    if (Object.keys(columnFilters).length > 0) {
      table.setPageIndex(0);
    }
  }, [table, columnFilters]);
  
  // Extract selected rows for bulk actions
  const selectedRows = table.getSelectedRowModel().rows.map(row => row.original);

  return (
    <div className="space-y-4">
      {/* Bulk Action Panel */}
      <BulkActionPanel 
        selectedRows={selectedRows} 
        onBulkEdit={onBulkEdit} 
      />
      
      {/* Active Filters Display */}
      <ActiveFilters 
        activeFilters={columnFilters}
        onClearFilter={handleClearFilter}
        onClearAllFilters={handleClearAllFilters}
      />
      
      {/* Data Grid */}
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
      
      {/* Pagination Controls */}
      <Pagination table={table} />
    </div>
  );
};

export default InvoiceGrid;
