"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Download, FileText, Loader2, Calendar, Building2, User, Mail, Phone, Clock, CheckCircle2, Info, Upload, FileType, X, FileBarChart, AlertTriangle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { DocumentViewerModal } from "@/components/DocumentViewerModal"
import { MonthlyReportsModal } from "@/components/MonthlyReportsModal"
import { FiscalIndicators } from "@/components/FiscalIndicators"
import { axiosInstance } from "@/lib/axios"
import axios from "axios"
import { toast } from "sonner"
import type { Client } from "@/types"
import { uploadFinancialData, getFinancialData, getMonthName, type ClienteFinancialData } from "@/api/financial-data"
import { ReportModal } from "@/components/contpaq-data"
import type { MonthlyReport } from "@/types"

interface ClienteDetailModalProps {
  isOpen: boolean
  onClose: () => void
  client: Client | null | undefined
}

// Interfaz para la respuesta de la API de URL de descarga
interface DownloadUrlResponse {
  success: boolean
  message: string
  errorCode: string | null
  data: {
    url: string
  }
}

export function ClienteDetailModal({ isOpen, onClose, client }: ClienteDetailModalProps) {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [documentType, setDocumentType] = useState<"pdf" | "image">("image")
  const [documentTitle, setDocumentTitle] = useState<string>("")
  const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false)
  const [fileName, setFileName] = useState<string>("")
  const [fileId, setFileId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMonthlyReportsModalOpen, setIsMonthlyReportsModalOpen] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadingFileName, setDownloadingFileName] = useState("")
  const [activeTab, setActiveTab] = useState("general")
  
  // Estados para informes mensuales
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<MonthlyReport | null>(null)
  const [isLoadingReportsData, setIsLoadingReportsData] = useState(false)
  const [availableReports, setAvailableReports] = useState<MonthlyReport[]>([])
  
  // Estados para subida de PDFs
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  // Estado para email del usuario (restricción de acceso)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  if (!client) return null

  // Handle monthly report example download with progress
  const handleDownloadMonthlyReportExample = async () => {
    setDownloadingFileName("informe_mensual_ejemplo.pdf")
    setDownloadProgress(0)
    setIsDownloading(true)
    
    try {
      // Simulate download progress - replace with real API call
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 150))
        setDownloadProgress(i)
      }
      
      // In production, download the actual file from API
      // const response = await axiosInstance.get(`/reports/monthly/example`, {
      //   responseType: 'blob',
      //   onDownloadProgress: (progressEvent) => {
      //     const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
      //     setDownloadProgress(percentCompleted)
      //   }
      // })
      
      toast.success("Archivo de ejemplo descargado exitosamente")
    } catch (error) {
      console.error("Error al descargar:", error)
      toast.error("Error al descargar el archivo de ejemplo")
    } finally {
      setIsDownloading(false)
      setDownloadProgress(0)
    }
  }

  // Función para obtener la URL de descarga de un archivo
  const getFileDownloadUrl = async (fileId: string): Promise<string | null> => {
    try {
      setIsLoading(true)
      const response = await axiosInstance.get<DownloadUrlResponse>(`/file/${fileId}/download-url`)

      if (response.data.success && response.data.data.url) {
        return response.data.data.url
      } else {
        toast.error(`Error al obtener la URL del archivo: ${response.data.message}`)
        return null
      }
    } catch (error) {
      console.error("Error al obtener la URL de descarga:", error)
      toast.error("No se pudo obtener la URL del archivo")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Función para abrir el visor de documentos del contrato
  const openContractViewer = async () => {
    if (client.contractFile) {
      setIsLoading(true)
      try {
        // Obtener la URL de descarga válida
        const downloadUrl = await getFileDownloadUrl(client.contractFile.id)

        if (downloadUrl) {
          setDocumentUrl(downloadUrl)
          setDocumentType(client.contractFile.type.includes("pdf") ? "pdf" : "image")
          setDocumentTitle("Contrato del Cliente")
          setFileName(client.contractFile.originalName || "contrato.pdf")
          setFileId(client.contractFile.id)
          setIsDocumentViewerOpen(true)
        } else {
          toast.error("No se pudo obtener la URL del contrato")
        }
      } catch (error) {
        console.error("Error al preparar el contrato para visualización:", error)
        toast.error("Error al preparar el contrato para visualización")
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Función para descargar el contrato
  const handleDownloadContract = async () => {
    try {
      setIsLoading(true)
      if (!client.contractFile?.id) {
        toast.error("ID de archivo no disponible")
        return
      }

      const url = await getFileDownloadUrl(client.contractFile.id)

      if (url) {
        // Realizar la petición para obtener el archivo como blob
        const response = await axiosInstance.get(url, { responseType: "blob" })
        // Crear un objeto Blob a partir de la respuesta
        const blob = new Blob([response.data])
        // Crear un URL de objeto para el blob
        const blobUrl = window.URL.createObjectURL(blob)
        // Crear un enlace de descarga
        const link = document.createElement("a")
        link.href = blobUrl
        link.setAttribute("download", client.contractFile.originalName || "contrato.pdf")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
        toast.success("Contrato descargado exitosamente")
      } else {
        toast.error("No se pudo obtener la URL de descarga")
      }
    } catch (error) {
      console.error("Error al descargar el contrato:", error)
      toast.error("No se pudo descargar el contrato")
    } finally {
      setIsLoading(false)
    }
  }

  // Función para formatear el tamaño del archivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Función para manejar selección de archivos
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf')
      if (pdfFiles.length !== files.length) {
        toast.warning('Solo se permiten archivos PDF')
      }
      setSelectedFiles(prev => [...prev, ...pdfFiles])
    }
  }

  // Función para eliminar archivo seleccionado
  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Función para subir archivos
  const handleUploadFiles = async () => {
    if (!client?.id || selectedFiles.length === 0) {
      toast.error('Selecciona al menos un archivo PDF')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simular progreso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const result = await uploadFinancialData(client.id, selectedFiles)
      
      clearInterval(progressInterval)
      setUploadProgress(100)

      toast.success(`${result.filesProcessed} archivo(s) procesado(s) exitosamente`)
      setSelectedFiles([])
      setUploadProgress(0)
      
      // Recargar reportes disponibles
      loadAvailableReports()
    } catch (error) {
      console.error('Error uploading files:', error)
      toast.error('Error al procesar los archivos')
    } finally {
      setIsUploading(false)
    }
  }

  // Función para cargar reportes disponibles
  const loadAvailableReports = async () => {
    if (!client?.id) return
    
    setIsLoadingReportsData(true)
    try {
      const clientData: ClienteFinancialData | null = await getFinancialData(client.id)
      
      if (!clientData) {
        setAvailableReports([])
        return
      }

      const reports: MonthlyReport[] = []
      
      // Iterate through all years in the client data
      Object.keys(clientData.years).sort((a, b) => parseInt(b) - parseInt(a)).forEach((year) => {
        const yearData = clientData.years[year]
        
        // Get all available months for this year
        const months = yearData.estadoResultadosPeriodo.map((er) => er.mes).sort().reverse()
        
        months.forEach((monthStr) => {
          const [yearPart, monthPart] = monthStr.split("-")
          const monthName = getMonthName(monthStr)
          
          reports.push({
            id: `report-${yearPart}-${monthPart}`,
            month: monthName,
            year: parseInt(yearPart),
            date: new Date(parseInt(yearPart), parseInt(monthPart) - 1, 1).toISOString(),
            clientId: client.id,
          })
        })
      })

      setAvailableReports(reports)
    } catch (error) {
      console.error("Error loading client reports:", error)
      toast.error("Error al cargar los reportes financieros")
      setAvailableReports([])
    } finally {
      setIsLoadingReportsData(false)
    }
  }

  const handleMonthlyReportClick = (report: MonthlyReport) => {
    setSelectedReport(report)
    setIsReportModalOpen(true)
  }

  function convertMonthNameToNumber(monthName: string): string {
    const monthMap: Record<string, string> = {
      Enero: "01",
      Febrero: "02",
      Marzo: "03",
      Abril: "04",
      Mayo: "05",
      Junio: "06",
      Julio: "07",
      Agosto: "08",
      Septiembre: "09",
      Octubre: "10",
      Noviembre: "11",
      Diciembre: "12",
    }
    return monthMap[monthName] || "01"
  }

  // Cargar email del usuario y reportes cuando se abre el modal
  useEffect(() => {
    if (isOpen && client) {
      // Obtener email del usuario
      const email = localStorage.getItem('userEmail')
      setUserEmail(email)
      
      // Cargar reportes disponibles
      loadAvailableReports()
    }
  }, [isOpen, client])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[95vw] lg:max-w-[1200px] max-h-[95vh] overflow-y-auto bg-gradient-to-b from-white to-gray-50/50">
        {/* Header con información principal */}
        <DialogHeader className="pb-2">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-bold text-gray-900 truncate">
                {client.company}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge 
                  variant={client.status === "ACTIVE" ? "default" : "secondary"}
                  className={cn(
                    "transition-all duration-300",
                    client.status === "ACTIVE" 
                      ? "bg-green-100 text-green-700 hover:bg-green-200" 
                      : "bg-gray-100 text-gray-600"
                  )}
                >
                  <span className={cn(
                    "w-2 h-2 rounded-full mr-1.5 animate-pulse",
                    client.status === "ACTIVE" ? "bg-green-500" : "bg-gray-400"
                  )} />
                  {client.status === "ACTIVE" ? "Activo" : "Inactivo"}
                </Badge>
                <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                  {client.type === "FISICA" ? "Persona Física" : "Persona Moral"}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Separator className="my-4" />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Información General
            </TabsTrigger>
            <TabsTrigger value="fiscal" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Identificadores Fiscales
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Informes Mensuales
            </TabsTrigger>
          </TabsList>

          {/* Tab: Información General */}
          <TabsContent value="general" className="space-y-5 mt-0">
          {/* Grid de información principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Régimen Fiscal */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur hover:shadow-md transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Régimen Fiscal</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {typeof client.regimenFiscal === "object" && client.regimenFiscal
                        ? client.regimenFiscal.nombre
                        : "No asignado"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contador */}
            {client.contador && (
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur hover:shadow-md transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contador</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{client.contador.name}</p>
                      <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {client.contador.email}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contacto */}
            {client.contacto && (
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur hover:shadow-md transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contacto</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{client.contacto.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="truncate flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {client.contacto.email}
                        </span>
                        {client.contacto.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {client.contacto.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Información del contrato */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b">
              <CardTitle className="text-base flex items-center gap-2 text-gray-800">
                <div className="h-8 w-8 rounded-lg bg-slate-200 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-slate-600" />
                </div>
                Contrato
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              {client.isContractSigned && client.contractFile ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      Contrato Firmado
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:shadow-sm transition-all duration-300">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{client.contractFile.originalName}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(client.contractFile.size)} • {client.contractFile.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openContractViewer}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-200"
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadContract}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all duration-200"
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        Descargar
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-600 mb-2">
                    Sin Contrato Firmado
                  </Badge>
                  <p className="text-sm text-gray-500">Este cliente no tiene un contrato firmado registrado.</p>
                </div>
              )}
            </CardContent>
          </Card>

          </TabsContent>

          {/* Tab: Identificadores Fiscales */}
          <TabsContent value="fiscal" className="space-y-5 mt-0">
            {client?.company && (
              <FiscalIndicators 
                clientCompany={client.company}
                clientId={client.id}
              />
            )}
          </TabsContent>

          {/* Tab: Informes Mensuales */}
          <TabsContent value="reports" className="space-y-5 mt-0">
            <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100/50">
              <div className="max-w-6xl mx-auto">
                {/* Upload Section - Solo para a.pulido@whipple.mx */}
                {userEmail === 'a.pulido@whipple.mx' && (
                  <Card className="border-2 border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden mb-6">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                          <Upload className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-slate-900">Subir Documentos</h4>
                          <p className="text-sm text-slate-600">
                            Sube PDFs de Estado de Resultados, Balance General y Anexos
                          </p>
                        </div>
                      </div>

                      <div className="relative">
                        <input
                          type="file"
                          id="pdf-upload"
                          multiple
                          accept="application/pdf"
                          onChange={handleFileSelect}
                          className="hidden"
                          disabled={isUploading}
                        />
                        <label
                          htmlFor="pdf-upload"
                          className={`flex flex-col items-center justify-center w-full h-40 border-3 border-dashed rounded-2xl cursor-pointer transition-all ${
                            isUploading
                              ? 'border-slate-300 bg-slate-50 cursor-not-allowed'
                              : 'border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400'
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FileType className={`w-12 h-12 mb-3 ${isUploading ? 'text-slate-400' : 'text-blue-500'}`} />
                            <p className="mb-2 text-sm font-semibold text-slate-700">
                              <span className="text-blue-600">Click para seleccionar</span> o arrastra archivos
                            </p>
                            <p className="text-xs text-slate-500">Solo archivos PDF (múltiples archivos permitidos)</p>
                          </div>
                        </label>
                      </div>

                      {selectedFiles.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-slate-700 mb-3">
                            Archivos seleccionados ({selectedFiles.length})
                          </p>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {selectedFiles.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <FileText className="h-5 w-5 text-red-500 flex-shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                                    <p className="text-xs text-slate-500">
                                      {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  </div>
                                </div>
                                {!isUploading && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveFile(index)}
                                    className="h-8 w-8 p-0 rounded-full hover:bg-red-100"
                                  >
                                    <X className="h-4 w-4 text-red-600" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {isUploading && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-700">Procesando archivos...</span>
                            <span className="font-bold text-blue-600">{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={handleUploadFiles}
                        disabled={selectedFiles.length === 0 || isUploading}
                        className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-lg rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                            Procesando archivos...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-3 h-6 w-6" />
                            Subir y Procesar ({selectedFiles.length})
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                )}

                {/* View Reports Section - Material Design 3 - Visible para todos */}
                <div className="bg-white rounded-[28px] shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200/50">
                  <div className="p-8">
                    {isLoadingReportsData ? (
                      <div className="flex flex-col items-center justify-center py-20 space-y-6">
                        <div className="relative">
                          <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center shadow-sm">
                            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                          </div>
                        </div>
                        <div className="text-center space-y-2">
                          <p className="text-lg font-semibold text-slate-900">Cargando reportes</p>
                          <p className="text-sm text-slate-500">Obteniendo información financiera...</p>
                        </div>
                      </div>
                    ) : availableReports.length === 0 ? (
                      <div className="text-center py-20 px-6">
                        <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-sm">
                          <AlertTriangle className="h-12 w-12 text-slate-400" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 mb-3">Sin reportes disponibles</h4>
                        <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
                          Sube documentos financieros para comenzar a generar reportes mensuales automatizados
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Header with count */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                          <div>
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Reportes Mensuales</h3>
                            <p className="text-sm text-slate-600 mt-1">
                              {availableReports.length} {availableReports.length === 1 ? 'reporte disponible' : 'reportes disponibles'}
                            </p>
                          </div>
                        </div>

                        {/* Reports Grid - MD3 Style */}
                        <div className="grid grid-cols-4 gap-4">
                          {availableReports.map((report) => (
                            <button
                              key={report.id}
                              onClick={() => handleMonthlyReportClick(report)}
                              className="group relative flex flex-col items-center gap-4 p-6 rounded-[20px] bg-gradient-to-br from-slate-50 to-white border border-slate-200/80 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100/50 hover:-translate-y-1 transition-all duration-300 active:scale-[0.98]"
                            >
                              {/* Icon Container - MD3 FAB style */}
                              <div className="relative">
                                <div className="h-16 w-16 rounded-[16px] bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                                  <FileBarChart className="h-8 w-8 text-white" />
                                </div>
                                {/* Ripple effect indicator */}
                                <div className="absolute inset-0 rounded-[16px] bg-blue-400/0 group-hover:bg-blue-400/10 transition-colors duration-300" />
                              </div>

                              {/* Text Content */}
                              <div className="flex flex-col items-center gap-0.5 w-full">
                                <span className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors tracking-tight">
                                  {report.month}
                                </span>
                                <span className="text-sm text-slate-600 font-medium">{report.year}</span>
                              </div>

                              {/* State layer */}
                              <div className="absolute inset-0 rounded-[20px] bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors duration-300" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          {/* Fechas */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Creado:</span>
                  <span>
                    {new Date(client.createdAt).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="h-4 w-px bg-gray-200" />
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Actualizado:</span>
                  <span>
                    {new Date(client.updatedAt).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>

      {/* Modal para visualizar el contrato */}
      <DocumentViewerModal
        isOpen={isDocumentViewerOpen}
        onClose={() => setIsDocumentViewerOpen(false)}
        documentUrl={documentUrl}
        documentType={documentType}
        title={documentTitle}
        fileName={fileName}
        onDownload={handleDownloadContract}
      />

      {/* Download Progress Dialog */}
      <Dialog open={isDownloading} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-sm" onPointerDownOutside={(e) => e.preventDefault()}>
          <div className="flex flex-col items-center py-6">
            {/* Animated Icon */}
            <div className="relative mb-6">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <Download className="h-8 w-8 text-blue-600 animate-bounce" />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
            </div>
            
            {/* File Info */}
            <div className="text-center mb-6">
              <h3 className="font-semibold text-gray-900 mb-1">Descargando archivo</h3>
              <p className="text-sm text-gray-500 truncate max-w-[250px]">{downloadingFileName}</p>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full space-y-2">
              <div className="relative">
                <Progress value={downloadProgress} className="h-3 bg-gray-100" />
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"
                  style={{ backgroundSize: '200% 100%' }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Progreso</span>
                <span className="font-semibold text-blue-600">{downloadProgress}%</span>
              </div>
            </div>
            
            <p className="text-xs text-gray-400 mt-4 text-center">
              Por favor espere mientras se descarga el archivo...
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Modal */}
      {selectedReport && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => {
            setIsReportModalOpen(false)
            setSelectedReport(null)
          }}
          clientId={client.id}
          month={`${selectedReport.year}-${convertMonthNameToNumber(selectedReport.month)}`}
          year={selectedReport.year}
        />
      )}
    </Dialog>
  )
}
