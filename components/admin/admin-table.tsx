"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";

type Column<T> = {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
};

type AdminTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  searchKey?: string;
  searchPlaceholder?: string;
  actions?: (item: T) => React.ReactNode;
  emptyMessage?: string;
};

export function AdminTable<T extends Record<string, unknown>>({
  data,
  columns,
  searchKey,
  searchPlaceholder = "Buscar...",
  actions,
  emptyMessage = "No hay elementos",
}: AdminTableProps<T>) {
  const [search, setSearch] = useState("");

  const filteredData = searchKey
    ? data.filter((item) => {
        const value = item[searchKey];
        if (typeof value === "string") {
          return value.toLowerCase().includes(search.toLowerCase());
        }
        return true;
      })
    : data;

  return (
    <div className="flex flex-col gap-4">
      {searchKey && (
        <div className="relative max-w-sm">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-surface/60">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      "px-4 py-3 text-left text-sm font-medium text-muted",
                      column.className,
                    )}
                  >
                    {column.header}
                  </th>
                ))}
                {actions && (
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted">Acciones</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="px-4 py-8 text-center text-sm text-muted"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={index} className="transition-colors hover:bg-surface/40">
                    {columns.map((column) => (
                      <td key={column.key} className={cn("px-4 py-3 text-sm", column.className)}>
                        {column.render
                          ? column.render(item)
                          : (item[column.key] as React.ReactNode)}
                      </td>
                    ))}
                    {actions && <td className="px-4 py-3 text-right">{actions(item)}</td>}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
