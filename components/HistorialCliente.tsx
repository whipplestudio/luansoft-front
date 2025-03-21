import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import type { Contador } from "@/types"

interface HistorialClienteProps {
  contador: Contador
}

interface HistorialEntry {
  month: string
  year: number
  client: string
  process: string
  status: "completed" | "late" | "not_submitted"
}

const columns: ColumnDef<HistorialEntry>[] = [
  {
    accessorKey: "month",
    header: "Mes",
  },
  {
    accessorKey: "year",
    header: "Año",
  },
  {
    accessorKey: "client",
    header: "Cliente",
  },
  {
    accessorKey: "process",
    header: "Proceso",
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
              : status === "late"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {status === "completed" ? "Completado" : status === "late" ? "Tardío" : "No Presentado"}
        </span>
      )
    },
  },
]

// Datos mock para el historial
const mockHistorial: HistorialEntry[] = [
  {
    month: "Enero",
    year: 2025,
    client: "Cliente A",
    process: "Declaración mensual",
    status: "completed",
  },
  {
    month: "Enero",
    year: 2025,
    client: "Cliente B",
    process: "Nómina",
    status: "completed",
  },
  {
    month: "Diciembre",
    year: 2024,
    client: "Cliente C",
    process: "Conciliación bancaria",
    status: "late",
  },
  {
    month: "Diciembre",
    year: 2024,
    client: "Cliente A",
    process: "Declaración mensual",
    status: "completed",
  },
  {
    month: "Noviembre",
    year: 2024,
    client: "Cliente B",
    process: "Nómina",
    status: "not_submitted",
  },
]

export function HistorialCliente({ contador }: HistorialClienteProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Historial de Clientes</h2>
      <DataTable columns={columns} data={mockHistorial} />
    </div>
  )
}

