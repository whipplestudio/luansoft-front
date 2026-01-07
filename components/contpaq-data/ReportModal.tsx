"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { ReportContentDynamic } from "@/components/contpaq-data/ReportContentDynamic"

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  clientId: string
  month: string
  year: number
}

export function ReportModal({ isOpen, onClose, clientId, month, year }: ReportModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] p-0 gap-0">
        <div className="absolute top-4 right-4 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-lg"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="w-full h-full overflow-y-auto">
          <ReportContentDynamic clientId={clientId} month={month} year={year} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
