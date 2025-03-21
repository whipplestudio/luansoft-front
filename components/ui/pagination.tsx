import React from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Página anterior</span>
      </Button>
      <span className="text-sm font-medium">
        Página {currentPage} de {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Página siguiente</span>
      </Button>
    </div>
  )
}

export const PaginationContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className="flex w-full items-center justify-center space-x-2 sm:justify-between" {...props} />
  ),
)
PaginationContent.displayName = "PaginationContent"

export const PaginationItem = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <li>
      <Button ref={ref} variant="outline" className="h-8 w-8 p-0 text-sm font-medium" {...props} />
    </li>
  ),
)
PaginationItem.displayName = "PaginationItem"

export const PaginationLink = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ className, ...props }, ref) => (
    <Button ref={ref} variant="outline" className="h-8 w-8 p-0 text-sm font-medium" {...props} />
  ),
)
PaginationLink.displayName = "PaginationLink"

export const PaginationEllipsis = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className="h-8 w-8 text-sm font-medium [&:not(:first-child)]:hidden sm:inline" {...props}>
      ...
    </span>
  ),
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export const PaginationPrevious = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ className, ...props }, ref) => (
    <Button ref={ref} variant="outline" className="h-8 p-0 text-sm font-medium" {...props}>
      <ChevronLeft className="h-4 w-4" />
      Anterior
    </Button>
  ),
)
PaginationPrevious.displayName = "PaginationPrevious"

export const PaginationNext = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ className, ...props }, ref) => (
    <Button ref={ref} variant="outline" className="h-8 p-0 text-sm font-medium" {...props}>
      Siguiente
      <ChevronRight className="h-4 w-4" />
    </Button>
  ),
)
PaginationNext.displayName = "PaginationNext"

