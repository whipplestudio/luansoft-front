"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, Upload } from "lucide-react"
import { toast } from "sonner"

interface UploadPaymentProofDialogProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (file: File) => Promise<void>
  isUploading: boolean
}

export function UploadPaymentProofDialog({ isOpen, onClose, onUpload, isUploading }: UploadPaymentProofDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileType, setFileType] = useState<"pdf" | "image" | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState(false)

  // Definir el tamaño máximo de archivo (5MB)
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB en bytes

  useEffect(() => {
    // Limpiar la URL de vista previa al desmontar el componente
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Verificar que sea un archivo PDF o una imagen
    if (!file.type.includes("pdf") && !file.type.includes("image/")) {
      toast.error("Solo se permiten archivos PDF o imágenes")
      return
    }

    // Verificar el tamaño del archivo
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`El archivo es demasiado grande. El tamaño máximo permitido es 5MB.`)
      return
    }

    setSelectedFile(file)

    // Limpiar la URL anterior si existe
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    // Crear URL de vista previa
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    // Establecer el tipo de archivo
    if (file.type.includes("pdf")) {
      setFileType("pdf")
    } else if (file.type.includes("image/")) {
      setFileType("image")
    }

    setIsPreviewLoading(true)
    setPreviewError(false)
  }

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Por favor, selecciona un archivo")
      return
    }

    try {
      await onUpload(selectedFile)
      // Limpiar el estado después de una subida exitosa
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      setSelectedFile(null)
      setPreviewUrl(null)
      setFileType(null)
      setPreviewError(false)
      setIsPreviewLoading(false)
    } catch (error) {
      console.error("Error al subir el archivo:", error)
    }
  }

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedFile(null)
    setPreviewUrl(null)
    setFileType(null)
    setPreviewError(false)
    setIsPreviewLoading(false)
    onClose()
  }

  // Función para formatear el tamaño del archivo en KB o MB
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return `${bytes} B`
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    }
  }

  // Función para manejar errores de carga
  const handlePreviewLoadError = () => {
    setPreviewError(true)
    setIsPreviewLoading(false)
  }

  // Función para manejar carga exitosa
  const handlePreviewLoadSuccess = () => {
    setIsPreviewLoading(false)
  }

  useEffect(() => {
    // Limpiar el estado cuando el modal se cierra
    if (!isOpen) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      setSelectedFile(null)
      setPreviewUrl(null)
      setFileType(null)
      setPreviewError(false)
      setIsPreviewLoading(false)
    }
  }, [isOpen, previewUrl])

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Subir comprobante de pago</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="file">Archivo (PDF o imagen, máx. 5MB)</Label>
            <div className="flex items-center gap-2">
              <input id="file" type="file" accept=".pdf,image/*" onChange={handleFileChange} className="hidden" />
              <Label
                htmlFor="file"
                className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 border border-dashed rounded-md hover:bg-gray-50 w-full"
              >
                <Upload className="h-4 w-4" />
                {selectedFile ? selectedFile.name : "Seleccionar archivo"}
              </Label>
            </div>
            {selectedFile && <p className="text-xs text-gray-500 mt-1">Tamaño: {formatFileSize(selectedFile.size)}</p>}
          </div>

          {previewUrl && fileType && (
            <div className="mt-4">
              <Label>Vista previa</Label>
              <div className="mt-2 border rounded-md overflow-hidden" style={{ height: "300px" }}>
                {isPreviewLoading && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary-green" />
                      <p className="mt-2 text-sm text-muted-foreground">Cargando vista previa...</p>
                    </div>
                  </div>
                )}

                {previewError && (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-sm text-red-500">Error al cargar la vista previa</p>
                  </div>
                )}

                {fileType === "pdf" ? (
                  <div className="w-full h-full flex flex-col">
                    <div className="flex-1 bg-white rounded-md shadow-sm overflow-hidden">
                      <iframe
                        src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                        className="w-full h-full border-0"
                        title="Vista previa del PDF"
                        onError={handlePreviewLoadError}
                        onLoad={handlePreviewLoadSuccess}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src={previewUrl || "/placeholder.svg"}
                      alt="Vista previa"
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"
                        handlePreviewLoadError()
                      }}
                      onLoad={handlePreviewLoadSuccess}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedFile || isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              "Subir comprobante"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
