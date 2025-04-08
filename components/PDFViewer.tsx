"use client"

import { useState } from "react"
import { Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/esm/Page/AnnotationLayer.css"
import "react-pdf/dist/esm/Page/TextLayer.css"

// Configurar el worker de PDF.js
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`
}

interface PDFViewerProps {
  documentUrl: string
  title: string
}

export function PDFViewer({ documentUrl, title }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setIsLoading(false)
  }

  function changePage(offset: number) {
    setPageNumber((prevPageNumber) => {
      const newPageNumber = prevPageNumber + offset
      return newPageNumber >= 1 && newPageNumber <= (numPages || 1) ? newPageNumber : prevPageNumber
    })
  }

  function previousPage() {
    changePage(-1)
  }

  function nextPage() {
    changePage(1)
  }

  function zoomIn() {
    setScale((prevScale) => Math.min(prevScale + 0.2, 2.0))
  }

  function zoomOut() {
    setScale((prevScale) => Math.max(prevScale - 0.2, 0.6))
  }

  // Verificar que la URL sea válida y tenga el formato correcto
  const pdfUrl = documentUrl

  try {
    // Intentar crear un objeto URL para validar
    new URL(documentUrl)
  } catch (e) {
    console.error("URL inválida:", documentUrl)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <p className="text-sm text-red-500">URL del PDF no válida</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center w-full h-full">
      <div className="bg-gray-100 p-2 w-full flex justify-between items-center mb-2 rounded">
        <div className="flex items-center space-x-2">
          <button
            onClick={previousPage}
            disabled={pageNumber <= 1}
            className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm">
            Página {pageNumber} de {numPages || "?"}
          </span>
          <button
            onClick={nextPage}
            disabled={pageNumber >= (numPages || 1)}
            className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
            aria-label="Página siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={zoomOut} className="p-1 rounded hover:bg-gray-200" aria-label="Reducir zoom">
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} className="p-1 rounded hover:bg-gray-200" aria-label="Aumentar zoom">
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-auto flex-1 w-full flex justify-center bg-gray-50 p-4">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(error) => {
            console.error("Error al cargar el PDF:", error)
            setError(true)
          }}
          loading={
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary-green" />
              <p className="mt-2 text-sm text-muted-foreground">Cargando PDF...</p>
            </div>
          }
          className="shadow-lg"
          options={{
            cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/cmaps/",
            cMapPacked: true,
          }}
        >
          {error ? (
            <div className="flex flex-col items-center justify-center h-64">
              <p className="text-sm text-red-500">Error al cargar el PDF. Verifique la URL o intente más tarde.</p>
            </div>
          ) : (
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="shadow-md"
            />
          )}
        </Document>
      </div>
    </div>
  )
}

