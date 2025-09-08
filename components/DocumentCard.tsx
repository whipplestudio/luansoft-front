"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, FileText, ImageIcon, File, Calendar, User, Loader2 } from "lucide-react"
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
  const [imageError, setImageError] = useState(false)

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A"
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`
  }

  const getDocumentIcon = () => {
    const mimeType = document.mimeType || ""
    if (mimeType.startsWith("image/")) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />
    } else if (mimeType === "application/pdf") {
      return <FileText className="h-8 w-8 text-red-500" />
    } else {
      // Fallback based on docKind
      switch (document.docKind) {
        case "PDF":
          return <FileText className="h-8 w-8 text-red-500" />
        case "Imagen":
          return <ImageIcon className="h-8 w-8 text-blue-500" />
        default:
          return <File className="h-8 w-8 text-gray-500" />
      }
    }
  }

  return (
    <Card className={`hover:shadow-md transition-all duration-200 ${isSelected ? "ring-2 ring-blue-500" : ""}`}>
      <CardContent className="p-4">
        {/* Header with selection checkbox */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-gray-900 truncate" title={document.displayTitle}>
              {document.displayTitle}
            </h3>
            <p className="text-xs text-gray-500 truncate mt-1" title={document.fileName}>
              {document.fileName}
            </p>
          </div>
          <Checkbox checked={isSelected} onCheckedChange={() => onSelect(document.id)} className="ml-2 flex-shrink-0" />
        </div>

        {/* Thumbnail or icon */}
        <div className="flex items-center justify-center h-24 bg-gray-50 rounded-lg mb-3">
          {document.thumbnailUrl && !imageError ? (
            <img
              src={document.thumbnailUrl || "/placeholder.svg"}
              alt={document.fileName}
              className="max-h-full max-w-full object-contain rounded"
              onError={() => setImageError(true)}
            />
          ) : (
            getDocumentIcon()
          )}
        </div>

        {/* Document type badge */}
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className="text-xs">
            {document.docKind}
          </Badge>
          <span className="text-xs text-gray-500">{formatFileSize(document.sizeBytes)}</span>
        </div>

        {/* Metadata */}
        <div className="space-y-2 mb-4">
          {document.accountant && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <User className="h-3 w-3" />
              <span className="truncate">{document.accountant}</span>
            </div>
          )}

          {document.completedAt && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Calendar className="h-3 w-3" />
              <span>Completado: {format(new Date(document.completedAt), "dd/MM/yyyy", { locale: es })}</span>
            </div>
          )}

          {document.originalDate && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Calendar className="h-3 w-3" />
              <span>Original: {format(new Date(document.originalDate), "dd/MM/yyyy", { locale: es })}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreview(document)}
            disabled={isLoadingPreview}
            className="flex-1 text-xs h-8"
          >
            {isLoadingPreview ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Eye className="h-3 w-3 mr-1" />}
            Ver
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
