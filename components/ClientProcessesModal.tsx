"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  Eye,
  Download,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  Loader2,
  X,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { axiosInstance } from "@/lib/axios"
import { toast } from "sonner"
import { DocumentViewerModal } from "@/components/DocumentViewerModal"
import { DataTable } from "@/components/data-table"
import { ProcessHistoryFilters } from "@/components/ProcessHistoryFilters"
import { useProcessHistory } from "@/hooks/useProcessHistory"
import type { FiscalDeliverable } from "@/types"
import type { ColumnDef } from "@tanstack/react-table"
import type {
  ProcessHistoryFilters as ProcessHistoryFiltersType,
  ProcessHistorySorting,
} from "@/hooks/useProcessHistory"

// Interfaces para los datos de procesos
interface ProcessItem {
  id: string
  name: string
  status: string
  deliveryStatus: "onTime" | "atRisk" | "delayed" | "completed"
  commitmentDate: string
  graceDays: number
  file?: {
    id: string
    originalName: string
    url: string
    type: string
  }
}

// Interface para la respuesta de la API de URL de descarga
interface DownloadUrlResponse {
  success: boolean
  message: string
  errorCode: string | null
  data: {
    url: string
  }
}

// Interfaces para contadores y procesos
interface ContadorItem {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface ProcessItem2 {
  id: string
  name: string
  description: string
}

interface ClientProcessesModalProps {
  isOpen: boolean
  onClose: () => void
  client: FiscalDeliverable | null
}

export function ClientProcessesModal({ isOpen, onClose, client }: ClientProcessesModalProps) {
  // Estados para procesos actuales
  const [currentProcesses, setCurrentProcesses] = useState<ProcessItem[]>([])
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(false)

  // Hook para procesos históricos
  const {
    data: historicalProcesses,
    isLoading: isLoadingHistorical,
    totalItems,
    totalPages,
    currentPage,
    fetchProcessHistory,
  } = useProcessHistory()

  // Estados para filtros y ordenamiento del historial
  const [historicalFilters, setHistoricalFilters] = useState<ProcessHistoryFiltersType>({})
  const [historicalSorting, setHistoricalSorting] = useState<ProcessHistorySorting>({
    sortBy: "dateCompleted",
    sortOrder: "desc",
  })
  const [historicalLimit, setHistoricalLimit] = useState(10)

  // Estados para datos auxiliares
  const [contadores, setContadores] = useState<ContadorItem[]>([])
  const [processes, setProcesses] = useState<ProcessItem2[]>([])
  const [isLoadingContadores, setIsLoadingContadores] = useState(false)
  const [isLoadingProcesses, setIsLoadingProcesses] = useState(false)

  // Estados para filtros y búsqueda de procesos actuales
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("current")

  // Estados para el visor de documentos
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [documentType, setDocumentType] = useState<"pdf" | "image">("pdf")
  const [documentTitle, setDocumentTitle] = useState<string>("")
  const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false)
  const [fileName, setFileName] = useState<string>("")
  const [fileId, setFileId] = useState<string>("")
  const [isLoadingDocument, setIsLoadingDocument] = useState(false)

  // Función para obtener contadores
  const fetchContadores = useCallback(async () => {
    setIsLoadingContadores(true)
    try {
      const response = await axiosInstance.get("/contador")
      if (response.data.success) {
        setContadores(response.data.data.data)
      }
    } catch (error) {
      console.error("Error fetching contadores:", error)
    } finally {
      setIsLoadingContadores(false)
    }
  }, [])

  // Función para obtener procesos
  const fetchProcesses = useCallback(async () => {
    setIsLoadingProcesses(true)
    try {
      const response = await axiosInstance.get("/process")
      if (response.data.success) {
        setProcesses(response.data.data.data)
      }
    } catch (error) {
      console.error("Error fetching processes:", error)
    } finally {
      setIsLoadingProcesses(false)
    }
  }, [])

  // Función para obtener la URL de descarga de un archivo
  const getFileDownloadUrl = async (fileId: string): Promise<string | null> => {
    try {
      setIsLoadingDocument(true)
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
      setIsLoadingDocument(false)
    }
  }

