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
import { SearchableSelect, type SelectOption } from "@/components/ui/searchable-select"
import { Skeleton } from "@/components/ui/skeleton"

const formSchema = z.object({
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  processes: z.array(z.string()).optional(),
  clients: z.array(z.string()).optional(),
  contadores: z.array(z.string()).optional(),
})

interface HistoricoFiltrosProps {
  onFilter: (filters: any) => void
  procesos: { id: string; name: string }[]
  clientes: { id: string; company: string }[]
  contadores: { id: string; firstName: string; lastName: string }[]
  isLoadingClients?: boolean
  isLoadingProcesses?: boolean
  isLoadingContadores?: boolean
}

export function HistoricoFiltros({
  onFilter,
  procesos,
  clientes,
  contadores,
  isLoadingClients = false,
  isLoadingProcesses = false,
  isLoadingContadores = false,
}: HistoricoFiltrosProps) {
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
    form.reset({
      startDate: undefined,
      endDate: undefined,
      processes: [],
      clients: [],
      contadores: [],
    })
    onFilter({})
  }

  // Convertir los datos a formato de opciones para SearchableSelect
  const procesosOptions: SelectOption[] = procesos.map((proceso) => ({
    label: proceso.name,
    value: proceso.id,
  }))

  const clientesOptions: SelectOption[] = clientes.map((cliente) => ({
    label: cliente.company,
    value: cliente.id,
  }))

  const contadoresOptions: SelectOption[] = contadores.map((contador) => ({
    label: `${contador.firstName} ${contador.lastName}`,
    value: contador.id,
  }))

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
                      options={procesosOptions}
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
                      options={clientesOptions}
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
                      options={contadoresOptions}
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

