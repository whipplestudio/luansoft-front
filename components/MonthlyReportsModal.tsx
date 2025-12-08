"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileDown, X } from "lucide-react"
import { useState } from "react"
import type { MonthlyReport } from "@/types"
import { MRMModal } from "@/components/MRMModal"

interface MonthlyReportsModalProps {
  isOpen: boolean
  onClose: () => void
  clientId: string
  clientName: string
}

export function MonthlyReportsModal({ isOpen, onClose, clientId, clientName }: MonthlyReportsModalProps) {
  const [isMRMModalOpen, setIsMRMModalOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<MonthlyReport | null>(null)

  // Generate last 24 months of reports
  const generateMonthlyReports = (): MonthlyReport[] => {
    const reports: MonthlyReport[] = []
    const currentDate = new Date()
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ]

    for (let i = 0; i < 24; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      reports.push({
        id: `report-${i}`,
        month: months[date.getMonth()],
        year: date.getFullYear(),
        date: date.toISOString(),
        clientId: clientId,
      })
    }

    return reports
  }

  const monthlyReports = generateMonthlyReports()

  // Handle monthly report click - open MRM modal
  const handleMonthlyReportClick = (report: MonthlyReport) => {
    setSelectedReport(report)
    setIsMRMModalOpen(true)
  }

  const handleCloseMRMModal = () => {
    setIsMRMModalOpen(false)
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
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-3 gap-3">
              {monthlyReports.map((report) => (
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
        </div>
      </DialogContent>

      {/* MRM Modal */}
      {selectedReport && (
        <MRMModal
          isOpen={isMRMModalOpen}
          onClose={handleCloseMRMModal}
          clientId={clientId}
          month={selectedReport.month}
          year={selectedReport.year}
        />
      )}
    </Dialog>
  )
}
