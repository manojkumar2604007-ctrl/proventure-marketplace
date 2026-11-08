"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { Input } from "./input";
import { Button } from "./button";
import { DataTableSkeleton } from "./skeleton";
import { EmptyState } from "./empty-state";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchable?: boolean;
  searchKey?: keyof T | ((row: T) => string);
  searchPlaceholder?: string;
  pageSize?: number;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  className?: string;
  selectable?: boolean;
  onSelectedChange?: (selectedRows: T[]) => void;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  searchable = true,
  searchKey,
  searchPlaceholder = "Search records...",
  pageSize = 10,
  isLoading = false,
  emptyTitle = "No records found",
  emptyDescription = "There are currently no items matching your criteria.",
  onRowClick,
  className,
  selectable = false,
  onSelectedChange,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  // Filter
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const query = search.toLowerCase().trim();

    return data.filter((row) => {
      if (typeof searchKey === "function") {
        return searchKey(row).toLowerCase().includes(query);
      }
      if (typeof searchKey === "string") {
        const val = row[searchKey];
        return String(val ?? "").toLowerCase().includes(query);
      }
      // Default: inspect all string/number fields of the row
      return Object.values(row as Record<string, unknown>).some((val) =>
        String(val ?? "").toLowerCase().includes(query)
      );
    });
  }, [data, search, searchKey]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const compare = aVal < bVal ? -1 : 1;
      return sortOrder === "asc" ? compare : -compare;
    });
  }, [filteredData, sortKey, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortKey === key) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else {
        setSortKey(null);
        setSortOrder("asc");
      }
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = new Set(
        paginatedData
          .map((r) => r.id)
          .filter((id): id is string | number => id !== undefined)
      );
      setSelectedIds(allIds);
      if (onSelectedChange) {
        onSelectedChange(paginatedData);
      }
    } else {
      setSelectedIds(new Set());
      if (onSelectedChange) {
        onSelectedChange([]);
      }
    }
  };

  const handleSelectRow = (row: T, e: React.MouseEvent) => {
    e.stopPropagation();
    if (row.id === undefined) return;

    const newSelected = new Set(selectedIds);
    if (newSelected.has(row.id)) {
      newSelected.delete(row.id);
    } else {
      newSelected.add(row.id);
    }
    setSelectedIds(newSelected);

    if (onSelectedChange) {
      const selected = data.filter((r) => r.id !== undefined && newSelected.has(r.id));
      onSelectedChange(selected);
    }
  };

  if (isLoading) {
    return <DataTableSkeleton rows={pageSize} cols={columns.length + (selectable ? 1 : 0)} />;
  }

  return (
    <div className={cn("w-full space-y-3", className)}>
      {/* Top Filter Bar */}
      {searchable && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="w-full sm:max-w-xs">
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="text-xs text-muted-foreground self-end sm:self-center">
            Showing <span className="font-semibold text-foreground">{sortedData.length}</span>{" "}
            records
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="overflow-hidden rounded-xl border border-border/80 bg-background shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface/80 border-b border-border/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                {selectable && (
                  <th className="w-12 px-4 py-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={
                        paginatedData.length > 0 &&
                        paginatedData.every((r) => r.id !== undefined && selectedIds.has(r.id))
                      }
                      onChange={handleSelectAll}
                      className="rounded border-input text-secondary focus:ring-secondary cursor-pointer"
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key, col.sortable)}
                    className={cn(
                      "px-4 py-3.5 transition-colors select-none",
                      col.sortable && "cursor-pointer hover:bg-muted/50 hover:text-foreground",
                      col.className
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-muted-foreground">
                          {sortKey === col.key ? (
                            sortOrder === "asc" ? (
                              <ChevronUp className="h-3.5 w-3.5 text-secondary stroke-[2.5]" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5 text-secondary stroke-[2.5]" />
                            )
                          ) : (
                            <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-foreground">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => {
                  const isSelected = row.id !== undefined && selectedIds.has(row.id);
                  return (
                    <tr
                      key={row.id ? String(row.id) : index}
                      onClick={() => onRowClick && onRowClick(row)}
                      className={cn(
                        "transition-colors duration-100",
                        onRowClick && "cursor-pointer hover:bg-surface/80",
                        isSelected && "bg-secondary/5"
                      )}
                    >
                      {selectable && (
                        <td className="w-12 px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onClick={(e) => handleSelectRow(row, e)}
                            onChange={() => {}}
                            className="rounded border-input text-secondary focus:ring-secondary cursor-pointer"
                          />
                        </td>
                      )}
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={cn("px-4 py-3 align-middle", col.className)}
                        >
                          {col.render
                            ? col.render(row, index)
                            : String((row as Record<string, unknown>)[col.key] ?? "-")}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0)}
                    className="p-8 text-center"
                  >
                    <EmptyState
                      title={emptyTitle}
                      description={emptyDescription}
                      className="border-none bg-transparent min-h-[220px]"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border/60 bg-surface/40 px-4 py-3 gap-3">
            <span className="text-xs text-muted-foreground">
              Page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
              <span className="font-semibold text-foreground">{totalPages}</span>
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 3 + i;
                    if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        "h-8 w-8 rounded-md text-xs font-medium transition-colors",
                        currentPage === pageNum
                          ? "bg-primary text-primary-foreground font-bold shadow-subtle"
                          : "hover:bg-surface text-foreground"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
