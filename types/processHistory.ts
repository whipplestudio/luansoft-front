// Base types for process history items
export interface ProcessHistoryFile {
  id: string
  originalName: string
  fileName: string
  mimeType: string
  sizeBytes: number
  url?: string
  thumbnailUrl?: string
}

export interface ProcessHistoryAccountant {
  id: string
  firstName: string
  lastName: string
  email: string
  fullName: string
}

export interface ProcessHistoryProcess {
  id: string
  name: string
  description?: string
}

export interface ProcessHistoryClient {
  id: string
  company: string
  rfc: string
  email?: string
}

export interface ProcessHistoryItem {
  id: string
  processId: string
  processName: string
  clientId: string
  clientName: string
  accountantId: string
  accountant: string
  accountantData?: ProcessHistoryAccountant
  processData?: ProcessHistoryProcess
  clientData?: ProcessHistoryClient
  fileId: string
  fileName: string
  originalFileName: string
  mimeType: string
  sizeBytes: number
  docKind: string
  paymentPeriod?: string
  monthLabel: string
  displayTitle: string
  url?: string
  thumbnailUrl?: string
  file?: ProcessHistoryFile
  dateCompleted: string // ISO string
  completedAt: string // ISO string
  originalDate: string // ISO string
  createdAt: string // ISO string
  updatedAt: string // ISO string
}

// API Response types
export interface ProcessHistoryResponse {
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

// Filter types
export interface ProcessHistoryFiltersType {
  clientId?: string
  clientIds?: string[]
  processId?: string
  processIds?: string[]
  accountantId?: string
  accountantIds?: string[]
  from?: string // ISO date string
  to?: string // ISO date string
  q?: string // search query
  search?: string // alternative search field
  docKind?: string[]
  paymentPeriod?: "MONTHLY" | "QUARTERLY" | "ANNUAL"
  monthLabel?: string[]
  selectedProcesses?: string[]
  selectedMonths?: string[]
  groupBy?: "process" | "month"
  viewMode?: "cards" | "table"
}

// Sorting types
export interface ProcessHistorySorting {
  sortBy: "clientName" | "dateCompleted"
  sortOrder: "asc" | "desc"
}

// Pagination types
export interface ProcessHistoryPagination {
  page: number
  limit: number
}

// Combined query parameters
export interface ProcessHistoryQueryParams
  extends ProcessHistoryFiltersType,
    ProcessHistorySorting,
    ProcessHistoryPagination {}

// Hook return types
export interface ProcessHistoryHookReturn {
  data: ProcessHistoryItem[]
  isLoading: boolean
  error: Error | null
  totalItems: number
  totalPages: number
  currentPage: number
  fetchProcessHistory: (
    filters: ProcessHistoryFiltersType,
    sorting: ProcessHistorySorting,
    pagination: ProcessHistoryPagination,
  ) => Promise<void>
  refetch: () => Promise<void>
}

// Document preview types
export interface DocumentPreviewState {
  isLoading: boolean
  error: string | null
  url: string | null
}

export interface DocumentPreviewCache {
  [fileId: string]: {
    url: string
    timestamp: number
    ttl: number
  }
}

// URL cache response
export interface DownloadUrlResponse {
  success: boolean
  message: string
  errorCode: string | null
  data: {
    url: string
  }
}
