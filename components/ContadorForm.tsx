"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Contador } from "@/types"
import axiosInstance from "@/api/config"

const contadorSchema = z.object({
  firstName: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  lastName: z.string().min(2, { message: "El apellido debe tener al menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres" }).optional(),
})

type ContadorFormData = z.infer<typeof contadorSchema>

interface ContadorFormProps {
  onSuccess: () => void
  contador?: Contador
}

export function ContadorForm({ onSuccess, contador }: ContadorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    reset,
  } = useForm<ContadorFormData>({
    resolver: zodResolver(contadorSchema),
    defaultValues: {
      firstName: contador?.name.split(" ")[0] || "",
      lastName: contador?.name.split(" ")[1] || "",
      email: contador?.email || "",
    },
  })

  useEffect(() => {
    if (contador) {
      reset({
        firstName: contador.name.split(" ")[0],
        lastName: contador.name.split(" ")[1],
        email: contador.email,
      })
    }
  }, [contador, reset])

  const onSubmit = async (data: ContadorFormData) => {
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      let response
      if (contador) {
        // Editing existing contador
        const updatedFields = Object.keys(dirtyFields).reduce((acc, key) => {
          if (key !== "password" || data.password) {
            acc[key] = data[key]
          }
          return acc
        }, {})

        response = await axiosInstance.patch(`/contador/${contador.id}`, updatedFields, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      } else {
        // Creating new contador
        response = await axiosInstance.post("/contador", data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      }

      if (response.data.success) {
        toast.success(contador ? "Contador actualizado exitosamente" : "Contador creado exitosamente")
        reset()
        onSuccess()
      } else {
        throw new Error(response.data.message || "Error al procesar la solicitud")
      }
    } catch (error) {
      console.error("Error:", error)
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || `Error al ${contador ? "actualizar" : "crear"} el contador`)
      } else {
        toast.error(`Error al ${contador ? "actualizar" : "crear"} el contador`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="firstName">Nombre</Label>
        <Input id="firstName" {...register("firstName")} />
        {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
      </div>

      <div>
        <Label htmlFor="lastName">Apellido</Label>
        <Input id="lastName" {...register("lastName")} />
        {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      {!contador && (
        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" type="password" {...register("password")} />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : contador ? "Actualizar Contador" : "Crear Contador"}
      </Button>
    </form>
  )
}