  // Función para abrir el visor de documentos
  const handleOpenDocumentViewer = async (process: ProcessItem | any) => {
    let fileIdToUse: string
    let fileNameToUse: string
    let processName: string

    if ("file" in process && process.file) {
      // Proceso actual
      fileIdToUse = process.file.id
      fileNameToUse = process.file.originalName
      processName = process.name
    } else if ("fileId" in process) {
      // Proceso histórico
      fileIdToUse = process.fileId
      fileNameToUse = process.fileName
      processName = process.processName
    } else {
      toast.error("No hay archivo disponible para este proceso")
      return
    }

    setIsLoadingDocument(true)
    try {
      const downloadUrl = await getFileDownloadUrl(fileIdToUse)

      if (downloadUrl) {
        setDocumentUrl(downloadUrl)
        setDocumentType(fileNameToUse.toLowerCase().includes("pdf") ? "pdf" : "image")
        setDocumentTitle(processName)
        setFileName(fileNameToUse)
        setFileId(fileIdToUse)
        setIsDocumentViewerOpen(true)
      } else {
        toast.error("No se pudo obtener la URL del documento")
      }
    } catch (error) {
      console.error("Error al preparar el documento para visualización:", error)
      toast.error("Error al preparar el documento para visualización")
    } finally {
      setIsLoadingDocument(false)
    }
  }

  // Función para descargar documento
  const handleDownloadDocument = async () => {
    try {
      setIsLoadingDocument(true)
      if (!fileId) {
        toast.error("ID de archivo no disponible")
        return
      }

      const url = await getFileDownloadUrl(fileId)

      if (url) {
        const response = await axiosInstance.get(url, { responseType: "blob" })
        const blob = new Blob([response.data])
        const blobUrl = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = blobUrl
        link.setAttribute("download", fileName)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
        toast.success("Archivo descargado exitosamente")
      } else {
        toast.error("No se pudo obtener la URL de descarga")
      }
    } catch (error) {
      console.error("Error al descargar el archivo:", error)
      toast.error("No se pudo descargar el archivo")
    } finally {
      setIsLoadingDocument(false)
    }
  }

  // Función para descargar archivo directamente desde el historial
  const handleDownloadHistoricalFile = async (fileId: string, fileName: string) => {
    try {
      setIsLoadingDocument(true)
      const url = await getFileDownloadUrl(fileId)

      if (url) {
        const response = await axiosInstance.get(url, { responseType: "blob" })
        const blob = new Blob([response.data])
        const blobUrl = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = blobUrl
        link.setAttribute("download", fileName)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
        toast.success("Archivo descargado exitosamente")
      } else {
        toast.error("No se pudo obtener la URL de descarga")
      }
    } catch (error) {
      console.error("Error al descargar el archivo:", error)
      toast.error("No se pudo descargar el archivo")
    } finally {
      setIsLoadingDocument(false)
    }
  }

