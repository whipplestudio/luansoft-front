"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileDown, X, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import type { MonthlyReport } from "@/types"
import { ReportModal } from "@/components/contpaq-data"
import { loadClientFinancialData, getMonthName } from "@/lib/financial-data-service"
import type { ClienteFinancialData } from "@/types/financial"

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
        const clientData: ClienteFinancialData | null = await loadClientFinancialData(clientName)
        
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
              clientId: clientName,
            })
          })
        })

        setAvailableReports(reports)
      } catch (error) {
        console.error("Error loading client reports:", error)
        setAvailableReports([])
      } finally {
        setIsLoadingData(false)
      }
    }

    loadAvailableReports()
  }, [isOpen, clientName])

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
      <DialogContent className="sm:max-w-[700px] max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Informes Mensuales - {clientName}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-600 mb-4">
            Selecciona un mes para ver el informe mensual correspondiente
          </p>
          
          {isLoadingData ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
              <span className="text-slate-600">Cargando reportes disponibles...</span>
            </div>
          ) : availableReports.length === 0 ? (
            <div className="text-center py-12">
              <FileDown className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600">No hay reportes disponibles para este cliente.</p>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-3 gap-3">
                {availableReports.map((report) => (
                  <Button
                    key={report.id}
                    variant="outline"
                    size="lg"
                    onClick={() => handleMonthlyReportClick(report)}
                    className="flex items-center justify-between gap-2 w-full h-auto py-4 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-sm font-semibold">{report.month}</span>
                      <span className="text-xs text-gray-500">{report.year}</span>
                    </div>
                    <FileDown className="h-5 w-5 text-blue-600" />
                  </Button>
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
          clientId={clientName}
          month={`${selectedReport.year}-${convertMonthNameToNumber(selectedReport.month)}`}
          year={selectedReport.year}
        />
      )}
    </Dialog>
  )
}
