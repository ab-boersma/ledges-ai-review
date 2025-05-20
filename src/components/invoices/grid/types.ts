
import { LineItem } from '@/types';
import { FilterFn } from '@tanstack/react-table';

export interface GetColumnsProps {
  onBulkEdit: (lineItems: LineItem[], fieldName: string, value: any) => void;
  onFilterChange: (columnId: string, value: any) => void;
  activeFilters: Record<string, any>;
  columnFilterFns: Record<string, FilterFn<any>>;
}
