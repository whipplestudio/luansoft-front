"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, FolderOpen, Calendar, CheckSquare } from "lucide-react"

interface ProcessSelectorProps {
  processes: Array<{
    id: string
    name: string
    count: number
    months: Array<{
      month: string
      count: number
    }>
  }>
  selectedProcesses: string[]
  selectedMonths: string[]
  onProcessSelect: (processId: string) => void
  onMonthSelect: (processId: string, month: string) => void
  onSelectAll: () => void
  onClearAll: () => void
}

export function ProcessSelector({
  processes,
  selectedProcesses,
  selectedMonths,
  onProcessSelect,
  onMonthSelect,
  onSelectAll,
  onClearAll,
}: ProcessSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProcesses = processes.filter((process) => process.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const totalDocuments = processes.reduce((sum, process) => sum + process.count, 0)
  const hasSelections = selectedProcesses.length > 0 || selectedMonths.length > 0

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Tipos de Proceso
        </CardTitle>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{totalDocuments} documentos</span>
          {hasSelections && (
            <Button variant="ghost" size="sm" onClick={onClearAll} className="text-xs h-6 px-2">
              Limpiar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar procesos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9"
          />
        </div>

        {/* Bulk actions */}
        {processes.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onSelectAll}
              className="flex items-center gap-1 text-xs h-7 bg-transparent"
            >
              <CheckSquare className="h-3 w-3" />
              Seleccionar todo
            </Button>
          </div>
        )}

        {/* Process list */}
        <div className="flex-1 overflow-auto">
          {filteredProcesses.length > 0 ? (
            <Accordion type="multiple" className="space-y-2">
              {filteredProcesses.map((process) => {
                const isProcessSelected = selectedProcesses.includes(process.id)
                const selectedMonthsForProcess = selectedMonths.filter((month) =>
                  process.months.some((m) => m.month === month),
                )

                return (
                  <AccordionItem key={process.id} value={process.id} className="border rounded-lg">
                    <div className="flex items-center gap-2 px-3 py-2">
                      <Checkbox
                        checked={isProcessSelected}
                        onCheckedChange={() => onProcessSelect(process.id)}
                      />
                      <AccordionTrigger className="flex-1 py-0 hover:no-underline">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="flex-1 text-left">
                            <div className="font-medium text-sm">{process.name}</div>
                            <div className="text-xs text-gray-500">
                              {process.count} documento{process.count !== 1 ? "s" : ""}
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {process.count}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                    </div>
                    <AccordionContent className="px-3 pb-2">
                      <div className="space-y-1 ml-6">
                        {process.months.map((monthData) => {
                          const isMonthSelected = selectedMonths.includes(monthData.month)

                          return (
                            <div
                              key={monthData.month}
                              className="flex items-center gap-2 py-1 px-2 rounded hover:bg-gray-50 cursor-pointer"
                              onClick={() => onMonthSelect(process.id, monthData.month)}
                            >
                              <Checkbox
                                checked={isMonthSelected}
                                onCheckedChange={() => onMonthSelect(process.id, monthData.month)}
                              />
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="text-sm flex-1">{monthData.month}</span>
                              <Badge variant="outline" className="text-xs">
                                {monthData.count}
                              </Badge>
                            </div>
                          )
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FolderOpen className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">{searchTerm ? "No se encontraron procesos" : "No hay procesos disponibles"}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
