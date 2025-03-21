import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format, isValid } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, BuildingIcon, MailIcon, UserIcon, CreditCardIcon, ClockIcon } from "lucide-react"

interface ClienteDetailModalProps {
  isOpen: boolean
  onClose: () => void
  client: any // Cambia 'any' por el tipo correcto de tu cliente cuando lo tengas definido
}

export function ClienteDetailModal({ isOpen, onClose, client }: ClienteDetailModalProps) {
  if (!client) return null

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "No disponible"
    const date = new Date(dateString)
    return isValid(date) ? format(date, "dd 'de' MMMM 'de' yyyy, HH:mm:ss", { locale: es }) : "Fecha inválida"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Detalles del Cliente</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex items-center space-x-4">
            <UserIcon className="h-6 w-6 text-gray-400" />
            <div>
              <h3 className="font-semibold">{`${client.firstName} ${client.lastName}`}</h3>
              <p className="text-sm text-gray-500">{client.type === "FISICA" ? "Persona Física" : "Persona Moral"}</p>
            </div>
            <Badge
              variant={client.status === "ACTIVE" ? "default" : "destructive"}
              className={`ml-auto ${client.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {client.status === "ACTIVE" ? "Activo" : "Inactivo"}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <BuildingIcon className="h-5 w-5 text-gray-400" />
              <span>{client.company || "No especificada"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MailIcon className="h-5 w-5 text-gray-400" />
              <span>{client.email || "No especificado"}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
              <span>Día límite: {client.limitDay !== undefined ? client.limitDay : "No especificado"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-5 w-5 text-gray-400" />
              <span>Días de gracia: {client.graceDays !== undefined ? client.graceDays : "No especificado"}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <CreditCardIcon className="h-5 w-5 text-gray-400" />
              <span>Nómina: {client.payroll !== undefined ? (client.payroll ? "Sí" : "No") : "No especificado"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5 text-gray-400" />
              <span>Contador: {client.contadorId || "No asignado"}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <CalendarIcon className="h-4 w-4" />
            <span>Creado el: {formatDate(client.createdAt)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

