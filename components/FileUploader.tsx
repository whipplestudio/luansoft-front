"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Upload, X, FileText } from "lucide-react"
import Image from "next/image"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/esm/Page/AnnotationLayer.css"
import "react-pdf/dist/esm/Page/TextLayer.css"
import { Progress } from "@/components/ui/progress"

// Configuración necesaria para react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface FileUploaderProps {
  onFileUpload: (file: File) => void
}

export function FileUploader({ onFileUpload }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | File | null>(null)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const uploadedFile = acceptedFiles[0]
        setFile(uploadedFile)
        setUploadStatus("uploading")
        setUploadProgress(0)

        // Simular una carga de archivo
        const uploadSimulation = setInterval(() => {
          setUploadProgress((prevProgress) => {
            if (prevProgress >= 100) {
              clearInterval(uploadSimulation)
              setUploadStatus("success")
              onFileUpload(uploadedFile)
              return 100
            }
            return prevProgress + 10
          })
        }, 500)

        if (uploadedFile.type.startsWith("image/")) {
          const reader = new FileReader()
          reader.onload = (e) => {
            setPreview(e.target?.result as string)
          }
          reader.readAsDataURL(uploadedFile)
        } else if (uploadedFile.type === "application/pdf") {
          setPreview(uploadedFile)
        } else {
          setPreview(null)
        }
      }
    },
    [onFileUpload],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const removeFile = () => {
    setFile(null)
    setPreview(null)
    setNumPages(null)
    setUploadProgress(0)
    setUploadStatus("idle")
  }

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  // Simular un error aleatorio en la carga
  useEffect(() => {
    if (uploadStatus === "uploading" && Math.random() < 0.1) {
      setUploadStatus("error")
    }
  }, [uploadStatus])

  const getProgressColor = () => {
    switch (uploadStatus) {
      case "uploading":
        return "bg-blue-500"
      case "success":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-200"
    }
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer ${
          isDragActive ? "border-primary" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Archivo seleccionado: {file.name}</p>
            {preview ? (
              file.type.startsWith("image/") ? (
                <div className="relative w-full h-40">
                  <Image src={preview || "/placeholder.svg"} alt="Vista previa" fill style={{ objectFit: "contain" }} />
                </div>
              ) : file.type === "application/pdf" ? (
                <div className="w-full h-40 overflow-hidden">
                  <Document file={file} onLoadSuccess={onDocumentLoadSuccess} className="w-full h-full">
                    <Page pageNumber={1} width={200} />
                  </Document>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full h-40 bg-gray-100 rounded-md">
                  <FileText className="w-16 h-16 text-gray-400" />
                </div>
              )
            ) : (
              <p className="text-sm text-gray-500">Vista previa no disponible para este tipo de archivo</p>
            )}
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressColor()} transition-all duration-500 ease-out`}
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {uploadStatus === "uploading" && "Cargando..."}
              {uploadStatus === "success" && "Carga completada"}
              {uploadStatus === "error" && "Error en la carga"}
            </p>
            <Button onClick={removeFile} variant="outline" size="sm" className="mt-2">
              <X className="mr-2 h-4 w-4" />
              Eliminar archivo
            </Button>
          </div>
        ) : (
          <div>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Arrastra y suelta un archivo aquí, o haz clic para seleccionar un archivo
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

