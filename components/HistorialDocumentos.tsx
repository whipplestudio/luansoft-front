"use client"

import { useState } from "react"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Eye, Download } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import type { Client } from "@/types"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface HistorialDocumentosProps {
  client: Client
}

interface Document {
  id: string
  name: string
  uploadDate: string
  type: string
}

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Factura-001.pdf",
    uploadDate: "2025-01-15",
    type: "Factura",
  },
  {
    id: "2",
    name: "Contrato-2025.pdf",
    uploadDate: "2025-01-10",
    type: "Contrato",
  },
  // Add more mock documents as needed
]

export function HistorialDocumentos({ client }: HistorialDocumentosProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handlePreview = (documentId: string) => {
    // En un caso real, aquí obtendrías la URL del documento para previsualizarlo
    setPreviewUrl(`https://example.com/preview/${documentId}`)
  }

  const handleDownload = (documentId: string) => {
    // En un caso real, aquí implementarías la lógica de descarga del documento
    console.log(`Descargando documento ${documentId}`)
  }

  const columns: ColumnDef<Document>[] = [
    {
      accessorKey: "name",
      header: "Nombre del Documento",
    },
    {
      accessorKey: "uploadDate",
      header: "Fecha de Carga",
    },
    {
      accessorKey: "type",
      header: "Tipo de Documento",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const document = row.original
        return (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => handlePreview(document.id)}>
              <Eye className="mr-2 h-4 w-4" />
              Previsualizar
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDownload(document.id)}>
              <Download className="mr-2 h-4 w-4" />
              Descargar
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Documentos de {client.name}</h3>
      <DataTable columns={columns} data={mockDocuments} />
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <iframe src={previewUrl || ""} className="w-full h-[70vh]" title="Document Preview" />
        </DialogContent>
      </Dialog>
    </div>
  )
}

