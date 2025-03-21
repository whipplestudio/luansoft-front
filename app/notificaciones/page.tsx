"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table"
import type { Notification } from "@/types"

const columns: ColumnDef<Notification>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Título
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "message",
    header: "Mensaje",
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return (
        <Badge variant={type === "error" ? "destructive" : type === "warning" ? "warning" : "default"}>
          {type === "error" ? "Error" : type === "warning" ? "Advertencia" : "Info"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Fecha",
  },
  {
    accessorKey: "read",
    header: "Estado",
    cell: ({ row }) => {
      const read = row.getValue("read") as boolean
      return <Badge variant={read ? "outline" : "secondary"}>{read ? "Leído" : "No leído"}</Badge>
    },
  },
]

const data: Notification[] = [
  {
    id: "1",
    title: "Vencimiento Próximo",
    message: "La declaración de impuestos vence en 3 días",
    type: "warning",
    createdAt: "2024-01-27 10:00",
    read: false,
  },
  {
    id: "2",
    title: "Proceso Completado",
    message: "La nómina ha sido procesada exitosamente",
    type: "info",
    createdAt: "2024-01-26 15:30",
    read: true,
  },
  // Más datos de ejemplo...
]

export default function NotificacionesPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Notificaciones</h1>
      <DataTable columns={columns} data={data} />
    </div>
  )
}

