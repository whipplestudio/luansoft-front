"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Eye, Download } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export interface CompletedProcess {
  id: string
  processName: string
  clientName: string
  contadorName: string
  completedDate: string
  originalDueDate: string
  documentUrl: string
}

export const columns: ColumnDef<CompletedProcess>[] = [
  {
    accessorKey: "clientName",
    header: "Cliente",
  },
  {
    accessorKey: "processName",
    header: "Proceso",
  },
  {
    accessorKey: "contadorName",
    header: "Contador",
  },
  {
    accessorKey: "completedDate",
    header: "Fecha de Completado",
    cell: ({ row }) => {
      const date = new Date(row.original.completedDate)
      return format(date, "dd/MM/yyyy", { locale: es })
    },
  },
  {
    accessorKey: "originalDueDate",
    header: "Fecha Original",
    cell: ({ row }) => {
      const date = new Date(row.original.originalDueDate)
      return format(date, "dd/MM/yyyy", { locale: es })
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const process = row.original

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.open(process.documentUrl, "_blank")}
            title="Ver documento"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const link = document.createElement("a")
              link.href = process.documentUrl
              link.download = `documento-${process.id}.pdf`
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
            }}
            title="Descargar documento"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]

