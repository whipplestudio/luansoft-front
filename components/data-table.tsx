"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pageSize?: number
  onRowClick?: (row: TData) => void
  isLoading?: boolean
  pagination?: {
    pageCount: number
    page: number
    onPageChange: (page: number) => void
    perPage: number
    onPerPageChange: (perPage: number) => void
  }
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  hideSearchInput?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageSize = 10,
  onRowClick,
  isLoading = false,
  pagination,
  searchValue = "",
  onSearchChange,
  searchPlaceholder,
  hideSearchInput = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: pagination
        ? {
            pageIndex: pagination.page - 1,
            pageSize: pagination.perPage,
          }
        : {
            pageIndex: 0,
            pageSize: pageSize,
          },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: !!pagination,
    pageCount: pagination ? pagination.pageCount : undefined,
  })

  // Remove this useEffect
  // React.useEffect(() => {
  //   if (!pagination) {
  //     table.setPageSize(pageSize)
  //   }
  // }, [pageSize, table, pagination])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          {!hideSearchInput && (
            <Input
              placeholder={searchPlaceholder || "Filtrar..."}
              value={searchValue}
              onChange={(event) => onSearchChange && onSearchChange(event.target.value)}
              className="max-w-sm text-sm h-8"
            />
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto text-sm h-8">
                Columnas <ChevronDown className="ml-2 h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize text-lg"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-xs sm:text-sm">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Cargando...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick && onRowClick(row.original)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2 text-xs sm:text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-xs sm:text-sm">
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 py-4">
        <div className="text-xs sm:text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} de {table.getFilteredRowModel().rows.length} fila(s)
          seleccionada(s).
        </div>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <p className="text-xs sm:text-sm font-medium">Filas por página</p>
            <Select
              value={`${pagination ? pagination.perPage : table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                if (pagination) {
                  pagination.onPerPageChange(Number(value))
                } else {
                  table.setPageSize(Number(value))
                }
              }}
            >
              <SelectTrigger className="h-8 w-[60px] sm:w-[70px]">
                <SelectValue placeholder={pagination ? pagination.perPage : table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`} className="text-xs sm:text-sm">
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 px-2 text-xs sm:text-sm"
              onClick={() => {
                if (pagination) {
                  pagination.onPageChange(pagination.page - 1)
                } else {
                  table.previousPage()
                }
              }}
              disabled={pagination ? pagination.page <= 1 : !table.getCanPreviousPage()}
            >
              Anterior
            </Button>
            {pagination && (
              <span className="text-xs sm:text-sm">
                Página {pagination.page} de {pagination.pageCount}
              </span>
            )}
            <Button
              variant="outline"
              className="h-8 px-2 text-xs sm:text-sm"
              onClick={() => {
                if (pagination) {
                  pagination.onPageChange(pagination.page + 1)
                } else {
                  table.nextPage()
                }
              }}
              disabled={pagination ? pagination.page >= pagination.pageCount : !table.getCanNextPage()}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

