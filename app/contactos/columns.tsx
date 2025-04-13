"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Trash2 } from "lucide-react"
import type { Contacto } from "@/types"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Función para generar las columnas con las acciones
export const columns = (
  onView: (contacto: Contacto) => void,
  onEdit: (contacto: Contacto) => void,
  onDelete: (contacto: Contacto) => void,
): ColumnDef<Contacto>[] => [
  {
    accessorKey: "firstName",
    header: "Nombre",
    cell: ({ row }) => {
      const firstName = row.getValue("firstName") as string
      const lastName = row.getValue("lastName") as string
      return <div>{`${firstName} ${lastName}`}</div>
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Teléfono",
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string | null
      return <div>{phone || "No disponible"}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={status === "ACTIVE" ? "default" : "destructive"} className="capitalize">
          {status === "ACTIVE" ? "Activo" : "Inactivo"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Fecha de Creación",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string
      return <div>{format(new Date(createdAt), "dd/MM/yyyy", { locale: es })}</div>
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const contacto = row.original
      return (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => onView(contacto)} title="Ver detalles">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(contacto)} title="Editar">
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(contacto)}
            title="Eliminar"
            className="text-red-500 hover:text-red-700 hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]
