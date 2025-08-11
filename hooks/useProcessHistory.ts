"use client"

import { useState, useCallback } from "react"
import { axiosInstance } from "@/lib/axios"
import { format } from "date-fns"
import { toast } from "sonner"

// Interface para los filtros
export interface ProcessHistoryFilters {
  clientId?: string
  dateFrom?: string
  dateTo?: string
  contadorId?: string
  processId?: string
  paymentPeriod?: "MONTHLY" | "QUARTERLY" | "ANNUAL"
  payrollFrequencies?: string[]
  search?: string
}

// Interface para los parámetros de ordenamiento
export interface ProcessHistorySorting {
  sortBy: "clientName" | "dateCompleted"
  sortOrder: "asc" | "desc"
}

// Interface para la paginación
export interface ProcessHistoryPagination {
  page: number
  limit: number
}

// Interface para el historial de procesos desde la API
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

// Interface para la respuesta de la API
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

// Interface para los datos procesados del historial
export interface ProcessedHistoryItem {
  id: string
  processName: string
  contadorName: string
  completedDate: string
  originalDueDate: string
  fileId: string
  fileName: string
  fileType: string
  fileUrl: string | null
}

export function useProcessHistory() {
  const [data, setData] = useState<ProcessedHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchProcessHistory = useCallback(
    async (
      filters: ProcessHistoryFilters = {},
      sorting: ProcessHistorySorting = { sortBy: "dateCompleted", sortOrder: "desc" },
      pagination: ProcessHistoryPagination = { page: 1, limit: 10 },
    ) => {
      setIsLoading(true)
      try {
        const token = localStorage.getItem("accessToken")
        if (!token) {
          throw new Error("No authentication token found")
        }

        // Construir URLSearchParams para la consulta
        const searchParams = new URLSearchParams()
        searchParams.append("page", pagination.page.toString())
        searchParams.append("limit", pagination.limit.toString())
        searchParams.append("sortBy", sorting.sortBy)
        searchParams.append("sortOrder", sorting.sortOrder)

        // Añadir filtros
        if (filters.clientId) {
          searchParams.append("clientId[]", filters.clientId)
        }

        if (filters.dateFrom) {
          searchParams.append("dateFrom", filters.dateFrom)
        }

        if (filters.dateTo) {
          searchParams.append("dateTo", filters.dateTo)
        }

        if (filters.contadorId) {
          searchParams.append("contadorId", filters.contadorId)
        }

        if (filters.processId) {
          searchParams.append("processId", filters.processId)
        }

        if (filters.paymentPeriod) {
          searchParams.append("paymentPeriod", filters.paymentPeriod)
        }

        if (filters.payrollFrequencies && filters.payrollFrequencies.length > 0) {
          filters.payrollFrequencies.forEach((freq) => {
            searchParams.append("payrollFrequencies[]", freq)
          })
        }

        if (filters.search) {
          searchParams.append("search", filters.search)
        }

        const url = `/processhistory?${searchParams.toString()}`

        const response = await axiosInstance.get<ProcessHistoryResponse>(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data.success) {
          // Mapear los datos al formato esperado
          const mappedData: ProcessedHistoryItem[] = response.data.data.data.map((item) => ({
            id: item.id,
            processName: item.process.name,
            contadorName: `${item.contador.firstName} ${item.contador.lastName}`,
            completedDate: format(new Date(item.dateCompleted), "dd/MM/yyyy"),
            originalDueDate: format(new Date(item.originalDate), "dd/MM/yyyy"),
            fileId: item.file.id,
            fileName: item.file.originalName,
            fileType: item.file.type,
            fileUrl: item.file.url,
          }))

          setData(mappedData)
          setTotalItems(response.data.data.total)
          setTotalPages(response.data.data.totalPages)
          setCurrentPage(response.data.data.page)
        } else {
          throw new Error(response.data.message || "Error fetching process history")
        }
      } catch (error) {
        console.error("Error fetching process history:", error)
        toast.error("Error al cargar el historial de procesos")
        // En caso de error, limpiar los datos
        setData([])
        setTotalItems(0)
        setTotalPages(1)
        setCurrentPage(1)
      } finally {
        setIsLoading(false)
      }
    },
    [],
  )

  return {
    data,
    isLoading,
    totalItems,
    totalPages,
    currentPage,
    fetchProcessHistory,
  }
}
