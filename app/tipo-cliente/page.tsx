"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import type { ClientType } from "@/types"

const columns: ColumnDef<ClientType>[] = [
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
    accessorKey: "totalClients",
    header: "Total Clientes",
  },
  {
    accessorKey: "createdAt",
    header: "Fecha de Creación",
  },
]

const data: ClientType[] = [
  {
    id: "1",
    name: "Premium",
    description: "Clientes con servicios completos",
    createdAt: "2024-01-01",
    totalClients: 25,
  },
  {
    id: "2",
    name: "Basic",
    description: "Clientes con servicios básicos",
    createdAt: "2024-01-01",
    totalClients: 50,
  },
  // Más datos de ejemplo...
]

export default function TipoClientePage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Tipos de Cliente</h1>
      <DataTable columns={columns} data={data} />
    </div>
  )
}

