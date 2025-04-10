"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Power } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { RegimenFiscal } from "@/types"

interface ColumnOptions {
  onEdit: (regimenFiscal: RegimenFiscal) => void
  onToggleStatus: (regimenFiscal: RegimenFiscal) => void
}

export const columns = ({ onEdit, onToggleStatus }: ColumnOptions): ColumnDef<RegimenFiscal>[] => [
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={status === "ACTIVE" ? "default" : "destructive"}>
          {status === "ACTIVE" ? "Activo" : "Inactivo"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const regimenFiscal = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(regimenFiscal)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onToggleStatus(regimenFiscal)}
              className={
                regimenFiscal.status === "ACTIVE"
                  ? "text-red-600 focus:text-red-600"
                  : "text-green-600 focus:text-green-600"
              }
            >
              <Power className="mr-2 h-4 w-4" />
              {regimenFiscal.status === "ACTIVE" ? "Desactivar" : "Activar"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
