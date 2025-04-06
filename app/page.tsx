"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { ArrowUpDown, Filter, Maximize, Minimize, Grid, List, ArrowLeft, Loader2 } from "lucide-react"
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
import { toast } from "sonner"
import { debounce } from "lodash"
import { Logo } from "@/components/Logo"
import { SearchableSelect } from "@/components/ui/searchable-select"

const ITEMS_PER_PAGE = 100
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

// Find the mapApiClientToFiscalDeliverable function and replace it with this updated version
// that properly handles null contacto and contador objects

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
    status: p.status === "PAID" ? "completed" : p.deliveryStatus === "onTime" ? "in_progress" : "pending",
    progress: p.status === "PAID" ? 100 : p.deliveryStatus === "onTime" ? 50 : 0,
    dueDate: p.commitmentDate,
    deliveryStatus: p.deliveryStatus, // Añadir el deliveryStatus al proceso
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
    // Añadir campos adicionales para mantener la información original
    originalData: client,
  }
}

// Update the columns definition to match the new structure
const columns: ColumnDef<FiscalDeliverable>[] = [
  {
    accessorKey: "client",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="text-xs">
        Contacto
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="space-y-1">
        <div className="text-xs font-medium">{row.getValue("client")}</div>
        <div className="text-xs text-muted-foreground">{row.original.company}</div>
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
      return (
        <div className="space-y-1">
          {processes.map((process, index) => (
            <Badge
              key={index}
              variant="outline"
              className={`text-xs ${
                process.deliveryStatus === "onTime"
                  ? "bg-green-100 text-green-800 border-green-300"
                  : process.deliveryStatus === "atRisk"
                    ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                    : process.deliveryStatus === "delayed"
                      ? "bg-red-100 text-red-800 border-red-300"
                      : process.status === "completed"
                        ? "bg-green-100 text-green-800 border-green-300"
                        : process.status === "pending"
                          ? "bg-red-100 text-red-800 border-red-300"
                          : "bg-yellow-100 text-yellow-800 border-yellow-300"
              }`}
            >
              {process.name}
            </Badge>
          ))}
        </div>
      )
    },
  },
  {
    accessorKey: "progressPercentage",
    header: "Progreso",
    cell: ({ row }) => {
      const progress = row.getValue("progressPercentage") as number
      const statusColor = progress >= 66 ? "green" : progress >= 33 ? "yellow" : "red"
      return (
        <div className="flex items-center">
          <div className={`h-2 w-2 rounded-full mr-2 bg-${statusColor}-500`}></div>
          <span className="text-xs">{progress}%</span>
        </div>
      )
    },
  },
]

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

