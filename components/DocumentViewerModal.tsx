"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Download, Maximize, Minimize, Loader2 } from "lucide-react"
import { DocumentPreview } from "./DocumentPreview"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./custom-dialog"

interface DocumentViewerModalProps {
  isOpen: boolean
  onClose: () => void
  documentUrl: string | null
  documentType: "pdf" | "image"
  title: string
  fileName: string
  onDownload?: () => void
  isLoading?: boolean
}

export function DocumentViewerModal({
  isOpen,
  onClose,
  documentUrl,
  documentType,
  title,
  fileName,
  onDownload,
  isLoading = false,
}: DocumentViewerModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  // Función para verificar si estamos en modo pantalla completa
  const checkFullscreenStatus = () => {
    const fullscreenElement =
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement

    setIsFullscreen(!!fullscreenElement)
  }

  // Escuchar todos los eventos de cambio de pantalla completa en diferentes navegadores
  useEffect(() => {
    const handleFullscreenChange = () => {
      checkFullscreenStatus()
    }

    // Añadir listeners para todos los prefijos de navegadores
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
    document.addEventListener("mozfullscreenchange", handleFullscreenChange)
    document.addEventListener("MSFullscreenChange", handleFullscreenChange)

    // También detectar la tecla Esc
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        checkFullscreenStatus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    // Importante: verificar el estado inicial
    checkFullscreenStatus()

    return () => {
      // Limpiar todos los listeners
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange)
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange)
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isFullscreen])

  // Función para salir de pantalla completa
  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen()
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen()
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen()
      }

      // Verificar el estado después de la acción
      setTimeout(checkFullscreenStatus, 100)
    } catch (error) {
      console.error("Error al salir de pantalla completa:", error)
      checkFullscreenStatus()
    }
  }

  // Función para entrar/salir de pantalla completa
  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        // Entrar en modo pantalla completa
        if (contentRef.current) {
          const element = contentRef.current

          if (element.requestFullscreen) {
            await element.requestFullscreen()
          } else if ((element as any).webkitRequestFullscreen) {
            await (element as any).webkitRequestFullscreen()
          } else if ((element as any).mozRequestFullScreen) {
            await (element as any).mozRequestFullScreen()
          } else if ((element as any).msRequestFullscreen) {
            await (element as any).msRequestFullscreen()
          }
        }
      } else {
        // Salir del modo pantalla completa
        await exitFullscreen()
      }

      // Verificar el estado después de la acción
      setTimeout(checkFullscreenStatus, 100)
    } catch (error) {
      console.error("Error al cambiar el modo de pantalla completa:", error)
      // Asegurar que el estado se actualice incluso si hay un error
      checkFullscreenStatus()
    }
  }

  // Asegurarse de salir de pantalla completa al cerrar el modal
  const handleClose = () => {
    if (isFullscreen) {
      try {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if ((document as any).webkitExitFullscreen) {
          ;(document as any).webkitExitFullscreen()
        } else if ((document as any).mozCancelFullScreen) {
          ;(document as any).mozCancelFullScreen()
        } else if ((document as any).msExitFullscreen) {
          ;(document as any).msExitFullscreen()
        }
      } catch (error) {
        console.error("Error al salir de pantalla completa:", error)
      }
    }
    onClose()
  }

  // Si no hay URL, no mostrar el modal
  if (!documentUrl) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl w-[90vw] h-[80vh] flex flex-col p-0" hideCloseButton>
        <DialogHeader className="p-4 border-b flex-shrink-0">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-medium truncate" title={fileName}>
              {fileName}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              {onDownload && (
                <Button variant="ghost" size="icon" onClick={onDownload} title="Descargar documento">
                  <Download className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleClose} title="Cerrar">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div ref={contentRef} className="flex-1 overflow-hidden p-4 bg-gray-50 relative flex items-center justify-center">
          {/* Botón flotante para salir de pantalla completa (solo visible en modo pantalla completa) */}
          {isFullscreen && (
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 z-50 bg-white opacity-90 hover:opacity-100 transition-opacity shadow-md flex items-center gap-1"
              onClick={exitFullscreen}
              title="Salir de pantalla completa (Esc)"
            >
              <Minimize className="h-4 w-4 mr-1" />
              <span>Salir (Esc)</span>
            </Button>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Cargando documento...</p>
            </div>
          ) : documentUrl ? (
            <div className="w-full h-full">
              <DocumentPreview documentUrl={documentUrl} documentType={documentType} title={title} />
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}

