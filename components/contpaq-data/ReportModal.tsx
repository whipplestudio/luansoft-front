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
        <div className="w-full h-full overflow-y-auto">
          <ReportContentDynamic clientId={clientId} month={month} year={year} onClose={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
