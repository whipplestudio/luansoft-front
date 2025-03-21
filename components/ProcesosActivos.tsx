import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import type { Contador, Process } from "@/types"

interface ProcesosActivosProps {
  contador: Contador
}

const columns: ColumnDef<Process>[] = [
  {
    accessorKey: "name",
    header: "Nombre del Proceso",
  },
  {
    accessorKey: "client",
    header: "Cliente",
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            status === "completed"
              ? "bg-green-100 text-green-800"
              : status === "in_progress"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {status === "completed" ? "Completado" : status === "in_progress" ? "En Progreso" : "Pendiente"}
        </span>
      )
    },
  },
  {
    accessorKey: "dueDate",
    header: "Fecha de Vencimiento",
  },
]

// Datos mock para procesos activos
const mockProcesosActivos: Process[] = [
  {
    name: "Declaración mensual",
    client: "Cliente A",
    status: "in_progress",
    dueDate: "2025-02-15",
  },
  {
    name: "Nómina",
    client: "Cliente B",
    status: "completed",
    dueDate: "2025-02-10",
  },
  {
    name: "Conciliación bancaria",
    client: "Cliente C",
    status: "pending",
    dueDate: "2025-02-20",
  },
]

export function ProcesosActivos({ contador }: ProcesosActivosProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Procesos Activos</h2>
      <DataTable columns={columns} data={mockProcesosActivos} />
    </div>
  )
}

