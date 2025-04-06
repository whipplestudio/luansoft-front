"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import type { Contador, Process } from "@/types"

interface ClientesAsignadosProps {
  contador: Contador
}

export function ClientesAsignados({ contador }: ClientesAsignadosProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Usar clientDetails si está disponible, de lo contrario un array vacío
  const clientes = contador.clientDetails || []

  // Filtrar clientes por término de búsqueda
  const filteredClientes = clientes.filter((cliente) =>
    cliente.company.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Función para obtener el color de la badge según el estado de entrega
  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case "onTime":
        return "secondary" // Map "success" to "secondary" or another valid value
      case "atRisk":
        return "default" // Map "warning" to "default" or another valid value
      case "delayed":
        return "destructive"
      case "completed":
        return "outline"
      default:
        return "secondary"
    }
  }

  // Función para traducir el estado de entrega
  const getDeliveryStatusText = (status: string) => {
    switch (status) {
      case "onTime":
        return "A tiempo"
      case "atRisk":
        return "En riesgo"
      case "delayed":
        return "Retrasado"
      case "completed":
        return "Completado"
      default:
        return status
    }
  }

  // Función para formatear la fecha corregida para manejar correctamente la zona horaria
  const formatDate = (dateString: string) => {
    // Extraer año, mes y día directamente de la cadena ISO
    const [year, month, day] = dateString
      .split("T")[0]
      .split("-")
      .map((num) => Number.parseInt(num, 10))

    // Crear un array con los nombres de los meses en español
    const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]

    // Formatear la fecha manualmente (día mes año)
    return `${day} ${meses[month - 1]} ${year}`
  }

  return (
    <div className="space-y-6 h-full overflow-auto">
      <Card className="border-0 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white z-10 pb-4">
          <CardTitle>Clientes Asignados</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-y-auto px-1">
          {filteredClientes.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No hay clientes asignados</p>
          ) : (
            <Accordion type="multiple" className="space-y-4">
              {filteredClientes.map((cliente) => (
                <AccordionItem key={cliente.id} value={cliente.id} className="border rounded-lg px-4">
                  <AccordionTrigger className="py-4 hover:no-underline">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full text-left">
                      <div className="font-medium">{cliente.company}</div>
                      <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <Badge variant="outline">
                          {cliente.type === "FISICA" ? "Persona Física" : "Persona Moral"}
                        </Badge>
                        <Badge>{cliente.processes?.length || 0} Procesos</Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Proceso</TableHead>
                            <TableHead>Fecha Compromiso</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Estatus de Entrega</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cliente.processes && cliente.processes.length > 0 ? (
                            cliente.processes.map((proceso: Process, index: number) => (
                              <TableRow key={`${proceso.id}-${index}`}>
                                <TableCell className="font-medium">{proceso.name}</TableCell>
                                <TableCell>
                                  {proceso.commitmentDate ? formatDate(proceso.commitmentDate) : "Fecha no disponible"}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={proceso.status === "ACTIVE" ? "outline" : "secondary"}>
                                    {proceso.status === "ACTIVE"
                                      ? "Activo"
                                      : proceso.status === "PAID"
                                        ? "Pagado"
                                        : "Inactivo"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={getDeliveryStatusColor(proceso.deliveryStatus || "secondary")}>
                                    {getDeliveryStatusText(proceso.deliveryStatus || "unknown")}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center">
                                No hay procesos asignados
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

