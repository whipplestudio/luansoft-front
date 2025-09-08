"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, FileText, Calendar, User, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { DocumentItem } from "@/utils/processHistoryUtils"

interface DocumentCardProps {
  document: DocumentItem
  isSelected: boolean
  onSelect: (documentId: string) => void
  onPreview: (document: DocumentItem) => void
  onDownload: (document: DocumentItem) => void
  isLoadingPreview?: boolean
}

export function DocumentCard({
  document,
  isSelected,
  onSelect,
  onPreview,
  onDownload,
  isLoadingPreview = false,
}: DocumentCardProps) {
  const formatFileSize = (bytes: number) => {
    if (!bytes) return "N/A"
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`
  }

  return (
    <Card className={`hover:shadow-md transition-shadow ${isSelected ? "ring-2 ring-blue-500" : ""}`}>
      <CardContent className="p-4">
        {/* Header with checkbox and file icon */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(document.id)}
              aria-label={`Seleccionar ${document.displayTitle}`}
            />
            <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
          </div>
          <Badge variant="outline" className="text-xs">
            {document.docKind}
          </Badge>
        </div>

        {/* Document title and filename */}
        <div className="mb-3">
          <h3 className="font-medium text-sm line-clamp-2 mb-1">{document.displayTitle}</h3>
          <p className="text-xs text-gray-500 truncate">{document.fileName}</p>
        </div>

        {/* Process and month info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <FileText className="h-3 w-3" />
            <span className="truncate">{document.processName}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Calendar className="h-3 w-3" />
            <span>{document.monthLabel}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <User className="h-3 w-3" />
            <span className="truncate">{document.accountant}</span>
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-1 mb-4 text-xs text-gray-500">
          {document.completedAt && (
            <div>
              <span className="font-medium">Completado:</span>{" "}
              {format(new Date(document.completedAt), "dd/MM/yyyy", { locale: es })}
            </div>
          )}
          {document.originalDate && (
            <div>
              <span className="font-medium">Fecha original:</span>{" "}
              {format(new Date(document.originalDate), "dd/MM/yyyy", { locale: es })}
            </div>
          )}
        </div>

        {/* File size */}
        {document.sizeBytes && (
          <div className="text-xs text-gray-500 mb-4">
            <span className="font-medium">Tamaño:</span> {formatFileSize(document.sizeBytes)}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreview(document)}
            disabled={isLoadingPreview}
            className="flex-1 flex items-center gap-1"
            aria-busy={isLoadingPreview}
            aria-disabled={isLoadingPreview}
            title="Ver documento"
          >
            {isLoadingPreview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
            Ver
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
