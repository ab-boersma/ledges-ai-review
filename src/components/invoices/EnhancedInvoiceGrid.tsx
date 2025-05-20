import React, { useState, useMemo, useEffect } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnDef,
  RowSelectionState,
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
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Edit,
  DollarSign,
  ShieldCheck,
  Trash2,
  Filter,
  X,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import AICommentary from './AICommentary';
import AdjustmentPanel from './AdjustmentPanel';

interface EnhancedInvoiceGridProps {
  data: LineItem[];
  filters: Record<string, any>;
  onBulkEdit: (lineItems: LineItem[], fieldName: string, value: any) => void;
  onLineItemUpdate: (lineItem: LineItem) => void;
}

// Highlight matching text in search results
const HighlightMatch = ({ text, searchTerm }: { text: string, searchTerm: string }) => {
  if (!searchTerm || searchTerm === '') {
    return <>{text}</>;
  }

  const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
  
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === searchTerm.toLowerCase() ? 
          <mark key={i} className="bg-yellow-200 rounded-sm px-0.5">{part}</mark> : 
          <span key={i}>{part}</span>
      )}
    </>
  );
};

const EnhancedInvoiceGrid: React.FC<EnhancedInvoiceGridProps> = ({ 
  data, 
  filters, 
  onBulkEdit,
  onLineItemUpdate
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  
  // Column filtering state
  const [columnFilters, setColumnFilters] = useState({
    status: {
      accepted: false,
      adjusted: false,
      rejected: false,
    },
    aiAction: {
      approve: false,
      adjust: false,
      reject: false,
    },
    amount: {
      showChangesOnly: false,
    },
    timekeeper: {
      value: "",
    },
  });

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

  // Calculate adjustment percentage
  const calculateAdjustmentPercentage = (original: number, adjusted: number | null): string => {
    if (adjusted === null) return "0%";
    const diff = ((adjusted - original) / original) * 100;
    return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;
  };

  // Toggle expanded row
  const toggleRowExpanded = (rowId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));
  };

  // Add a quick reject handler
  const handleQuickReject = (lineItem: LineItem) => {
    const updatedItem: LineItem = {
      ...lineItem,
      status: 'rejected',
      adjusted_amount: 0
    };
    onLineItemUpdate(updatedItem);
  };

  // Add a quick accept handler
  const handleQuickAccept = (lineItem: LineItem) => {
    const updatedItem: LineItem = {
      ...lineItem,
      status: 'compliance_accepted'
    };
    onLineItemUpdate(updatedItem);
  };

  // Check if any column filter is active
  const isColumnFilterActive = useMemo(() => {
    return (
      columnFilters.status.accepted || 
      columnFilters.status.adjusted || 
      columnFilters.status.rejected ||
      columnFilters.aiAction.approve ||
      columnFilters.aiAction.adjust || 
      columnFilters.aiAction.reject ||
      columnFilters.amount.showChangesOnly ||
      !!columnFilters.timekeeper.value
    );
  }, [columnFilters]);

  // Clear all column filters
  const clearAllColumnFilters = () => {
    setColumnFilters({
      status: {
        accepted: false,
        adjusted: false,
        rejected: false,
      },
      aiAction: {
        approve: false,
        adjust: false,
        reject: false,
      },
      amount: {
        showChangesOnly: false,
      },
      timekeeper: {
        value: "",
      },
    });
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
              (table.getIsSomeRowsSelected() ? true : false)
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
      id: 'expander',
      header: '',
      cell: ({ row }) => {
        const isExpanded = expandedRows[row.id] || false;
        return (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => toggleRowExpanded(row.id)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        );
      },
      enableSorting: false,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const lineItem = row.original;
        const isRejected = lineItem.status === 'rejected';
        const isAccepted = lineItem.status === 'compliance_accepted';
        
        return (
          <div className="flex items-center space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${isAccepted ? 'text-green-500' : 'text-gray-500 hover:text-green-500'}`}
                    onClick={() => handleQuickAccept(lineItem)}
                    disabled={isAccepted}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isAccepted ? 'Already accepted' : 'Accept this line item'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${isRejected ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                    onClick={() => handleQuickReject(lineItem)}
                    disabled={isRejected}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isRejected ? 'Already rejected' : 'Reject this line item'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: 'ai_action',
      header: () => (
        <div className="flex items-center justify-center">
          <span className="mr-1">AI</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-6 w-6 hover:bg-gray-100 ${
                  columnFilters.aiAction.approve || 
                  columnFilters.aiAction.adjust || 
                  columnFilters.aiAction.reject ? 
                  'bg-blue-100 text-blue-600' : ''}`}
              >
                <Filter className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <div className="p-2">
                <h4 className="text-sm font-medium mb-2">Filter by AI Action</h4>
                <div className="space-y-1">
                  <DropdownMenuCheckboxItem
                    checked={columnFilters.aiAction.approve}
                    onCheckedChange={(checked) => {
                      setColumnFilters({
                        ...columnFilters,
                        aiAction: {
                          ...columnFilters.aiAction,
                          approve: !!checked,
                        },
                      });
                    }}
                  >
                    <div className="flex items-center">
                      <ShieldCheck className="h-4 w-4 text-green-500 mr-2" />
                      Approved
                    </div>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={columnFilters.aiAction.adjust}
                    onCheckedChange={(checked) => {
                      setColumnFilters({
                        ...columnFilters,
                        aiAction: {
                          ...columnFilters.aiAction,
                          adjust: !!checked,
                        },
                      });
                    }}
                  >
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                      Needs Adjustment
                    </div>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={columnFilters.aiAction.reject}
                    onCheckedChange={(checked) => {
                      setColumnFilters({
                        ...columnFilters,
                        aiAction: {
                          ...columnFilters.aiAction,
                          reject: !!checked,
                        },
                      });
                    }}
                  >
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                      Rejection
                    </div>
                  </DropdownMenuCheckboxItem>
                </div>
                {(columnFilters.aiAction.approve || 
                  columnFilters.aiAction.adjust || 
                  columnFilters.aiAction.reject) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 h-8 text-xs"
                    onClick={() => {
                      setColumnFilters({
                        ...columnFilters,
                        aiAction: {
                          approve: false,
                          adjust: false,
                          reject: false,
                        },
                      });
                    }}
                  >
                    Clear AI Filters
                  </Button>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      cell: ({ row }) => {
        const action = row.getValue('ai_action');
        if (!action) return null;
        
        switch(action) {
          case 'approve':
            return (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ShieldCheck className="h-4 w-4 mx-auto text-green-500" />
                  </TooltipTrigger>
                  <TooltipContent>Compliance accepted</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          case 'adjust':
            return (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertTriangle className="h-4 w-4 mx-auto text-amber-500" />
                  </TooltipTrigger>
                  <TooltipContent>Needs adjustment</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          case 'reject':
            return (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertTriangle className="h-4 w-4 mx-auto text-red-500" />
                  </TooltipTrigger>
                  <TooltipContent>Recommended rejection</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          default:
            return null;
        }
      },
      enableSorting: true,
    },
    {
      accessorKey: 'timekeeper_name',
      header: () => (
        <div className="flex items-center">
          <span className="mr-1">Timekeeper</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-6 w-6 hover:bg-gray-100 ${
                  columnFilters.timekeeper.value ? 'bg-blue-100 text-blue-600' : ''
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" align="start">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Filter by Timekeeper</h4>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search timekeepers..."
                    value={columnFilters.timekeeper.value}
                    onChange={(e) => {
                      setColumnFilters({
                        ...columnFilters,
                        timekeeper: {
                          value: e.target.value,
                        },
                      });
                    }}
                    className="h-8"
                  />
                  {columnFilters.timekeeper.value && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setColumnFilters({
                          ...columnFilters,
                          timekeeper: {
                            value: "",
                          },
                        });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      ),
      cell: ({ row }) => {
        const timekeeperName = row.getValue('timekeeper_name') as string;
        const searchTerm = columnFilters.timekeeper.value || '';
        
        return (
          <div className="max-w-[150px] truncate">
            <HighlightMatch text={timekeeperName} searchTerm={searchTerm} />
          </div>
        );
      }
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
        const adjustedHours = row.original.adjusted_hours;
        
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
            className="text-right cursor-pointer hover:bg-gray-100 flex items-center justify-end"
          >
            {adjustedHours !== null ? (
              <div className="flex flex-col">
                <span className="line-through text-gray-400 text-xs">
                  {formatHours(value as number)}
                </span>
                <span
                  onClick={() => {
                    setEditingCell({ rowId: row.id, columnId: column.id });
                    setEditValue(adjustedHours.toString());
                  }}
                >
                  {formatHours(adjustedHours)}
                </span>
              </div>
            ) : (
              <span
                onClick={() => {
                  setEditingCell({ rowId: row.id, columnId: column.id });
                  setEditValue(formatHours(value as number));
                }}
              >
                {formatHours(value as number)}
              </span>
            )}
            <Edit className="h-3 w-3 ml-1 text-gray-400" />
          </div>
        );
      },
    },
    {
      accessorKey: 'rate',
      header: 'Rate',
      cell: ({ row, column }) => {
        const isEditing = 
          editingCell?.rowId === row.id && 
          editingCell?.columnId === column.id;

        const value = row.getValue('rate');
        const adjustedRate = row.original.adjusted_rate;
        
        if (isEditing) {
          return (
            <Input
              className="h-8 w-28 p-1 text-right"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => {
                onBulkEdit([row.original], 'rate', parseFloat(editValue) || 0);
                setEditingCell(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onBulkEdit([row.original], 'rate', parseFloat(editValue) || 0);
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
            className="text-right cursor-pointer hover:bg-gray-100 flex items-center justify-end"
            onClick={() => {
              setEditingCell({ rowId: row.id, columnId: column.id });
              setEditValue((adjustedRate !== null ? adjustedRate : value as number).toString());
            }}
          >
            {adjustedRate !== null ? (
              <div className="flex flex-col">
                <span className="line-through text-gray-400 text-xs">
                  {formatCurrency(value as number)}
                </span>
                <span>{formatCurrency(adjustedRate)}</span>
              </div>
            ) : (
              <span>{formatCurrency(value as number)}</span>
            )}
            <Edit className="h-3 w-3 ml-1 text-gray-400" />
          </div>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: () => (
        <div className="flex items-center justify-end">
          <span className="mr-1">Amount</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-6 w-6 hover:bg-gray-100 ${columnFilters.amount.showChangesOnly ? 'bg-blue-100 text-blue-600' : ''}`}
              >
                <Filter className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3" align="end">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Filter by Amount</h4>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="amountChangesFilter"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mr-2"
                    checked={columnFilters.amount.showChangesOnly}
                    onChange={(e) => {
                      setColumnFilters({
                        ...columnFilters,
                        amount: {
                          showChangesOnly: e.target.checked,
                        },
                      });
                    }}
                  />
                  <label htmlFor="amountChangesFilter" className="text-sm">
                    Show amount changes only
                  </label>
                </div>
                {columnFilters.amount.showChangesOnly && (
                  <p className="text-xs text-gray-500 mt-1">
                    Showing only items with adjusted amounts
                  </p>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      ),
      cell: ({ row, column }) => {
        const amount = row.getValue('amount') as number;
        const adjustedAmount = row.original.adjusted_amount;
        const status = row.original.status;
        const isRejected = status === 'rejected';
        const hasAmountChange = adjustedAmount !== null && adjustedAmount !== amount;
        
        const isEditing = 
          editingCell?.rowId === row.id && 
          editingCell?.columnId === column.id;
        
        if (isEditing) {
          return (
            <div className="relative">
              <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                className="h-8 w-28 p-1 pl-8 text-right"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => {
                  const updatedItem: LineItem = {
                    ...row.original,
                    adjusted_amount: parseFloat(editValue) || 0,
                    status: "adjusted"
                  };
                  onLineItemUpdate(updatedItem);
                  setEditingCell(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const updatedItem: LineItem = {
                      ...row.original,
                      adjusted_amount: parseFloat(editValue) || 0,
                      status: "adjusted"
                    };
                    onLineItemUpdate(updatedItem);
                    setEditingCell(null);
                  } else if (e.key === 'Escape') {
                    setEditingCell(null);
                  }
                }}
                autoFocus
              />
            </div>
          );
        }
        
        return (
          <div 
            className={`text-right font-medium cursor-pointer hover:bg-gray-100 flex items-center justify-end ${isRejected ? 'opacity-50' : ''} ${hasAmountChange ? 'bg-purple-50 rounded px-1' : ''}`}
            onClick={() => {
              if (!isRejected) {
                setEditingCell({ rowId: row.id, columnId: column.id });
                setEditValue((adjustedAmount !== null ? adjustedAmount : amount).toString());
              }
            }}
          >
            {isRejected ? (
              <div className="flex flex-col">
                <span className="line-through text-gray-400 text-xs">
                  {formatCurrency(amount)}
                </span>
                <span className="text-red-600">Rejected</span>
              </div>
            ) : adjustedAmount !== null ? (
              <div className="flex flex-col">
                <span className="line-through text-gray-400 text-xs">
                  {formatCurrency(amount)}
                </span>
                <div className="flex flex-col">
                  <span className="text-blue-600">
                    {formatCurrency(adjustedAmount)}
                  </span>
                  <span className={`text-xs ${adjustedAmount < amount ? 'text-green-600' : 'text-red-600'}`}>
                    {calculateAdjustmentPercentage(amount, adjustedAmount)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-end">
                <span>{formatCurrency(amount)}</span>
                <Edit className="h-3 w-3 ml-1 text-gray-400" />
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'narrative',
      header: 'Narrative',
      cell: ({ row }) => {
        const narrative: string = row.getValue('narrative');
        const isExpanded = expandedRows[row.id] || false;
        const searchTerm = filters.search || '';
        
        return (
          <div 
            className={isExpanded ? "" : "max-w-[400px] truncate"} 
            title={!isExpanded ? narrative : undefined}
          >
            <HighlightMatch text={narrative} searchTerm={searchTerm} />
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: () => (
        <div className="flex items-center justify-center">
          <span className="mr-1">Status</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-6 w-6 hover:bg-gray-100 ${
                  columnFilters.status.accepted || 
                  columnFilters.status.adjusted || 
                  columnFilters.status.rejected ? 
                  'bg-blue-100 text-blue-600' : ''}`}
              >
                <Filter className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="p-2">
                <h4 className="text-sm font-medium mb-2">Filter by Status</h4>
                <div className="space-y-1">
                  <DropdownMenuCheckboxItem
                    checked={columnFilters.status.accepted}
                    onCheckedChange={(checked) => {
                      setColumnFilters({
                        ...columnFilters,
                        status: {
                          ...columnFilters.status,
                          accepted: !!checked,
                        },
                      });
                    }}
                  >
                    <div className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                      Accepted
                    </div>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={columnFilters.status.adjusted}
                    onCheckedChange={(checked) => {
                      setColumnFilters({
                        ...columnFilters,
                        status: {
                          ...columnFilters.status,
                          adjusted: !!checked,
                        },
                      });
                    }}
                  >
                    <div className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-amber-500 mr-2"></span>
                      Adjusted
                    </div>
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={columnFilters.status.rejected}
                    onCheckedChange={(checked) => {
                      setColumnFilters({
                        ...columnFilters,
                        status: {
                          ...columnFilters.status,
                          rejected: !!checked,
                        },
                      });
                    }}
                  >
                    <div className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                      Rejected
                    </div>
                  </DropdownMenuCheckboxItem>
                </div>
                {(columnFilters.status.accepted || 
                  columnFilters.status.adjusted || 
                  columnFilters.status.rejected) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 h-8 text-xs"
                    onClick={() => {
                      setColumnFilters({
                        ...columnFilters,
                        status: {
                          accepted: false,
                          adjusted: false,
                          rejected: false,
                        },
                      });
                    }}
                  >
                    Clear Status Filters
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
        let displayText = '';
        
        switch(status) {
          case 'reviewed':
            statusClass = 'bg-blue-100 text-blue-800 border-blue-200';
            displayText = 'Reviewed';
            break;
          case 'compliance_accepted':
            statusClass = 'bg-green-100 text-green-800 border-green-200';
            displayText = 'Accepted';
            break;
          case 'adjusted':
            statusClass = 'bg-amber-100 text-amber-800 border-amber-200';
            displayText = 'Adjusted';
            break;
          case 'rejected':
            statusClass = 'bg-red-100 text-red-800 border-red-200';
            displayText = 'Rejected';
            break;
          case 'approved':
            statusClass = 'bg-blue-100 text-blue-800 border-blue-200';
            displayText = 'Approved';
            break;
          default:
            statusClass = 'bg-gray-100 text-gray-800 border-gray-200';
            displayText = status.charAt(0).toUpperCase() + status.slice(1);
        }
        
        return (
          <div className="flex justify-center">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
              {displayText}
            </span>
          </div>
        );
      }
    },
  ], [
    editingCell, 
    editValue, 
    expandedRows, 
    onBulkEdit, 
    onLineItemUpdate, 
    filters.search, 
    handleQuickAccept, 
    handleQuickReject, 
    columnFilters
  ]);

  // Apply global filtering and column filtering
  const customFilters = useMemo(() => {
    return (row: LineItem) => {
      // Search filtering (from parent component filters)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          row.timekeeper_name.toLowerCase().includes(searchTerm) ||
          row.narrative.toLowerCase().includes(searchTerm) ||
          row.task_code.toLowerCase().includes(searchTerm);
          
        if (!matchesSearch) return false;
      }
      
      // Timekeeper filtering
      if (columnFilters.timekeeper.value) {
        if (!row.timekeeper_name.toLowerCase().includes(columnFilters.timekeeper.value.toLowerCase())) {
          return false;
        }
      }
      
      // Status filter
      const statusFiltersActive = 
        columnFilters.status.accepted || 
        columnFilters.status.adjusted || 
        columnFilters.status.rejected;
        
      if (statusFiltersActive) {
        const matchesStatus = 
          (columnFilters.status.accepted && row.status === 'compliance_accepted') ||
          (columnFilters.status.adjusted && row.status === 'adjusted') ||
          (columnFilters.status.rejected && row.status === 'rejected');
          
        if (!matchesStatus) return false;
      }
      
      // AI Action filter
      const aiFiltersActive = 
        columnFilters.aiAction.approve || 
        columnFilters.aiAction.adjust || 
        columnFilters.aiAction.reject;
        
      if (aiFiltersActive) {
        const matchesAiAction = 
          (columnFilters.aiAction.approve && row.ai_action === 'approve') ||
          (columnFilters.aiAction.adjust && row.ai_action === 'adjust') ||
          (columnFilters.aiAction.reject && row.ai_action === 'reject');
          
        if (!matchesAiAction) return false;
      }
      
      // Amount changes filter
      if (columnFilters.amount.showChangesOnly) {
        const hasAmountChange = 
          row.adjusted_amount !== null && 
          row.adjusted_amount !== row.amount;
          
        if (!hasAmountChange) return false;
      }
      
      return true;
    };
  }, [filters.search, columnFilters]);

  // Filter data manually
  const filteredData = useMemo(() => {
    return data.filter(row => customFilters(row));
  }, [data, customFilters]);

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
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: () => true, // We handle filtering manually
    initialState: {
      pagination: {
        pageSize: 10,
      }
    }
  });

  // Set page size once during initialization
  useEffect(() => {
    table.setPageSize(10);
  }, [table]);

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
              onClick={() => onBulkEdit(selectedRows, 'status', 'compliance_accepted')}
            >
              Accept
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
      
      {isColumnFilterActive && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600">Active filters:</span>
            
            {columnFilters.status.accepted && (
              <div className="bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                <span>Status: Accepted</span>
                <Button 
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-1 p-0"
                  onClick={() => {
                    setColumnFilters({
                      ...columnFilters,
                      status: {
                        ...columnFilters.status,
                        accepted: false,
                      },
                    });
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {columnFilters.status.adjusted && (
              <div className="bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs flex items-center">
                <span className="h-2 w-2 rounded-full bg-amber-500 mr-1"></span>
                <span>Status: Adjusted</span>
                <Button 
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-1 p-0"
                  onClick={() => {
                    setColumnFilters({
                      ...columnFilters,
                      status: {
                        ...columnFilters.status,
                        adjusted: false,
                      },
                    });
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {columnFilters.status.rejected && (
              <div className="bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs flex items-center">
                <span className="h-2 w-2 rounded-full bg-red-500 mr-1"></span>
                <span>Status: Rejected</span>
                <Button 
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-1 p-0"
                  onClick={() => {
                    setColumnFilters({
                      ...columnFilters,
                      status: {
                        ...columnFilters.status,
                        rejected: false,
                      },
                    });
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {(columnFilters.aiAction.approve || 
             columnFilters.aiAction.adjust || 
             columnFilters.aiAction.reject) && (
              <div className="bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs flex items-center">
                <span>AI Action</span>
                <Button 
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-1 p-0"
                  onClick={() => {
                    setColumnFilters({
                      ...columnFilters,
                      aiAction: {
                        approve: false,
                        adjust: false,
                        reject: false,
                      },
                    });
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {columnFilters.amount.showChangesOnly && (
              <div className="bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs flex items-center">
                <span>Amount Changes</span>
                <Button 
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-1 p-0"
                  onClick={() => {
                    setColumnFilters({
                      ...columnFilters,
                      amount: {
                        showChangesOnly: false,
                      },
                    });
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {columnFilters.timekeeper.value && (
              <div className="bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs flex items-center">
                <span>Timekeeper: {columnFilters.timekeeper.value}</span>
                <Button 
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-1 p-0"
                  onClick={() => {
                    setColumnFilters({
                      ...columnFilters,
                      timekeeper: {
                        value: "",
                      },
                    });
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-sm text-gray-500"
            onClick={clearAllColumnFilters}
          >
            Clear All Filters
          </Button>
        </div>
      )}
      
      <div className="rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50">
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id}
                    className={header.column.getCanSort() ? "cursor-pointer select-none" : ""}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <div className="ml-2">
                            {header.column.getIsSorted() === 'asc' ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <div className="h-4 w-4 text-gray-300">⋮</div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No line items found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => {
                const isExpanded = expandedRows[row.id] || false;
                
                return [
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={isExpanded ? "border-b-0" : ""}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>,
                  
                  isExpanded && (
                    <TableRow key={`${row.id}-expanded`} className="bg-gray-50">
                      <TableCell colSpan={columns.length} className="p-0">
                        <div className="p-4">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium mb-2">AI Commentary</h4>
                              <AICommentary 
                                lineItem={row.original} 
                                expanded={isExpanded} 
                              />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-2">Adjustment Details</h4>
                              <AdjustmentPanel 
                                lineItem={row.original}
                                onSave={onLineItemUpdate}
                                expanded={isExpanded}
                              />
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                ];
              }).flat()
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
          {Math.max(1, table.getPageCount())}
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

export default EnhancedInvoiceGrid;
