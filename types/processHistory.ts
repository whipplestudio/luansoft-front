// Tipos base para el historial de procesos

// Tipo para el archivo asociado a un proceso histórico
export interface ProcessHistoryFile {
  id: string
  originalName: string
  fileName: string
  mimeType: string
  sizeBytes: number
  url?: string
}

// Tipo para el contador asociado a un proceso histórico
export interface ProcessHistoryAccountant {
  id: string
  firstName: string
  lastName: string
  email: string
}

// Tipo para el proceso asociado al historial
export interface ProcessHistoryProcess {
  id: string
  name: string
  description?: string
}

// Tipo para el cliente asociado al historial
export interface ProcessHistoryClient {
  id: string
  company: string
  rfc?: string
}

// Tipo para un item individual del historial de procesos
export interface ProcessHistoryItem {
  id: string
  processId: string
  processName: string
  clientId: string
  clientName: string
  accountantId: string
  accountant: string
  status: string
  dateCompleted: string // ISO string
  originalDate: string // ISO string
  commitmentDate: string // ISO string
  graceDays: number
  docKind: string
  paymentPeriod: string
  monthLabel: string
  displayTitle: string
  fileId: string
  fileName: string
  mimeType: string
  sizeBytes: number
  completedAt: string // ISO string
  file?: ProcessHistoryFile
  process?: ProcessHistoryProcess
  client?: ProcessHistoryClient
  accountantInfo?: ProcessHistoryAccountant
}

// Tipo para la respuesta paginada del historial
export interface ProcessHistoryResponse {
  success: boolean
  message: string
  errorCode: string | null
  data: {
    data: ProcessHistoryItem[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

// Tipo para los filtros del historial de procesos
export interface ProcessHistoryFiltersType {
  clientId?: string
  from?: string // ISO string
  to?: string // ISO string
  q?: string // búsqueda general
  search?: string // alias para q
  processId?: string
  accountantId?: string
  status?: string
  docKind?: string[]
  paymentPeriod?: string[]
  selectedProcesses?: string[]
  selectedMonths?: string[]
  groupBy?: "process" | "month"
  viewMode?: "cards" | "table"
}

// Tipo para el ordenamiento del historial
export interface ProcessHistorySorting {
  sortBy:
    | "dateCompleted"
    | "originalDate"
    | "processName"
    | "clientName"
    | "accountant"
    | "status"
    | "docKind"
    | "paymentPeriod"
    | "sizeBytes"
  sortOrder: "asc" | "desc"
}

// Tipo para los parámetros de paginación
export interface ProcessHistoryPagination {
  page: number
  limit: number
}

// Tipo para los parámetros completos de la consulta del historial
export interface ProcessHistoryQueryParams
  extends ProcessHistoryFiltersType,
    ProcessHistorySorting,
    ProcessHistoryPagination {}

// Tipo para el estado del explorador de documentos
export interface DocumentExplorerState {
  groupBy: "process" | "month"
  viewMode: "cards" | "table"
  sortBy: string
  sortOrder: "asc" | "desc"
}

// Tipo para los filtros del explorador de documentos
export interface DocumentExplorerFilters {
  search: string
  docKind: string[]
  paymentPeriod: string[]
  selectedProcesses: string[]
  selectedMonths: string[]
}

// Tipo para un proceso con sus meses disponibles (usado en el selector)
export interface ProcessWithMonths {
  id: string
  name: string
  months: Array<{
    value: string
    label: string
    count: number
  }>
  totalDocuments: number
}

// Tipo para estadísticas del historial
export interface ProcessHistoryStats {
  totalDocuments: number
  totalProcesses: number
  dateRange: {
    from: string // ISO string
    to: string // ISO string
  }
  documentsByType: Record<string, number>
  documentsByPeriod: Record<string, number>
}
