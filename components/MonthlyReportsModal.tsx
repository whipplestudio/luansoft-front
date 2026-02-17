"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileDown, X, Loader2, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import type { MonthlyReport } from "@/types"
import { ReportModal } from "@/components/contpaq-data"
import { getFinancialData, getMonthName, type ClienteFinancialData } from "@/api/financial-data"
import { toast } from "sonner"

interface MonthlyReportsModalProps {
  isOpen: boolean
  onClose: () => void
  clientId: string
  clientName: string
}

export function MonthlyReportsModal({ isOpen, onClose, clientId, clientName }: MonthlyReportsModalProps) {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<MonthlyReport | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [availableReports, setAvailableReports] = useState<MonthlyReport[]>([])

  // Load client data and generate reports based on available data
  useEffect(() => {
    if (!isOpen) return

    const loadAvailableReports = async () => {
      setIsLoadingData(true)
      try {
        const clientData: ClienteFinancialData | null = await getFinancialData(clientId)
        
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
              clientId: clientId,
            })
          })
        })

        setAvailableReports(reports)
      } catch (error) {
        console.error("Error loading client reports:", error)
        toast.error("Error al cargar los reportes financieros")
        setAvailableReports([])
      } finally {
        setIsLoadingData(false)
      }
    }

    loadAvailableReports()
  }, [isOpen, clientId])

  const handleMonthlyReportClick = (report: MonthlyReport) => {
    setSelectedReport(report)
    setIsReportModalOpen(true)
  }

  const convertMonthNameToNumber = (monthName: string): string => {
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

  const handleCloseReportModal = () => {
    setIsReportModalOpen(false)
    setSelectedReport(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] rounded-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Informes Mensuales - {clientName}
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="h-10 w-10 rounded-full hover:bg-slate-100"
            >
              <X className="h-5 w-5 text-slate-600" />
            </Button>
          </div>
        </DialogHeader>
        <div className="py-6">
          <p className="text-sm text-slate-600 mb-6 px-1">
            Selecciona un mes para ver el informe financiero detallado
          </p>
          
          {isLoadingData ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              </div>
              <span className="text-slate-600 font-medium">Cargando reportes disponibles...</span>
            </div>
          ) : availableReports.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-slate-400" />
              </div>
              <p className="text-slate-700 font-semibold text-lg mb-2">No hay reportes disponibles</p>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                Sube documentos financieros para generar reportes mensuales
              </p>
            </div>
          ) : (
            <div className="max-h-[65vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
              <div className="grid grid-cols-3 gap-4">
                {availableReports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => handleMonthlyReportClick(report)}
                    className="group relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg transition-all duration-200 active:scale-95"
                  >
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md group-hover:shadow-xl transition-shadow">
                      <FileDown className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-base font-bold text-slate-900 group-hover:text-blue-700">
                        {report.month}
                      </span>
                      <span className="text-sm text-slate-500 font-medium">{report.year}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>

      {selectedReport && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={handleCloseReportModal}
          clientId={clientId}
          month={`${selectedReport.year}-${convertMonthNameToNumber(selectedReport.month)}`}
          year={selectedReport.year}
        />
      )}
    </Dialog>
  )
}
