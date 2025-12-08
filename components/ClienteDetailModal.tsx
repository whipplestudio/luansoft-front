"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Download, FileText, Loader2, Calendar, Building2, User, Mail, Phone, Clock, CheckCircle2, AlertCircle, XCircle, MinusCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { DocumentViewerModal } from "@/components/DocumentViewerModal"
import { MonthlyReportsModal } from "@/components/MonthlyReportsModal"
import { axiosInstance } from "@/lib/axios"
import { toast } from "sonner"
import type { Client, TaxIndicator, TaxIndicatorStatus } from "@/types"

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

  if (!client) return null

  // Dummy tax indicators data - replace with real data from API
  const taxIndicators: TaxIndicator[] = [
    { id: "1", name: "Cuotas Obrero Patronales", shortName: "Cuotas Obrero Patr", status: "green" },
    { id: "2", name: "Declaración provisional de IVA", shortName: "Dec Prov IVA", status: "yellow" },
    { id: "3", name: "IVA Definitivo Mensual", shortName: "IVA Def Mens", status: "green" },
    { id: "4", name: "Entero Retenciones Mensuales ISR Salarios y Servicios", shortName: "Ent Ret Mens ISR SyS", status: "red" },
    { id: "5", name: "Declaración Anual ISR Ejercicio PM", shortName: "Dec Anu ISR Ejerc PM", status: "green" },
    { id: "6", name: "ISR Provisional Mensual PM Régimen General", shortName: "ISR Prov Mens PM RG", status: "yellow" },
    { id: "7", name: "Declaración anual de ISR. Personas Físicas", shortName: "Dec Anu ISR PF", status: "green" },
    { id: "8", name: "Declaración Informativa IVA con ISR", shortName: "Dec Inf IVA con ISR", status: "gray" },
    { id: "9", name: "ISR Provisional Mensual SP RAEP", shortName: "ISR Prov Mens SP RAEP", status: "green" },
    { id: "10", name: "Entero Retenciones Mensuales IVA", shortName: "Ent Ret Mens IVA", status: "yellow" },
    { id: "11", name: "ISR Provisional Mensual AE RAEP", shortName: "ISR Prov Mens AE RAEP", status: "green" },
    { id: "12", name: "Pago provisional mensual de ISR. RSC", shortName: "ISR Prov Mens RSC", status: "red" },
    { id: "13", name: "Pago definitivo mensual de IVA. RSC", shortName: "IVA Def Mens RSC", status: "green" },
    { id: "14", name: "Entero mensual retenciones ISR arrendamiento", shortName: "Ent Ret Mens ISR IAS", status: "yellow" },
    { id: "15", name: "IEPS Chatarra Mensual", shortName: "IEPS Chatarra Mens", status: "gray" },
    { id: "16", name: "Dec Inf 50 principales clientes IEPS", shortName: "Dec Inf IEPS 50", status: "green" },
    { id: "17", name: "Dec Inf anual bienes producidos", shortName: "Dec Inf Bienes Anu", status: "green" },
    { id: "18", name: "Declaración informativa de IEPS trasladado", shortName: "Dec Inf IEPS Trasl", status: "gray" },
    { id: "19", name: "Pago provisional trimestral ISR PM inicio segundo", shortName: "ISR Prov Trim PM", status: "yellow" },
    { id: "20", name: "ISR Anual Ajuste RSC", shortName: "ISR Anu Ajust RSC", status: "green" },
    { id: "21", name: "Entero ISR sobre dividendos distribuidos PM", shortName: "ISR Dividendos PM", status: "green" },
    { id: "22", name: "Declaración anual ISR RSC PM", shortName: "Dec Anu ISR RSC PM", status: "red" },
  ]

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

  // Handle tax indicator click - download PDF with progress
  const handleTaxIndicatorClick = async (indicator: TaxIndicator) => {
    setDownloadingFileName(`${indicator.shortName}.pdf`)
    setDownloadProgress(0)
    setIsDownloading(true)
    
    try {
      // Simulate download progress - replace with real API call
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 150))
        setDownloadProgress(i)
      }
      
      // In production, download the actual file from API
      // const response = await axiosInstance.get(`/tax-indicators/${indicator.id}/download`, {
      //   responseType: 'blob',
      //   onDownloadProgress: (progressEvent) => {
      //     const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
      //     setDownloadProgress(percentCompleted)
      //   }
      // })
      
      toast.success(`${indicator.shortName} descargado exitosamente`)
    } catch (error) {
      console.error("Error al descargar:", error)
      toast.error(`Error al descargar ${indicator.shortName}`)
    } finally {
      setIsDownloading(false)
      setDownloadProgress(0)
    }
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
            </CardHeader>
            <CardContent className="p-5">
              <div className="overflow-x-auto pb-2">
                <div className="min-w-fit">
                  {/* First row of indicators */}
                  <div className="flex gap-2 mb-4">
                    {taxIndicators.slice(0, 11).map((indicator, index) => (
                      <div key={indicator.id} className="flex flex-col items-center gap-1.5" style={{ animationDelay: `${index * 50}ms` }}>
                        <button
                          onClick={() => handleTaxIndicatorClick(indicator)}
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center",
                            getStatusColor(indicator.status),
                            "hover:scale-110 hover:shadow-lg hover:-translate-y-1",
                            "transition-all duration-300 ease-out cursor-pointer",
                            "border-2 border-white/50 shadow-md",
                            "group relative"
                          )}
                          title={indicator.name}
                          aria-label={indicator.name}
                        >
                          <Download className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </button>
                        <span className="text-[9px] text-gray-600 font-medium text-center leading-tight max-w-[52px] truncate" title={indicator.shortName}>
                          {indicator.shortName}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Second row of indicators */}
                  <div className="flex gap-2">
                    {taxIndicators.slice(11, 22).map((indicator, index) => (
                      <div key={indicator.id} className="flex flex-col items-center gap-1.5" style={{ animationDelay: `${(index + 11) * 50}ms` }}>
                        <button
                          onClick={() => handleTaxIndicatorClick(indicator)}
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center",
                            getStatusColor(indicator.status),
                            "hover:scale-110 hover:shadow-lg hover:-translate-y-1",
                            "transition-all duration-300 ease-out cursor-pointer",
                            "border-2 border-white/50 shadow-md",
                            "group relative"
                          )}
                          title={indicator.name}
                          aria-label={indicator.name}
                        >
                          <Download className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </button>
                        <span className="text-[9px] text-gray-600 font-medium text-center leading-tight max-w-[52px] truncate" title={indicator.shortName}>
                          {indicator.shortName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
