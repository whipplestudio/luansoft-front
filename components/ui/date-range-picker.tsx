"use client"

import * as React from "react"
import { CalendarIcon, X } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subDays,
} from "date-fns"
import { es } from "date-fns/locale"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  placeholder?: string
  className?: string
}

const presets = [
  {
    label: "Este mes",
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
  {
    label: "Últimos 30 días",
    getValue: () => ({
      from: subDays(new Date(), 30),
      to: new Date(),
    }),
  },
  {
    label: "Trimestre actual",
    getValue: () => ({
      from: startOfQuarter(new Date()),
      to: endOfQuarter(new Date()),
    }),
  },
  {
    label: "Año en curso",
    getValue: () => ({
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    }),
  },
]

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Seleccionar rango de fechas",
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [tempRange, setTempRange] = React.useState<DateRange | undefined>(value)
  const [error, setError] = React.useState<string>("")

  React.useEffect(() => {
    setTempRange(value)
  }, [value])

  const handleApply = () => {
    if (tempRange?.from && tempRange?.to && tempRange.from > tempRange.to) {
      setError("La fecha 'hasta' debe ser posterior a la fecha 'desde'")
      return
    }

    setError("")
    onChange?.(tempRange)
    setIsOpen(false)
  }

  const handleReset = () => {
    const defaultRange = presets[1].getValue() // Últimos 30 días
    setTempRange(defaultRange)
    onChange?.(defaultRange)
    setError("")
    setIsOpen(false)
  }

  const handlePresetSelect = (preset: (typeof presets)[0]) => {
    const range = preset.getValue()
    setTempRange(range)
    setError("")
  }

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return placeholder
    if (!range.to) return format(range.from, "dd/MMM/yyyy", { locale: es })
    return `${format(range.from, "dd/MMM/yyyy", { locale: es })} – ${format(range.to, "dd/MMM/yyyy", { locale: es })}`
  }

  return (
    <div className="space-y-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground", className)}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(value)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Presets */}
            <div className="border-r p-3 space-y-1">
              <div className="text-sm font-medium mb-2">Presets</div>
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-sm"
                  onClick={() => handlePresetSelect(preset)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {/* Calendar */}
            <div className="p-3">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Fecha desde</label>
                    <div className="text-sm">
                      {tempRange?.from ? format(tempRange.from, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Fecha hasta</label>
                    <div className="text-sm">
                      {tempRange?.to ? format(tempRange.to, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                    </div>
                  </div>
                </div>

                {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</div>}

                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={tempRange?.from}
                  selected={tempRange}
                  onSelect={setTempRange}
                  numberOfMonths={2}
                  locale={es}
                />

                <div className="flex justify-between pt-2 border-t">
                  <Button variant="link" size="sm" onClick={handleReset} className="text-xs px-0">
                    Restablecer
                  </Button>
                  <Button size="sm" onClick={handleApply} disabled={!!error} className="text-xs">
                    Aplicar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