  // Función para obtener procesos actuales del cliente
  const fetchCurrentProcesses = useCallback(async () => {
    if (!client?.originalData?.id) return

    setIsLoadingCurrent(true)
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      // Usar los procesos que ya vienen en los datos del cliente
      const processes = client.originalData.processes.map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        deliveryStatus: p.deliveryStatus,
        commitmentDate: p.commitmentDate,
        graceDays: p.graceDays,
        file: p.file,
      }))

      setCurrentProcesses(processes)
    } catch (error) {
      console.error("Error fetching current processes:", error)
      toast.error("Error al cargar los procesos actuales")
    } finally {
      setIsLoadingCurrent(false)
    }
  }, [client])

  // Función para manejar cambios en filtros del historial
  const handleHistoricalFiltersChange = (newFilters: ProcessHistoryFiltersType) => {
    setHistoricalFilters(newFilters)
    fetchProcessHistory(newFilters, historicalSorting, { page: 1, limit: historicalLimit })
  }

  // Función para manejar cambios en ordenamiento del historial
  const handleHistoricalSortingChange = (newSorting: ProcessHistorySorting) => {
    setHistoricalSorting(newSorting)
    fetchProcessHistory(historicalFilters, newSorting, { page: 1, limit: historicalLimit })
  }

  // Función para manejar cambio de página en el historial
  const handleHistoricalPageChange = (newPage: number) => {
    fetchProcessHistory(historicalFilters, historicalSorting, { page: newPage, limit: historicalLimit })
  }

  // Función para manejar cambio de límite por página
  const handleHistoricalLimitChange = (newLimit: number) => {
    setHistoricalLimit(newLimit)
    fetchProcessHistory(historicalFilters, historicalSorting, { page: 1, limit: newLimit })
  }

  // Definir las columnas para la tabla del historial
  const historicalColumns: ColumnDef<any>[] = [
    {
      accessorKey: "processName",
      header: "Proceso",
      cell: ({ row }) => <div className="text-sm font-medium">{row.getValue("processName")}</div>,
    },
    {
      accessorKey: "contadorName",
      header: "Contador",
      cell: ({ row }) => <div className="text-sm">{row.getValue("contadorName")}</div>,
    },
    {
      accessorKey: "completedDate",
      header: "Fecha de Completado",
      cell: ({ row }) => <div className="text-sm">{row.getValue("completedDate")}</div>,
    },
    {
      accessorKey: "originalDueDate",
      header: "Fecha Original",
      cell: ({ row }) => <div className="text-sm">{row.getValue("originalDueDate")}</div>,
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const process = row.original
        const hasFile = process.fileUrl !== null

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleOpenDocumentViewer(process)}
              title="Ver documento"
              disabled={!hasFile || isLoadingDocument}
              aria-label={`Ver documento de ${process.processName}`}
              className="h-8 w-8"
            >
              {isLoadingDocument ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDownloadHistoricalFile(process.fileId, process.fileName)}
              title="Descargar documento"
              disabled={!hasFile || isLoadingDocument}
              aria-label={`Descargar documento de ${process.processName}`}
              className="h-8 w-8"
            >
              {isLoadingDocument ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            </Button>
          </div>
        )
      },
    },
  ]

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen && client) {
      fetchCurrentProcesses()
      fetchContadores()
      fetchProcesses()

      // Establecer filtro de cliente para el historial
      const clientFilter: ProcessHistoryFiltersType = {
        clientId: client.originalData.id,
      }
      setHistoricalFilters(clientFilter)
    }
  }, [isOpen, client, fetchCurrentProcesses, fetchContadores, fetchProcesses])

  // Cargar datos históricos solo cuando se abre el tab de historial
  useEffect(() => {
    if (isOpen && client && activeTab === "historical" && historicalFilters.clientId) {
      fetchProcessHistory(historicalFilters, historicalSorting, { page: currentPage, limit: historicalLimit })
    }
  }, [
    isOpen,
    client,
    activeTab,
    historicalFilters,
    historicalSorting,
    currentPage,
    historicalLimit,
    fetchProcessHistory,
  ])

  // Limpiar estados al cerrar
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("")
      setStatusFilter("all")
      setActiveTab("current")
      setCurrentProcesses([])
      // Resetear filtros del historial
      setHistoricalFilters({})
      setHistoricalSorting({ sortBy: "dateCompleted", sortOrder: "desc" })
      setHistoricalLimit(10)
    }
  }, [isOpen])

  // Función para obtener el icono según el estado
  const getStatusIcon = (deliveryStatus: string) => {
    switch (deliveryStatus) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "onTime":
        return <Clock className="h-4 w-4 text-green-600" />
      case "atRisk":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "delayed":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  // Función para obtener el color del badge según el estado
  const getStatusBadgeColor = (deliveryStatus: string) => {
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

  // Función para obtener el texto del estado
  const getStatusText = (deliveryStatus: string) => {
    switch (deliveryStatus) {
      case "completed":
        return "Completado"
      case "onTime":
        return "En tiempo"
      case "atRisk":
        return "En riesgo"
      case "delayed":
        return "Atrasado"
      default:
        return "Pendiente"
    }
  }

  // Filtrar procesos actuales
  const filteredCurrentProcesses = currentProcesses.filter((process) => {
    const matchesSearch = process.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || process.deliveryStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  // Función para restablecer filtros del historial
  const handleResetHistoricalFilters = () => {
    const defaultFilters: ProcessHistoryFiltersType = {
      clientId: client?.originalData?.id,
    }
    const defaultSorting: ProcessHistorySorting = {
      sortBy: "dateCompleted",
      sortOrder: "desc",
    }
    const defaultLimit = 10

    setHistoricalFilters(defaultFilters)
    setHistoricalSorting(defaultSorting)
    setHistoricalLimit(defaultLimit)

    // Re-fetch con valores por defecto
    fetchProcessHistory(defaultFilters, defaultSorting, { page: 1, limit: defaultLimit })
  }

  // Función para restablecer filtros de procesos actuales
  const handleResetCurrentFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
  }

  if (!client) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[80vh] flex flex-col overflow-hidden">
          {/* Header fijo del modal */}
          <div className="sticky top-0 z-10 bg-white border-b">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Procesos de {client.company}
              </DialogTitle>
            </DialogHeader>

            {/* Filtros y búsqueda - Solo para procesos actuales */}
            {activeTab === "current" && (
              <div className="space-y-4 pb-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar procesos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => setSearchTerm("")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="completed">Completados</SelectItem>
                      <SelectItem value="onTime">En tiempo</SelectItem>
                      <SelectItem value="atRisk">En riesgo</SelectItem>
                      <SelectItem value="delayed">Atrasados</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetCurrentFilters}
                    aria-label="Restablecer filtros"
                    title="Restablecer filtros"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Restablecer
                  </Button>
                </div>
              </div>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="current" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Procesos Actuales ({filteredCurrentProcesses.length})
                </TabsTrigger>
                <TabsTrigger value="historical" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Historial ({totalItems})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Body del modal con scroll */}
          <div className="flex-1 min-h-0 overflow-scroll">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              {/* Procesos Actuales */}
              <TabsContent
                value="current"
                className="h-full overflow-hidden flex flex-col mt-0 data-[state=inactive]:hidden"
              >
                {isLoadingCurrent ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : filteredCurrentProcesses.length > 0 ? (
                  <div className="h-full overflow-y-auto pr-2 -mr-2 p-4" style={{ WebkitOverflowScrolling: "touch" }}>
                    <div className="grid gap-4">
                      {filteredCurrentProcesses.map((process) => (
                        <Card key={process.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  {getStatusIcon(process.deliveryStatus)}
                                  <h3 className="font-semibold text-lg">{process.name}</h3>
                                  <Badge variant="outline" className={getStatusBadgeColor(process.deliveryStatus)}>
                                    {getStatusText(process.deliveryStatus)}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                      Vence: {format(new Date(process.commitmentDate), "dd/MM/yyyy", { locale: es })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>Días de gracia: {process.graceDays}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {process.deliveryStatus === "completed" && process.file && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleOpenDocumentViewer(process)}
                                      disabled={isLoadingDocument}
                                      className="flex items-center gap-1"
                                      aria-label={`Ver documento de ${process.name}`}
                                    >
                                      {isLoadingDocument ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                      Ver
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleOpenDocumentViewer(process)}
                                      disabled={isLoadingDocument}
                                      className="flex items-center gap-1"
                                      aria-label={`Descargar documento de ${process.name}`}
                                    >
                                      {isLoadingDocument ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Download className="h-4 w-4" />
                                      )}
                                      Descargar
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {searchTerm || statusFilter !== "all"
                        ? "No se encontraron procesos actuales con los filtros aplicados"
                        : "No hay procesos actuales para este cliente"}
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Procesos Históricos */}
              <TabsContent
                value="historical"
                className="h-full overflow-hidden flex flex-col mt-0 data-[state=inactive]:hidden"
              >
                <div className="flex-1 overflow-hidden flex flex-col p-4">
                  {/* Filtros del historial */}
                  <ProcessHistoryFilters
                    filters={historicalFilters}
                    sorting={historicalSorting}
                    onFiltersChange={handleHistoricalFiltersChange}
                    onSortingChange={handleHistoricalSortingChange}
                    onResetFilters={handleResetHistoricalFilters}
                    clientName={client.company}
                    isClientLocked={true}
                    contadores={contadores}
                    processes={processes}
                    isLoadingContadores={isLoadingContadores}
                    isLoadingProcesses={isLoadingProcesses}
                  />

                  {/* Tabla del historial */}
                  {isLoadingHistorical ? (
                    <div className="flex justify-center items-center h-32">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : historicalProcesses.length > 0 ? (
                    <div className="flex-1 overflow-hidden flex flex-col mt-4">
                      <div className="flex-1 overflow-auto">
                        <DataTable
                          columns={historicalColumns}
                          data={historicalProcesses}
                          hideSearchInput={true}
                          pagination={{
                            pageCount: totalPages,
                            page: currentPage,
                            onPageChange: handleHistoricalPageChange,
                            perPage: historicalLimit,
                            onPerPageChange: handleHistoricalLimitChange,
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {Object.keys(historicalFilters).length > 1
                          ? "Sin resultados para los filtros aplicados"
                          : "Este cliente no tiene procesos históricos"}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal del visor de documentos */}
      <DocumentViewerModal
        isOpen={isDocumentViewerOpen}
        onClose={() => setIsDocumentViewerOpen(false)}
        documentUrl={documentUrl}
        documentType={documentType}
        title={documentTitle}
        fileName={fileName}
        onDownload={handleDownloadDocument}
      />
    </>
  )
}
