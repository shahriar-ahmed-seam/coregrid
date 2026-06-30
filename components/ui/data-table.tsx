"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
  FileX,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ==========================================
// TYPES
// ==========================================

export interface Column<T> {
  id?: string;
  key?: string; // alias for id
  header: string;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => React.ReactNode;
  cell?: (row: T) => React.ReactNode;
  render?: (row: T) => React.ReactNode; // alias for cell
  sortable?: boolean;
  visible?: boolean;
  className?: string;
  hidden?: (row: T) => boolean;
}

export interface RowAction<T> {
  label: string | ((row: T) => string);
  icon?: React.ReactNode;
  onClick: (row: T) => void | Promise<void>;
  variant?: "default" | "destructive";
  separator?: boolean;
  hidden?: (row: T) => boolean;
}

interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface EmptyStateConfig {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowActions?: RowAction<T>[];
  searchPlaceholder?: string;
  searchKey?: keyof T;
  onSearch?: (query: string) => void;
  searchValue?: string;
  onRowClick?: (row: T) => void;
  // Pagination - legacy format
  pageSize?: number;
  pageIndex?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  // Pagination - new format
  pagination?: PaginationConfig;
  // Empty state - new format  
  emptyState?: EmptyStateConfig;
  // Sorting
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (column: string, order: "asc" | "desc") => void;
  // State
  isLoading?: boolean;
  emptyMessage?: string;
  // Selection
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (rows: T[]) => void;
  getRowId?: (row: T) => string;
}

// ==========================================
// COMPONENT
// ==========================================

