"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Eye, Download } from "lucide-react"
import type { Client, HistoryEntry, Document } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast, Toaster } from "sonner"

const mockClient: Client = {
  id: "1",
  name: "Empresa A",
  company: "Corporación XYZ",
  type: "Persona Moral",
  assignedTo: "1",
  status: "active",
  processes: [],
}

const mockHistory: HistoryEntry[] = [
  {
    id: "1",
    date: "2025-02-14",
    responsibleName: "Carlos Gómez",
    processes: [
      { name: "Pago de IMSS", status: "completed" },
      { name: "Pago de nómina", status: "completed" },
      { name: "Carga de constancia", status: "completed" },
      { name: "Carga de opinión de cumplimiento", status: "completed" },
      { name: "Pago ante el SAT", status: "completed" },
    ],
  },
  {
    id: "2",
    date: "2025-01-15",
    responsibleName: "Ana Rodríguez",
    processes: [
      { name: "Pago de IMSS", status: "completed" },
      { name: "Pago de nómina", status: "completed" },
      { name: "Carga de constancia", status: "completed" },
      { name: "Carga de opinión de cumplimiento", status: "pending" },
      { name: "Pago ante el SAT", status: "pending" },
    ],
  },
]

const mockDocuments: Document[] = [
  { id: "1", name: "IMSS_Pago_Feb2025.pdf", uploadDate: "2025-02-14", type: "application/pdf", clientId: "1" },
  {
    id: "2",
    name: "Nomina_Feb2025.xlsx",
    uploadDate: "2025-02-14",
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    clientId: "1",
  },
  { id: "3", name: "Constancia_Fiscal_2025.pdf", uploadDate: "2025-02-14", type: "application/pdf", clientId: "1" },
  {
    id: "4",
    name: "Opinion_Cumplimiento_Feb2025.pdf",
    uploadDate: "2025-02-14",
    type: "application/pdf",
    clientId: "1",
  },
  { id: "5", name: "SAT_Pago_Feb2025.pdf", uploadDate: "2025-02-14", type: "application/pdf", clientId: "1" },
]

export default function ClienteHistorialPage() {
  const params = useParams()
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null)

  useEffect(() => {
    // In a real application, you would fetch the client and history data here
    // For now, we'll use the mock data
    setClient(mockClient)
    setHistory(mockHistory)
  }, [])

  const columns: ColumnDef<HistoryEntry>[] = [
    {
      accessorKey: "date",
      header: "Fecha",
    },
    {
      accessorKey: "responsibleName",
      header: "Responsable",
    },
    {
      accessorKey: "processes",
      header: "Procesos",
      cell: ({ row }) => (
        <div>
          {row.original.processes.map((process, index) => (
            <div key={index} className="flex items-center mb-1">
              <span
                className={`w-3 h-3 rounded-full mr-2 ${process.status === "completed" ? "bg-green-500" : "bg-red-500"}`}
              ></span>
              <span>{process.name}</span>
            </div>
          ))}
        </div>
      ),
    },
  ]

  const handleRowClick = (entry: HistoryEntry) => {
    setSelectedEntry(entry)
    setIsModalOpen(true)
  }

  const handleDownload = (document: Document) => {
    // Simulamos la descarga del archivo
    setTimeout(() => {
      const success = Math.random() < 0.8 // 80% de probabilidad de éxito
      if (success) {
        toast.success(`Documento "${document.name}" descargado con éxito`)
        // Aquí iría la lógica real de descarga
        console.log(`Descargando documento: ${document.name}`)
      } else {
        toast.error(`Error al descargar el documento "${document.name}". Por favor, intente nuevamente.`)
      }
    }, 1500) // Simulamos un tiempo de descarga de 1.5 segundos
  }

  if (!client) {
    return <div>Cargando...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Historial de {client.name}</h1>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Clientes Asignados
        </Button>
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Información del Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Nombre:</strong> {client.name}
          </p>
          <p>
            <strong>Empresa:</strong> {client.company}
          </p>
          <p>
            <strong>Tipo:</strong> {client.type}
          </p>
          <p>
            <strong>Estado:</strong> {client.status === "active" ? "Activo" : "Inactivo"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Historial de Procesos</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={history} onRowClick={handleRowClick} />
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalles del Historial - {selectedEntry?.date}</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="processes" className="w-full">
            <TabsList>
              <TabsTrigger value="processes">Procesos</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
            </TabsList>
            <TabsContent value="processes">
              <div className="space-y-2">
                {selectedEntry?.processes.map((process, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                    <span>{process.name}</span>
                    <span
                      className={`px-2 py-1 rounded ${process.status === "completed" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}
                    >
                      {process.status === "completed" ? "Completado" : "Pendiente"}
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="documents">
              <div className="space-y-2">
                {mockDocuments.map((document) => (
                  <div key={document.id} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                    <span>{document.name}</span>
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mr-2"
                        onClick={() => window.open(`/api/preview/${document.id}`, "_blank")}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Previsualizar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownload(document)}>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}

