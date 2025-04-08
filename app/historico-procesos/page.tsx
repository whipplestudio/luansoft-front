"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Filter, Eye, Download } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { HistoricoFiltros } from "@/components/HistoricoFiltros"
import { Toaster, toast } from "sonner"
import { format } from "date-fns"
import { axiosInstance } from "@/lib/axios"
import { DocumentViewerModal } from "@/components/DocumentViewerModal"

// Interfaces para la respuesta de la API
interface ProcessHistoryResponse {
  success: boolean
  message: string
  errorCode: string | null
  data: {
    data: ProcessHistoryItem[]
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

interface ProcessHistoryItem {
  id: string
  clientId: string
  processId: string
  contadorId: string
  fileId: string
  dateCompleted: string
  originalDate: string
  newDate: string | null
  paymentPeriod: string
  payrollFrequencies: string[]
  createdAt: string
  file: {
    id: string
    originalName: string
    url: string
    thumbnailUrl: string | null
    type: string
    bucket: string
    folder: string
    size: number
    createdAt: string
    updatedAt: string
  }
  client: {
    id: string
    company: string
    status: string
    type: string
    limitDay: number
    graceDays: number
    payroll: boolean
    payrollFrequencies: string[]
    contadorId: string
    contactoId: string | null
    regimenFiscalId: string | null
    createdAt: string
    updatedAt: string
  }
  contador: {
    id: string
    email: string
    firstName: string
    lastName: string
    status: string
    userId: string
    createdAt: string
    updatedAt: string
  }
  process: {
    id: string
    name: string
    description: string
    createdAt: string
    updatedAt: string
  }
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

// Interfaz para la respuesta de la API de clientes activos
interface ActiveClientsResponse {
  success: boolean
  message: string
  errorCode: string | null
  data: {
    data: ClientItem[]
    total: number
    page: number | null
    limit: number | null
    totalPages: number | null
  }
}

// Interfaz para la respuesta de la API de procesos
interface ProcessesResponse {
  success: boolean
  message: string
  errorCode: string | null
  data: {
    data: ProcessItem[]
    total: number
    page: number | null
    limit: number | null
    totalPages: number | null
  }
}

// Interfaz para la respuesta de la API de contadores
interface ContadoresResponse {
  success: boolean
  message: string
  errorCode: string | null
  data: {
    data: ContadorItem[]
    total: number
  }
}

interface ClientItem {
  id: string
  company: string
  status: string
  type: string
  limitDay: number
  graceDays: number
  payroll: boolean
  payrollFrequencies: string[]
  contadorId: string
  contactoId: string | null
  regimenFiscalId: string | null
  createdAt: string
  updatedAt: string
}

interface ProcessItem {
  id: string
  name: string
  description: string
  status: string
  createdAt: string
  updatedAt: string
}

interface ContadorItem {
  id: string
  firstName: string
  lastName: string
  email: string
  clientCount: number
  clients: any[]
}

// Interfaz para los procesos completados que se muestran en la tabla
interface CompletedProcess {
  id: string
  processName: string
  clientName: string
  contadorName: string
  completedDate: string
  originalDueDate: string
  fileId: string
  fileName: string
  fileType: string
}

// Actualizar la interfaz Filters para usar los nombres correctos de parámetros de fecha
interface Filters {
  clientIds?: string[]
  contadorIds?: string[]
  processIds?: string[]
  originalDateFrom?: string
  originalDateTo?: string
}

// Datos mock para usar cuando la API no está disponible
const mockCompletedProcesses = [
  {
    id: "101",
    processName: "Nomina",
    clientName: "Hochos",
    contadorName: "Paquistrano Reyes",
    completedDate: "07/04/2025",
    originalDueDate: "13/04/2025",
    fileId: "deea4b37-2562-4cca-b91b-dbd13d733bbb",
    fileName: "documento1.pdf",
    fileType: "application/pdf",
  },
  {
    id: "102",
    processName: "Proceso B",
    clientName: "Cliente Y",
    contadorName: "Contador 2",
    completedDate: "05/04/2025",
    originalDueDate: "10/04/2025",
    fileId: "deea4b37-2562-4cca-b91b-dbd13d733bbb",
    fileName: "documento2.pdf",
    fileType: "application/pdf",
  },
  {
    id: "103",
    processName: "Proceso C",
    clientName: "Cliente Z",
    contadorName: "Contador 3",
    completedDate: "03/04/2025",
    originalDueDate: "08/04/2025",
    fileId: "deea4b37-2562-4cca-b91b-dbd13d733bbb",
    fileName: "documento3.pdf",
    fileType: "application/pdf",
  },
]

// Para pruebas locales, usamos URLs de ejemplo
const mockPdfUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
const mockImageUrl = "https://via.placeholder.com/800x600.png"

export default function HistoricoProcesosPage() {
  const [data, setData] = useState<CompletedProcess[]>([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<Filters>({})
  const [isLoading, setIsLoading] = useState(false)
  const [useLocalData, setUseLocalData] = useState(false)
  const [activeClients, setActiveClients] = useState<ClientItem[]>([])
  const [isLoadingClients, setIsLoadingClients] = useState(false)
  const [processes, setProcesses] = useState<ProcessItem[]>([])
  const [isLoadingProcesses, setIsLoadingProcesses] = useState(false)
  const [contadores, setContadores] = useState<ContadorItem[]>([])
  const [isLoadingContadores, setIsLoadingContadores] = useState(false)

  const [viewerOpen, setViewerOpen] = useState(false)
  const [currentDocument, setCurrentDocument] = useState<{
    url: string | null
    type: "pdf" | "image"
    title: string
    fileName: string
    fileId: string
  } | null>(null)

  // Función para obtener clientes activos
  const fetchActiveClients = async () => {
    setIsLoadingClients(true)
    try {
      const response = await axiosInstance.get<ActiveClientsResponse>("/client")

      if (response.data.success) {
        setActiveClients(response.data.data.data)
      } else {
        console.error("Error en la respuesta de la API de clientes:", response.data.message)
        toast.error("Error al cargar los clientes activos")
      }
    } catch (error) {
      console.error("Error al obtener clientes activos:", error)
      toast.error("No se pudieron cargar los clientes activos")
    } finally {
      setIsLoadingClients(false)
    }
  }

  // Función para obtener procesos
  const fetchProcesses = async () => {
    setIsLoadingProcesses(true)
    try {
      const response = await axiosInstance.get<ProcessesResponse>("/process")

      if (response.data.success) {
        setProcesses(response.data.data.data)
      } else {
        console.error("Error en la respuesta de la API de procesos:", response.data.message)
        toast.error("Error al cargar los procesos")
      }
    } catch (error) {
      console.error("Error al obtener procesos:", error)
      toast.error("No se pudieron cargar los procesos")
    } finally {
      setIsLoadingProcesses(false)
    }
  }

  // Función para obtener contadores
  const fetchContadores = async () => {
    setIsLoadingContadores(true)
    try {
      const response = await axiosInstance.get<ContadoresResponse>("/contador")

      if (response.data.success) {
        setContadores(response.data.data.data)
      } else {
        console.error("Error en la respuesta de la API de contadores:", response.data.message)
        toast.error("Error al cargar los contadores")
      }
    } catch (error) {
      console.error("Error al obtener contadores:", error)
      toast.error("No se pudieron cargar los contadores")
    } finally {
      setIsLoadingContadores(false)
    }
  }

  // Cargar clientes activos, procesos y contadores al montar el componente
  useEffect(() => {
    fetchActiveClients()
    fetchProcesses()
    fetchContadores()
  }, [])

  // Función para cerrar el visor de documentos
  const handleCloseViewer = () => {
    // Asegurarse de salir del modo pantalla completa si está activo
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.error("Error al salir de pantalla completa:", err)
      })
    }

    setViewerOpen(false)
    // Limpiar el documento actual después de un breve retraso para evitar parpadeos
    setTimeout(() => {
      setCurrentDocument(null)
    }, 300)
  }

  // Función para obtener la URL de descarga de un archivo
  const getFileDownloadUrl = async (fileId: string): Promise<string | null> => {
    try {
      setIsLoading(true)

      // Si estamos usando datos locales, devolver URLs de ejemplo
      if (useLocalData) {
        // Determinar si es PDF o imagen basado en un valor aleatorio para demostración
        const isPdf = Math.random() > 0.5
        return isPdf ? mockPdfUrl : mockImageUrl
      }

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

      // En caso de error, usar URL de ejemplo para demostración
      return mockPdfUrl
    } finally {
      setIsLoading(false)
    }
  }

  // Función para manejar la visualización de un archivo
  const handleViewFile = async (fileId: string, fileName: string) => {
    setIsLoading(true)
    try {
      let url = await getFileDownloadUrl(fileId)

      // Si no se pudo obtener la URL, usar una URL de ejemplo para demostración
      if (!url && useLocalData) {
        url = fileName.toLowerCase().endsWith(".pdf") ? mockPdfUrl : mockImageUrl
      }

      if (url) {
        // Determinar el tipo de documento basado en el nombre del archivo
        const isPdf = fileName.toLowerCase().endsWith(".pdf")

        setCurrentDocument({
          url,
          type: isPdf ? "pdf" : "image",
          title: fileName,
          fileName,
          fileId,
        })
        setViewerOpen(true)
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

  // Función para manejar la descarga de un archivo
  const handleDownloadFile = async (fileId: string, fileName: string) => {
    try {
      setIsLoading(true)
      const url = await getFileDownloadUrl(fileId)

      if (url) {
        // Si estamos en modo local, abrir la URL en una nueva pestaña
        if (useLocalData) {
          window.open(url, "_blank")
          return
        }

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
      }
    } catch (error) {
      console.error("Error al descargar el archivo:", error)
      toast.error("No se pudo descargar el archivo")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApiError = () => {
    setUseLocalData(true)
  }

  // Actualizar la función fetchProcessHistory para usar los nombres correctos de parámetros de fecha
  const fetchProcessHistory = async (page: number, limit: number, filters: Filters) => {
    setIsLoading(true)
    try {
      // Crear URLSearchParams para construir la URL con el formato correcto
      const searchParams = new URLSearchParams()
      searchParams.append("page", page.toString())
      searchParams.append("limit", limit.toString())

      // Añadir filtros si existen usando el formato correcto clientId[], contadorId[], processId[]
      if (filters.clientIds && filters.clientIds.length > 0) {
        filters.clientIds.forEach((id) => {
          searchParams.append("clientId[]", id)
        })
      }

      if (filters.contadorIds && filters.contadorIds.length > 0) {
        filters.contadorIds.forEach((id) => {
          searchParams.append("contadorId[]", id)
        })
      }

      if (filters.processIds && filters.processIds.length > 0) {
        filters.processIds.forEach((id) => {
          searchParams.append("processId[]", id)
        })
      }

      // Añadir fechas si existen con los nombres correctos y formato YYYY-MM-DD
      if (filters.originalDateFrom) searchParams.append("originalDateFrom", filters.originalDateFrom)
      if (filters.originalDateTo) searchParams.append("originalDateTo", filters.originalDateTo)

      // Construir la URL con los parámetros
      const url = `/processhistory?${searchParams.toString()}`

      // Realizar la petición con axiosInstance
      const response = await axiosInstance.get<ProcessHistoryResponse>(url)

      if (response.data.success) {
        // Mapear los datos al formato esperado por el componente DataTable
        const mappedData = response.data.data.data.map((item) => ({
          id: item.id,
          processName: item.process.name,
          clientName: item.client.company,
          contadorName: `${item.contador.firstName} ${item.contador.lastName}`,
          completedDate: format(new Date(item.dateCompleted), "dd/MM/yyyy"),
          originalDueDate: format(new Date(item.originalDate), "dd/MM/yyyy"),
          fileId: item.file.id,
          fileName: item.file.originalName,
          fileType: item.file.type,
        }))

        setData(mappedData)
        setTotalItems(response.data.data.total)
        setTotalPages(response.data.data.totalPages)

        // Si estábamos usando datos locales, mostrar mensaje de éxito
        if (useLocalData) {
          setUseLocalData(false)
          toast.success("Conexión con la API restablecida")
        }
      } else {
        console.error("Error en la respuesta de la API:", response.data.message)
        handleApiError()
      }
    } catch (error) {
      console.error("Error al obtener el historial de procesos:", error)
      handleApiError()
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    fetchProcessHistory(page, limit, filters)
  }, [page, limit])

  // Actualizar la función handleApplyFilters para usar los nombres correctos de parámetros de fecha
  const handleApplyFilters = (newFilters: any) => {
    const formattedFilters: Filters = {}

    // Manejar selecciones múltiples
    if (newFilters.processes && newFilters.processes.length > 0) {
      formattedFilters.processIds = newFilters.processes
    }

    if (newFilters.clients && newFilters.clients.length > 0) {
      formattedFilters.clientIds = newFilters.clients
    }

    if (newFilters.contadores && newFilters.contadores.length > 0) {
      formattedFilters.contadorIds = newFilters.contadores
    }

    if (newFilters.startDate) {
      // Formatear la fecha como YYYY-MM-DD
      formattedFilters.originalDateFrom = format(new Date(newFilters.startDate), "yyyy-MM-dd")
    }

    if (newFilters.endDate) {
      // Formatear la fecha como YYYY-MM-dd
      formattedFilters.originalDateTo = format(new Date(newFilters.endDate), "yyyy-MM-dd")
    }

    setFilters(formattedFilters)
    setPage(1) // Resetear a la primera página al aplicar filtros
    fetchProcessHistory(1, limit, formattedFilters)
  }

  // Función para cambiar de página
  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  // Función para cambiar el límite de elementos por página
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1) // Resetear a la primera página al cambiar el límite
  }

  return (
    <div className="container mx-auto py-6">
      <Toaster />

      {currentDocument && (
        <DocumentViewerModal
          isOpen={viewerOpen}
          onClose={handleCloseViewer}
          documentUrl={currentDocument.url}
          documentType={currentDocument.type}
          title={currentDocument.title}
          fileName={currentDocument.fileName}
          onDownload={() => handleDownloadFile(currentDocument.fileId, currentDocument.fileName)}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Histórico de Procesos</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtros avanzados
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filtros avanzados</SheetTitle>
              <SheetDescription>Filtra el histórico de procesos por diferentes criterios</SheetDescription>
            </SheetHeader>
            <HistoricoFiltros
              onFilter={handleApplyFilters}
              procesos={processes}
              clientes={activeClients}
              contadores={contadores}
              isLoadingClients={isLoadingClients}
              isLoadingProcesses={isLoadingProcesses}
              isLoadingContadores={isLoadingContadores}
            />
          </SheetContent>
        </Sheet>
      </div>

      {useLocalData && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p className="text-yellow-700">
            Usando datos locales para demostración. La conexión con la API no está disponible.
          </p>
        </div>
      )}

      <DataTable
        columns={[
          {
            accessorKey: "clientName",
            header: "Cliente",
          },
          {
            accessorKey: "processName",
            header: "Proceso",
          },
          {
            accessorKey: "contadorName",
            header: "Contador",
          },
          {
            accessorKey: "completedDate",
            header: "Fecha de Completado",
          },
          {
            accessorKey: "originalDueDate",
            header: "Fecha Original",
          },
          {
            id: "actions",
            header: "Acciones",
            cell: ({ row }) => {
              const process = row.original

              return (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewFile(process.fileId, process.fileName)}
                    title="Ver documento"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDownloadFile(process.fileId, process.fileName)}
                    title="Descargar documento"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )
            },
          },
        ]}
        data={data}
        isLoading={isLoading}
        pagination={{
          pageCount: totalPages,
          page: page,
          onPageChange: handlePageChange,
          perPage: limit,
          onPerPageChange: handleLimitChange,
        }}
        hideSearchInput={true}
      />
    </div>
  )
}

