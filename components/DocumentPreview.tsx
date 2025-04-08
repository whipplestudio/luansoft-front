"use client"

import { useState, useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"

interface DocumentPreviewProps {
  documentUrl: string
  documentType: "pdf" | "image"
  title: string
}

export function DocumentPreview({ documentUrl, documentType, title }: DocumentPreviewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    setIsLoading(true)
    setError(false)

    // Simular tiempo de carga para dar feedback visual
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [documentUrl, documentType])

  // Función para manejar errores de carga
  const handleLoadError = () => {
    setError(true)
    setIsLoading(false)
  }

  // Función para manejar carga exitosa
  const handleLoadSuccess = () => {
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-green" />
          <p className="mt-2 text-sm text-muted-foreground">Cargando documento...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <p className="text-sm text-red-500">Error al cargar el documento</p>
        </div>
      </div>
    )
  }

  if (!documentUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-sm text-red-500">URL del documento no disponible</p>
      </div>
    )
  }

  if (documentType === "pdf") {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 bg-white rounded-md shadow-sm overflow-hidden">
          <iframe
            ref={iframeRef}
            src={`${documentUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            className="w-full h-full border-0"
            title={title}
            onError={handleLoadError}
            onLoad={handleLoadSuccess}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <img
        ref={imgRef}
        src={documentUrl || "/placeholder.svg"}
        alt={title}
        className="max-w-full max-h-full object-contain"
        onError={(e) => {
          e.currentTarget.src = "/placeholder.svg"
          handleLoadError()
        }}
        onLoad={handleLoadSuccess}
      />
    </div>
  )
}
