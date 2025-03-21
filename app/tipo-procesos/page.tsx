"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table"
import type { Process } from "@/types"

const columns: ColumnDef<Process>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Nombre
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "description",
    header: "Descripción",
  },
  {
    accessorKey: "estimatedTime",
    header: "Tiempo Estimado",
  },
  {
    accessorKey: "priority",
    header: "Prioridad",
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string
      return (
        <Badge variant={priority === "high" ? "destructive" : priority === "medium" ? "warning" : "default"}>
          {priority === "high" ? "Alta" : priority === "medium" ? "Media" : "Baja"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant={status === "completed" ? "default" : status === "in_progress" ? "secondary" : "outline"}>
          {status === "completed" ? "Completado" : status === "in_progress" ? "En Progreso" : "Pendiente"}
        </Badge>
      )
    },
  },
]

const data: Process[] = [
  {
    id: "1",
    name: "Declaración de Impuestos",
    description: "Proceso mensual de declaración",
    estimatedTime: "5 días",
    priority: "high",
    status: "in_progress",
  },
  {
    id: "2",
    name: "Nómina",
    description: "Proceso quincenal de nómina",
    estimatedTime: "2 días",
    priority: "medium",
    status: "completed",
  },
  // Más datos de ejemplo...
]

export default function TipoProcesosPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Tipos de Procesos</h1>
      <DataTable columns={columns} data={data} />
    </div>
  )
}

