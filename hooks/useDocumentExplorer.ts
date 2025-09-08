"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { axiosInstance } from "@/lib/axios"
import { toast } from "sonner"
import {
  flattenProcessHistory,
  groupDocumentsByProcess,
  groupDocumentsByMonth,
  sortDocuments,
  type ProcessHistoryItem,
} from "@/utils/processHistoryUtils"

interface DocumentExplorerFilters {
  search: string
  docKind: string[]
  paymentPeriod: string[]
  selectedProcesses: string[]
  selectedMonths: string[]
}

interface DocumentExplorerState {
  groupBy: "process" | "month"
  viewMode: "cards" | "table"
  sortBy: string
  sortOrder: "asc" | "desc"
  page: number
  limit: number
}

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

export function useDocumentExplorer(clientId: string, dateFrom?: string, dateTo?: string) {
  // State management
  const [filters, setFilters] = useState<DocumentExplorerFilters>({
    search: "",
    docKind: [],
    paymentPeriod: [],
    selectedProcesses: [],
    selectedMonths: [],
  })

  const [state, setState] = useState<DocumentExplorerState>({
    groupBy: "process",
    viewMode: "cards",
    sortBy: "originalDate",
    sortOrder: "desc",
    page: 1,
    limit: 50,
  })

  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set())
  const [rawData, setRawData] = useState<ProcessHistoryResponse["data"] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Fetch process history data
  const fetchData = useCallback(async () => {
    if (!clientId) return

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: state.page.toString(),
        limit: state.limit.toString(),
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      })

      if (clientId) params.append("clientId[]", clientId)
      if (dateFrom) params.append("from", dateFrom)
      if (dateTo) params.append("to", dateTo)

      const response = await axiosInstance.get<ProcessHistoryResponse>(`/processhistory?${params}`)

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch process history")
      }

      setRawData(response.data.data)
    } catch (err) {
      setError(err as Error)
      console.error("Error fetching process history:", err)
    } finally {
      setIsLoading(false)
    }
  }, [clientId, dateFrom, dateTo, state.page, state.limit, state.sortBy, state.sortOrder])

  // Fetch data when dependencies change
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Transform and filter documents
  const documents = useMemo(() => {
    if (!rawData?.data) return []

    let docs = flattenProcessHistory(rawData.data)

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      docs = docs.filter(
        (doc) =>
          doc.fileName.toLowerCase().includes(searchLower) || doc.processName.toLowerCase().includes(searchLower),
      )
    }

    if (filters.docKind.length > 0) {
      docs = docs.filter((doc) => filters.docKind.includes(doc.docKind))
    }

    if (filters.paymentPeriod.length > 0) {
      // This would need to be implemented based on the original data structure
      // For now, we'll skip this filter
    }

    if (filters.selectedProcesses.length > 0) {
      docs = docs.filter((doc) => filters.selectedProcesses.includes(doc.processId))
    }

    if (filters.selectedMonths.length > 0) {
      docs = docs.filter((doc) => filters.selectedMonths.includes(doc.monthLabel))
    }

    return sortDocuments(docs, state.sortBy, state.sortOrder)
  }, [rawData, filters, state.sortBy, state.sortOrder])

  // Group documents
  const groupedDocuments = useMemo(() => {
    if (state.groupBy === "process") {
      return groupDocumentsByProcess(documents)
    } else {
      return groupDocumentsByMonth(documents)
    }
  }, [documents, state.groupBy])

  // Get unique processes for sidebar
  const processes = useMemo(() => {
    const processMap = new Map<string, { name: string; count: number; months: Map<string, number> }>()

    documents.forEach((doc) => {
      if (!processMap.has(doc.processId)) {
        processMap.set(doc.processId, {
          name: doc.processName,
          count: 0,
          months: new Map(),
        })
      }

      const process = processMap.get(doc.processId)!
      process.count++

      const monthCount = process.months.get(doc.monthLabel) || 0
      process.months.set(doc.monthLabel, monthCount + 1)
    })

    return Array.from(processMap.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      count: data.count,
      months: Array.from(data.months.entries()).map(([month, count]) => ({
        month,
        count,
      })),
    }))
  }, [documents])

  // Actions
  const updateFilters = useCallback((newFilters: Partial<DocumentExplorerFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const updateState = useCallback((newState: Partial<DocumentExplorerState>) => {
    setState((prev) => ({ ...prev, ...newState }))
  }, [])

  const toggleDocumentSelection = useCallback((documentId: string) => {
    setSelectedDocuments((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(documentId)) {
        newSet.delete(documentId)
      } else {
        newSet.add(documentId)
      }
      return newSet
    })
  }, [])

  const selectAllDocuments = useCallback(() => {
    setSelectedDocuments(new Set(documents.map((doc) => doc.id)))
  }, [documents])

  const clearSelection = useCallback(() => {
    setSelectedDocuments(new Set())
  }, [])

  const downloadSelectedAsZip = useCallback(async () => {
    if (selectedDocuments.size === 0) {
      toast.error("No hay documentos seleccionados")
      return
    }

    try {
      // Mock implementation - replace with actual API call
      toast.success(`Preparando descarga de ${selectedDocuments.size} documentos...`)

      // In a real implementation, you would call:
      // const response = await axiosInstance.post('/api/documents/zip', {
      //   ids: Array.from(selectedDocuments)
      // })
      // window.open(response.data.zipUrl, '_blank')
    } catch (error) {
      console.error("Error downloading ZIP:", error)
      toast.error("Error al preparar la descarga")
    }
  }, [selectedDocuments])

  const copySelectedUrls = useCallback(() => {
    if (selectedDocuments.size === 0) {
      toast.error("No hay documentos seleccionados")
      return
    }

    const selectedDocs = documents.filter((doc) => selectedDocuments.has(doc.id))
    const urls = selectedDocs.map((doc) => doc.url).join("\n")

    navigator.clipboard
      .writeText(urls)
      .then(() => {
        toast.success(`${selectedDocuments.size} enlaces copiados al portapapeles`)
      })
      .catch(() => {
        toast.error("Error al copiar enlaces")
      })
  }, [selectedDocuments, documents])

  return {
    // Data
    documents,
    groupedDocuments,
    processes,
    totalDocuments: rawData?.total || 0,
    totalPages: rawData?.totalPages || 1,

    // State
    filters,
    state,
    selectedDocuments,

    // Loading states
    isLoading,
    error,

    // Actions
    updateFilters,
    updateState,
    toggleDocumentSelection,
    selectAllDocuments,
    clearSelection,
    downloadSelectedAsZip,
    copySelectedUrls,
    refetch: fetchData,
  }
}
