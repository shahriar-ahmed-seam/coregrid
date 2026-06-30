"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

// ==========================================
// TYPES
// ==========================================

export interface TableState {
  pageIndex: number;
  pageSize: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  search: string;
}

export interface UseTableStateOptions {
  defaultPageSize?: number;
  defaultSortBy?: string;
  defaultSortOrder?: "asc" | "desc";
}

export interface PaginatedData<T> {
  data: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
}

// ==========================================
// USE TABLE STATE HOOK
// ==========================================

export function useTableState(options: UseTableStateOptions = {}) {
  const {
    defaultPageSize = 10,
    defaultSortBy = "",
    defaultSortOrder = "desc",
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse state from URL
  const pageIndex = parseInt(searchParams.get("page") || "0", 10);
  const pageSize = parseInt(searchParams.get("size") || String(defaultPageSize), 10);
  const sortBy = searchParams.get("sortBy") || defaultSortBy;
  const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || defaultSortOrder;
  const search = searchParams.get("search") || "";

  // Update URL with new state
  const updateState = React.useCallback(
    (updates: Partial<TableState>) => {
      const params = new URLSearchParams(searchParams.toString());

      if (updates.pageIndex !== undefined) {
        if (updates.pageIndex === 0) {
          params.delete("page");
        } else {
          params.set("page", String(updates.pageIndex));
        }
      }

      if (updates.pageSize !== undefined) {
        if (updates.pageSize === defaultPageSize) {
          params.delete("size");
        } else {
          params.set("size", String(updates.pageSize));
        }
      }

      if (updates.sortBy !== undefined) {
        if (!updates.sortBy) {
          params.delete("sortBy");
        } else {
          params.set("sortBy", updates.sortBy);
        }
      }

      if (updates.sortOrder !== undefined) {
        if (updates.sortOrder === defaultSortOrder) {
          params.delete("sortOrder");
        } else {
          params.set("sortOrder", updates.sortOrder);
        }
      }

      if (updates.search !== undefined) {
        if (!updates.search) {
          params.delete("search");
        } else {
          params.set("search", updates.search);
        }
        // Reset to first page on search
        params.delete("page");
      }

      const query = params.toString();
      router.push(`${pathname}${query ? `?${query}` : ""}`);
    },
    [router, pathname, searchParams, defaultPageSize, defaultSortOrder]
  );

  // Handlers
  const setPageIndex = React.useCallback(
    (page: number) => updateState({ pageIndex: page }),
    [updateState]
  );

  const setPageSize = React.useCallback(
    (size: number) => updateState({ pageSize: size, pageIndex: 0 }),
    [updateState]
  );

  const setSort = React.useCallback(
    (column: string, order: "asc" | "desc") =>
      updateState({ sortBy: column, sortOrder: order }),
    [updateState]
  );

  const setSearch = React.useCallback(
    (query: string) => updateState({ search: query }),
    [updateState]
  );

  return {
    // State
    pageIndex,
    pageSize,
    sortBy,
    sortOrder,
    search,
    // Setters
    setPageIndex,
    setPageSize,
    setSort,
    setSearch,
    // Raw update
    updateState,
  };
}

// ==========================================
// USE DEBOUNCED CALLBACK
// ==========================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return React.useCallback(
    ((...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}

// ==========================================
// USE TABLE SELECTION
// ==========================================

export function useTableSelection<T>(
  data: T[],
  getRowId: (row: T) => string = (row: T) => (row as Record<string, unknown>).id as string
) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const selectedRows = React.useMemo(
    () => data.filter((row) => selectedIds.has(getRowId(row))),
    [data, selectedIds, getRowId]
  );

  const toggleRow = React.useCallback(
    (row: T) => {
      const id = getRowId(row);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    },
    [getRowId]
  );

  const toggleAll = React.useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === data.length) {
        return new Set();
      }
      return new Set(data.map(getRowId));
    });
  }, [data, getRowId]);

  const clearSelection = React.useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = React.useCallback(
    (row: T) => selectedIds.has(getRowId(row)),
    [selectedIds, getRowId]
  );

  const isAllSelected = data.length > 0 && selectedIds.size === data.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < data.length;

  return {
    selectedRows,
    selectedIds,
    toggleRow,
    toggleAll,
    clearSelection,
    isSelected,
    isAllSelected,
    isSomeSelected,
  };
}

// ==========================================
// BUILD QUERY PARAMS
// ==========================================

export function buildQueryParams(state: Partial<TableState>): URLSearchParams {
  const params = new URLSearchParams();

  if (state.pageIndex && state.pageIndex > 0) {
    params.set("page", String(state.pageIndex));
  }

  if (state.pageSize && state.pageSize !== 10) {
    params.set("size", String(state.pageSize));
  }

  if (state.sortBy) {
    params.set("sortBy", state.sortBy);
  }

  if (state.sortOrder && state.sortOrder !== "desc") {
    params.set("sortOrder", state.sortOrder);
  }

  if (state.search) {
    params.set("search", state.search);
  }

  return params;
}

// ==========================================
// PARSE PRISMA ORDER BY
// ==========================================

export function parseSortToPrisma(
  sortBy: string | null | undefined,
  sortOrder: string | null | undefined,
  defaultSort: Record<string, "asc" | "desc">
): Record<string, "asc" | "desc"> {
  if (!sortBy) {
    return defaultSort;
  }
  return { [sortBy]: (sortOrder as "asc" | "desc") || "desc" };
}

// ==========================================
// BUILD PRISMA PAGINATION
// ==========================================

export interface PrismaQueryOptions {
  skip: number;
  take: number;
  orderBy: Record<string, "asc" | "desc">;
}

export function buildPrismaQuery(
  pageIndex: number,
  pageSize: number,
  sortBy: string | null | undefined,
  sortOrder: string | null | undefined,
  defaultSort: Record<string, "asc" | "desc"> = { createdAt: "desc" }
): PrismaQueryOptions {
  return {
    skip: pageIndex * pageSize,
    take: pageSize,
    orderBy: parseSortToPrisma(sortBy, sortOrder, defaultSort),
  };
}
