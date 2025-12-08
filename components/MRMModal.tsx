"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { MRMReportContent } from "@/components/MRMReportContent"

interface MRMModalProps {
  isOpen: boolean
  onClose: () => void
  clientId: string
  month: string
  year: number
}

export function MRMModal({ isOpen, onClose, clientId, month, year }: MRMModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] p-0 gap-0">
        {/* Header with close button */}
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

        {/* Content - Direct render without iframe */}
        <div className="w-full h-full overflow-y-auto">
          <MRMReportContent clientId={clientId} month={month} year={year} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
