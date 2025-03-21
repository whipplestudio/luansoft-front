"use client"

import { useState } from "react"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Upload, Trash2, History, FileText } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import type { Contador, Client, Process } from "@/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { HistorialDocumentos } from "@/components/HistorialDocumentos"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ProgressBar } from "@/components/ProgressBar"

interface ClientesAsignadosProps {
  contador: Contador
}

const mockClients: Client[] = [
  {
    id: "1",
    name: "Empresa A",
    company: "Corporación XYZ",
    type: "Persona Moral",
    assignedTo: "1",
    status: "active",
    processes: [
      { name: "Declaración Anual", status: "pending", progress: 0 },
      { name: "Pago de IMSS", status: "in_progress", progress: 50 },
      { name: "Nómina", status: "completed", progress: 100 },
    ],
  },
  {
    id: "2",
    name: "Juan Pérez",
    company: "Juan Pérez",
    type: "Persona Física",
    assignedTo: "1",
    status: "active",
    processes: [
      { name: "Declaración Mensual", status: "in_progress", progress: 75 },
      { name: "Facturación", status: "pending", progress: 0 },
    ],
  },
  // Add more mock clients as needed
]

const ProcessBadge = ({ process }: { process: Process }) => {
  let bgColor = "bg-gray-100"
  let textColor = "text-gray-800"
  const Icon = FileText

  switch (process.status) {
    case "completed":
      bgColor = "bg-green-100"
      textColor = "text-green-800"
      break
    case "in_progress":
      bgColor = "bg-yellow-100"
      textColor = "text-yellow-800"
      break
    case "pending":
      bgColor = "bg-red-100"
      textColor = "text-red-800"
      break
  }

  return (
    <span className={`inline-flex items-center rounded-full ${bgColor} ${textColor} px-2 py-1 text-xs font-medium`}>
      <Icon className="mr-1 h-3 w-3" />
      {process.name}
    </span>
  )
}

export function ClientesAsignados({ contador }: ClientesAsignadosProps) {
  const [isHistorialOpen, setIsHistorialOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const handleFileUpload = (clientId: string) => {
    console.log(`Subiendo archivo para el cliente ${clientId}`)
    // Implementar lógica de carga de archivos aquí
  }

  const handleFileDelete = (clientId: string) => {
    console.log(`Eliminando archivo del cliente ${clientId}`)
    // Implementar lógica de eliminación de archivos aquí
  }

  const handleViewHistory = (client: Client) => {
    setSelectedClient(client)
    setIsHistorialOpen(true)
  }

  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
    },
    {
      accessorKey: "company",
      header: "Razón Social",
    },
    {
      accessorKey: "type",
      header: "Tipo de Persona",
    },
    {
      accessorKey: "processes",
      header: "Procesos Pendientes",
      cell: ({ row }) => {
        const processes = row.original.processes
        return (
          <div className="space-y-2">
            {processes.map((process, index) => (
              <div key={index} className="flex items-center space-x-2">
                <ProcessBadge process={process} />
                <ProgressBar percentage={process.progress} />
              </div>
            ))}
          </div>
        )
      },
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
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleFileUpload(client.id)}>
                <Upload className="mr-2 h-4 w-4" />
                Cargar documento
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFileDelete(client.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar documento
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleViewHistory(client)}>
                <History className="mr-2 h-4 w-4" />
                Ver historial
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Clientes Asignados</h2>
      <DataTable columns={columns} data={mockClients} />
      <Dialog open={isHistorialOpen} onOpenChange={setIsHistorialOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Historial de Documentos</DialogTitle>
          </DialogHeader>
          {selectedClient && <HistorialDocumentos client={selectedClient} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

