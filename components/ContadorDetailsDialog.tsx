"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InformacionGeneral } from "@/components/InformacionGeneral"
import { ClientesAsignados } from "@/components/ClientesAsignados"
import type { Contador } from "@/types"

interface ContadorDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  contador: Contador | null
}

export function ContadorDetailsDialog({ isOpen, onClose, contador }: ContadorDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("informacion")

  if (!contador) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
          <TabsList className="mb-4 justify-start sticky top-0 z-20">
            <TabsTrigger value="informacion" className="flex-1 text-left justify-start">
              Información del Contador
            </TabsTrigger>
            <TabsTrigger value="clientes" className="flex-1 text-left justify-start">
              Clientes
            </TabsTrigger>
          </TabsList>
          <TabsContent value="informacion" className="flex-grow overflow-auto">
            <InformacionGeneral contador={contador} />
          </TabsContent>
          <TabsContent value="clientes" className="flex-grow overflow-auto h-[calc(90vh-120px)]">
            <ClientesAsignados contador={contador} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

