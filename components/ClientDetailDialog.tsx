"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format, isValid } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ProgressBar } from "@/components/ProgressBar"
import type { FiscalDeliverable } from "@/types"
import { CalendarIcon, Eye, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DocumentViewerModal } from "@/components/DocumentViewerModal"
import { axiosInstance } from "@/lib/axios"
import { toast } from "sonner"

interface ClientDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  client: FiscalDeliverable | null
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

export function ClientDetailDialog({ isOpen, onClose, client }: ClientDetailDialogProps) {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [documentType, setDocumentType] = useState<"pdf" | "image">("pdf")
  const [documentTitle, setDocumentTitle] = useState<string>("")
  const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false)
  const [fileName, setFileName] = useState<string>("")
  const [fileId, setFileId] = useState<string>("")
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Obtener el rol del usuario desde localStorage
  useEffect(() => {
    const role = localStorage.getItem("userRole")
    setUserRole(role)
  }, [])

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

  // Función para abrir el visor de documentos
  const openDocumentViewer = async (process: any) => {
    if (process.file) {
      setIsLoading(true)
      try {
        // Obtener la URL de descarga válida
        const downloadUrl = await getFileDownloadUrl(process.file.id)

        if (downloadUrl) {
          setDocumentUrl(downloadUrl)
          setDocumentType(process.file.type.includes("pdf") ? "pdf" : "image")
          setDocumentTitle(process.name)
          setFileName(process.file.originalName || `${process.name}.pdf`)
          setFileId(process.file.id)
          setIsDocumentViewerOpen(true)
        } else {
          toast.error("No se pudo obtener la URL del documento")
        }
      } catch (error) {
        console.error("Error al preparar el documento para visualización:", error)
        toast.error("Error al preparar el documento para visualización")
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Función para descargar el documento
  const handleDownload = async () => {
    try {
      setIsLoading(true)
      if (!fileId) {
        toast.error("ID de archivo no disponible")
        return
      }

      const url = await getFileDownloadUrl(fileId)

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
        link.setAttribute("download", fileName)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
      } else {
        toast.error("No se pudo obtener la URL de descarga")
      }
    } catch (error) {
      console.error("Error al descargar el archivo:", error)
      toast.error("No se pudo descargar el archivo")
    } finally {
      setIsLoading(false)
    }
  }

  if (!client) return null

  // Modificar la función getNearestDueDate para filtrar procesos no completados
  const getNearestDueDate = () => {
    if (!client.processes || client.processes.length === 0) {
      return client.dueDate
    }

    // Filtrar procesos que tienen fecha de vencimiento y NO están completados
    const processesWithDates = client.processes.filter(
      (p) => p.dueDate && p.status !== "completed" && p.deliveryStatus !== "completed",
    )

    if (processesWithDates.length === 0) {
      // Si no hay procesos pendientes, buscar entre todos los procesos
      const allProcessesWithDates = client.processes.filter((p) => p.dueDate)
      if (allProcessesWithDates.length === 0) {
        return client.dueDate
      }

      // Ordenar por fecha y tomar la más cercana
      const sortedDates = [...allProcessesWithDates].sort((a, b) => {
        const dateA = new Date(a.dueDate || "")
        const dateB = new Date(b.dueDate || "")
        return dateA.getTime() - dateB.getTime()
      })

      return sortedDates[0].dueDate
    }

    // Ordenar por fecha y tomar la más cercana entre los no completados
    const sortedDates = [...processesWithDates].sort((a, b) => {
      const dateA = new Date(a.dueDate || "")
      const dateB = new Date(b.dueDate || "")
      return dateA.getTime() - dateB.getTime()
    })

    return sortedDates[0].dueDate
  }

  // Modificar la función getStatusColor para incluir el estado "completed"
  const getStatusColor = (status: string, deliveryStatus?: string) => {
    // Si tenemos deliveryStatus, usarlo para determinar el color
    if (deliveryStatus) {
      switch (deliveryStatus) {
        case "completed":
          return "bg-green-100 text-green-800 border-green-300"
        case "onTime":
          return "bg-green-100 text-green-800 border-green-300"
        case "atRisk":
          return "bg-yellow-100 text-yellow-800 border-yellow-300"
        case "delayed":
          return "bg-red-100 text-red-800 border-red-300"
        default:
          return "bg-gray-100 text-gray-800 border-gray-300"
      }
    }

    // Fallback al comportamiento anterior si no hay deliveryStatus
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "pending":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "No disponible"
    try {
      // Extraer solo la fecha (YYYY-MM-DD) para evitar problemas de zona horaria
      const dateParts = dateString.split("T")[0].split("-")
      const year = Number.parseInt(dateParts[0])
      const month = Number.parseInt(dateParts[1]) - 1 // Los meses en JS son 0-indexed
      const day = Number.parseInt(dateParts[2])

      const date = new Date(year, month, day)

      return isValid(date) ? format(date, "dd 'de' MMMM 'de' yyyy", { locale: es }) : "Fecha inválida"
    } catch (error) {
      return "Fecha inválida"
    }
  }

  const nearestDueDate = getNearestDueDate()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{client.company}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Responsable</p>
            <p>{client.responsible}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Fecha de vencimiento más cercana</p>
            <div className="flex items-center space-x-2 text-sm">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
              <span>{formatDate(nearestDueDate)}</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Progreso general</p>
            <ProgressBar percentage={client.progressPercentage} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Procesos</p>
            <Card>
              <CardContent className="p-4 space-y-3">
                {client.processes.map((process, index) => (
                  <div key={index} className="flex flex-col space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm font-medium">{process.name}</span>
                        {process.deliveryStatus === "completed" && process.file && userRole !== "dashboard" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2 p-0 h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation()
                              openDocumentViewer(process)
                            }}
                            title="Ver documento"
                            disabled={isLoading}
                          >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getStatusColor(process.status, process.deliveryStatus)}`}
                      >
                        {process.deliveryStatus === "completed"
                          ? "Completado"
                          : process.deliveryStatus === "onTime"
                            ? "En tiempo"
                            : process.deliveryStatus === "atRisk"
                              ? "En riesgo"
                              : process.deliveryStatus === "delayed"
                                ? "Atrasado"
                                : process.status === "completed"
                                  ? "Completado"
                                  : process.status === "in_progress"
                                    ? "En progreso"
                                    : "Pendiente"}
                      </Badge>
                    </div>
                    <div className="flex flex-col space-y-1 text-xs text-gray-500">
                      <div className="flex items-center">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        <span>Vence: {process.dueDate ? formatDate(process.dueDate) : "No definida"}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="ml-4">
                          Días de gracia: {process.graceDays !== undefined ? process.graceDays : 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
      <DocumentViewerModal
        isOpen={isDocumentViewerOpen}
        onClose={() => setIsDocumentViewerOpen(false)}
        documentUrl={documentUrl}
        documentType={documentType}
        title={documentTitle}
        fileName={fileName}
        onDownload={handleDownload}
      />
    </Dialog>
  )
}
