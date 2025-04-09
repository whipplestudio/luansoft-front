"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmationWord: string
  isConfirming?: boolean
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmationWord,
  isConfirming,
}: ConfirmationDialogProps) {
  const [inputValue, setInputValue] = useState("")

  // Efecto para limpiar el input cuando el diálogo se cierra
  useEffect(() => {
    if (!isOpen) {
      setInputValue("")
    }
  }, [isOpen])

  const handleClose = () => {
    onClose()
  }

  const handleConfirm = () => {
    if (inputValue.toLowerCase() === confirmationWord.toLowerCase()) {
      onConfirm()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder={`Escribe "${confirmationWord}" para confirmar`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isConfirming}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={inputValue.toLowerCase() !== confirmationWord?.toLowerCase() || isConfirming}
          >
            {isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              "Confirmar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

