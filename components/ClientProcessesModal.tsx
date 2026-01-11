"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Search,
  Filter,
  Eye,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  Loader2,
  X,
  Grid3X3,
  List,
  Archive,
  Copy,
  Trash2,
  RefreshCw,
  FileBarChart,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { axiosInstance } from "@/lib/axios"
import { toast } from "sonner"
import { DocumentViewerModal } from "@/components/DocumentViewerModal"
import { DataTable } from "@/components/data-table"
import { useDocumentExplorer } from "@/hooks/useDocumentExplorer"
import { DocumentCard } from "@/components/DocumentCard"
import { ProcessSelector } from "@/components/ProcessSelector"
import type { FiscalDeliverable } from "@/types"
import type { ColumnDef } from "@tanstack/react-table"
import type { DocumentItem } from "@/utils/processHistoryUtils"
import { Checkbox } from "@/components/ui/checkbox"
import { useProcessHistory } from "@/hooks/useProcessHistory"
import type { ProcessHistoryFiltersType, ProcessHistorySorting, DownloadUrlResponse } from "@/types/processHistory"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import type { DateRange } from "react-day-picker"
import { startOfDay, endOfDay, subDays } from "date-fns"
import { MonthlyReportsModal } from "@/components/MonthlyReportsModal"
import { FiscalIndicators } from "@/components/FiscalIndicators"

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

// Cache para URLs firmadas
interface UrlCache {
  [fileId: string]: {
    url: string
    timestamp: number
    ttl: number
  }
}

const URL_CACHE_TTL = 5 * 60 * 1000 // 5 minutos

