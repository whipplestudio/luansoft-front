"use client"

import { useState } from "react"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ColumnDef } from "@tanstack/react-table"
import type { Client, Contador } from "@/types"

const columns: ColumnDef<Client>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
  },
  {
    accessorKey: "company",
    header: "Empresa",
  },
  {
    accessorKey: "type",
    header: "Tipo",
  },
  {
    accessorKey: "assignedTo",
    header: "Contador Asignado",
    cell: ({ row }) => {
      const client = row.original
      return (
        <Select defaultValue={client.assignedTo} onValueChange={(value) => handleAssignContador(client.id, value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar contador" />
          </SelectTrigger>
          <SelectContent>
            {mockContadores.map((contador) => (
              <SelectItem key={contador.id} value={contador.id}>
                {contador.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    },
  },
]

const mockClients: Client[] = [
  {
    id: "1",
    name: "Empresa A",
    company: "Corporación XYZ",
    type: "Premium",
    assignedTo: "1",
    status: "active",
  },
  {
    id: "2",
    name: "Empresa B",
    company: "Industrias ABC",
    type: "Basic",
    assignedTo: "2",
    status: "active",
  },
  // Add more mock clients as needed
]

const mockContadores: Contador[] = [
  {
    id: "1",
    name: "Ana Rodríguez",
    email: "ana.rodriguez@example.com",
    role: "contador",
    status: "active",
    lastLogin: "2023-04-01T10:00:00Z",
    clients: ["1"],
  },
  {
    id: "2",
    name: "Carlos Gómez",
    email: "carlos.gomez@example.com",
    role: "contador",
    status: "active",
    lastLogin: "2023-04-02T11:30:00Z",
    clients: ["2"],
  },
  // Add more mock contadores as needed
]

const handleAssignContador = (clientId: string, contadorId: string) => {
  // Here you would update the client's assigned contador
  console.log(`Assigning client ${clientId} to contador ${contadorId}`)
}

export default function AsignarClientesPage() {
  const [clients, setClients] = useState<Client[]>(mockClients)

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Asignar Clientes a Contadores</h1>
      <DataTable columns={columns} data={clients} />
    </div>
  )
}

