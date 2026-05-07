"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { ArrowUpDown, Filter, Maximize, Minimize, Grid, List, ArrowLeft, Loader2, Check, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/components/ui/pagination"
import { ProgressBar } from "@/components/ProgressBar"
import type { ColumnDef } from "@tanstack/react-table"
import type { FiscalDeliverable, SemaphoreStatus, Process, ApiClient } from "@/types"
import { ClientDetailDialog } from "@/components/ClientDetailDialog"
import { useRouter } from "next/navigation"
import { axiosInstance } from "@/lib/axios"
import axios from "axios"
import { toast } from "sonner"
import { Logo } from "@/components/Logo"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DocumentViewerModal } from "@/components/DocumentViewerModal"
import { ClientProcessesModal } from "@/components/ClientProcessesModal"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const GRID_ITEMS_PER_PAGE = 100
const DEFAULT_TABLE_ITEMS_PER_PAGE = 20
const BULK_DISPLAY_TIME = 10000 // Time in milliseconds to display each bulk (10 seconds)

// Define the ApiResponse interface
interface ApiResponse {
  success: boolean
  data: {
    data: ApiClient[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  message?: string
}

// Actualizar la función mapApiClientToFiscalDeliverable para incluir la información del archivo
const mapApiClientToFiscalDeliverable = (client: ApiClient): FiscalDeliverable => {
  const completionPercentage = parseCompletionPercentage(client.completionPercentage)

  // Safely access contacto properties with null checks
  const contactName = client.contacto
    ? `${client.contacto.firstName || ""} ${client.contacto.lastName || ""}`.trim()
    : "Sin contacto"

  // Mapear los procesos al formato esperado por los componentes
  const mappedProcesses: Process[] = client.processes.map((p) => ({
    id: p.id,
    name: p.name,
    graceDays: p.graceDays,
    status: p.status === "PAID" ? "completed" : p.deliveryStatus === "onTime" ? "in_progress" : "pending",
    progress: p.status === "PAID" ? 100 : p.deliveryStatus === "onTime" ? 50 : 0,
    dueDate: p.commitmentDate,
    deliveryStatus: p.deliveryStatus, // Añadir el deliveryStatus al proceso
    file: p.file, // Añadir la información del archivo
  }))

  return {
    id: client.id,
    client: contactName,
    company: client.company,
    deliverableType: "Cliente",
    period: "Mensual",
    dueDate: client.processes.length > 0 ? client.processes[0].commitmentDate : new Date().toISOString(),
    responsible: client.contador
      ? `${client.contador.firstName || ""} ${client.contador.lastName || ""}`.trim()
      : "Sin contador",
    observations: "",
    processes: mappedProcesses,
    progressPercentage: completionPercentage,
    isContalink: client.isContalink || false,
    // Añadir campos adicionales para mantener la información original
    originalData: client,
  }
}

const mapDeliveryStatusToSemaphore = (status: string): SemaphoreStatus => {
  switch (status) {
    case "onTime":
      return "green"
    case "atRisk":
      return "yellow"
    case "delayed":
      return "red"
    default:
      return "red"
  }
}

// Mapear el porcentaje de completitud a un número
const parseCompletionPercentage = (percentage: string): number => {
  return Number.parseFloat(percentage.replace("%", ""))
}

// Función para determinar el estado del dot basado en los procesos del cliente
const getDotStatus = (client: FiscalDeliverable) => {
  const { processes, isContalink, progressPercentage } = client

  // LÓGICA ESPECIAL PARA CLIENTES CONTALINK
  if (isContalink) {
    // Si es cliente Contalink con 0% (sin obligaciones sincronizadas), mostrar rojo
    if (progressPercentage === 0) {
      return {
        color: "bg-red-500",
        tooltip: "Sin datos fiscales sincronizados",
      }
    }
    
    // Si tiene datos (>0%), el color depende del porcentaje
    if (progressPercentage === 100) {
      return {
        color: "bg-green-500",
        tooltip: "Cumplimiento fiscal completo",
      }
    } else if (progressPercentage >= 70) {
      return {
        color: "bg-green-500",
        tooltip: `Cumplimiento fiscal: ${progressPercentage}%`,
      }
    } else if (progressPercentage >= 40) {
      return {
        color: "bg-yellow-500",
        tooltip: `Cumplimiento fiscal: ${progressPercentage}%`,
      }
    } else {
      return {
        color: "bg-red-500",
        tooltip: `Cumplimiento fiscal: ${progressPercentage}%`,
      }
    }
  }

  // LÓGICA LEGACY PARA CLIENTES NO-CONTALINK
  if (!processes || processes.length === 0) {
    return {
      color: "bg-gray-500",
      tooltip: "Sin datos",
    }
  }

  const delayedCount = processes.filter((p) => p.deliveryStatus === "delayed").length
  const onTimeAndCompletedCount = processes.filter(
    (p) => p.deliveryStatus === "onTime" || p.deliveryStatus === "completed",
  ).length

  if (delayedCount > 0) {
    return {
      color: "bg-red-500",
      tooltip: `Atrasado (${delayedCount})`,
    }
  }

  if (onTimeAndCompletedCount > 0) {
    return {
      color: "bg-green-500",
      tooltip: `En tiempo (${onTimeAndCompletedCount})`,
    }
  } 

  return {
    color: "bg-gray-500",
    tooltip: "Sin datos",
  }
}

// Component for the airport-style infinite scroll display
const InfiniteScrollDisplay = ({
  clients,
  onClientClick,
}: { clients: FiscalDeliverable[]; onClientClick: (client: FiscalDeliverable) => void }) => {
  const [currentBulkIndex, setCurrentBulkIndex] = useState(0)
  const [clientsPerBulk, setClientsPerBulk] = useState(12) // Default value
  const [isVisible, setIsVisible] = useState(true) // Add this state for fade effect
  const totalClients = clients.length
  const timerRef = useRef<NodeJS.Timeout | null>(null) // Use useRef to hold the timer

  // Calculate optimal number of clients per bulk based on screen size
  // In the InfiniteScrollDisplay component, replace the useEffect that calculates clientsPerBulk with this:
  useEffect(() => {
    const calculateClientsPerBulk = () => {
      // Get viewport dimensions
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth

      // Calculate approximate card dimensions (including margins)
      const cardHeight = 120 // Increased height to account for full card + margin
      const cardWidth = 250 // Approximate width in pixels
      const cardMargin = 16 // Approximate margin in pixels

      // Calculate how many cards can fit in a row based on the current grid layout
      let cardsPerRow
      if (viewportWidth >= 1280) {
        // xl breakpoint (xl:grid-cols-6)
        cardsPerRow = 6
      } else if (viewportWidth >= 1024) {
        // lg breakpoint (lg:grid-cols-4)
        cardsPerRow = 4
      } else if (viewportWidth >= 768) {
        // md breakpoint (md:grid-cols-3)
        cardsPerRow = 3
      } else if (viewportWidth >= 640) {
        // sm breakpoint (sm:grid-cols-2)
        cardsPerRow = 2
      } else {
        cardsPerRow = 1
      }

      // Calculate available height for cards (subtract header/footer/navigation space)
      const headerHeight = 150 // Increased header height to account for navigation and padding
      const availableHeight = viewportHeight - headerHeight

      // Calculate how many complete rows can fit in the available height
      const rowsPerScreen = Math.floor(availableHeight / (cardHeight + cardMargin * 2))

      // Subtract 1 row to ensure no cards are cut off at the bottom
      const safeRowsPerScreen = Math.max(1, rowsPerScreen - 1)

      // Calculate total cards that can fit on screen without scrolling or being cut off
      const optimalCardsPerScreen = cardsPerRow * safeRowsPerScreen

      // Ensure we have at least 1 row of cards
      return Math.max(optimalCardsPerScreen, cardsPerRow)
    }

    // Set initial value
    setClientsPerBulk(calculateClientsPerBulk())

    // Add resize listener
    const handleResize = () => {
      setClientsPerBulk(calculateClientsPerBulk())
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // If no clients, show a message
  if (totalClients === 0) {
    return <div className="text-center py-10 text-gray-500">No se encontraron clientes con los filtros aplicados</div>
  }

  const totalBulks = Math.ceil(totalClients / clientsPerBulk)

  // Create bulks of clients
  const clientBulks = Array.from({ length: totalBulks }, (_, i) =>
    clients.slice(i * clientsPerBulk, (i + 1) * clientsPerBulk),
  )

  // Auto-scroll to the next bulk after a certain time with fade effect
  // const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)

  const intervalIdRef = useRef<NodeJS.Timeout | null>(null)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    const startInterval = () => {
      intervalId = setInterval(() => {
        // Start fade out
        setIsVisible(false)

        // After fade out completes, change the bulk and fade in
        setTimeout(() => {
          setCurrentBulkIndex((prevIndex) => (prevIndex + 1) % totalBulks)
          // Start fade in
          setIsVisible(true)
        }, 500) // This should match the CSS transition duration
      }, BULK_DISPLAY_TIME)
      setIntervalId(intervalId)
    }

    startInterval()

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [totalBulks, setIsVisible, setCurrentBulkIndex])

  // Get the current bulk of clients to display
  const currentBulk = clientBulks[currentBulkIndex] || []

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] px-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-semibold">
          Mostrando clientes {currentBulkIndex * clientsPerBulk + 1} -{" "}
          {Math.min((currentBulkIndex + 1) * clientsPerBulk, totalClients)} de {totalClients}
        </div>
        <div className="flex gap-2">
          {Array.from({ length: totalBulks }).map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${index === currentBulkIndex ? "bg-green-500" : "bg-gray-300"}`}
            />
          ))}
        </div>
      </div>
      <div
        className={`card-grid-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6 transition-opacity duration-500 ease-in-out ${isVisible ? "opacity-100" : "opacity-0"}`}
        style={{
          gridAutoRows: "min-content",
          maxHeight: "calc(100vh - 180px)", // Increased space to prevent cut-off
          overflow: "hidden", // Prevent scrolling within the container
        }}
      >
        {currentBulk.map((item: FiscalDeliverable) => (
          <Card
            key={item.id}
            className="overflow-hidden cursor-pointer w-full hover:shadow-lg transition-shadow h-auto"
            onClick={() => onClientClick(item)}
          >
            <CardContent className="p-4">
              <div className="text-sm font-semibold truncate">{item.company}</div>
              <div className="text-xs text-gray-500 truncate">{item.client}</div>
              <div className="flex items-center mt-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`h-2 w-2 rounded-full mr-1 ${getDotStatus(item).color} cursor-help`}
                      ></div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{getDotStatus(item).tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="text-xs">{item.progressPercentage}%</span>
              </div>
              <div className="text-xs mt-1 text-gray-500">{item.responsible}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Function to get the logged contact id
const getLoggedContactoId = () => {
  try {
    const userData = localStorage.getItem("user")
    if (userData) {
      const user = JSON.parse(userData)
      return user.contactoId || null
    }
    return null
  } catch (error) {
    console.error("Error al obtener el ID del contacto:", error)
    return null
  }
}

// Function to get the logged contador id
const getLoggedContadorId = () => {
  try {
    const userData = localStorage.getItem("user")
    if (userData) {
      const user = JSON.parse(userData)
      return user.contadorId || null
    }
    return null
  } catch (error) {
    console.error("Error al obtener el ID del contador:", error)
    return null
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [clientsData, setClientsData] = useState<FiscalDeliverable[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [currentLimit, setCurrentLimit] = useState(GRID_ITEMS_PER_PAGE)
  // Nuevo estado específico para el límite de la vista tabla
  const [tableLimit, setTableLimit] = useState(DEFAULT_TABLE_ITEMS_PER_PAGE)
  // Add a new state for contacts after the allProcesses state
  const [allContacts, setAllContacts] = useState<{ id: string; name: string }[]>([])
  // Add contactIds to the filters state
  const [filters, setFilters] = useState({
    companyName: "",
    statuses: [] as string[],
    contadorIds: [] as string[],
    processIds: [] as string[],
    contactoIds: [] as string[], // Change from contactIds to contactoIds
  })
  const [selectedClient, setSelectedClient] = useState<FiscalDeliverable | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [isLoading, setIsLoading] = useState(true)
  const [allContadores, setAllContadores] = useState<{ id: string; name: string }[]>([])
  const [allProcesses, setAllProcesses] = useState<{ id: string; name: string }[]>([])
  const [allClientsData, setAllClientsData] = useState<FiscalDeliverable[]>([])
  const [isLoadingAllClients, setIsLoadingAllClients] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const [sortCompany, setSortCompany] = useState<"asc" | "desc">("asc")

  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [documentType, setDocumentType] = useState<"pdf" | "image">("pdf")
  const [documentTitle, setDocumentTitle] = useState<string>("")
  const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false)
  const [fileName, setFileName] = useState<string>("")
  const [fileId, setFileId] = useState<string>("")
  const [isLoadingDocument, setIsLoadingDocument] = useState(false)
  const [isClientProcessesModalOpen, setIsClientProcessesModalOpen] = useState(false)
  const [selectedClientForProcesses, setSelectedClientForProcesses] = useState<FiscalDeliverable | null>(null)
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
  const [isSendReportsModalOpen, setIsSendReportsModalOpen] = useState(false)

  // Función para obtener la URL de descarga de un archivo
  const getFileDownloadUrl = async (fileId: string): Promise<string | null> => {
    try {
      setIsLoadingDocument(true)
      const response = await axiosInstance.get(`/file/${fileId}/download-url`)

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
  const handleOpenDocumentViewer = async (process: any) => {
    if (process.file) {
      setIsLoadingDocument(true)
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
        setIsLoadingDocument(false)
      }
    }
  }

  // Función para descargar el documento
  const handleDownloadDocument = async () => {
    try {
      setIsLoadingDocument(true)
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
      setIsLoadingDocument(false)
    }
  }

  // Función para abrir el modal de procesos del cliente
  const handleOpenClientProcesses = (client: FiscalDeliverable) => {
    setSelectedClientForProcesses(client)
    setIsClientProcessesModalOpen(true)
  }

  // Definir las columnas dentro del componente para tener acceso a handleOpenDocumentViewer
  const columns: ColumnDef<FiscalDeliverable>[] = [
    {
      accessorKey: "client",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="text-xs"
        >
          Contacto
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">{row.original.company}</div>
          <div className="text-xs font-medium">{row.getValue("client")}</div>
          <ProgressBar percentage={row.original.progressPercentage} />
        </div>
      ),
    },
    {
      accessorKey: "responsible",
      header: "Responsable",
      cell: ({ row }) => <div className="text-xs">{row.getValue("responsible")}</div>,
    },
    // Modificar la columna de procesos para mostrar el estado de entrega
    {
      accessorKey: "processes",
      header: "Procesos",
      cell: ({ row }) => {
        const processes = row.original.processes
        const userRole = localStorage.getItem("userRole")

        return (
          <div className="flex flex-wrap gap-2">
            {processes.map((process, index) => {
              const isCompleted = process.deliveryStatus === "completed"
              const hasFile = process.file && userRole !== "dashboard"

              return (
                <Badge
                  key={index}
                  variant="outline"
                  className={`text-xs cursor-pointer transition-colors hover:opacity-80 ${
                    isCompleted
                      ? "bg-green-100 text-green-800 border-green-300"
                      : process.deliveryStatus === "onTime"
                        ? "bg-green-100 text-green-800 border-green-300"
                        : process.deliveryStatus === "atRisk"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                          : process.deliveryStatus === "delayed"
                            ? "bg-red-100 text-red-800 border-red-300"
                            : "bg-gray-100 text-gray-800 border-gray-300"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (isCompleted && hasFile) {
                      handleOpenDocumentViewer(process)
                    }
                  }}
                  title={isCompleted && hasFile ? "Click para ver documento" : process.name}
                >
                  <div className="flex items-center gap-1">
                    <span>{process.name}</span>
                    {isCompleted && hasFile && <Check className="h-3 w-3" />}
                  </div>
                </Badge>
              )
            })}
          </div>
        )
      },
    },
  ]

  // Función para obtener los datos del dashboard
  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await axiosInstance.get("/dashboard/summary", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        // Actualizar para acceder a la nueva estructura anidada
        setDashboardData(response.data.data.data)
      } else {
        throw new Error(response.data.message || "Error fetching dashboard data")
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Error al cargar los datos del dashboard")
    }
  }, [])

  // Función para obtener los contadores
  const fetchContadores = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await axiosInstance.get("/contador/active", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        const contadores = response.data.data.map((contador: any) => ({
          id: contador.id,
          name: `${contador.firstName} ${contador.lastName}`,
        }))
        setAllContadores(contadores)
      } else {
        throw new Error(response.data.message || "Error fetching contadores")
      }
    } catch (error) {
      console.error("Error fetching contadores:", error)
      toast.error("Error al cargar los contadores")
    }
  }, [])

  // Función para obtener los procesos
  const fetchProcesses = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await axiosInstance.get("/process", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        const processes = response.data.data.data.map((process: any) => ({
          id: process.id,
          name: process.name,
        }))
        setAllProcesses(processes)
      } else {
        throw new Error(response.data.message || "Error fetching processes")
      }
    } catch (error) {
      console.error("Error fetching processes:", error)
      toast.error("Error al cargar los procesos")
    }
  }, [])

  // Add a function to fetch contacts after the fetchProcesses function
  const fetchContacts = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await axiosInstance.get("/contacto/active", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        const contacts = response.data.data.map((contact: any) => ({
          id: contact.id,
          name: `${contact.firstName} ${contact.lastName}`,
        }))
        setAllContacts(contacts)
      } else {
        throw new Error(response.data.message || "Error fetching contacts")
      }
    } catch (error) {
      console.error("Error fetching contacts:", error)
      toast.error("Error al cargar los contactos")
    }
  }, [])

  // Función para obtener los clientes con sus detalles
  const fetchClients = useCallback(
    async (page = 1, limit = currentLimit, filters = {}) => {
      setIsLoading(true)
      try {
        const token = localStorage.getItem("accessToken")
        if (!token) {
          throw new Error("No authentication token found")
        }

        // Construir los parámetros de la consulta
        const params: Record<string, any> = {
          page,
          limit, // Usar el parámetro limit en lugar de ITEMS_PER_PAGE
          sortCompany, // Añadir el parámetro de ordenamiento
        }

        // Verificar el rol del usuario y aplicar filtros específicos
        const userRole = localStorage.getItem("userRole")

        if (userRole === "contacto") {
          const contactoId = getLoggedContactoId()
          if (contactoId) {
            // Si ya hay contactoIds en los filtros, ignorarlos y usar solo el ID del usuario
            params.contactoIds = [contactoId]
          }
        } else if (userRole === "contador") {
          const contadorId = getLoggedContadorId()
          if (contadorId) {
            // Si ya hay contadorIds en los filtros, ignorarlos y usar solo el ID del usuario
            params.contadorIds = [contadorId]
          }
        } else {
          // Añadir filtros si existen
          if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
              if (
                value &&
                (typeof value === "string" ? value.trim() !== "" : Array.isArray(value) ? value.length > 0 : true)
              ) {
                params[key] = value
              }
            })
          }
        }

        const response = await axiosInstance.get<ApiResponse>("/dashboard/clients", {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          paramsSerializer: (params) => {
            const searchParams = new URLSearchParams()

            Object.entries(params).forEach(([key, value]) => {
              if (Array.isArray(value)) {
                value.forEach((val) => searchParams.append(key, val))
              } else {
                searchParams.append(key, value)
              }
            })

            return searchParams.toString()
          },
        })

        if (response.data.success) {
          const { data, pagination } = response.data.data

          // Mapear los datos de la API al formato esperado por los componentes
          const mappedData = data.map(mapApiClientToFiscalDeliverable)

          setClientsData(mappedData)
          setCurrentPage(pagination.page)
          setTotalPages(pagination.totalPages)
          setTotalItems(pagination.total)
        } else {
          throw new Error(response.data.message || "Error fetching clients")
        }
      } catch (error) {
        console.error("Error fetching clients:", error)
        toast.error("Error al cargar los clientes")
      } finally {
        setIsLoading(false)
      }
    },
    [sortCompany, currentLimit],
  ) // Añadir sortCompany como dependencia

  // Function to fetch all clients for fullscreen mode
  const fetchAllClients = useCallback(async () => {
    if (isLoadingAllClients) return

    setIsLoadingAllClients(true)
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      // Use a very high limit to get all clients at once
      const params: Record<string, any> = {
        page: 1,
        limit: currentLimit === GRID_ITEMS_PER_PAGE ? 10000 : currentLimit, // Para fullscreen usar 10000, sino el límite actual
        sortCompany, // Añadir el parámetro de ordenamiento
      }

      // Verificar si el usuario es un contacto y añadir su ID como filtro
      const userRole = localStorage.getItem("userRole")
      if (userRole === "contacto") {
        const contactoId = getLoggedContactoId()
        if (contactoId) {
          // Si ya hay contactoIds en los filtros, ignorarlos y usar solo el ID del usuario
          params.contactoIds = [contactoId]
        }
      } else {
        // Add any active filters
        Object.entries(filters).forEach(([key, value]) => {
          if (
            value &&
            (typeof value === "string" ? value.trim() !== "" : Array.isArray(value) ? value.length > 0 : true)
          ) {
            params[key] = value
          }
        })
      }

      const response = await axiosInstance.get<ApiResponse>("/dashboard/clients", {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        paramsSerializer: (params) => {
          const searchParams = new URLSearchParams()

          Object.entries(params).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              value.forEach((val) => searchParams.append(key, val))
            } else {
              searchParams.append(key, value)
            }
          })

          return searchParams.toString()
        },
      })

      if (response.data.success) {
        const { data } = response.data.data
        const mappedData = data.map(mapApiClientToFiscalDeliverable)
        setAllClientsData(mappedData)
      } else {
        throw new Error(response.data.message || "Error fetching all clients")
      }
    } catch (error) {
      console.error("Error fetching all clients:", error)
      toast.error("Error al cargar todos los clientes para el modo pantalla completa")
    } finally {
      setIsLoadingAllClients(false)
    }
  }, [filters, isLoadingAllClients, sortCompany, currentLimit]) // Añadir sortCompany como dependencia

  // Cargar datos iniciales
  // Update the useEffect to call fetchContacts

  // Manejar cambios en los filtros (inmediato para ciertos casos)
  const handleFilter = (key: string, value: any) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value }
      // Resetear a la página 1 cuando cambian los filtros
      setCurrentPage(1)
      // Aplicar los filtros
      fetchClients(1, currentLimit, newFilters)
      return newFilters
    })
  }

  // Limpiar todos los filtros
  // Update the clearFilters function to include contactIds
  const clearFilters = () => {
    const emptyFilters = {
      companyName: "",
      statuses: [] as string[],
      contadorIds: [] as string[],
      processIds: [] as string[],
      contactoIds: [] as string[],
    }

    // Si el usuario es un contacto, mantener su ID en los filtros
    const userRole = localStorage.getItem("userRole")
    if (userRole === "contacto") {
      const contactoId = getLoggedContactoId()
      if (contactoId) {
        emptyFilters.contactoIds = [contactoId]
      }
    }
    // Si el usuario es un contador, mantener su ID en los filtros
    else if (userRole === "contador") {
      const contadorId = getLoggedContadorId()
      if (contadorId) {
        emptyFilters.contadorIds = [contadorId]
      }
    }

    setFilters(emptyFilters)
    setCurrentPage(1)
    fetchClients(1, currentLimit, emptyFilters)
  }

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchClients(page, currentLimit, filters)
  }

  // Nueva función para manejar el cambio de filas por página en la tabla
  const handlePerPageChange = (newPerPage: number) => {
    setTableLimit(newPerPage)
    setCurrentLimit(newPerPage)
    setCurrentPage(1) // Resetear a página 1
    fetchClients(1, newPerPage, filters)
  }

  // FilterContent con estado local - no modifica estado padre hasta aplicar
  const FilterContent = ({ onClose }: { onClose?: () => void }) => {
    const [localUserRole, setLocalUserRole] = useState<string | null>(null)
    const [localFilters, setLocalFilters] = useState({
      companyName: "",
      statuses: [] as string[],
      contadorIds: [] as string[],
      processIds: [] as string[],
      contactoIds: [] as string[],
    })
    const initialized = useRef(false)

    // Inicializar filtros locales una sola vez al montar
    useEffect(() => {
      if (initialized.current) return
      
      const role = localStorage.getItem("userRole")
      setLocalUserRole(role)

      // Copiar filtros actuales del padre
      const initialFilters = { ...filters }

      if (role === "contacto") {
        const contactId = getLoggedContactoId()
        if (contactId) {
          initialFilters.contactoIds = [contactId]
        }
      } else if (role === "contador") {
        const contId = getLoggedContadorId()
        if (contId) {
          initialFilters.contadorIds = [contId]
        }
      }

      setLocalFilters(initialFilters)
      initialized.current = true
    }, [])

    const handleApplyFilters = () => {
      setFilters(localFilters)
      setCurrentPage(1)
      fetchClients(1, currentLimit, localFilters)
      onClose?.()
    }

    const handleClearFilters = () => {
      const emptyFilters = {
        companyName: "",
        statuses: [] as string[],
        contadorIds: [] as string[],
        processIds: [] as string[],
        contactoIds: [] as string[],
      }

      const userRole = localStorage.getItem("userRole")
      if (userRole === "contacto") {
        const contactoId = getLoggedContactoId()
        if (contactoId) {
          emptyFilters.contactoIds = [contactoId]
        }
      } else if (userRole === "contador") {
        const contadorId = getLoggedContadorId()
        if (contadorId) {
          emptyFilters.contadorIds = [contadorId]
        }
      }

      setLocalFilters(emptyFilters)
      setFilters(emptyFilters)
      setCurrentPage(1)
      fetchClients(1, currentLimit, emptyFilters)
      onClose?.()
    }

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="companyName">Empresa</Label>
          <Input
            id="companyName"
            placeholder="Filtrar por empresa"
            value={localFilters.companyName}
            onChange={(e) => setLocalFilters(prev => ({ ...prev, companyName: e.target.value }))}
            className="text-sm h-8"
          />
        </div>
        <div className="space-y-2">
          <Label>Estado</Label>
          <div className="space-y-2">
            {[
              { value: "onTime", label: "En tiempo", bgColor: "bg-green-100", textColor: "text-green-800" },
              { value: "atRisk", label: "En riesgo", bgColor: "bg-yellow-100", textColor: "text-yellow-800" },
              { value: "delayed", label: "Atrasados", bgColor: "bg-red-100", textColor: "text-red-800" },
              { value: "completed", label: "Completados", bgColor: "bg-blue-100", textColor: "text-blue-800" },
            ].map((status) => (
              <div key={status.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status.value}`}
                  checked={localFilters.statuses.includes(status.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setLocalFilters(prev => ({ ...prev, statuses: [...prev.statuses, status.value] }))
                    } else {
                      setLocalFilters(prev => ({
                        ...prev,
                        statuses: prev.statuses.filter((s) => s !== status.value),
                      }))
                    }
                  }}
                />
                <div className={`w-4 h-4 rounded-full ${status.bgColor} ${status.textColor}`}></div>
                <Label htmlFor={`status-${status.value}`} className="text-sm">
                  {status.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Mostrar selector de responsables solo si el usuario NO es un contador */}
        {localUserRole !== "contador" ? (
          <div className="space-y-2">
            <Label htmlFor="contadorIds">Responsables</Label>
            <SearchableSelect
              options={allContadores.map((contador) => ({ label: contador.name, value: contador.id }))}
              selected={localFilters.contadorIds}
              onChange={(selected) => setLocalFilters(prev => ({ ...prev, contadorIds: Array.isArray(selected) ? selected : selected ? [selected] : [] }))}
              multiple={true}
              placeholder="Seleccionar responsables"
            />
          </div>
        ) : (
          // Para contadores, mostrar un mensaje informativo en lugar del selector
          <div className="space-y-2">
            <Label>Responsable</Label>
            <div className="text-sm p-2 bg-gray-100 rounded border border-gray-200">
              Solo puedes ver tus clientes asignados
            </div>
          </div>
        )}

        {/* Mostrar selector de contactos solo si el usuario NO es un contacto */}
        {localUserRole !== "contacto" ? (
          <div className="space-y-2">
            <Label htmlFor="contactoIds">Contactos</Label>
            <SearchableSelect
              options={allContacts.map((contact) => ({ label: contact.name, value: contact.id }))}
              selected={localFilters.contactoIds}
              onChange={(selected) => setLocalFilters(prev => ({ ...prev, contactoIds: Array.isArray(selected) ? selected : selected ? [selected] : [] }))}
              multiple={true}
              placeholder="Seleccionar contactos"
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="processIds">Procesos</Label>
          <SearchableSelect
            options={allProcesses.map((process) => ({ label: process.name, value: process.id }))}
            selected={localFilters.processIds}
            onChange={(selected) => setLocalFilters(prev => ({ ...prev, processIds: Array.isArray(selected) ? selected : selected ? [selected] : [] }))}
            multiple={true}
            placeholder="Seleccionar procesos"
          />
        </div>

        {/* Botones de acción */}
        <div className="space-y-2 pt-4 border-t">
          <Button 
            onClick={handleApplyFilters} 
            className="w-full bg-primary text-white hover:bg-primary/90"
          >
            Aplicar filtros
          </Button>
          <Button onClick={handleClearFilters} variant="outline" className="w-full bg-transparent">
            Limpiar filtros
          </Button>
        </div>
      </div>
    )
  }

  // Función para alternar el orden de clasificación
  const toggleSortOrder = () => {
    const newOrder = sortCompany === "asc" ? "desc" : "asc"
    setSortCompany(newOrder)
    fetchClients(currentPage, currentLimit, filters)
  }

  const handleCardClick = (client: FiscalDeliverable) => {
    handleOpenClientProcesses(client)
  }

  const handleViewModeChange = (newViewMode: string) => {
    if (newViewMode === "grid" || newViewMode === "table") {
      let newLimit: number;

      if (newViewMode === "grid") {
        newLimit = GRID_ITEMS_PER_PAGE;
      } else {
        newLimit = tableLimit;
      }

      setViewMode(newViewMode as "grid" | "table");
      setCurrentLimit(newLimit);
      setCurrentPage(1);
      fetchClients(1, newLimit, filters);
    }
  };

  // Buscar el useEffect que maneja el modo de pantalla completa (cerca de la línea 1000)
  // y reemplazarlo con este código mejorado:

  useEffect(() => {
    const handleFullscreenChange = () => {
      // Actualizar el estado isFullscreen basado en si hay un elemento en pantalla completa
      setIsFullscreen(!!document.fullscreenElement)
    }

    // Añadir event listeners para todos los navegadores
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
    document.addEventListener("mozfullscreenchange", handleFullscreenChange)
    document.addEventListener("MSFullscreenchange", handleFullscreenChange)

    // Limpiar los event listeners al desmontar
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange)
      document.removeEventListener("MSFullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Modificar la función toggleFullscreen para que sea más robusta
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error al intentar entrar en modo pantalla completa: ${err.message}`)
      })
      // No necesitamos setIsFullscreen(true) aquí porque el event listener lo hará
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          console.error(`Error al intentar salir del modo pantalla completa: ${err.message}`)
        })
        // No necesitamos setIsFullscreen(false) aquí porque el event listener lo hará
      }
    }
  }

  // Fetch all clients only once when entering fullscreen mode
  useEffect(() => {
    if (isFullscreen && allClientsData.length === 0 && !isLoadingAllClients) {
      fetchAllClients()
    }
  }, [isFullscreen, fetchAllClients, allClientsData.length, isLoadingAllClients])

  // Función para enviar reportes mensuales a todos los clientes
  const handleSendMonthlyReports = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://luansoft-api-837868015612.us-central1.run.app/api"
      const apiKey = process.env.NEXT_PUBLIC_API_KEY || "e3b7ba168b3861c371bad80e284c71b82b4ef6a81826651e4cad693d7d3a02c2"

      const response = await axios.post(
        `${apiUrl}/monthly-reports/send-all`,
        {
          year: selectedYear,
          month: selectedMonth,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
        }
      )

      toast.success(response.data?.message || "Reportes mensuales enviados exitosamente", { duration: 5000 })
    } catch (error: any) {
      console.error("Error enviando reportes mensuales:", error)
      const errorMessage = error.response?.data?.message || "Error al enviar los reportes mensuales"
      toast.error(errorMessage, { duration: 5000 })
    }
  }

  // Inicializar mes y año por defecto (mes anterior)
  useEffect(() => {
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const defaultYear = lastMonth.getFullYear()
    const defaultMonth = String(lastMonth.getMonth() + 1).padStart(2, "0")
    setSelectedYear(defaultYear)
    setSelectedMonth(defaultMonth)
  }, [])

  // Modificar la sección useEffect que obtiene el rol del usuario

  // Buscar la sección donde se verifica el rol del usuario y añadir el rol "contacto"
  useEffect(() => {
    const role = localStorage.getItem("userRole")
    setUserRole(role)
    const isClientUser = role === "cliente"
    setIsClient(isClientUser)

    // Obtener el email del usuario desde localStorage
    const user = localStorage.getItem("user")
    if (user) {
      try {
        const userData = JSON.parse(user)
        setUserEmail(userData.email || null)
      } catch (error) {
        console.error("Error al obtener el email del usuario:", error)
      }
    }
  }, [])

  // Añadir este useEffect después del useEffect que establece userRole
  useEffect(() => {
    // Si el usuario es un contacto, establecer su ID en los filtros iniciales
    if (userRole === "contacto") {
      const contactoId = getLoggedContactoId()
      if (contactoId && !filters.contactoIds.includes(contactoId)) {
        // Actualizar los filtros sin desencadenar una nueva renderización
        setFilters((prevFilters) => ({
          ...prevFilters,
          contactoIds: [contactoId],
        }))
      }
    }
  }, [userRole]) // Solo se ejecuta cuando cambia

  // Añadir este useEffect después del useEffect que establece userRole y contactoId
  useEffect(() => {
    // Si el usuario es un contador, establecer su ID en los filtros iniciales
    if (userRole === "contador") {
      const contadorId = getLoggedContadorId()
      if (contadorId && !filters.contadorIds.includes(contadorId)) {
        // Actualizar los filtros sin desencadenar una nueva renderización
        setFilters((prevFilters) => ({
          ...prevFilters,
          contadorIds: [contadorId],
        }))
      }
    }
  }, [userRole]) // Solo se ejecuta cuando cambia el rol

  // Define fetchData outside of the conditional rendering
  const fetchData = useCallback(async () => {
    await fetchDashboardData()
    await fetchContadores()
    await fetchProcesses()
    await fetchContacts()

    // Verificar si el usuario es un contacto y añadir su ID como filtro
    const userRole = localStorage.getItem("userRole")
    if (userRole === "contacto") {
      const contactoId = getLoggedContactoId()
      if (contactoId) {
        // Crear un nuevo objeto de filtros con el contactoId
        const contactoFilters = {
          ...filters,
          contactoIds: [contactoId],
        }
        await fetchClients(currentPage, currentLimit, contactoFilters)
      } else {
        await fetchClients(currentPage, currentLimit, filters)
      }
    } else {
      await fetchClients(currentPage, currentLimit, filters)
    }

    setInitialLoad(false)
  }, [
    fetchDashboardData,
    fetchContadores,
    fetchProcesses,
    fetchContacts,
    fetchClients,
    currentPage,
    filters,
    currentLimit,
  ])

  // Move the useEffect hook that calls fetchData outside the conditional rendering
  // Solo ejecutar en carga inicial, no cuando cambian los filtros
  const dataFetchedRef = useRef(false)
  useEffect(() => {
    if (dataFetchedRef.current) return
    dataFetchedRef.current = true
    fetchData()
  }, [fetchData])

  // Move the useEffect hook that redirects clients outside the conditional rendering
  useEffect(() => {
    if (isClient) {
      router.push("/historial")
    }
  }, [isClient, router])

  let content = null

  // En la parte donde se define el contenido conditional, modificar así:
  if (isClient) {
    content = null // The client will be redirected to /historial
  } else {
    content = (
      <>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          {isFullscreen ? (
            <div className="flex items-center gap-4">
              <Logo variant="horizontal" color="black" width={150} height={40} className="h-20 w-auto" />
            </div>
          ) : (
            <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-0">Semáforo de Clientes</h1>
          )}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Clase común para todos los botones de la barra de herramientas */}
            {!isFullscreen && (
              <>
                {/* Sección de envío de reportes mensuales - Solo para administradores */}
                {userRole === 'admin' && (
                  <div className="flex items-center gap-3 bg-surface-container-low rounded-xl px-4 py-2 border border-outline-variant">
                    {/* Label de la sección */}
                    <span className="text-xs font-medium text-on-surface-variant whitespace-nowrap">Reportes:</span>

                    {/* Selector de Mes - Material Design 3 */}
                    <div className="relative">
                      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="h-8 w-[110px] bg-white border border-outline shadow-sm focus:ring-2 focus:ring-primary/20 text-on-surface text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                          <SelectValue placeholder="Mes" />
                        </SelectTrigger>
                        <SelectContent className="bg-white rounded-xl border border-gray-200 shadow-lg z-50">
                          {[
                            { value: "01", label: "Enero" },
                            { value: "02", label: "Febrero" },
                            { value: "03", label: "Marzo" },
                            { value: "04", label: "Abril" },
                            { value: "05", label: "Mayo" },
                            { value: "06", label: "Junio" },
                            { value: "07", label: "Julio" },
                            { value: "08", label: "Agosto" },
                            { value: "09", label: "Septiembre" },
                            { value: "10", label: "Octubre" },
                            { value: "11", label: "Noviembre" },
                            { value: "12", label: "Diciembre" },
                          ].map((month) => (
                            <SelectItem
                              key={month.value}
                              value={month.value}
                              className="text-on-surface text-sm hover:bg-secondary-container hover:text-on-secondary-container rounded-lg cursor-pointer focus:bg-secondary-container focus:text-on-secondary-container"
                            >
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Divider - Material Design 3 */}
                    <div className="w-px h-5 bg-outline-variant" />

                    {/* Selector de Año - Material Design 3 */}
                    <div className="relative">
                      <Select
                        value={selectedYear.toString()}
                        onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
                      >
                        <SelectTrigger className="h-8 w-[85px] bg-white border border-outline shadow-sm focus:ring-2 focus:ring-primary/20 text-on-surface text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                          <SelectValue placeholder="Año" />
                        </SelectTrigger>
                        <SelectContent className="bg-white rounded-xl border border-gray-200 shadow-lg z-50 max-h-[200px]">
                          {Array.from({ length: 6 }, (_, i) => {
                            const year = new Date().getFullYear() - 2 + i
                            return (
                              <SelectItem
                                key={year}
                                value={year.toString()}
                                className="text-on-surface text-sm hover:bg-secondary-container hover:text-on-secondary-container rounded-lg cursor-pointer focus:bg-secondary-container focus:text-on-secondary-container"
                              >
                                {year}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Botón Enviar - Material Design 3 Filled Button */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => setIsSendReportsModalOpen(true)}
                            className="h-8 px-3 ml-1 bg-primary text-on-primary hover:bg-primary/90 rounded-lg text-sm font-medium shadow-elevation-1 hover:shadow-elevation-2 transition-all"
                          >
                            <Mail className="mr-1.5 h-4 w-4" />
                            <span className="whitespace-nowrap">Enviar Reportes</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-surface-container-high text-on-surface text-xs">
                          Enviar reportes mensuales por email a todos los clientes activos
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="h-10 px-4 flex items-center justify-center bg-transparent"
                  onClick={() => {
                    // Cerrar sesión eliminando datos de autenticación
                    localStorage.removeItem("accessToken")
                    localStorage.removeItem("refreshToken")
                    localStorage.removeItem("user")
                    localStorage.removeItem("isAuthenticated")
                    localStorage.removeItem("userRole")
                    // Redirigir a la página de login
                    router.push("/login")
                  }}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  <span className="whitespace-nowrap">Cerrar sesión</span>
                </Button>
                <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="h-10 w-10 flex items-center justify-center bg-transparent">
                      <Filter className="h-4 w-4" />
                      <span className="sr-only">Filtros</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Filtros</SheetTitle>
                      <SheetDescription>Ajusta los filtros para el dashboard</SheetDescription>
                    </SheetHeader>
                    <div className="mt-4">
                      <FilterContent onClose={() => setIsFilterSheetOpen(false)} />
                    </div>
                  </SheetContent>
                </Sheet>
                <Button
                  onClick={toggleSortOrder}
                  variant="outline"
                  className="h-10 px-4 flex items-center justify-center bg-transparent"
                >
                  {sortCompany === "asc" ? (
                    <>
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                      <span className="whitespace-nowrap">A-Z</span>
                    </>
                  ) : (
                    <>
                      <ArrowUpDown className="mr-2 h-4 w-4 rotate-180" />
                      <span className="whitespace-nowrap">Z-A</span>
                    </>
                  )}
                </Button>
              </>
            )}
            <Button
              onClick={toggleFullscreen}
              variant="outline"
              className="h-10 w-10 flex items-center justify-center bg-transparent"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              <span className="sr-only">{isFullscreen ? "Salir de Pantalla Completa" : "Pantalla Completa"}</span>
            </Button>
            {!isFullscreen && (
              <Select value={viewMode} onValueChange={handleViewModeChange}>
                <SelectTrigger className="h-10 w-auto whitespace-nowrap flex items-center justify-center">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">
                    <div className="flex items-center whitespace-nowrap">
                      <Grid className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="hidden sm:inline">Cuadrícula</span>
                      <span className="sm:hidden" title="Vista Cuadrícula">
                        <Grid className="h-4 w-4" />
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="table">
                    <div className="flex items-center whitespace-nowrap">
                      <List className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="hidden sm:inline">Tabla</span>
                      <span className="sm:hidden" title="Vista Tabla">
                        <List className="h-4 w-4" />
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Ocultar las secciones de resumen, clientes y contadores para el rol contacto */}
        {!isFullscreen && userRole !== "contacto" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6 2xl:gap-8 2xl:mb-8">
            <Card className="col-span-1 sm:col-span-3">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-24">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : dashboardData ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Actualizar para usar las nuevas claves de estado */}
                    {[
                      {
                        status: "completed",
                        label: "Completados",
                        bgColor: "bg-blue-100",
                        textColor: "text-blue-800",
                        count: dashboardData.summary.processes.byStatus.completed.count,
                        percentage: dashboardData.summary.processes.byStatus.completed.percentage,
                      },
                      {
                        status: "onTime",
                        label: "En tiempo",
                        bgColor: "bg-green-100",
                        textColor: "text-green-800",
                        count: dashboardData.summary.processes.byStatus.onTime.count,
                        percentage: dashboardData.summary.processes.byStatus.onTime.percentage,
                      },
                      {
                        status: "atRisk",
                        label: "En riesgo",
                        bgColor: "bg-yellow-100",
                        textColor: "text-yellow-800",
                        count: dashboardData.summary.processes.byStatus.atRisk.count,
                        percentage: dashboardData.summary.processes.byStatus.atRisk.percentage,
                      },
                      {
                        status: "delayed",
                        label: "Atrasados",
                        bgColor: "bg-red-100",
                        textColor: "text-red-800",
                        count: dashboardData.summary.processes.byStatus.delayed.count,
                        percentage: dashboardData.summary.processes.byStatus.delayed.percentage,
                      },
                    ].map(({ status, label, bgColor, textColor, count, percentage }) => (
                      <div key={status} className={`p-4 rounded-lg ${bgColor} ${textColor}`}>
                        <h3 className="text-lg font-semibold mb-2">{label}</h3>
                        <p className="text-3xl font-bold">{count}</p>
                        <p className="text-sm mt-1">({percentage}% del total)</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">No hay datos disponibles</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        {!isFullscreen && userRole !== "contacto" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6 2xl:gap-8 2xl:mb-8">
            {/* Tarjeta de Clientes */}
            <Card className="col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-24">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : dashboardData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-3 rounded-lg bg-purple-100 text-purple-800">
                        <h3 className="text-sm font-semibold mb-1">Total</h3>
                        <p className="text-2xl font-bold">{dashboardData.summary.clients.total}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-teal-100 text-teal-800">
                        <h3 className="text-sm font-semibold mb-1">Activos</h3>
                        <p className="text-2xl font-bold">{dashboardData.summary.clients.active}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-100 text-gray-800">
                        <h3 className="text-sm font-semibold mb-1">Inactivos</h3>
                        <p className="text-2xl font-bold">{dashboardData.summary.clients.inactive}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">No hay datos disponibles</div>
                )}
              </CardContent>
            </Card>

            {/* Tarjeta de Contadores */}
            <Card className="col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Contadores</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-24">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : dashboardData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-3 rounded-lg bg-indigo-100 text-indigo-800">
                        <h3 className="text-sm font-semibold mb-1">Total</h3>
                        <p className="text-2xl font-bold">{dashboardData.summary.contadores.total}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-emerald-100 text-emerald-800">
                        <h3 className="text-sm font-semibold mb-1">Activos</h3>
                        <p className="text-2xl font-bold">{dashboardData.summary.contadores.active}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-100 text-slate-800">
                        <h3 className="text-sm font-semibold mb-1">Inactivos</h3>
                        <p className="text-2xl font-bold">{dashboardData.summary.contadores.inactive}</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-cyan-100 text-cyan-800">
                      <h3 className="text-sm font-semibold mb-1">Promedio de clientes por contador</h3>
                      <p className="text-2xl font-bold">{dashboardData.summary.contadores.averageClientsPerContador}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">No hay datos disponibles</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {isFullscreen ? (
          <div className="mt-4">
            {isLoadingAllClients ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <InfiniteScrollDisplay clients={allClientsData} onClientClick={handleCardClick} />
            )}
          </div>
        ) : (
          <Tabs value={viewMode} onValueChange={handleViewModeChange}>
            <TabsContent value="grid" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : clientsData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
                  {clientsData.map((item) => (
                    <Card
                      key={item.id}
                      className="overflow-hidden cursor-pointer w-full"
                      onClick={() => handleCardClick(item)}
                    >
                      <CardContent className="p-4">
                        <div className="text-sm font-semibold truncate">{item.company}</div>
                        <div className="text-xs text-gray-500 truncate">{item.client}</div>
                        <div className="flex items-center mt-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`h-2 w-2 rounded-full mr-1 ${getDotStatus(item).color} cursor-help`}
                                ></div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{getDotStatus(item).tooltip}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <span className="text-xs">{item.progressPercentage}%</span>
                        </div>
                        <div className="text-xs mt-1 text-gray-500">{item.responsible}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">No se encontraron clientes</div>
              )}
            </TabsContent>
            <TabsContent value="table" className="mt-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={clientsData}
                  onRowClick={handleCardClick}
                  pagination={{
                    page: currentPage,
                    pageCount: totalPages,
                    onPageChange: handlePageChange,
                    perPage: tableLimit,
                    onPerPageChange: handlePerPageChange,
                  }}
                />
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Paginación para vista cuadrícula */}
        {!isFullscreen && viewMode === "grid" && (
          <div className="mt-4 flex justify-center">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        )}

        {/* Diálogo de detalles del cliente */}
        <ClientDetailDialog
          client={selectedClient}
          isOpen={isDetailDialogOpen}
          onClose={() => setIsDetailDialogOpen(false)}
        />

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

        {/* Modal de procesos del cliente */}
        <ClientProcessesModal
          isOpen={isClientProcessesModalOpen}
          onClose={() => setIsClientProcessesModalOpen(false)}
          client={selectedClientForProcesses}
        />

        {/* Modal de confirmación para enviar reportes */}
        <Dialog open={isSendReportsModalOpen} onOpenChange={setIsSendReportsModalOpen}>
          <DialogContent className="max-w-md mx-4">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold text-slate-900">Confirmar envío de reportes</DialogTitle>
                  <p className="text-sm text-slate-600">Esta acción enviará reportes a todos los clientes activos</p>
                </div>
              </div>
            </DialogHeader>
            
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-slate-700 mb-2">Detalles del envío:</p>
              <div className="space-y-1">
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Mes:</span> {selectedMonth ? [
                    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
                  ][parseInt(selectedMonth) - 1] : 'No seleccionado'}
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Año:</span> {selectedYear}
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
              <p className="text-xs text-amber-800">
                ⚠️ Esta acción enviará emails a todos los clientes con datos disponibles para el período seleccionado. 
                Los reportes se generarán automáticamente con los datos financieros más recientes.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsSendReportsModalOpen(false)}
                className="px-4 py-2"
              >
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                  await handleSendMonthlyReports()
                  setIsSendReportsModalOpen(false)
                }}
                className="px-4 py-2 bg-primary text-on-primary hover:bg-primary/90"
              >
                <Mail className="mr-2 h-4 w-4" />
                Enviar Reportes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <div
      className={`w-full max-w-[2560px] mx-auto py-2 px-2 sm:py-4 sm:px-4 2xl:px-0 ${isFullscreen ? "fullscreen-mode" : ""}`}
    >
      {content}
    </div>
  )
}
