"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FileText, Loader2, AlertCircle, Eye, Download, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect, useCallback } from "react"
import { axiosInstance } from "@/lib/axios"
import axios from "axios"
import { toast } from "sonner"
import { DocumentViewerModal } from "@/components/DocumentViewerModal"

interface FiscalIndicatorsProps {
  clientCompany: string
  clientId?: string  // UUID del cliente (más confiable)
}

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

export function FiscalIndicators({ clientCompany, clientId }: FiscalIndicatorsProps) {
  console.log("🚀 ~ FiscalIndicators ~ clientCompany:", clientCompany)
  console.log("🚀 ~ FiscalIndicators ~ clientId:", clientId)
  const [contalinkData, setContalinkData] = useState<ContalinkData | null>(null)
  const [isLoadingContalink, setIsLoadingContalink] = useState(false)
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [documentType, setDocumentType] = useState<"pdf" | "image">("pdf")
  const [documentTitle, setDocumentTitle] = useState<string>("")
  const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false)
  const [fileName, setFileName] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadingFileName, setDownloadingFileName] = useState("")
  const [isSyncing, setIsSyncing] = useState(false)

  // Función para obtener el mes anterior
  const getPreviousMonth = () => {
    const today = new Date()
    const currentMonth = today.getMonth() + 1
    const currentYear = today.getFullYear()
    
    if (currentMonth === 1) {
      return { month: '12', year: (currentYear - 1).toString() }
    } else {
      return { month: (currentMonth - 1).toString(), year: currentYear.toString() }
    }
  }
  
  const previousMonth = getPreviousMonth()
  const [selectedYear, setSelectedYear] = useState(previousMonth.year)
  const [selectedMonth, setSelectedMonth] = useState(previousMonth.month)

  // Función para sincronizar datos fiscales (llama al proxy en NestJS)
  const handleSyncFiscal = async () => {
    // Priorizar clientId, luego RFC
    if (!clientId && !contalinkData?.rfc) {
      toast.error('No se puede sincronizar: el cliente no tiene ID ni RFC registrado')
      return
    }

    try {
      setIsSyncing(true)
      
      const requestBody: any = {
        year: parseInt(selectedYear),
        month: parseInt(selectedMonth),
      }

      // Priorizar clientId sobre RFC
      if (clientId) {
        requestBody.clientId = clientId
      } else if (contalinkData?.rfc) {
        requestBody.rfc = contalinkData.rfc
      }

      const response = await axiosInstance.post(
        '/contalink/sync-fiscal',
        requestBody
      )

      if (response.data?.success) {
        toast.success(
          response.data.message || 'Sincronización completada exitosamente',
          {
            description: 'Los datos fiscales han sido actualizados',
            duration: 4000,
          }
        )
        
        // Recargar datos después de sincronización exitosa
        await fetchContalinkObligations()
      }
    } catch (error: any) {
      console.error('Error al sincronizar datos fiscales:', error)
      
      if (error.response?.status === 429) {
        // Rate limit activo
        const errorData = error.response.data
        console.log('📊 Rate limit error data:', errorData)
        
        // Intentar obtener remainingMinutes de múltiples fuentes
        let remainingMinutes = errorData?.data?.remainingMinutes || errorData?.remainingMinutes
        
        // Si data es null, extraer del mensaje (ej: "...espera 2 minuto(s)...")
        if (!remainingMinutes && errorData?.message) {
          const match = errorData.message.match(/espera (\d+) minuto/)
          remainingMinutes = match ? parseInt(match[1]) : 30
        }
        
        // Fallback final
        remainingMinutes = remainingMinutes || 30
        
        toast.error(
          'Sincronización bloqueada temporalmente',
          {
            description: `Este RFC fue sincronizado recientemente. Por favor espera ${remainingMinutes} minuto(s) antes de sincronizar nuevamente.`,
            duration: 6000,
          }
        )
      } else if (error.response?.status === 404) {
        toast.error('Cliente no encontrado en el sistema')
      } else if (error.response?.status === 502) {
        toast.error(
          'Error de comunicación con la API externa',
          {
            description: 'No se pudo conectar con el servicio de sincronización',
            duration: 5000,
          }
        )
      } else if (error.response?.status === 504) {
        toast.error(
          'Tiempo de espera agotado',
          {
            description: 'La sincronización está tomando más tiempo del esperado. Intenta nuevamente en unos minutos.',
            duration: 5000,
          }
        )
      } else {
        toast.error(
          error.response?.data?.message || 'Error al sincronizar datos fiscales',
          {
            description: 'Ocurrió un error inesperado durante la sincronización',
          }
        )
      }
    } finally {
      setIsSyncing(false)
    }
  }

  // Función para obtener las obligaciones con archivos de un cliente específico
  const fetchContalinkObligations = async () => {
    if (!clientCompany) {
      toast.warning('El cliente no tiene nombre de empresa registrado')
      return
    }

    try {
      setIsLoadingContalink(true)
      
      // Construir request body con prioridad: clientId > RFC > nombre
      const requestBody: any = {
        year: parseInt(selectedYear),
        month: parseInt(selectedMonth),
        includePresignedUrls: true
      }

      // Prioridad: clientId (UUID - más confiable) > RFC > nombre
      if (clientId) {
        requestBody.clientId = clientId
      } else if (contalinkData?.rfc) {
        requestBody.rfc = contalinkData.rfc
      } else {
        requestBody.clientName = clientCompany
      }
      
      const response = await axiosInstance.post(
        '/contalink/obligations/client',
        requestBody
      )

      if (response.data?.success && response.data.data?.success && response.data.data.data) {
        const apiData = response.data.data.data
        setContalinkData({
          nombre: apiData.nombre || clientCompany,
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
  }

  // Cargar automáticamente con el mes anterior al montar el componente
  useEffect(() => {
    if (clientCompany) {
      fetchContalinkObligations()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Función para previsualizar archivos de Contalink
  const handlePreviewContalinkFile = async (file: ContalinkFile, fileName?: string) => {
    if (!file.downloadUrl) {
      toast.error('URL de descarga no disponible')
      return
    }

    try {
      setIsLoading(true)
      setDocumentUrl(file.downloadUrl)
      setDocumentType('pdf')
      setDocumentTitle(fileName || file.tipoDeclaracion || file.numeroOperacion)
      setFileName(fileName ? `${fileName}.pdf` : `${file.numeroOperacion}.pdf`)
      setIsDocumentViewerOpen(true)
    } catch (error: any) {
      console.error('Error al previsualizar archivo:', error)
      toast.error('Error al previsualizar el archivo')
    } finally {
      setIsLoading(false)
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

  // Función para obtener clases de color completas para Tailwind CSS
  const getIconColorClasses = (tipoDocumento: string): string => {
    switch (tipoDocumento) {
      case 'EFIRMA':
        return 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg hover:shadow-purple-500/50'
      case 'CSIF':
        return 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg hover:shadow-blue-500/50'
      case 'CSD':
        return 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg hover:shadow-green-500/50'
      case 'CIEC':
        return 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg hover:shadow-orange-500/50'
      default:
        return 'bg-gradient-to-br from-gray-500 to-gray-600 shadow-lg hover:shadow-gray-500/50'
    }
  }

  // Función para obtener nombre de icono
  const getIconName = (tipoDocumento: string): string => {
    switch (tipoDocumento) {
      case 'EFIRMA':
        return 'e.firma'
      case 'CSIF':
        return 'CSIF'
      case 'CSD':
        return 'CSD'
      case 'CIEC':
        return 'CIEC'
      default:
        return tipoDocumento
    }
  }

  if (!clientCompany) {
    return null
  }

  return (
    <>
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
                disabled={isLoadingContalink || isSyncing}
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
              <Button
                onClick={handleSyncFiscal}
                disabled={isLoadingContalink || isSyncing || !contalinkData?.rfc}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2"
                title={!contalinkData?.rfc ? 'Cliente sin RFC registrado' : 'Sincronizar datos desde Contalink (Cloud Run)'}
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sincronizar
                  </>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {contalinkData.archivosIconos.map((archivo, index) => (
                        <div
                          key={index}
                          className={cn(
                            "group relative p-4 rounded-xl",
                            getIconColorClasses(archivo.tipoDocumento),
                            "hover:shadow-2xl transition-all duration-300 hover:scale-105",
                            "flex items-center gap-3 text-white"
                          )}
                        >
                        <FileText className="h-8 w-8 flex-shrink-0" />
                        <span className="text-sm font-semibold flex-1">
                          {getIconName(archivo.tipoDocumento)}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handlePreviewContalinkFile(archivo, getIconName(archivo.tipoDocumento))}
                            disabled={isDownloading || isLoading}
                            className="bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 h-8 px-3"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleDownloadContalinkFile(archivo, getIconName(archivo.tipoDocumento))}
                            disabled={isDownloading || isLoading}
                            className="bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 h-8 px-3"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
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
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handlePreviewContalinkFile(archivo)}
                            disabled={isDownloading || isLoading}
                            className="hover:bg-blue-100 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownloadContalinkFile(archivo)}
                            disabled={isDownloading || isLoading}
                            className="hover:bg-indigo-100 hover:text-indigo-700"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sin datos */}
              {(!contalinkData.archivosIconos || contalinkData.archivosIconos.length === 0) &&
               (!contalinkData.archivosObligaciones || contalinkData.archivosObligaciones.length === 0) &&
               (!contalinkData.obligaciones || contalinkData.obligaciones.length === 0) && (
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

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={isDocumentViewerOpen}
        onClose={() => {
          setIsDocumentViewerOpen(false)
          setDocumentUrl(null)
        }}
        documentUrl={documentUrl}
        documentType={documentType}
        title={documentTitle}
        fileName={fileName}
      />
    </>
  )
}
