"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { cn } from "@/lib/utils"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Skeleton } from "@/components/ui/skeleton"
import { useState, useEffect } from "react"

const formSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  processes: z.array(z.string()).optional(),
  clients: z.array(z.string()).optional(),
  contadores: z.array(z.string()).optional(),
})

// Modificar para preseleccionar y bloquear el contacto cuando el usuario es un contacto

// Primero, actualizar las props para incluir userRole y el ID del contacto preseleccionado
interface HistoricoFiltrosProps {
  onFilter: (filters: any) => void
  procesos: { id: string; name: string }[]
  clientes: { id: string; company: string }[]
  contadores: { id: string; firstName: string; lastName: string }[]
  isLoadingClients?: boolean
  isLoadingProcesses?: boolean
  isLoadingContadores?: boolean
}

// Modificar el componente para ocultar el selector de contadores cuando el usuario es un contador
export function HistoricoFiltros({
  onFilter,
  procesos,
  clientes,
  contadores,
  isLoadingClients = false,
  isLoadingProcesses = false,
  isLoadingContadores = false,
}: HistoricoFiltrosProps) {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Obtener el rol y el ID del usuario al cargar el componente
  useEffect(() => {
    const role = localStorage.getItem("userRole")
    setUserRole(role)

    const userData = localStorage.getItem("user")
    if (userData) {
      const user = JSON.parse(userData)
      if (user.id) {
        setUserId(user.id)
      }
    }
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startDate: undefined,
      endDate: undefined,
      processes: [],
      clients: [],
      contadores: [],
    },
  })

  // Preseleccionar el contador logueado si el usuario es un contador
  useEffect(() => {
    if (userRole === "contador" && userId) {
      // Buscar el contador correspondiente al usuario
      const contadorFound = contadores.find((contador) => contador.id === userId)
      if (contadorFound) {
        form.setValue("contadores", [contadorFound.id])
      }
    }
  }, [userRole, userId, contadores, form])

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Convertir los arrays vacíos a undefined para el filtrado
    const filters = {
      ...values,
      processes: values.processes && values.processes.length > 0 ? values.processes : undefined,
      clients: values.clients && values.clients.length > 0 ? values.clients : undefined,
      contadores: values.contadores && values.contadores.length > 0 ? values.contadores : undefined,
    }
    onFilter(filters)
  }

  function handleReset() {
    // Si el usuario es un contador, mantener preseleccionado su ID al resetear
    if (userRole === "contador" && userId) {
      const contadorFound = contadores.find((contador) => contador.id === userId)
      if (contadorFound) {
        form.reset({
          startDate: undefined,
          endDate: undefined,
          processes: [],
          clients: [],
          contadores: [contadorFound.id],
        })
        onFilter({ contadores: [contadorFound.id] })
      } else {
        form.reset()
        onFilter({})
      }
    } else {
      form.reset({
        startDate: undefined,
        endDate: undefined,
        processes: [],
        clients: [],
        contadores: [],
      })
      onFilter({})
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de inicio</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Seleccionar fecha</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de fin</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Seleccionar fecha</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="processes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Procesos</FormLabel>
                {isLoadingProcesses ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <FormControl>
                    <SearchableSelect
                      options={procesos.map((proceso) => ({
                        label: proceso.name,
                        value: proceso.id,
                      }))}
                      selected={field.value || []}
                      onChange={field.onChange}
                      placeholder="Seleccionar procesos"
                      multiple={true}
                      showSearch={true}
                      searchPlaceholder="Buscar procesos..."
                      noResultsMessage="No se encontraron procesos"
                      clearButtonText="Limpiar selección"
                      selectAllButtonText="Seleccionar todos"
                    />
                  </FormControl>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="clients"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Clientes</FormLabel>
                {isLoadingClients ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <FormControl>
                    <SearchableSelect
                      options={clientes.map((cliente) => ({
                        label: cliente.company,
                        value: cliente.id,
                      }))}
                      selected={field.value || []}
                      onChange={field.onChange}
                      placeholder="Seleccionar clientes"
                      multiple={true}
                      showSearch={true}
                      searchPlaceholder="Buscar clientes..."
                      noResultsMessage="No se encontraron clientes"
                      clearButtonText="Limpiar selección"
                      selectAllButtonText="Seleccionar todos"
                    />
                  </FormControl>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mostrar el selector de contadores solo si el usuario no es un contador */}
          {userRole !== "contador" && (
            <FormField
              control={form.control}
              name="contadores"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contadores</FormLabel>
                  {isLoadingContadores ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <FormControl>
                      <SearchableSelect
                        options={contadores.map((contador) => ({
                          label: `${contador.firstName} ${contador.lastName}`,
                          value: contador.id,
                        }))}
                        selected={field.value || []}
                        onChange={field.onChange}
                        placeholder="Seleccionar contadores"
                        multiple={true}
                        showSearch={true}
                        searchPlaceholder="Buscar contadores..."
                        noResultsMessage="No se encontraron contadores"
                        clearButtonText="Limpiar selección"
                        selectAllButtonText="Seleccionar todos"
                      />
                    </FormControl>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={handleReset}>
            Limpiar filtros
          </Button>
          <Button type="submit">Aplicar filtros</Button>
        </div>
      </form>
    </Form>
  )
}