export function DataTable<T extends object>({
  data,
  columns: initialColumns,
  rowActions,
  searchPlaceholder = "Search...",
  searchKey,
  onSearch,
  searchValue = "",
  onRowClick,
  pageSize: legacyPageSize = 10,
  pageIndex = 0,
  totalCount,
  onPageChange: legacyOnPageChange,
  onPageSizeChange,
  pagination,
  emptyState,
  sortBy,
  sortOrder = "asc",
  onSort,
  isLoading = false,
  emptyMessage = "No results found.",
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  getRowId = (row) => (row as { id?: string }).id || "",
}: DataTableProps<T>) {
  // Normalize pagination props
  const pageSize = pagination?.pageSize ?? legacyPageSize;
  const currentPage = pagination?.page ?? (pageIndex + 1);
  const handlePageChange = pagination?.onPageChange ?? ((page: number) => legacyOnPageChange?.(page - 1));
  
  // Normalize columns - support both id/key and cell/render
  const normalizedColumns = initialColumns.map((col) => ({
    ...col,
    id: (col.id || col.key || col.header) as string,
    cell: col.cell || col.render,
  }));
  
  // Column visibility state
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>(
    () => {
      const visibility: Record<string, boolean> = {};
      normalizedColumns.forEach((col) => {
        visibility[col.id] = col.visible !== false;
      });
      return visibility;
    }
  );

  // Local search state (for client-side filtering)
  const [localSearch, setLocalSearch] = React.useState(searchValue);

  // Visible columns
  const visibleColumns = normalizedColumns.filter((col) => columnVisibility[col.id]);

  // Get cell value (defined early for use in filtering)
  const getCellValue = (row: T, column: Column<T>): React.ReactNode => {
    if (column.cell) {
      return column.cell(row);
    }
    if (column.accessorFn) {
      return column.accessorFn(row);
    }
    if (column.accessorKey) {
      return row[column.accessorKey] as React.ReactNode;
    }
    return null;
  };

  // Apply client-side filtering if no onSearch handler is provided
  const filteredData = React.useMemo(() => {
    if (onSearch || !localSearch) return data;
    
    const searchLower = localSearch.toLowerCase();
    return data.filter((row) => {
      // Search through all visible columns
      return visibleColumns.some((column) => {
        const value = getCellValue(row, column);
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchLower);
      });
    });
  }, [data, localSearch, onSearch, visibleColumns]);

  // Use filtered data for display
  const displayData = filteredData;

  // Calculate pagination
  const total = pagination?.total ?? totalCount ?? displayData.length;
  const totalPages = pagination?.totalPages ?? Math.ceil(total / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, total);

  // Handle search
  const handleSearch = (value: string) => {
    setLocalSearch(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  // Handle sort
  const handleSort = (columnId: string) => {
    if (!onSort) return;
    const newOrder = sortBy === columnId && sortOrder === "asc" ? "desc" : "asc";
    onSort(columnId, newOrder);
  };

  // Selection handlers
  const isRowSelected = (row: T) => {
    const rowId = getRowId(row);
    return selectedRows.some((r) => getRowId(r) === rowId);
  };

  const toggleRowSelection = (row: T) => {
    if (!onSelectionChange) return;
    const rowId = getRowId(row);
    const isSelected = isRowSelected(row);
    if (isSelected) {
      onSelectionChange(selectedRows.filter((r) => getRowId(r) !== rowId));
    } else {
      onSelectionChange([...selectedRows, row]);
    }
  };

  const toggleAllSelection = () => {
    if (!onSelectionChange) return;
    if (selectedRows.length === displayData.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange([...displayData]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={localSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Column Visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {normalizedColumns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={columnVisibility[column.id]}
                onCheckedChange={(checked) =>
                  setColumnVisibility((prev) => ({
                    ...prev,
                    [column.id]: checked,
                  }))
                }
              >
                {column.header}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Selection info */}
      {selectable && selectedRows.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">{selectedRows.length} selected</Badge>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={displayData.length > 0 && selectedRows.length === displayData.length}
                    onChange={toggleAllSelection}
                  />
                </TableHead>
              )}
              {visibleColumns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    column.sortable && "cursor-pointer select-none",
                    column.className
                  )}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && (
                      <span className="text-muted-foreground">
                        {sortBy === column.id ? (
                          sortOrder === "asc" ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
              {rowActions && rowActions.length > 0 && (
                <TableHead className="w-12">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}
                  className="h-32"
                >
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : displayData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0)}
                  className="h-32"
                >
                  {emptyState ? (
                    <div className="flex flex-col items-center justify-center text-muted-foreground py-8">
                      {emptyState.icon && <div className="mb-4">{emptyState.icon}</div>}
                      {emptyState.title && <p className="font-medium text-foreground">{emptyState.title}</p>}
                      {emptyState.description && <p className="text-sm">{emptyState.description}</p>}
                      {emptyState.action && (
                        <Button onClick={emptyState.action.onClick} className="mt-4" size="sm">
                          {emptyState.action.label}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <FileX className="h-8 w-8 mb-2" />
                      <p>{localSearch ? "No results found for your search." : emptyMessage}</p>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              displayData.map((row, rowIndex) => (
                <TableRow
                  key={getRowId(row) || rowIndex}
                  className={cn(
                    isRowSelected(row) && "bg-muted/50",
                    onRowClick && "cursor-pointer hover:bg-muted/50"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={isRowSelected(row)}
                        onChange={() => toggleRowSelection(row)}
                      />
                    </TableCell>
                  )}
                  {visibleColumns.map((column) => (
                    <TableCell key={column.id} className={column.className}>
                      {getCellValue(row, column)}
                    </TableCell>
                  ))}
                  {rowActions && rowActions.length > 0 && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {rowActions
                            .filter((action) => !action.hidden || !action.hidden(row))
                            .map((action, actionIndex) => (
                            <React.Fragment key={actionIndex}>
                              {action.separator && <DropdownMenuSeparator />}
                              <DropdownMenuItem
                                onClick={() => action.onClick(row)}
                                className={cn(
                                  action.variant === "destructive" &&
                                    "text-red-600 focus:text-red-600"
                                )}
                              >
                                {action.icon && (
                                  <span className="mr-2">{action.icon}</span>
                                )}
                                {typeof action.label === "function" ? action.label(row) : action.label}
                              </DropdownMenuItem>
                            </React.Fragment>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {(pagination || legacyOnPageChange || onPageSizeChange) && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Showing {startIndex} to {endIndex} of {total} results
            </span>
            {onPageSizeChange && (
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="h-8 rounded-md border border-input bg-background px-2 text-sm"
              >
                {[10, 20, 30, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePageChange(1)}
              disabled={currentPage <= 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 text-sm">
              Page {currentPage} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage >= totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
