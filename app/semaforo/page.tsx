"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { DataTable } from "@/components/data-table"
import type { TrafficLight } from "@/types"

const columns: ColumnDef<TrafficLight>[] = [
  {
    accessorKey: "clientName",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Cliente
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "process",
    header: "Proceso",
  },
  {
    accessorKey: "progress",
    header: "Progreso",
    cell: ({ row }) => {
      const progress = row.getValue("progress") as number
      const status = row.getValue("status") as string
      return (
        <div className="w-full">
          <Progress
            value={progress}
            className={status === "delayed" ? "bg-red-200" : status === "at_risk" ? "bg-yellow-200" : "bg-green-200"}
          />
          <span className="text-sm text-gray-500">{progress}%</span>
        </div>
      )
    },
  },
  {
    accessorKey: "dueDate",
    header: "Fecha Límite",
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <div
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
          ${
            status === "delayed"
              ? "bg-red-100 text-red-800"
              : status === "at_risk"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
          }`}
        >
          {status === "delayed" ? "Retrasado" : status === "at_risk" ? "En Riesgo" : "A Tiempo"}
        </div>
      )
    },
  },
  {
    accessorKey: "assignedTo",
    header: "Asignado a",
  },
]

const data: TrafficLight[] = [
  {
    id: "1",
    clientName: "Empresa A",
    process: "Declaración de Impuestos",
    dueDate: "2024-02-15",
    progress: 75,
    status: "on_time",
    assignedTo: "Juan Pérez",
  },
  {
    id: "2",
    clientName: "Empresa B",
    process: "Nómina",
    dueDate: "2024-02-01",
    progress: 30,
    status: "at_risk",
    assignedTo: "María García",
  },
  // Más datos de ejemplo...
]

export default function SemaforoPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Semáforo de Avances</h1>
      <DataTable columns={columns} data={data} />
    </div>
  )
}

