"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MoreHorizontal, History, FileText } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import type { Client, Contador, Process } from "@/types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { mockContadores, mockClients } from "@/lib/mock-data"

// Mock data for clients and contador
//const mockClients: Client[] = [
//  {
//    id: "1",
//    name: "Empresa A",
//    company: "Corporación XYZ",
//    type: "Persona Moral",
//    assignedTo: "1",
//    status: "active",
//    processes: [
//      { name: "Declaración Anual", status: "pending", progress: 0 },
//      { name: "Pago de IMSS", status: "in_progress", progress: 50 },
//      { name: "Pago de nómina", status: "completed", progress: 100 },
//      { name: "Carga de constancia", status: "pending", progress: 0 },
//      { name: "Carga de opinión de cumplimiento", status: "pending", progress: 0 },
//      { name: "Pago ante el SAT", status: "pending", progress: 0 },
//    ],
//  },
//  {
//    id: "2",
//    name: "Juan Pérez",
//    company: "Juan Pérez",
//    type: "Persona Física",
//    assignedTo: "1",
//    status: "active",
//    processes: [
//      { name: "Declaración Mensual", status: "completed", progress: 100 },
//      { name: "Pago de IMSS", status: "in_progress", progress: 75 },
//      { name: "Pago de nómina", status: "pending", progress: 0 },
//      { name: "Carga de constancia", status: "pending", progress: 0 },
//      { name: "Carga de opinión de cumplimiento", status: "completed", progress: 100 },
//      { name: "Pago ante el SAT", status: "in_progress", progress: 25 },
//    ],
//  },
//]

//const mockContador: Contador = {
//  id: "1",
//  name: "Ana Rodríguez",
//  email: "ana.rodriguez@example.com",
//  role: "contador",
//  status: "active",
//  lastLogin: "2023-04-01T10:00:00Z",
//  clients: ["1", "2"],
//}

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
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => (
      <span className={row.original.status === "active" ? "text-green-600" : "text-red-600"}>
        {row.original.status === "active" ? "Activo" : "Inactivo"}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const client = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/contadores/${client.assignedTo}/clientes/${client.id}/procesos`}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Ver procesos activos</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/contadores/${client.assignedTo}/clientes/${client.id}/historial`}>
                <History className="mr-2 h-4 w-4" />
                <span>Ver historial</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export default function ContadorClientesPage() {
  const params = useParams()
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [contador, setContador] = useState<Contador | null>(null)

  useEffect(() => {
    const contadorId = params.contadorId as string
    const selectedContador = mockContadores.find((c) => c.id === contadorId) || null
    setContador(selectedContador)
    if (selectedContador) {
      const contadorClients = mockClients.filter((client) => client.assignedTo === contadorId)
      setClients(contadorClients)
    }
  }, [params.contadorId])

  if (!contador) {
    return <div>Cargando...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Clientes asignados a {contador.name}</h1>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Catálogo de Contadores
        </Button>
      </div>
      <DataTable columns={columns} data={clients} />
    </div>
  )
}