export function ClientProcessesModal({ isOpen, onClose, client }: ClientProcessesModalProps) {
  // Estados para procesos actuales
  const [currentProcesses, setCurrentProcesses] = useState<ProcessItem[]>([])
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(false)

  // Hook para procesos históricos (legacy - mantenido para compatibilidad)
  const {
    data: historicalProcesses,
    isLoading: isLoadingHistorical,
    totalItems,
    totalPages,
    currentPage,
    fetchProcessHistory,
  } = useProcessHistory()

  // Estados para filtros y ordenamiento del historial (legacy)
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

  // Estados para informes mensuales
  const [isMonthlyReportsModalOpen, setIsMonthlyReportsModalOpen] = useState(false)

  // Estados para filtro de rango de fechas
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    // Default to last 30 days
    return {
      from: subDays(new Date(), 30),
      to: new Date(),
    }
  })

  // Cache para URLs firmadas
  const [urlCache, setUrlCache] = useState<UrlCache>({})

  // Estados para preview de documentos
  const [previewDocument, setPreviewDocument] = useState<DocumentItem | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [loadingDocumentIds, setLoadingDocumentIds] = useState<Set<string>>(new Set())
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)

  // Document explorer hook - ONLY enabled when historical tab is active
  const isExplorerActive = activeTab === "historical"
  const {
    documents,
    processes: documentExplorerProcesses,
    totalDocuments,
    filters,
    state,
    selectedDocuments,
    isLoading: isLoadingDocuments,
    updateFilters,
    updateState,
    toggleDocumentSelection,
    selectAllDocuments,
    clearSelection,
    downloadSelectedAsZip,
    copySelectedUrls,
  } = useDocumentExplorer(
    client?.originalData?.id || "",
    // Convert date range to ISO strings
    dateRange?.from ? startOfDay(dateRange.from).toISOString() : undefined,
    dateRange?.to ? endOfDay(dateRange.to).toISOString() : undefined,
    isExplorerActive, // Only fetch when explorer tab is active
  )

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

  // Función para obtener la URL firmada de un archivo con cache
  const getSignedFileUrl = async (fileId: string, forceRefresh = false): Promise<string | null> => {
    // Verificar cache si no es refresh forzado
    if (!forceRefresh && urlCache[fileId]) {
      const cached = urlCache[fileId]
      const now = Date.now()
      if (now - cached.timestamp < cached.ttl) {
        return cached.url
      }
    }

    try {
      const response = await axiosInstance.get<DownloadUrlResponse>(`/file/${fileId}/download-url`)

      if (response.data.success && response.data.data.url) {
        // Guardar en cache
        setUrlCache((prev) => ({
          ...prev,
          [fileId]: {
            url: response.data.data.url,
            timestamp: Date.now(),
            ttl: URL_CACHE_TTL,
          },
        }))

        return response.data.data.url
      } else {
        throw new Error(response.data.message || "Error al obtener la URL del archivo")
      }
    } catch (error) {
      console.error("Error al obtener la URL firmada:", error)
      throw error
    }
  }

  // Función para manejar la vista previa de documentos con loading state manual
  const handleDocumentPreview = async (document: DocumentItem) => {
    // Verificar si ya está en cache para evitar loading innecesario
    const cached = urlCache[document.id]
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      // Abrir directamente desde cache sin loading
      openPreviewModal(document, cached.url)
      return
    }

    // Verificar si ya está cargando este documento
    if (loadingDocumentIds.has(document.id)) {
      return
    }

    // Agregar al set de documentos cargando
    setLoadingDocumentIds((prev) => new Set(prev).add(document.id))
    setPreviewError(null)

    try {
      const signedUrl = await getSignedFileUrl(document.id)
      if (signedUrl) {
        openPreviewModal(document, signedUrl)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al obtener la vista previa"
      setPreviewError(errorMessage)
      toast.error("No se pudo cargar la vista previa. Reintentar.")
    } finally {
      // Remover del set de documentos cargando
      setLoadingDocumentIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(document.id)
        return newSet
      })
    }
  }

  // Función auxiliar para abrir el modal de preview
  const openPreviewModal = (document: DocumentItem, signedUrl: string) => {
    setPreviewDocument(document)
    setPreviewUrl(signedUrl)

    // Determinar tipo de documento basado en mimeType
    const mimeType = document.mimeType || ""
    if (mimeType.startsWith("image/")) {
      setDocumentType("image")
    } else if (mimeType === "application/pdf") {
      setDocumentType("pdf")
    } else {
      // Fallback basado en extensión del archivo
      setDocumentType(document.fileName.toLowerCase().includes("pdf") ? "pdf" : "image")
    }

    setDocumentTitle(document.processName)
    setFileName(document.fileName)
    setFileId(document.id)
    setIsDocumentViewerOpen(true)
  }

  // Función para reintentar la vista previa
  const handleRetryPreview = () => {
    if (previewDocument) {
      // Forzar refresh del cache
      setUrlCache((prev) => {
        const newCache = { ...prev }
        delete newCache[previewDocument.id]
        return newCache
      })
      handleDocumentPreview(previewDocument)
    }
  }

  // Función para abrir el visor de documentos (procesos actuales)
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
      const signedUrl = await getSignedFileUrl(fileIdToUse)

      if (signedUrl) {
        setDocumentUrl(signedUrl)
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

      const url = await getSignedFileUrl(fileId)

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
      const url = await getSignedFileUrl(fileId)

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

  // Helper to prepare filters for the fetch hook (legacy)
  const getFetchableFilters = (filters: ProcessHistoryFiltersType) => {
    const filtersToFetch = { ...filters }
    if (Array.isArray(filtersToFetch.paymentPeriod)) {
      filtersToFetch.paymentPeriod = filtersToFetch.paymentPeriod[0] as "MONTHLY" | "QUARTERLY" | "ANNUAL" | undefined
    }
    return filtersToFetch
  }

  // Legacy functions for historical processes (kept for compatibility)
  const handleHistoricalFiltersChange = (newFilters: ProcessHistoryFiltersType) => {
    setHistoricalFilters(newFilters)
    fetchProcessHistory(getFetchableFilters(newFilters), historicalSorting, { page: 1, limit: historicalLimit })
  }

  const handleHistoricalSortingChange = (newSorting: ProcessHistorySorting) => {
    setHistoricalSorting(newSorting)
    fetchProcessHistory(getFetchableFilters(historicalFilters), newSorting, { page: 1, limit: historicalLimit })
  }

  const handleHistoricalPageChange = (newPage: number) => {
    fetchProcessHistory(getFetchableFilters(historicalFilters), historicalSorting, {
      page: newPage,
      limit: historicalLimit,
    })
  }

  const handleHistoricalLimitChange = (newLimit: number) => {
    setHistoricalLimit(newLimit)
    fetchProcessHistory(getFetchableFilters(historicalFilters), historicalSorting, { page: 1, limit: newLimit })
  }

  // Document explorer functions
  const handleProcessSelect = (processId: string) => {
    const currentSelected = filters.selectedProcesses
    const newSelected = currentSelected.includes(processId)
      ? currentSelected.filter((id) => id !== processId)
      : [...currentSelected, processId]

    updateFilters({ selectedProcesses: newSelected })
  }

  const handleMonthSelect = (processId: string, month: string) => {
    const currentSelected = filters.selectedMonths
    const newSelected = currentSelected.includes(month)
      ? currentSelected.filter((m) => m !== month)
      : [...currentSelected, month]

    updateFilters({ selectedMonths: newSelected })
  }

  const handleClearAllSelections = () => {
    updateFilters({ selectedProcesses: [], selectedMonths: [] })
  }

  // Filter chips data
  const getActiveFilters = () => {
    const chips = []

    if (filters.search) {
      chips.push({ type: "search", label: `Búsqueda: ${filters.search}`, value: filters.search })
    }

    if (dateRange?.from || dateRange?.to) {
      const fromStr = dateRange?.from ? format(dateRange.from, "dd/MM/yyyy", { locale: es }) : ""
      const toStr = dateRange?.to ? format(dateRange.to, "dd/MM/yyyy", { locale: es }) : ""
      const rangeLabel = fromStr && toStr ? `${fromStr} - ${toStr}` : fromStr || toStr
      chips.push({ type: "dateRange", label: `Fecha: ${rangeLabel}`, value: "dateRange" })
    }

    filters.docKind.forEach((kind) => {
      chips.push({ type: "docKind", label: `Tipo: ${kind}`, value: kind })
    })

    filters.paymentPeriod.forEach((period) => {
      chips.push({ type: "paymentPeriod", label: `Periodo: ${period}`, value: period })
    })

    return chips
  }

  const removeFilter = (type: string, value: string) => {
    switch (type) {
      case "search":
        updateFilters({ search: "" })
        break
      case "dateRange":
        setDateRange(undefined)
        break
      case "docKind":
        updateFilters({ docKind: filters.docKind.filter((k) => k !== value) })
        break
      case "paymentPeriod":
        updateFilters({ paymentPeriod: filters.paymentPeriod.filter((p) => p !== value) })
        break
    }
  }

  // Función para verificar si un documento está cargando
  const isDocumentLoading = (documentId: string) => {
    return loadingDocumentIds.has(documentId)
  }

  // Table columns for document table view
  const documentTableColumns: ColumnDef<DocumentItem>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todo"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedDocuments.has(row.original.id)}
          onCheckedChange={() => toggleDocumentSelection(row.original.id)}
          aria-label="Seleccionar fila"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "displayTitle",
      header: "Documento",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-400" />
          <div>
            <div className="font-medium text-sm">{row.original.displayTitle}</div>
            <div className="text-xs text-gray-500">{row.original.fileName}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "processName",
      header: "Proceso",
    },
    {
      accessorKey: "monthLabel",
      header: "Mes",
    },
    {
      accessorKey: "accountant",
      header: "Contador",
    },
    {
      accessorKey: "completedAt",
      header: "Fecha Completado",
      cell: ({ row }) => {
        const date = row.original.completedAt
        return date ? format(new Date(date), "dd/MM/yyyy", { locale: es }) : "N/A"
      },
    },
    {
      accessorKey: "originalDate",
      header: "Fecha Original",
      cell: ({ row }) => {
        const date = row.original.originalDate
        return date ? format(new Date(date), "dd/MM/yyyy", { locale: es }) : "N/A"
      },
    },
    {
      accessorKey: "docKind",
      header: "Tipo",
      cell: ({ row }) => <Badge variant="outline">{row.original.docKind}</Badge>,
    },
    {
      accessorKey: "sizeBytes",
      header: "Tamaño",
      cell: ({ row }) => {
        const size = row.original.sizeBytes
        if (!size) return "N/A"
        const sizes = ["B", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(size) / Math.log(1024))
        return `${Math.round((size / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const isLoading = isDocumentLoading(row.original.id)
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDocumentPreview(row.original)}
              disabled={isLoading}
              className="h-8 w-8 p-0"
              title="Ver documento"
              aria-busy={isLoading}
              aria-disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        )
      },
    },
  ]

  // Filtrar procesos actuales
  const filteredCurrentProcesses = currentProcesses.filter((process) => {
    const matchesSearch = process.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || process.deliveryStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  // Función para restablecer filtros del historial (legacy)
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

    // Re-fetch with default values
    fetchProcessHistory(getFetchableFilters(defaultFilters), defaultSorting, { page: 1, limit: defaultLimit })
  }

  // Función para restablecer filtros de procesos actuales
  const handleResetCurrentFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
  }

  // Función para manejar cambios en el rango de fechas
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
    // Update URL params if needed (excluding sortBy/sortOrder)
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      if (range?.from) {
        url.searchParams.set("from", format(range.from, "yyyy-MM-dd"))
      } else {
        url.searchParams.delete("from")
      }
      if (range?.to) {
        url.searchParams.set("to", format(range.to, "yyyy-MM-dd"))
      } else {
        url.searchParams.delete("to")
      }
      // Remove any existing sortBy/sortOrder params for compatibility
      url.searchParams.delete("sortBy")
      url.searchParams.delete("sortOrder")
      window.history.replaceState({}, "", url.toString())
    }
  }

  // Cargar datos cuando se abre el modal - REMOVED processhistory fetch
  useEffect(() => {
    if (isOpen && client) {
      fetchCurrentProcesses()
      fetchContadores()
      fetchProcesses()

      // NO longer setting historical filters here - they are handled by the document explorer
    }
  }, [isOpen, client, fetchCurrentProcesses, fetchContadores, fetchProcesses])

  // REMOVED: Legacy historical data loading effect - now handled by manual fetch in useDocumentExplorer

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
      // Reset date range to default (last 30 days)
      setDateRange({
        from: subDays(new Date(), 30),
        to: new Date(),
      })
      // Limpiar cache de URLs
      setUrlCache({})
      // Limpiar estados de preview
      setPreviewDocument(null)
      setPreviewUrl(null)
      setPreviewError(null)
      setLoadingDocumentIds(new Set())
      setIsLoadingPreview(false)
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

  if (!client) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl max-h-[90vh] flex flex-col">
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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="current" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Procesos Actuales ({filteredCurrentProcesses.length})
                </TabsTrigger>
                <TabsTrigger value="historical" className="flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  Explorador de Documentos ({totalDocuments})
                </TabsTrigger>
                <TabsTrigger value="fiscal-indicators" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Indicadores Fiscales
                </TabsTrigger>
                <TabsTrigger value="monthly-reports" className="flex items-center gap-2">
                  <FileBarChart className="h-4 w-4" />
                  Informes Mensuales
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Body del modal con scroll */}
          <div className="flex-1 min-h-0 overflow-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              {/* Procesos Actuales */}
              <TabsContent
                value="current"
                className="h-full overflow-auto flex flex-col mt-0 data-[state=inactive]:hidden"
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

              {/* Document Explorer */}
              <TabsContent
                value="historical"
                className="h-full overflow-auto flex flex-col mt-0 data-[state=inactive]:hidden"
              >
                {/* Document Explorer Header */}
                <div className="sticky top-0 z-10 bg-white border-b p-4 space-y-4">
                  {/* Main controls grid - 2 rows */}
                  <div className="grid grid-cols-12 gap-3 items-center">
                    {/* Row 1: Controls */}
                    {/* Date Range Picker */}
                    <div className="col-span-12 md:col-span-4">
                      <DateRangePicker
                        value={dateRange}
                        onChange={handleDateRangeChange}
                        placeholder="Seleccionar rango de fechas"
                        className="h-11"
                      />
                    </div>

                    {/* Search */}
                    <div className="col-span-12 md:col-span-7 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar documentos... (presiona / para enfocar)"
                        value={filters.search}
                        onChange={(e) => updateFilters({ search: e.target.value })}
                        className="pl-10 h-11"
                        onKeyDown={(e) => {
                          if (e.key === "/" && e.target !== document.activeElement) {
                            e.preventDefault()
                            e.currentTarget.focus()
                          }
                        }}
                      />
                      {filters.search && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                          onClick={() => updateFilters({ search: "" })}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* View mode toggle */}
                    <div className="col-span-12 md:col-span-1 md:justify-self-end flex md:justify-end">
                      <ToggleGroup
                        type="single"
                        value={state.viewMode}
                        onValueChange={(value) => value && updateState({ viewMode: value as "cards" | "table" })}
                        className="h-11"
                      >
                        <ToggleGroupItem value="cards" size="sm" className="h-11 w-11">
                          <Grid3X3 className="h-4 w-4" />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="table" size="sm" className="h-11 w-11">
                          <List className="h-4 w-4" />
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>

                    {/* Row 2: Filter chips */}
                    {getActiveFilters().length > 0 && (
                      <div className="col-span-12">
                        <div className="flex flex-wrap gap-2 overflow-x-auto whitespace-nowrap md:whitespace-normal">
                          {getActiveFilters().map((filter, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1 flex-shrink-0">
                              {filter.label}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={() => removeFilter(filter.type, filter.value)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Selection actions */}
                  {selectedDocuments.size > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">
                        {selectedDocuments.size} documento{selectedDocuments.size !== 1 ? "s" : ""} seleccionado
                        {selectedDocuments.size !== 1 ? "s" : ""}
                      </span>
                      <div className="flex items-center gap-2 ml-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadSelectedAsZip}
                          className="flex items-center gap-1 bg-transparent"
                        >
                          <Archive className="h-4 w-4" />
                          Descargar ZIP
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copySelectedUrls}
                          className="flex items-center gap-1 bg-transparent"
                        >
                          <Copy className="h-4 w-4" />
                          Copiar enlaces
                        </Button>
                        <Button variant="ghost" size="sm" onClick={clearSelection} className="flex items-center gap-1">
                          <Trash2 className="h-4 w-4" />
                          Limpiar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Document Explorer Body */}
                <div className="flex-1 overflow-hidden flex">
                  {/* Process Selector Sidebar */}
                  <div className="w-80 flex-shrink-0 hidden lg:block border-r">
                    <ProcessSelector
                      processes={documentExplorerProcesses}
                      selectedProcesses={filters.selectedProcesses}
                      selectedMonths={filters.selectedMonths}
                      onProcessSelect={handleProcessSelect}
                      onMonthSelect={handleMonthSelect}
                      onSelectAll={selectAllDocuments}
                      onClearAll={handleClearAllSelections}
                    />
                  </div>

                  {/* Document List */}
                  <div className="flex-1 overflow-hidden flex flex-col">
                    {isLoadingDocuments ? (
                      <div className="flex justify-center items-center h-32">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : documents.length > 0 ? (
                      <div className="flex-1 overflow-auto p-4">
                        {state.viewMode === "cards" ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {documents.map((document) => (
                              <DocumentCard
                                key={document.id}
                                document={document}
                                isSelected={selectedDocuments.has(document.id)}
                                onSelect={toggleDocumentSelection}
                                onPreview={handleDocumentPreview}
                                onDownload={(doc) => handleDownloadHistoricalFile(doc.id, doc.fileName)}
                                isLoadingPreview={isDocumentLoading(document.id)}
                              />
                            ))}
                          </div>
                        ) : (
                          <DataTable columns={documentTableColumns} data={documents} hideSearchInput={true} />
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay documentos</h3>
                          <p className="text-gray-500">
                            {getActiveFilters().length > 0
                              ? "No se encontraron documentos con los filtros aplicados"
                              : "Este cliente no tiene documentos históricos"}
                          </p>
                          {previewError && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-sm text-red-600 mb-2">{previewError}</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRetryPreview}
                                className="flex items-center gap-1 bg-transparent"
                              >
                                <RefreshCw className="h-4 w-4" />
                                Reintentar
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Monthly Reports Tab */}
              <TabsContent
                value="monthly-reports"
                className="h-full overflow-auto flex flex-col mt-0 data-[state=inactive]:hidden"
              >
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-6">
                      <FileBarChart className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-slate-900 mb-2">Informes Mensuales</h3>
                      <p className="text-slate-600">
                        Accede a los reportes financieros mensuales de {client.company}
                      </p>
                    </div>
                    
                    <Card className="border-2 border-blue-100">
                      <CardContent className="p-8">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-full space-y-3">
                            <div className="flex items-center gap-3 text-slate-700">
                              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                              <span>Reportes financieros detallados por mes</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-700">
                              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                              <span>KPIs calculados automáticamente</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-700">
                              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                              <span>Estado de Resultados y Balance General</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-700">
                              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                              <span>Visualización de datos históricos</span>
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => setIsMonthlyReportsModalOpen(true)}
                            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white h-12"
                            size="lg"
                          >
                            <FileBarChart className="mr-2 h-5 w-5" />
                            Abrir Informes Mensuales
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Fiscal Indicators */}
              <TabsContent
                value="fiscal-indicators"
                className="h-full overflow-auto flex flex-col mt-0 data-[state=inactive]:hidden"
              >
                <div className="h-full overflow-y-auto p-4">
                  {client?.company ? (
                    <FiscalIndicators clientCompany={client.company} />
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">El cliente no tiene nombre de empresa registrado</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={isDocumentViewerOpen}
        onClose={() => setIsDocumentViewerOpen(false)}
        documentUrl={previewUrl || documentUrl}
        documentType={documentType}
        title={documentTitle}
        fileName={fileName}
        onDownload={handleDownloadDocument}
        isLoading={isLoadingDocument || isLoadingPreview}
      />

      {/* Monthly Reports Modal */}
      <MonthlyReportsModal
        isOpen={isMonthlyReportsModalOpen}
        onClose={() => setIsMonthlyReportsModalOpen(false)}
        clientId={client.id}
        clientName={client.company}
      />
    </>
  )
}
