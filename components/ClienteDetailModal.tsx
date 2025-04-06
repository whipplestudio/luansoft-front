"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Client } from "@/types"

// Actualizar la interfaz ClienteDetailModalProps para reflejar la nueva estructura
interface ClienteDetailModalProps {
  isOpen: boolean
  onClose: () => void
  client: Client | null | undefined
}

// Actualizar el componente para manejar casos donde contador o contacto pueden ser null
export function ClienteDetailModal({ isOpen, onClose, client }: ClienteDetailModalProps) {
  if (!client) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{client.company}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Tipo</p>
            <p>{client.type === "FISICA" ? "Persona Física" : "Persona Moral"}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Estado</p>
            <p className={client.status === "ACTIVE" ? "text-green-600" : "text-red-600"}>
              {client.status === "ACTIVE" ? "Activo" : "Inactivo"}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Contador Asignado</p>
            {client.contador ? (
              <div>
                <p>{client.contador.name}</p>
                <p className="text-sm text-gray-500">{client.contador.email}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No hay contador asignado</p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Contacto</p>
            {client.contacto ? (
              <div>
                <p>{client.contacto.name}</p>
                <p className="text-sm text-gray-500">{client.contacto.email}</p>
                {client.contacto.phone && <p className="text-sm text-gray-500">Tel: {client.contacto.phone}</p>}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No hay contacto asignado</p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Fecha de creación</p>
            <p className="text-sm">
              {new Date(client.createdAt).toLocaleDateString("es-MX", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