// Component for the airport-style infinite scroll display
const InfiniteScrollDisplay = ({
  clients,
  onClientClick,
}: { clients: FiscalDeliverable[]; onClientClick: (client: FiscalDeliverable) => void }) => {
  const [currentBulkIndex, setCurrentBulkIndex] = useState(0)
  const [clientsPerBulk, setClientsPerBulk] = useState(12) // Default value
  const [isVisible, setIsVisible] = useState(true) // Add this state for fade effect
  const totalClients = clients.length

  // Calculate optimal number of clients per bulk based on screen size
  useEffect(() => {
    const calculateClientsPerBulk = () => {
      // Get viewport dimensions
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth

      // Calculate approximate card dimensions (including margins)
      // These values should match your CSS for the cards
      const cardHeight = 120 // Approximate height in pixels
      const cardWidth = 250 // Approximate width in pixels
      const cardMargin = 16 // Approximate margin in pixels

      // Calculate how many cards can fit in a row based on viewport width
      const cardsPerRow = Math.floor(viewportWidth / (cardWidth + cardMargin * 2))

      // Calculate how many rows can fit in the viewport
      const availableHeight = viewportHeight - 200 // Subtract header/footer space
      const rowsPerScreen = Math.floor(availableHeight / (cardHeight + cardMargin * 2))

      // Calculate total cards that can fit on screen
      const optimalCardsPerScreen = cardsPerRow * rowsPerScreen

      // Ensure we have at least 6 cards per bulk
      return Math.max(optimalCardsPerScreen, 6)
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
  useEffect(() => {
    const timer = setInterval(() => {
      // Start fade out
      setIsVisible(false)

      // After fade out completes, change the bulk and fade in
      setTimeout(() => {
        setCurrentBulkIndex((prevIndex) => (prevIndex + 1) % totalBulks)
        // Start fade in
        setIsVisible(true)
      }, 500) // This should match the CSS transition duration
    }, BULK_DISPLAY_TIME)

    return () => clearInterval(timer)
  }, [totalBulks])

  // Get the current bulk of clients to display
  const currentBulk = clientBulks[currentBulkIndex] || []

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
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
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6 flex-1 transition-opacity duration-500 ease-in-out ${isVisible ? "opacity-100" : "opacity-0"}`}
      >
        {currentBulk.map((item: FiscalDeliverable) => (
          <Card
            key={item.id}
            className="overflow-hidden cursor-pointer w-full hover:shadow-lg transition-shadow"
            onClick={() => onClientClick(item)}
          >
            <CardContent className="p-4">
              <div className="text-sm font-semibold truncate">{item.client}</div>
              <div className="text-xs text-gray-500 truncate">{item.company}</div>
              <div className="flex items-center mt-1">
                <div
                  className={`h-2 w-2 rounded-full mr-1 bg-${item.progressPercentage >= 66 ? "green" : item.progressPercentage >= 33 ? "yellow" : "red"}-500`}
                ></div>
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

export default function DashboardPage() {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [clientsData, setClientsData] = useState<FiscalDeliverable[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
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
  const [isLoading, setIsLoading] = useState(true)
  const [allContadores, setAllContadores] = useState<{ id: string; name: string }[]>([])
  const [allProcesses, setAllProcesses] = useState<{ id: string; name: string }[]>([])
  const [allClientsData, setAllClientsData] = useState<FiscalDeliverable[]>([])
  const [isLoadingAllClients, setIsLoadingAllClients] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [isClient, setIsClient] = useState(false)

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
  const fetchClients = useCallback(async (page = 1, limit = ITEMS_PER_PAGE, filters = {}) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      // Construir los parámetros de la consulta
      const params: Record<string, any> = {
        page,
        limit,
      }

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
  }, [])

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
        limit: 10000, // Set a very high limit to get all clients at once
      }

      // Add any active filters
      Object.entries(filters).forEach(([key, value]) => {
        if (
          value &&
          (typeof value === "string" ? value.trim() !== "" : Array.isArray(value) ? value.length > 0 : true)
        ) {
          params[key] = value
        }
      })

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
  }, [filters, isLoadingAllClients])

  // Cargar datos iniciales
  // Update the useEffect to call fetchContacts

  // Manejar cambios en los filtros
  const handleFilter = (key: string, value: any) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value }
      // Resetear a la página 1 cuando cambian los filtros
      setCurrentPage(1)
      // Aplicar los filtros
      fetchClients(1, ITEMS_PER_PAGE, newFilters)
      return newFilters
    })
  }

  // Limpiar todos los filtros
  // Update the clearFilters function to include contactIds
  const clearFilters = () => {
    const emptyFilters = {
      companyName: "",
      statuses: [],
      contadorIds: [],
      processIds: [],
      contactoIds: [], // Change from contactIds to contactoIds
    }
    setFilters(emptyFilters)
    setCurrentPage(1)
    fetchClients(1, ITEMS_PER_PAGE, emptyFilters)
  }

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchClients(page, ITEMS_PER_PAGE, filters)
  }

  // Debounced function para el filtro de empresa
  const debouncedCompanyFilter = useCallback(
    debounce((value: string) => {
      handleFilter("companyName", value)
    }, 500),
    [handleFilter],
  )

  // Primero, vamos a modificar el componente FilterContent para usar un estado local y un useEffect con debounce

  // Reemplazar el componente FilterContent actual con esta versión:
  // Update the FilterContent component to include a select for contacts
  const FilterContent = () => {
    // Estado local para el valor del input de empresa
    const [companyNameInput, setCompanyNameInput] = useState(filters.companyName)

    // Manejar cambio en el input de empresa con debounce
    const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setCompanyNameInput(value)

      // Usar debounce para la llamada al backend
      clearTimeout((window as any).companyFilterTimeout)
      ;(window as any).companyFilterTimeout = setTimeout(() => {
        handleFilter("companyName", value)
      }, 500)
    }

    // Actualizar el input local cuando cambia el filtro global
    useEffect(() => {
      setCompanyNameInput(filters.companyName)
    }, [filters.companyName])

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="companyName">Empresa</Label>
          <Input
            id="companyName"
            placeholder="Filtrar por empresa"
            value={companyNameInput}
            onChange={handleCompanyNameChange}
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
                  checked={filters.statuses.includes(status.value)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleFilter("statuses", [...filters.statuses, status.value])
                    } else {
                      handleFilter(
                        "statuses",
                        filters.statuses.filter((s) => s !== status.value),
                      )
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
        <div className="space-y-2">
          <Label htmlFor="contadorIds">Responsables</Label>
          <SearchableSelect
            options={allContadores.map((contador) => ({ label: contador.name, value: contador.id }))}
            selected={filters.contadorIds}
            onChange={(selected) => handleFilter("contadorIds", selected)}
            multiple={true}
            placeholder="Seleccionar responsables"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactoIds">Contactos</Label>
          <SearchableSelect
            options={allContacts.map((contact) => ({ label: contact.name, value: contact.id }))}
            selected={filters.contactoIds}
            onChange={(selected) => handleFilter("contactoIds", selected)}
            multiple={true}
            placeholder="Seleccionar contactos"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="processIds">Procesos</Label>
          <SearchableSelect
            options={allProcesses.map((process) => ({ label: process.name, value: process.id }))}
            selected={filters.processIds}
            onChange={(selected) => handleFilter("processIds", selected)}
            multiple={true}
            placeholder="Seleccionar procesos"
          />
        </div>
        <Button onClick={clearFilters} variant="outline" className="w-full">
          Limpiar filtros
        </Button>
      </div>
    )
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  const handleCardClick = (client: FiscalDeliverable) => {
    setSelectedClient(client)
    setIsDetailDialogOpen(true)
  }
  // Fetch all clients only once when entering fullscreen mode
  useEffect(() => {
    if (isFullscreen && allClientsData.length === 0 && !isLoadingAllClients) {
      fetchAllClients()
    }
  }, [isFullscreen, fetchAllClients, allClientsData.length, isLoadingAllClients])

  // Move the conditional logic inside the useEffect hook
  useEffect(() => {
    const role = localStorage.getItem("userRole")
    setUserRole(role)
    const isClientUser = role === "cliente"
    setIsClient(isClientUser)

    const fetchData = async () => {
      await fetchDashboardData()
      await fetchContadores()
      await fetchProcesses()
      await fetchContacts()
      await fetchClients(currentPage, ITEMS_PER_PAGE, filters)
      setInitialLoad(false)
    }

    fetchData()
  }, [fetchDashboardData, fetchContadores, fetchProcesses, fetchContacts, fetchClients, currentPage])

  useEffect(() => {
    if (isClient) {
      router.push("/historial")
    }
  }, [isClient, router])

  let content = null

  if (userRole === "dashboard") {
    content = (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Dashboard de Visualización</h1>
        {/* Aquí puedes agregar componentes específicos para el dashboard de visualización */}
      </div>
    )
  } else if (isClient) {
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
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/login")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al login
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-8">
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
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
            <Button onClick={toggleFullscreen} variant="outline" size="sm" className="h-8 w-8">
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              <span className="sr-only">{isFullscreen ? "Salir de Pantalla Completa" : "Pantalla Completa"}</span>
            </Button>
            <Select value={viewMode} onValueChange={(value: "grid" | "table") => setViewMode(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">
                  <div className="flex items-center">
                    <Grid className="mr-2 h-4 w-4" />
                    Cuadrícula
                  </div>
                </SelectItem>
                <SelectItem value="table">
                  <div className="flex items-center">
                    <List className="mr-2 h-4 w-4" />
                    Tabla
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {!isFullscreen && (
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
        {!isFullscreen && (
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
          <Tabs value={viewMode} onValueChange={(value: string) => setViewMode(value as "grid" | "table")}>
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
                        <div className="text-sm font-semibold truncate">{item.client}</div>
                        <div className="text-xs text-gray-500 truncate">{item.company}</div>
                        <div className="flex items-center mt-1">
                          <div
                            className={`h-2 w-2 rounded-full mr-1 bg-${item.progressPercentage >= 66 ? "green" : item.progressPercentage >= 33 ? "yellow" : "red"}-500`}
                          ></div>
                          <span className="text-xs">{item.progressPercentage}%</span>
                        </div>
                        <div className="text-xs mt-1 text-gray-500">{item.responsible}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No se encontraron clientes con los filtros aplicados
                </div>
              )}
            </TabsContent>
            <TabsContent value="table" className="mt-0">
              <DataTable
                columns={columns}
                data={clientsData}
                isLoading={isLoading}
                pagination={{
                  pageCount: totalPages,
                  page: currentPage,
                  onPageChange: handlePageChange,
                  perPage: ITEMS_PER_PAGE,
                  onPerPageChange: () => {}, // No implementado por ahora
                }}
              />
            </TabsContent>
          </Tabs>
        )}

        {!isFullscreen && (
          <div className="mt-4 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              className="text-xs sm:text-sm"
            />
          </div>
        )}
        <ClientDetailDialog
          isOpen={isDetailDialogOpen}
          onClose={() => setIsDetailDialogOpen(false)}
          client={selectedClient}
        />
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

