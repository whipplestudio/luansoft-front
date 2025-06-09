"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Download, FileText, Loader2 } from "lucide-react"
import { useState } from "react"
import { DocumentViewerModal } from "@/components/DocumentViewerModal"
import { axiosInstance } from "@/lib/axios"
import { toast } from "sonner"
import type { Client } from "@/types"

interface ClienteDetailModalProps {
  isOpen: boolean
  onClose: () => void
  client: Client | null | undefined
}

// Interfaz para la respuesta de la API de URL de descarga
interface DownloadUrlResponse {
  success: boolean
  message: string
  errorCode: string | null
  data: {
    url: string
  }
}

export function ClienteDetailModal({ isOpen, onClose, client }: ClienteDetailModalProps) {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [documentType, setDocumentType] = useState<"pdf" | "image">("image")
  const [documentTitle, setDocumentTitle] = useState<string>("")
  const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false)
  const [fileName, setFileName] = useState<string>("")
  const [fileId, setFileId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  if (!client) return null

  // Función para obtener la URL de descarga de un archivo
  const getFileDownloadUrl = async (fileId: string): Promise<string | null> => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.get<DownloadUrlResponse>(`/file/${fileId}/download-url`)

      if (response.data.success && response.data.data.url) {
        return response.data.data.url
      } else {
        toast.error(`Error al obtener la URL del archivo: ${response.data.message}`)
        return null
      }
    } catch (error) {
      console.error("Error al obtener la URL de descarga:", error)
      toast.error("No se pudo obtener la URL del archivo")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Función para abrir el visor de documentos del contrato
  const openContractViewer = async () => {
    if (client.contractFile) {
      setIsLoading(true)
      try {
        // Obtener la URL de descarga válida
        const downloadUrl = await getFileDownloadUrl(client.contractFile.id)

        if (downloadUrl) {
          setDocumentUrl(downloadUrl)
          setDocumentType(client.contractFile.type.includes("pdf") ? "pdf" : "image")
          setDocumentTitle("Contrato del Cliente")
          setFileName(client.contractFile.originalName || "contrato.pdf")
          setFileId(client.contractFile.id)
          setIsDocumentViewerOpen(true)
        } else {
          toast.error("No se pudo obtener la URL del contrato")
        }
      } catch (error) {
        console.error("Error al preparar el contrato para visualización:", error)
        toast.error("Error al preparar el contrato para visualización")
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Función para descargar el contrato
  const handleDownloadContract = async () => {
    try {
      setIsLoading(true)
      if (!client.contractFile?.id) {
        toast.error("ID de archivo no disponible")
        return
      }

      const url = await getFileDownloadUrl(client.contractFile.id)

      if (url) {
        // Realizar la petición para obtener el archivo como blob
        const response = await axiosInstance.get(url, { responseType: "blob" })
        // Crear un objeto Blob a partir de la respuesta
        const blob = new Blob([response.data])
        // Crear un URL de objeto para el blob
        const blobUrl = window.URL.createObjectURL(blob)
        // Crear un enlace de descarga
        const link = document.createElement("a")
        link.href = blobUrl
        link.setAttribute("download", client.contractFile.originalName || "contrato.pdf")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
        toast.success("Contrato descargado exitosamente")
      } else {
        toast.error("No se pudo obtener la URL de descarga")
      }
    } catch (error) {
      console.error("Error al descargar el contrato:", error)
      toast.error("No se pudo descargar el contrato")
    } finally {
      setIsLoading(false)
    }
  }

  // Función para formatear el tamaño del archivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Detalles del Cliente</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Empresa</p>
                <p className="text-lg font-semibold">{client.company}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Tipo</p>
                  <p>{client.type === "FISICA" ? "Persona Física" : "Persona Moral"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Estado</p>
                  <Badge variant={client.status === "ACTIVE" ? "default" : "secondary"}>
                    {client.status === "ACTIVE" ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Régimen Fiscal</p>
                <p>
                  {typeof client.regimenFiscal === "object" && client.regimenFiscal
                    ? client.regimenFiscal.nombre
                    : "No asignado"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Información del contador */}
          {client.contador && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contador Asignado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{client.contador.name}</p>
                  <p className="text-sm text-gray-600">{client.contador.email}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información del contacto */}
          {client.contacto && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contacto Asignado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{client.contacto.name}</p>
                  <p className="text-sm text-gray-600">{client.contacto.email}</p>
                  {client.contacto.phone && <p className="text-sm text-gray-600">{client.contacto.phone}</p>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información del contrato */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contrato
              </CardTitle>
            </CardHeader>
            <CardContent>
              {client.isContractSigned && client.contractFile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Contrato Firmado
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Archivo del Contrato</p>
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{client.contractFile.originalName}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(client.contractFile.size)} • {client.contractFile.type}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={openContractViewer}
                          disabled={isLoading}
                          className="flex items-center gap-1"
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                          Ver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadContract}
                          disabled={isLoading}
                          className="flex items-center gap-1"
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                          Descargar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                    Sin Contrato Firmado
                  </Badge>
                  <p className="text-sm text-gray-500 mt-2">Este cliente no tiene un contrato firmado registrado.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fechas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fechas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha de creación</p>
                <p className="text-sm">
                  {new Date(client.createdAt).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Última actualización</p>
                <p className="text-sm">
                  {new Date(client.updatedAt).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>

      {/* Modal para visualizar el contrato */}
      <DocumentViewerModal
        isOpen={isDocumentViewerOpen}
        onClose={() => setIsDocumentViewerOpen(false)}
        documentUrl={documentUrl}
        documentType={documentType}
        title={documentTitle}
        fileName={fileName}
        onDownload={handleDownloadContract}
      />
    </Dialog>
  )
}
