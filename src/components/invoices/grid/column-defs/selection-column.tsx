
import { ColumnDef } from '@tanstack/react-table';
import { LineItem } from '@/types';

export const selectionColumn = (): ColumnDef<LineItem> => ({
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
  size: 40,
});
