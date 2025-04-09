import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { Contacto } from "@/types"
import { Badge } from "@/components/ui/badge"

interface ContactoDetailsProps {
  contacto: Contacto | null
  isOpen: boolean
  onClose: () => void
}

export function ContactoDetails({ contacto, isOpen, onClose }: ContactoDetailsProps) {
  if (!contacto) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalles del Contacto</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Nombre</h3>
              <p className="mt-1">{contacto.firstName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Apellido</h3>
              <p className="mt-1">{contacto.lastName}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Email</h3>
            <p className="mt-1">{contacto.email}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Teléfono</h3>
            <p className="mt-1">{contacto.phone || "No disponible"}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Estado</h3>
            <div className="mt-1">
              <Badge variant={contacto.status === "ACTIVE" ? "default" : "destructive"} className="capitalize">
                {contacto.status === "ACTIVE" ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Fecha de Creación</h3>
              <p className="mt-1">{format(new Date(contacto.createdAt), "dd/MM/yyyy", { locale: es })}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Última Actualización</h3>
              <p className="mt-1">{format(new Date(contacto.updatedAt), "dd/MM/yyyy", { locale: es })}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
