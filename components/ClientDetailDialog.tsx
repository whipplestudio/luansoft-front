import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format, isValid, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ProgressBar } from "@/components/ProgressBar"
import type { FiscalDeliverable, Process } from "@/types"
import { CalendarIcon } from "lucide-react"

interface ClientDetailDialogProps {
  isOpen: boolean
  onClose: () => void
  client: FiscalDeliverable | null
}

export function ClientDetailDialog({ isOpen, onClose, client }: ClientDetailDialogProps) {
  if (!client) return null

  // Encontrar la fecha de vencimiento más cercana
  const getNearestDueDate = () => {
    if (!client.processes || client.processes.length === 0) {
      return client.dueDate
    }

    // Filtrar procesos que tienen fecha de vencimiento
    const processesWithDates = client.processes.filter((p) => p.dueDate)
    if (processesWithDates.length === 0) {
      return client.dueDate
    }

    // Ordenar por fecha y tomar la más cercana
    const sortedDates = [...processesWithDates].sort((a, b) => {
      const dateA = new Date(a.dueDate || "")
      const dateB = new Date(b.dueDate || "")
      return dateA.getTime() - dateB.getTime()
    })

    return sortedDates[0].dueDate
  }

  const getStatusColor = (status: Process["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "pending":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "No disponible"
    try {
      const date = parseISO(dateString)
      return isValid(date) ? format(date, "dd 'de' MMMM 'de' yyyy", { locale: es }) : "Fecha inválida"
    } catch (error) {
      return "Fecha inválida"
    }
  }

  const nearestDueDate = getNearestDueDate()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{client.client}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Responsable</p>
            <p>{client.responsible}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Fecha de vencimiento más cercana</p>
            <div className="flex items-center space-x-2 text-sm">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
              <span>{formatDate(nearestDueDate)}</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Progreso general</p>
            <ProgressBar percentage={client.progressPercentage} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Procesos</p>
            <Card>
              <CardContent className="p-4 space-y-3">
                {client.processes.map((process, index) => (
                  <div key={index} className="flex flex-col space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{process.name}</span>
                      <Badge variant="outline" className={`text-xs ${getStatusColor(process.status)}`}>
                        {process.status === "completed"
                          ? "Completado"
                          : process.status === "in_progress"
                            ? "En progreso"
                            : "Pendiente"}
                      </Badge>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      <span>Vence: {process.dueDate ? formatDate(process.dueDate) : "No definida"}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

