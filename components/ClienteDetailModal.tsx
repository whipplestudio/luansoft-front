"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Download, FileText, Loader2, Calendar, Building2, User, Mail, Phone, Clock, CheckCircle2, AlertCircle, XCircle, MinusCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useState, useEffect, useCallback } from "react"
import { DocumentViewerModal } from "@/components/DocumentViewerModal"
import { MonthlyReportsModal } from "@/components/MonthlyReportsModal"
import { axiosInstance } from "@/lib/axios"
import axios from "axios"
import { toast } from "sonner"
import type { Client, TaxIndicator, TaxIndicatorStatus } from "@/types"

interface ClienteDetailModalProps {
  isOpen: boolean
  onClose: () => void
  client: Client | null | undefined
  contalinkData?: ContalinkData | null // Datos precargados desde el listado
  contalinkFilters?: { year: number; month: number } // Filtros usados en el listado
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

// Interfaces para la respuesta de Contalink
interface ContalinkFile {
  numeroOperacion: string
  lineaCaptura: string
  tipoDeclaracion: string
  tipoComplementaria: string
  fechaPresentacion: string
  tipoDocumento: string
  periodo: string
  filePath: string
  downloadUrl: string
}

interface ContalinkObligation {
  column: string
  status: 'white' | 'gray' | 'green'
  archivos?: ContalinkFile[]
}

interface ContalinkData {
  nombre: string
  rfc: string
  obligaciones: ContalinkObligation[]
  archivosObligaciones: ContalinkFile[]
  archivosIconos: ContalinkFile[]
}

// Interfaz eliminada - ya no se usa ContalinkCompany

export function ClienteDetailModal({ isOpen, onClose, client, contalinkData: preloadedContalinkData, contalinkFilters }: ClienteDetailModalProps) {
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
  const [contalinkData, setContalinkData] = useState<ContalinkData | null>(null)
  const [isLoadingContalink, setIsLoadingContalink] = useState(false)
  
  // Función para obtener el mes anterior
  const getPreviousMonth = () => {
    const today = new Date()
    const currentMonth = today.getMonth() + 1 // 1-12
    const currentYear = today.getFullYear()
    
    if (currentMonth === 1) {
      // Si es enero, regresar diciembre del año anterior
      return { month: '12', year: (currentYear - 1).toString() }
    } else {
      // Regresar el mes anterior del mismo año
      return { month: (currentMonth - 1).toString(), year: currentYear.toString() }
    }
  }
  
  const previousMonth = getPreviousMonth()
  const [selectedYear, setSelectedYear] = useState(previousMonth.year)
  const [selectedMonth, setSelectedMonth] = useState(previousMonth.month)

  // Función para obtener las obligaciones con archivos de un cliente específico
  const fetchContalinkObligations = useCallback(async () => {
    if (!client?.company) {
      toast.warning('El cliente no tiene nombre de empresa registrado')
      return
    }

    try {
      setIsLoadingContalink(true)
      
      // Llamar a la nueva API con los filtros seleccionados
      const response = await axiosInstance.post(
        '/contalink/obligations/client',
        {
          clientName: client.company,
          year: parseInt(selectedYear),
          month: parseInt(selectedMonth),
          includePresignedUrls: true
        }
      )

      // La respuesta tiene estructura: response.data.data.data
      if (response.data?.success && response.data.data?.success && response.data.data.data) {
        const apiData = response.data.data.data
        setContalinkData({
          nombre: apiData.nombre || client.company,
          rfc: apiData.rfc || '',
          obligaciones: apiData.obligaciones || [],
          archivosObligaciones: apiData.archivosObligaciones || [],
          archivosIconos: apiData.archivosIconos || []
        })
        
        const totalArchivos = (apiData.archivosIconos?.length || 0) + (apiData.archivosObligaciones?.length || 0)
        toast.success(`Datos cargados: ${totalArchivos} archivo(s) encontrado(s)`)
      } else {
        setContalinkData(null)
        toast.info(`No se encontraron datos para ${selectedMonth}/${selectedYear}`)
      }
    } catch (error: any) {
      console.error('Error al obtener obligaciones de Contalink:', error)
      toast.error(error.response?.data?.message || 'Error al cargar las obligaciones fiscales')
      setContalinkData(null)
    } finally {
      setIsLoadingContalink(false)
    }
  }, [client?.company, selectedYear, selectedMonth])

  // Cargar automáticamente con el mes anterior al abrir el modal
  useEffect(() => {
    if (isOpen && client?.company) {
      // Resetear al mes anterior al abrir el modal
      const prevMonth = getPreviousMonth()
      setSelectedYear(prevMonth.year)
      setSelectedMonth(prevMonth.month)
      setContalinkData(null)
      
      // Llamar automáticamente a la API con los valores del mes anterior
      const loadInitialData = async () => {
        try {
          setIsLoadingContalink(true)
          
          const response = await axiosInstance.post(
            '/contalink/obligations/client',
            {
              clientName: client.company,
              year: parseInt(prevMonth.year),
              month: parseInt(prevMonth.month),
              includePresignedUrls: true
            }
          )

          if (response.data?.success && response.data.data?.success && response.data.data.data) {
            const apiData = response.data.data.data
            setContalinkData({
              nombre: apiData.nombre || client.company,
              rfc: apiData.rfc || '',
              obligaciones: apiData.obligaciones || [],
              archivosObligaciones: apiData.archivosObligaciones || [],
              archivosIconos: apiData.archivosIconos || []
            })
            
            const totalArchivos = (apiData.archivosIconos?.length || 0) + (apiData.archivosObligaciones?.length || 0)
            toast.success(`Datos cargados: ${totalArchivos} archivo(s) encontrado(s)`)
          } else {
            setContalinkData(null)
            toast.info(`No se encontraron datos para ${prevMonth.month}/${prevMonth.year}`)
          }
        } catch (error: any) {
          console.error('Error al obtener obligaciones de Contalink:', error)
          toast.error(error.response?.data?.message || 'Error al cargar las obligaciones fiscales')
          setContalinkData(null)
        } finally {
          setIsLoadingContalink(false)
        }
      }
      
      loadInitialData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, client?.company])

  if (!client) return null

  // Mapear los datos de Contalink al formato de TaxIndicator
  const mapStatusToTaxIndicatorStatus = (status: 'white' | 'gray' | 'green'): TaxIndicatorStatus => {
    switch (status) {
      case 'green':
        return 'green'
      case 'gray':
        return 'gray'
      case 'white':
        return 'red' // white en Contalink significa pendiente/sin presentar
      default:
        return 'gray'
    }
  }

  // Función para descargar archivos de Contalink
  const handleDownloadContalinkFile = async (file: ContalinkFile, fileName?: string) => {
    if (!file.downloadUrl) {
      toast.error('URL de descarga no disponible')
      return
    }

    setDownloadingFileName(fileName || file.numeroOperacion)
    setDownloadProgress(0)
    setIsDownloading(true)

    try {
      // Descargar directamente usando la presigned URL
      const response = await axios.get(file.downloadUrl, {
        responseType: 'blob',
        headers: {
          'ngrok-skip-browser-warning': 'true'
        },
        onDownloadProgress: (progressEvent: any) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
          setDownloadProgress(percentCompleted)
        }
      })

      // Crear un blob y descargarlo
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName || `${file.numeroOperacion}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Archivo descargado exitosamente')
    } catch (error: any) {
      console.error('Error al descargar archivo:', error)
      toast.error('Error al descargar el archivo')
    } finally {
      setIsDownloading(false)
      setDownloadProgress(0)
    }
  }

  // Get status color for traffic light with gradient
  const getStatusColor = (status: TaxIndicatorStatus): string => {
    switch (status) {
      case "green":
        return "bg-gradient-to-br from-green-400 to-green-600"
      case "yellow":
        return "bg-gradient-to-br from-yellow-400 to-yellow-600"
      case "red":
        return "bg-gradient-to-br from-red-400 to-red-600"
      case "gray":
        return "bg-gradient-to-br from-gray-300 to-gray-500"
      default:
        return "bg-gradient-to-br from-gray-300 to-gray-500"
    }
  }

  // Get status icon
  const getStatusIcon = (status: TaxIndicatorStatus) => {
    switch (status) {
      case "green":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "yellow":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "red":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "gray":
        return <MinusCircle className="h-4 w-4 text-gray-500" />
      default:
        return <MinusCircle className="h-4 w-4 text-gray-500" />
    }
  }

  // Función auxiliar para obtener el nombre del icono basado en tipoDocumento
  const getIconName = (tipoDocumento: string): string => {
    const upperTipo = tipoDocumento.toUpperCase()
    if (upperTipo.includes('CONSTANCIA')) return 'Constancia'
    if (upperTipo.includes('OPINIÓN') || upperTipo.includes('OPINION')) return 'Opinión'
    if (upperTipo.includes('INFONAVIT')) return 'Infonavit'
    if (upperTipo.includes('IMSS')) return 'IMSS'
    return tipoDocumento
  }

  // Función auxiliar para obtener el color del icono
  const getIconColor = (tipoDocumento: string): string => {
    const upperTipo = tipoDocumento.toUpperCase()
    if (upperTipo.includes('CONSTANCIA')) return 'from-blue-500 to-blue-600'
    if (upperTipo.includes('OPINIÓN') || upperTipo.includes('OPINION')) return 'from-purple-500 to-purple-600'
    if (upperTipo.includes('INFONAVIT')) return 'from-orange-500 to-orange-600'
    if (upperTipo.includes('IMSS')) return 'from-green-500 to-green-600'
    return 'from-gray-500 to-gray-600'
  }

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

        <div className="grid gap-5">
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

          {/* Tax Indicators - Traffic Light System */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2 text-gray-800">
                    <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-indigo-600" />
                    </div>
                    Indicadores Fiscales
                  </CardTitle>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-sm" />
                      <span className="text-gray-600">Al día</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-sm" />
                      <span className="text-gray-600">Próximo</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-sm" />
                      <span className="text-gray-600">Vencido</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 shadow-sm" />
                      <span className="text-gray-600">N/A</span>
                    </div>
                  </div>
                </div>
                {/* Filtros de año y mes */}
                <div className="flex items-end gap-3">
                  <div className="space-y-1.5 flex-1">
                    <label htmlFor="fiscal-year" className="text-xs font-medium text-gray-600">
                      Año
                    </label>
                    <select
                      id="fiscal-year"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      disabled={isLoadingContalink}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {Array.from({ length: new Date().getFullYear() - 2023 }, (_, i) => {
                        const year = 2024 + i
                        return (
                          <option key={year} value={year.toString()}>
                            {year}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <label htmlFor="fiscal-month" className="text-xs font-medium text-gray-600">
                      Mes
                    </label>
                    <select
                      id="fiscal-month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      disabled={isLoadingContalink}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {[
                        { value: "1", label: "Enero" },
                        { value: "2", label: "Febrero" },
                        { value: "3", label: "Marzo" },
                        { value: "4", label: "Abril" },
                        { value: "5", label: "Mayo" },
                        { value: "6", label: "Junio" },
                        { value: "7", label: "Julio" },
                        { value: "8", label: "Agosto" },
                        { value: "9", label: "Septiembre" },
                        { value: "10", label: "Octubre" },
                        { value: "11", label: "Noviembre" },
                        { value: "12", label: "Diciembre" },
                      ].map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    onClick={fetchContalinkObligations}
                    disabled={isLoadingContalink || !client?.company}
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-6 py-2"
                  >
                    {isLoadingContalink ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cargando...
                      </>
                    ) : (
                      'Aplicar'
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isLoadingContalink ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                  <p className="text-sm text-gray-600">Cargando datos fiscales desde Contalink...</p>
                </div>
              ) : !contalinkData ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <AlertCircle className="h-10 w-10 text-gray-400" />
                  <p className="text-sm text-gray-600">No hay datos disponibles</p>
                  <p className="text-xs text-gray-500">Selecciona un mes/año y haz clic en "Aplicar" para cargar los datos</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Semáforo de Obligaciones */}
                  {contalinkData.obligaciones && contalinkData.obligaciones.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-indigo-500" />
                        <h3 className="text-sm font-semibold text-gray-700">Estado de Obligaciones</h3>
                        <Badge variant="secondary" className="text-xs">
                          {contalinkData.obligaciones.length}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                        {contalinkData.obligaciones.map((obligacion, index) => {
                          // Green = Presentado, Gray = No presentado (obligatorio), White = No aplica
                          const statusColor = obligacion.status === 'green' 
                            ? 'bg-gradient-to-br from-green-400 to-green-600'
                            : obligacion.status === 'gray'
                            ? 'bg-gradient-to-br from-gray-400 to-gray-600'
                            : 'bg-gradient-to-br from-white to-gray-100'
                          
                          const statusIcon = obligacion.status === 'green'
                            ? '✓'
                            : obligacion.status === 'gray'
                            ? '✕'
                            : '—'
                          
                          const statusBorderColor = obligacion.status === 'white'
                            ? 'border-gray-300'
                            : 'border-white/50'

                          return (
                            <TooltipProvider key={index}>
                              <Tooltip delayDuration={200}>
                                <TooltipTrigger asChild>
                                  <div className="flex flex-col items-center gap-2">
                                    <div
                                      className={cn(
                                        "w-14 h-14 rounded-xl flex items-center justify-center",
                                        statusColor,
                                        `border-2 ${statusBorderColor} shadow-md`,
                                        "transition-all duration-200 hover:scale-105 hover:shadow-xl"
                                      )}
                                    >
                                      <span className={cn(
                                        "text-xl font-bold",
                                        obligacion.status === 'white' ? 'text-gray-500' : 'text-white'
                                      )}>
                                        {statusIcon}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-gray-600 font-medium text-center leading-tight max-w-full line-clamp-2 px-1">
                                      {obligacion.column.length > 12 
                                        ? obligacion.column.substring(0, 12) + '...' 
                                        : obligacion.column}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                  <p className="font-semibold text-sm">{obligacion.column}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Estado: {obligacion.status === 'green' 
                                      ? 'Presentado' 
                                      : obligacion.status === 'gray'
                                      ? 'No presentado'
                                      : 'No aplica'}
                                  </p>
                                  {obligacion.archivos && obligacion.archivos.length > 0 && (
                                    <p className="text-xs text-gray-500">
                                      {obligacion.archivos.length} archivo(s)
                                    </p>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Archivos de Iconos */}
                  {contalinkData.archivosIconos && contalinkData.archivosIconos.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-indigo-500" />
                        <h3 className="text-sm font-semibold text-gray-700">Documentos Fiscales</h3>
                        <Badge variant="secondary" className="text-xs">
                          {contalinkData.archivosIconos.length}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {contalinkData.archivosIconos.map((archivo, index) => (
                          <button
                            key={index}
                            onClick={() => handleDownloadContalinkFile(archivo, getIconName(archivo.tipoDocumento))}
                            disabled={isDownloading}
                            className={cn(
                              "group relative p-4 rounded-xl border-2 border-transparent",
                              `bg-gradient-to-br ${getIconColor(archivo.tipoDocumento)}`,
                              "hover:scale-105 hover:shadow-xl transition-all duration-200",
                              "flex flex-col items-center gap-2 text-white",
                              "disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                          >
                            <FileText className="h-8 w-8" />
                            <span className="text-xs font-semibold text-center">
                              {getIconName(archivo.tipoDocumento)}
                            </span>
                            <Download className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Archivos de Obligaciones */}
                  {contalinkData.archivosObligaciones && contalinkData.archivosObligaciones.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-indigo-500" />
                        <h3 className="text-sm font-semibold text-gray-700">Declaraciones</h3>
                        <Badge variant="secondary" className="text-xs">
                          {contalinkData.archivosObligaciones.length}
                        </Badge>
                      </div>
                      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {contalinkData.archivosObligaciones.map((archivo, index) => (
                          <div
                            key={index}
                            className="group flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-200"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                <FileText className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {archivo.tipoDeclaracion || archivo.numeroOperacion}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  {archivo.fechaPresentacion && (
                                    <span>📅 {new Date(archivo.fechaPresentacion).toLocaleDateString('es-ES')}</span>
                                  )}
                                  {archivo.periodo && <span>• {archivo.periodo}</span>}
                                </div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDownloadContalinkFile(archivo)}
                              disabled={isDownloading}
                              className="flex-shrink-0 hover:bg-indigo-100 hover:text-indigo-700"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sin datos */}
                  {(!contalinkData.archivosIconos || contalinkData.archivosIconos.length === 0) &&
                   (!contalinkData.archivosObligaciones || contalinkData.archivosObligaciones.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-12 gap-4">
                      <AlertCircle className="h-10 w-10 text-gray-400" />
                      <p className="text-sm text-gray-600">No se encontraron archivos para este periodo</p>
                      <p className="text-xs text-gray-500">Intenta con otro mes o año</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Reports */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b">
              <CardTitle className="text-base flex items-center gap-2 text-gray-800">
                <div className="h-8 w-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-cyan-600" />
                </div>
                Informes Mensuales
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-sm text-gray-600">
                    Accede a los informes mensuales de los últimos 24 meses
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button
                    onClick={() => setIsMonthlyReportsModalOpen(true)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Ver Informes
                  </Button>
                  <Button
                    onClick={handleDownloadMonthlyReportExample}
                    variant="outline"
                    disabled={isDownloading}
                    className="hover:bg-gray-50 transition-all duration-200"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Descargar Ejemplo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

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
        </div>
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

      {/* Modal para informes mensuales */}
      <MonthlyReportsModal
        isOpen={isMonthlyReportsModalOpen}
        onClose={() => setIsMonthlyReportsModalOpen(false)}
        clientId={client.id}
        clientName={client.company}
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
    </Dialog>
  )
}
