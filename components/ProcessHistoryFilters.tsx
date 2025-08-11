"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, Filter, X, Search, ArrowUpDown, User, CalendarIcon as CalendarIconLucide } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type {
  ProcessHistoryFilters as ProcessHistoryFiltersType,
  ProcessHistorySorting,
} from "@/hooks/useProcessHistory"

interface ProcessHistoryFiltersProps {
  filters: ProcessHistoryFiltersType
  sorting: ProcessHistorySorting
  onFiltersChange: (filters: ProcessHistoryFiltersType) => void
  onSortingChange: (sorting: ProcessHistorySorting) => void
  onResetFilters?: () => void
  clientName?: string
  isClientLocked?: boolean
  contadores?: Array<{ id: string; firstName: string; lastName: string }>
  processes?: Array<{ id: string; name: string }>
  isLoadingContadores?: boolean
  isLoadingProcesses?: boolean
}

export function ProcessHistoryFilters({
  filters,
  sorting,
  onFiltersChange,
  onSortingChange,
  onResetFilters,
  clientName,
  isClientLocked = false,
  contadores = [],
  processes = [],
  isLoadingContadores = false,
  isLoadingProcesses = false,
}: ProcessHistoryFiltersProps) {
  const [localFilters, setLocalFilters] = useState<ProcessHistoryFiltersType>(filters)
  const [dateFromOpen, setDateFromOpen] = useState(false)
  const [dateToOpen, setDateToOpen] = useState(false)
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false)

  // Sincronizar filtros locales con los props
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  // Función para aplicar filtros
  const applyFilters = () => {
    onFiltersChange(localFilters)
    setAdvancedFiltersOpen(false)
  }

  // Función para limpiar filtros
  const clearFilters = () => {
    const clearedFilters: ProcessHistoryFiltersType = {
      clientId: filters.clientId, // Mantener clientId si está bloqueado
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  // Función para alternar ordenamiento
  const toggleSort = (field: "clientName" | "dateCompleted") => {
    if (sorting.sortBy === field) {
      // Si ya estamos ordenando por este campo, cambiar el orden
      onSortingChange({
        sortBy: field,
        sortOrder: sorting.sortOrder === "asc" ? "desc" : "asc",
      })
    } else {
      // Si cambiamos de campo, usar orden descendente por defecto para fechas
      onSortingChange({
        sortBy: field,
        sortOrder: field === "dateCompleted" ? "desc" : "asc",
      })
    }
  }

  // Contar filtros activos
  const activeFiltersCount = Object.keys(localFilters).filter((key) => {
    const value = localFilters[key as keyof ProcessHistoryFiltersType]
    if (key === "clientId" && isClientLocked) return false // No contar clientId si está bloqueado
    return value !== undefined && value !== "" && (Array.isArray(value) ? value.length > 0 : true)
  }).length

  return (
    <div className="space-y-4 border-b pb-4">
      {/* Controles principales */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Cliente (bloqueado si viene del modal) */}
        <div className="flex-1">
          <Label htmlFor="client" className="text-sm font-medium">
            Cliente
          </Label>
          <Input
            id="client"
            value={clientName || "Todos los clientes"}
            disabled={isClientLocked}
            className={cn("mt-1", isClientLocked && "bg-gray-50 text-gray-600")}
            readOnly
          />
        </div>

        {/* Búsqueda */}
        <div className="flex-1">
          <Label htmlFor="search" className="text-sm font-medium">
            Buscar proceso
          </Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="search"
              placeholder="Buscar por nombre de proceso..."
              value={localFilters.search || ""}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  search: e.target.value || undefined,
                }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  applyFilters()
                }
              }}
              className="pl-10"
            />
            {localFilters.search && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => {
                  setLocalFilters((prev) => ({ ...prev, search: undefined }))
                  onFiltersChange({ ...localFilters, search: undefined })
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filtros de fecha */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label className="text-sm font-medium">Fecha desde</Label>
          <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal mt-1",
                  !localFilters.dateFrom && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localFilters.dateFrom
                  ? format(new Date(localFilters.dateFrom), "dd/MM/yyyy", { locale: es })
                  : "Seleccionar fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={localFilters.dateFrom ? new Date(localFilters.dateFrom) : undefined}
                onSelect={(date) => {
                  setLocalFilters((prev) => ({
                    ...prev,
                    dateFrom: date ? format(date, "yyyy-MM-dd") : undefined,
                  }))
                  setDateFromOpen(false)
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex-1">
          <Label className="text-sm font-medium">Fecha hasta</Label>
          <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal mt-1",
                  !localFilters.dateTo && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {localFilters.dateTo
                  ? format(new Date(localFilters.dateTo), "dd/MM/yyyy", { locale: es })
                  : "Seleccionar fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={localFilters.dateTo ? new Date(localFilters.dateTo) : undefined}
                onSelect={(date) => {
                  setLocalFilters((prev) => ({
                    ...prev,
                    dateTo: date ? format(date, "yyyy-MM-dd") : undefined,
                  }))
                  setDateToOpen(false)
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Controles de ordenamiento y filtros avanzados */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Botones de ordenamiento */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Ordenar por:</span>
          <Button
            variant={sorting.sortBy === "clientName" ? "default" : "outline"}
            size="sm"
            onClick={() => toggleSort("clientName")}
            className="flex items-center gap-1"
            disabled={isClientLocked} // Deshabilitar si solo hay un cliente
          >
            <User className="h-4 w-4" />
            Cliente
            {sorting.sortBy === "clientName" && (
              <ArrowUpDown className={`h-4 w-4 ${sorting.sortOrder === "asc" ? "rotate-0" : "rotate-180"}`} />
            )}
          </Button>
          <Button
            variant={sorting.sortBy === "dateCompleted" ? "default" : "outline"}
            size="sm"
            onClick={() => toggleSort("dateCompleted")}
            className="flex items-center gap-1"
          >
            <CalendarIconLucide className="h-4 w-4" />
            Fecha
            {sorting.sortBy === "dateCompleted" && (
              <ArrowUpDown className={`h-4 w-4 ${sorting.sortOrder === "asc" ? "rotate-0" : "rotate-180"}`} />
            )}
          </Button>
        </div>

        {/* Filtros avanzados y acciones */}
        <div className="flex items-center gap-2">
          <Popover open={advancedFiltersOpen} onOpenChange={setAdvancedFiltersOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                <Filter className="h-4 w-4" />
                Filtros avanzados
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filtros avanzados</h4>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Limpiar
                  </Button>
                </div>

                <Separator />

                {/* Contador */}
                <div>
                  <Label className="text-sm font-medium">Contador</Label>
                  <Select
                    value={localFilters.contadorId || "all"}
                    onValueChange={(value) =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        contadorId: value === "all" ? undefined : value,
                      }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Todos los contadores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los contadores</SelectItem>
                      {contadores.map((contador) => (
                        <SelectItem key={contador.id} value={contador.id}>
                          {contador.firstName} {contador.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Proceso */}
                <div>
                  <Label className="text-sm font-medium">Proceso</Label>
                  <Select
                    value={localFilters.processId || "all"}
                    onValueChange={(value) =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        processId: value === "all" ? undefined : value,
                      }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Todos los procesos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los procesos</SelectItem>
                      {processes.map((process) => (
                        <SelectItem key={process.id} value={process.id}>
                          {process.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Período de pago */}
                <div>
                  <Label className="text-sm font-medium">Período de pago</Label>
                  <Select
                    value={localFilters.paymentPeriod || "all"}
                    onValueChange={(value) =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        paymentPeriod: value === "all" ? undefined : (value as "MONTHLY" | "QUARTERLY" | "ANNUAL"),
                      }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Todos los períodos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los períodos</SelectItem>
                      <SelectItem value="MONTHLY">Mensual</SelectItem>
                      <SelectItem value="QUARTERLY">Trimestral</SelectItem>
                      <SelectItem value="ANNUAL">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Frecuencias de nómina */}
                <div>
                  <Label className="text-sm font-medium">Frecuencia de nómina</Label>
                  <Select
                    value={localFilters.payrollFrequencies?.[0] || "all"}
                    onValueChange={(value) =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        payrollFrequencies: value === "all" ? undefined : [value],
                      }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Todas las frecuencias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las frecuencias</SelectItem>
                      <SelectItem value="SEMANAL">Semanal</SelectItem>
                      <SelectItem value="QUINCENAL">Quincenal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button onClick={applyFilters} className="flex-1">
                    Aplicar filtros
                  </Button>
                  <Button variant="outline" onClick={() => setAdvancedFiltersOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Botón aplicar filtros principales */}
          <Button onClick={applyFilters} size="sm">
            Aplicar
          </Button>

          {/* Botón restablecer filtros */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            aria-label="Restablecer filtros"
            title="Restablecer filtros"
            className="text-gray-600 hover:text-gray-900"
          >
            Restablecer
          </Button>
        </div>
      </div>

      {/* Chips de filtros activos */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {localFilters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Búsqueda: {localFilters.search}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => {
                  setLocalFilters((prev) => ({ ...prev, search: undefined }))
                  onFiltersChange({ ...localFilters, search: undefined })
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {localFilters.dateFrom && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Desde: {format(new Date(localFilters.dateFrom), "dd/MM/yyyy", { locale: es })}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => {
                  setLocalFilters((prev) => ({ ...prev, dateFrom: undefined }))
                  onFiltersChange({ ...localFilters, dateFrom: undefined })
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {localFilters.dateTo && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Hasta: {format(new Date(localFilters.dateTo), "dd/MM/yyyy", { locale: es })}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => {
                  setLocalFilters((prev) => ({ ...prev, dateTo: undefined }))
                  onFiltersChange({ ...localFilters, dateTo: undefined })
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
