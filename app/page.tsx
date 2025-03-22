"use client"

import { useState, useEffect, useCallback } from "react"
import {
  ArrowUpDown,
  Filter,
  Maximize,
  Minimize,
  Grid,
  List,
  Check,
  ChevronDown,
  ArrowLeft,
  Loader2,
} from "lucide-react"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Pagination } from "@/components/ui/pagination"
import { ProgressBar } from "@/components/ProgressBar"
import type { ColumnDef } from "@tanstack/react-table"
import type { FiscalDeliverable, SemaphoreStatus, Process } from "@/types"
import { ClientDetailDialog } from "@/components/ClientDetailDialog"
import { useRouter } from "next/navigation"
import { axiosInstance } from "@/lib/axios"
import { toast } from "sonner"

const ITEMS_PER_PAGE = 10

// Tipo para los datos de cliente que vienen de la API
interface ApiClient {
  id: string
  firstName: string
  lastName: string
  email: string
  company: string
  contador: {
    id: string
    firstName: string
    lastName: string
    email: string
  } | null
  processes: {
    id: string
    name: string
    commitmentDate: string
    status: string
    deliveryStatus: "onTime" | "atRisk" | "delayed"
  }[]
  completionPercentage: string
}

// Tipo para la respuesta de la API
interface ApiResponse {
  success: boolean
  message: string
  errorCode: null
  data: {
    success: boolean
    data: ApiClient[]
    pagination: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
    message: string
  }
}

// Mapear el estado de entrega a un color de semáforo
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

// Convertir ApiClient a FiscalDeliverable para mantener compatibilidad con los componentes existentes
const mapApiClientToFiscalDeliverable = (client: ApiClient): FiscalDeliverable => {
  const completionPercentage = parseCompletionPercentage(client.completionPercentage)

  // Mapear los procesos al formato esperado por los componentes
  const mappedProcesses: Process[] = client.processes.map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status === "PAID" ? "completed" : p.deliveryStatus === "onTime" ? "in_progress" : "pending",
    progress: p.status === "PAID" ? 100 : p.deliveryStatus === "onTime" ? 50 : 0,
    dueDate: p.commitmentDate,
  }))

  return {
    id: client.id,
    client: `${client.firstName} ${client.lastName}`,
    company: client.company,
    deliverableType: "Cliente",
    period: "Mensual",
    dueDate: client.processes.length > 0 ? client.processes[0].commitmentDate : new Date().toISOString(),
    responsible: client.contador ? `${client.contador.firstName} ${client.contador.lastName}` : "No asignado",
    observations: "",
    processes: mappedProcesses,
    progressPercentage: completionPercentage,
    // Añadir campos adicionales para mantener la información original
    originalData: client,
  }
}

const columns: ColumnDef<FiscalDeliverable>[] = [
  {
    accessorKey: "client",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="text-xs">
        Cliente
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
                process.status === "completed"
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

const MultiSelect = ({ options, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={isOpen} className="w-full justify-between">
          {selected.length > 0 ? `${selected.length} seleccionados` : "Seleccionar..."}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Buscar..." className="h-9" />
          <CommandList>
            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    onChange(
                      selected.includes(option.value)
                        ? selected.filter((item) => item !== option.value)
                        : [...selected, option.value],
                    )
                  }}
                >
                  <Check className={`mr-2 h-4 w-4 ${selected.includes(option.value) ? "opacity-100" : "opacity-0"}`} />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
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
  const [filters, setFilters] = useState({
    companyName: "",
    statuses: [] as string[],
    contadorIds: [] as string[],
    processIds: [] as string[],
  })
  const [selectedClient, setSelectedClient] = useState<FiscalDeliverable | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [allContadores, setAllContadores] = useState<{ id: string; name: string }[]>([])
  const [allProcesses, setAllProcesses] = useState<{ id: string; name: string }[]>([])

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

  // Cargar datos iniciales
  useEffect(() => {
    const role = localStorage.getItem("userRole")
    setUserRole(role)

    if (role === "cliente") {
      router.push("/historial")
    } else {
      fetchDashboardData()
      fetchContadores()
      fetchProcesses()
      fetchClients(currentPage, ITEMS_PER_PAGE, filters)
    }
  }, [router, fetchDashboardData, fetchContadores, fetchProcesses, fetchClients, currentPage])

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
  const clearFilters = () => {
    const emptyFilters = {
      companyName: "",
      statuses: [],
      contadorIds: [],
      processIds: [],
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

  const FilterContent = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="companyName">Empresa</Label>
        <Input
          id="companyName"
          placeholder="Filtrar por empresa"
          value={filters.companyName}
          onChange={(e) => handleFilter("companyName", e.target.value)}
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
        <MultiSelect
          options={allContadores.map((contador) => ({ label: contador.name, value: contador.id }))}
          selected={filters.contadorIds}
          onChange={(selected) => handleFilter("contadorIds", selected)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="processIds">Procesos</Label>
        <MultiSelect
          options={allProcesses.map((process) => ({ label: process.name, value: process.id }))}
          selected={filters.processIds}
          onChange={(selected) => handleFilter("processIds", selected)}
        />
      </div>
      <Button onClick={clearFilters} variant="outline" className="w-full">
        Limpiar filtros
      </Button>
    </div>
  )

  if (userRole === "dashboard") {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Dashboard de Visualización</h1>
        {/* Aquí puedes agregar componentes específicos para el dashboard de visualización */}
      </div>
    )
  }

  if (userRole === "cliente") {
    return null // The client will be redirected to /historial
  }

  return (
    <div
      className={`w-full max-w-[2560px] mx-auto py-2 px-2 sm:py-4 sm:px-4 2xl:px-0 ${isFullscreen ? "fullscreen-mode" : ""}`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-0">Semáforo de Clientes</h1>
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
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    status: "green",
                    label: "En tiempo",
                    bgColor: "bg-green-100",
                    textColor: "text-green-800",
                    count: dashboardData.summary.processes.byStatus.green.count,
                    percentage: dashboardData.summary.processes.byStatus.green.percentage,
                  },
                  {
                    status: "yellow",
                    label: "En riesgo",
                    bgColor: "bg-yellow-100",
                    textColor: "text-yellow-800",
                    count: dashboardData.summary.processes.byStatus.yellow.count,
                    percentage: dashboardData.summary.processes.byStatus.yellow.percentage,
                  },
                  {
                    status: "red",
                    label: "Atrasados",
                    bgColor: "bg-red-100",
                    textColor: "text-red-800",
                    count: dashboardData.summary.processes.byStatus.red.count,
                    percentage: dashboardData.summary.processes.byStatus.red.percentage,
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

      <Tabs value={viewMode} onValueChange={(value: "grid" | "table") => setViewMode(value)}>
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
            <div className="text-center py-10 text-gray-500">No se encontraron clientes con los filtros aplicados</div>
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

      <div className="mt-4 flex justify-center">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className="text-xs sm:text-sm"
        />
      </div>
      <ClientDetailDialog
        isOpen={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        client={selectedClient}
      />
    </div>
  )
}

