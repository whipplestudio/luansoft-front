import { format } from "date-fns"
import { es } from "date-fns/locale"

export interface ProcessHistoryItem {
  id: string
  dateCompleted?: string
  originalDate?: string
  paymentPeriod?: "ANNUAL" | "MONTHLY" | "QUARTERLY" | "SEMIANNUAL" | string
  file: {
    id: string
    originalName: string
    url: string
    thumbnailUrl?: string | null
    type: string
    size?: number
    createdAt?: string
  }
  contador?: {
    firstName?: string
    lastName?: string
  }
  process: {
    id: string
    name: string
  }
}

export interface DocumentItem {
  id: string
  fileName: string
  url: string
  thumbnailUrl?: string | null
  mimeType: string
  sizeBytes?: number
  createdAt?: string
  processId: string
  processName: string
  accountant?: string
  completedAt?: string
  originalDate?: string
  sourceId: string
  monthLabel: string // MMM yyyy, usando originalDate || completedAt
  monthValue: string // YYYY-MM, para filtros y agrupaciones
  docKind: "Imagen" | "PDF" | "Otros"
  displayTitle: string // `${processName} · ${monthLabel}`
  paymentPeriod?: string
}

export function flattenProcessHistory(items: ProcessHistoryItem[]): DocumentItem[] {
  return items.map((item) => {
    const dateToUse = item.originalDate || item.dateCompleted
    const monthLabel = dateToUse ? format(new Date(dateToUse), "MMM yyyy", { locale: es }) : "Sin fecha"
    const monthValue = dateToUse ? format(new Date(dateToUse), "yyyy-MM") : ""

    const docKind = getDocumentKind(item.file.type)
    const accountant = item.contador
      ? `${item.contador.firstName || ""} ${item.contador.lastName || ""}`.trim()
      : undefined

    return {
      id: item.file.id,
      fileName: item.file.originalName,
      url: item.file.url,
      thumbnailUrl: item.file.thumbnailUrl,
      mimeType: item.file.type,
      sizeBytes: item.file.size,
      createdAt: item.file.createdAt,
      processId: item.process.id,
      processName: item.process.name,
      accountant,
      completedAt: item.dateCompleted,
      originalDate: item.originalDate,
      sourceId: item.id,
      monthLabel,
      monthValue,
      docKind,
      displayTitle: `${item.process.name} · ${monthLabel}`,
      paymentPeriod: item.paymentPeriod,
    }
  })
}

function getDocumentKind(mimeType: string): "Imagen" | "PDF" | "Otros" {
  if (mimeType.startsWith("image/")) {
    return "Imagen"
  }
  if (mimeType === "application/pdf") {
    return "PDF"
  }
  return "Otros"
}

export function groupDocumentsByProcess(documents: DocumentItem[]): Record<string, DocumentItem[]> {
  return documents.reduce(
    (groups, doc) => {
      const key = doc.processName
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(doc)
      return groups
    },
    {} as Record<string, DocumentItem[]>,
  )
}

export function groupDocumentsByMonth(documents: DocumentItem[]): Record<string, DocumentItem[]> {
  return documents.reduce(
    (groups, doc) => {
      const key = doc.monthLabel
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(doc)
      return groups
    },
    {} as Record<string, DocumentItem[]>,
  )
}

export function sortDocuments(documents: DocumentItem[], sortBy: string, sortOrder: "asc" | "desc"): DocumentItem[] {
  return [...documents].sort((a, b) => {
    let aValue: any
    let bValue: any

    switch (sortBy) {
      case "originalDate":
        aValue = a.originalDate ? new Date(a.originalDate).getTime() : 0
        bValue = b.originalDate ? new Date(b.originalDate).getTime() : 0
        break
      case "dateCompleted":
        aValue = a.completedAt ? new Date(a.completedAt).getTime() : 0
        bValue = b.completedAt ? new Date(b.completedAt).getTime() : 0
        break
      case "processName":
        aValue = a.processName.toLowerCase()
        bValue = b.processName.toLowerCase()
        break
      case "size":
        aValue = a.sizeBytes || 0
        bValue = b.sizeBytes || 0
        break
      default:
        aValue = a.fileName.toLowerCase()
        bValue = b.fileName.toLowerCase()
    }

    if (aValue < bValue) {
      return sortOrder === "asc" ? -1 : 1
    }
    if (aValue > bValue) {
      return sortOrder === "asc" ? 1 : -1
    }
    return 0
  })
}
