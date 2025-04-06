"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast, Toaster } from "sonner"
import { Search, User } from "lucide-react"
import type { Client, Contador } from "@/types"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ConfirmationDialog } from "@/components/ConfirmationDialog"
import { axiosInstance } from "@/lib/axios"

export default function AsignacionClientesPage() {
  const [selectedContador, setSelectedContador] = useState<Contador | null>(null)
  const [assignedClients, setAssignedClients] = useState<Client[]>([])
  const [unassignedClients, setUnassignedClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [assignedSearchTerm, setAssignedSearchTerm] = useState("")
  const [openContadorSelect, setOpenContadorSelect] = useState(false)
  const [contadorSearchTerm, setContadorSearchTerm] = useState("")
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [clientToUnassign, setClientToUnassign] = useState<Client | null>(null)
  const [contadores, setContadores] = useState<Contador[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchContadores = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) throw new Error("No authentication token found")

      const response = await axiosInstance.get("/contador/active", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.success) {
        setContadores(
          response.data.data.map((contador: any) => ({
            id: contador.id,
            name: `${contador.firstName} ${contador.lastName}`,
            email: contador.email,
            role: "contador",
            status: contador.status.toLowerCase(),
            lastLogin: null,
            clients: [],
          })),
        )
      } else {
        throw new Error(response.data.message || "Error fetching contadores")
      }
    } catch (error) {
      console.error("Error fetching contadores:", error)
      toast.error("Error al cargar los contadores")
    }
  }, [])

  const fetchUnassignedClients = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) throw new Error("No authentication token found")

      const response = await axiosInstance.get("/assignment/unassigned-clients/contador", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.success) {
        const mappedClients = response.data.data.map((client: any) => ({
          id: client.id,
          name: client.company, // Usar company como nombre
          company: client.company,
          type: client.type,
          isAssigned: !!client.contadorId,
          status: client.status,
          processes: [],
          razonSocial: client.company,
        }))
        console.log("Unassigned clients fetched:", mappedClients)
        setUnassignedClients(mappedClients)
      } else {
        throw new Error(response.data.message || "Error fetching unassigned clients")
      }
    } catch (error) {
      console.error("Error fetching unassigned clients:", error)
      toast.error("Error al cargar los clientes no asignados")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchAssignedClients = useCallback(async (contadorId: string) => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) throw new Error("No authentication token found")

      const response = await axiosInstance.get(`/assignment/assigned-clients/contador/${contadorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.success) {
        const mappedClients = response.data.data.map((client: any) => ({
          id: client.id,
          name: client.company,
          company: client.company,
          type: client.type,
          isAssigned: !!client.contadorId,
          status: client.status,
          processes: [],
          razonSocial: client.company,
        }))
        console.log("Assigned clients fetched:", mappedClients)
        setAssignedClients(mappedClients)
      } else {
        throw new Error(response.data.message || "Error fetching assigned clients")
      }
    } catch (error) {
      console.error("Error fetching assigned clients:", error)
      toast.error("Error al cargar los clientes asignados")
    }
  }, [])

  useEffect(() => {
    fetchContadores()
    fetchUnassignedClients()
  }, [fetchContadores, fetchUnassignedClients])

  const filteredUnassignedClients = useMemo(() => {
    return unassignedClients.filter((client) => client.company.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [unassignedClients, searchTerm])

  const filteredAssignedClients = useMemo(() => {
    return assignedClients.filter((client) => client.company.toLowerCase().includes(assignedSearchTerm.toLowerCase()))
  }, [assignedClients, assignedSearchTerm])

  const filteredContadores = useMemo(() => {
    return contadores.filter(
      (contador) =>
        contador.name.toLowerCase().includes(contadorSearchTerm.toLowerCase()) ||
        contador.email.toLowerCase().includes(contadorSearchTerm.toLowerCase()),
    )
  }, [contadores, contadorSearchTerm])

  const handleContadorChange = async (contadorId: string) => {
    const contador = contadores.find((c) => c.id === contadorId) || null
    setSelectedContador(contador)
    if (contador) {
      await fetchAssignedClients(contador.id)
    } else {
      setAssignedClients([])
    }
    setOpenContadorSelect(false)
  }

  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result

    // Si no hay destino, el drag terminó fuera de una zona válida
    if (!destination) return

    // Si el origen y el destino son el mismo, no hacemos nada
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    // Asignación de cliente
    if (source.droppableId === "unassigned" && destination.droppableId === "assigned") {
      if (!selectedContador) {
        toast.error("Por favor, seleccione un contador antes de asignar un cliente")
        return
      }

      const clientToMove = unassignedClients[source.index]

      // Actualizar el estado inmediatamente para la UI
      setUnassignedClients((prev) => prev.filter((_, index) => index !== source.index))
      setAssignedClients((prev) => [...prev, { ...clientToMove, isAssigned: !!selectedContador.id }])

      try {
        const token = localStorage.getItem("accessToken")
        if (!token) throw new Error("No authentication token found")

        const response = await axiosInstance.post(
          "/assignment/assign/contador",
          {
            clientId: clientToMove.id,
            contadorId: selectedContador.id,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )

        if (response.data.success) {
          toast.success(`Cliente ${clientToMove.company} asignado a ${selectedContador.name}`)
        } else {
          throw new Error(response.data.message || "Error assigning client")
        }
      } catch (error) {
        console.error("Error assigning client:", error)
        toast.error("Error al asignar el cliente. Revirtiendo cambios...")

        // Revertir cambios en caso de error
        setUnassignedClients((prev) => [...prev, clientToMove])
        setAssignedClients((prev) => prev.filter((client) => client.id !== clientToMove.id))
      }
    }
    // Desasignación de cliente
    else if (source.droppableId === "assigned" && destination.droppableId === "unassigned") {
      const clientToMove = assignedClients[source.index]
      setClientToUnassign(clientToMove)
      setIsConfirmDialogOpen(true)
    }
  }

  const handleUnassignConfirm = async () => {
    if (clientToUnassign) {
      // Actualizar el estado inmediatamente para la UI
      setAssignedClients((prev) => prev.filter((client) => client.id !== clientToUnassign.id))
      setUnassignedClients((prev) => [...prev, { ...clientToUnassign, isAssigned: false }])

      try {
        const token = localStorage.getItem("accessToken")
        if (!token) throw new Error("No authentication token found")

        const response = await axiosInstance.delete(`/assignment/unassign/contador/${clientToUnassign.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.data.success) {
          toast.success(`Cliente ${clientToUnassign.company} desasignado`)
        } else {
          throw new Error(response.data.message || "Error unassigning client")
        }
      } catch (error) {
        console.error("Error unassigning client:", error)
        toast.error("Error al desasignar el cliente. Revirtiendo cambios...")

        // Revertir cambios en caso de error
        setAssignedClients((prev) => [...prev, clientToUnassign])
        setUnassignedClients((prev) => prev.filter((client) => client.id !== clientToUnassign.id))
      } finally {
        setIsConfirmDialogOpen(false)
        setClientToUnassign(null)
      }
    }
  }

  const getStatusColor = (isAssigned: boolean): "red" | "yellow" | "green" => {
    if (!isAssigned) return "red"
    return "green"
  }

  const ClientCard = ({ client }: { client: Client }) => (
    <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{client.company}</h3>
            <p className="text-sm text-muted-foreground">
              Tipo: {client.type === "FISICA" ? "Persona Física" : "Persona Moral"}
            </p>
          </div>
          <Badge
            variant="outline"
            className={`bg-${getStatusColor(client.isAssigned)}-100 text-${getStatusColor(client.isAssigned)}-800 border-${getStatusColor(client?.isAssigned)}-300`}
          >
            {client.isAssigned ? "Asignado" : "No Asignado"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <Toaster />
      <h1 className="text-2xl font-bold mb-6">Asignación de Clientes</h1>
      <div className="mb-6">
        <Label htmlFor="contador-select">Seleccionar Contador</Label>
        <Popover open={openContadorSelect} onOpenChange={setOpenContadorSelect}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openContadorSelect}
              className="w-full justify-between"
            >
              {selectedContador ? selectedContador.name : "Seleccione un contador..."}
              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0">
            <Command>
              <CommandInput placeholder="Buscar contador..." onValueChange={setContadorSearchTerm} />
              <CommandList>
                <CommandEmpty>No se encontraron contadores.</CommandEmpty>
                <CommandGroup>
                  {filteredContadores.map((contador) => (
                    <CommandItem key={contador.id} onSelect={() => handleContadorChange(contador.id)}>
                      <User className="mr-2 h-4 w-4" />
                      <span>{contador.name}</span>
                      <span className="ml-auto text-sm text-muted-foreground">{contador.email}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-2 gap-6">
          <Card className="h-full flex flex-col">
            <CardContent className="p-4 flex-grow flex flex-col">
              <h2 className="text-xl font-semibold mb-4">Clientes Asignados</h2>
              <div className="mb-4">
                <Label htmlFor="search-assigned-clients">Buscar Clientes</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-assigned-clients"
                    placeholder="Buscar por nombre de empresa"
                    value={assignedSearchTerm}
                    onChange={(e) => setAssignedSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="flex-grow overflow-hidden" style={{ maxHeight: "550px" }}>
                <Droppable droppableId="assigned">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`h-full overflow-y-auto overflow-x-hidden p-4 rounded-lg transition-colors duration-200 ${
                        snapshot.isDraggingOver ? "bg-green-100" : ""
                      }`}
                      style={{ maxHeight: "100%" }}
                    >
                      <div className="space-y-4">
                        {filteredAssignedClients.map((client, index) => (
                          <Draggable key={client.id} draggableId={client.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="transition-transform duration-200 hover:scale-105"
                              >
                                <ClientCard client={client} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            </CardContent>
          </Card>

          <Card className="h-full flex flex-col">
            <CardContent className="p-4 flex-grow flex flex-col">
              <h2 className="text-xl font-semibold mb-4">Clientes No Asignados</h2>
              <div className="mb-4">
                <Label htmlFor="search-clients">Buscar Clientes</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-clients"
                    placeholder="Buscar por nombre de empresa"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="flex-grow overflow-hidden" style={{ maxHeight: "550px" }}>
                <Droppable droppableId="unassigned">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`h-full overflow-y-auto overflow-x-hidden p-4 rounded-lg transition-colors duration-200 ${
                        snapshot.isDraggingOver ? "bg-red-100" : ""
                      }`}
                      style={{ maxHeight: "100%" }}
                    >
                      <div className="space-y-4">
                        {filteredUnassignedClients.map((client, index) => (
                          <Draggable key={client.id} draggableId={client.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`draggable-transition ${snapshot.isDragging ? "scale-105" : ""}`}
                              >
                                <ClientCard client={client} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            </CardContent>
          </Card>
        </div>
      </DragDropContext>
      <ConfirmationDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => {
          setIsConfirmDialogOpen(false)
          setClientToUnassign(null)
        }}
        onConfirm={handleUnassignConfirm}
        title="Desasignar Cliente"
        description={`¿Estás seguro de que quieres desasignar a ${clientToUnassign?.company}? Esta acción no se puede deshacer.`}
        confirmationWord="DESASIGNAR"
        isConfirming={false}
      />
    </div>
  )
}

