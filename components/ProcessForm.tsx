"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Process } from "@/types"
import { Loader2 } from "lucide-react"

const processSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
})

type ProcessFormData = z.infer<typeof processSchema>

interface ProcessFormProps {
  onSuccess: (process: Process) => void
  onCancel: () => void
  process?: Process
}

export function ProcessForm({ onSuccess, onCancel, process }: ProcessFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProcessFormData>({
    resolver: zodResolver(processSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  useEffect(() => {
    if (process) {
      reset({
        name: process.name,
        description: process.description || "",
      })
    }
  }, [process, reset])

  const onSubmit = async (data: ProcessFormData) => {
    setIsSubmitting(true)

    try {
      // Pasar los datos al componente padre
      await onSuccess({
        id: process?.id || "",
        name: data.name,
        description: data.description,
        progress: process?.progress || 0,
        createdAt: process?.createdAt,
        updatedAt: process?.updatedAt,
      })
      // No reseteamos el estado isSubmitting aquí, ya que el componente padre
      // cerrará el diálogo después de una operación exitosa
    } catch (error) {
      console.error("Error submitting form:", error)
      setIsSubmitting(false) // Solo reseteamos en caso de error
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" {...register("description")} />
        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {process ? "Actualizando..." : "Creando..."}
            </>
          ) : process ? (
            "Actualizar Proceso"
          ) : (
            "Crear Proceso"
          )}
        </Button>
      </div>
    </form>
  )
}

