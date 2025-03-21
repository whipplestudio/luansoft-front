"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { User } from "@/types"
import axiosInstance from "@/api/config"

const userSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  lastName: z.string().min(2, { message: "El apellido debe tener al menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  role: z.enum(["ADMINISTRADOR", "DASHBOARD", "CONTADOR", "CLIENTE"]),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }).optional(),
  staff: z.boolean().default(false),
})

type UserFormData = z.infer<typeof userSchema>

interface NewUserFormProps {
  onSuccess: () => void
  user?: User
}

export function NewUserForm({ onSuccess, user }: NewUserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    setValue,
    reset,
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      staff: false,
    },
  })

  const watchStaff = watch("staff")

  useEffect(() => {
    if (user) {
      // Split the name into firstName and lastName
      const nameParts = user.name.split(" ")
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(" ")

      reset({
        id: user.id,
        firstName,
        lastName,
        email: user.email,
        role: user.role.toUpperCase() as UserFormData["role"],
        staff: user.staff || false,
      })
    }
  }, [user, reset])

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      // Prepare the data for API
      const apiData: Partial<UserFormData> = {}
      Object.keys(dirtyFields).forEach((key) => {
        apiData[key] = data[key]
      })

      // Always include 'staff' field if it's different from the original value
      if (user && data.staff !== user.staff) {
        apiData.staff = data.staff
      }

      // Always include 'role' field if it's different from the original value
      if (user && data.role !== user.role.toUpperCase()) {
        apiData.role = data.role
      }

      if (user) {
        // Update existing user
        const response = await axiosInstance.patch(`/user/${user.id}`, apiData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data.success) {
          toast.success("Usuario actualizado exitosamente")
        } else {
          throw new Error(response.data.message || "Error al actualizar el usuario")
        }
      } else {
        // Create new user
        const response = await axiosInstance.post("/user", data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data.success) {
          toast.success("Usuario creado exitosamente")
        } else {
          throw new Error(response.data.message || "Error al crear el usuario")
        }
      }

      reset()
      onSuccess()
    } catch (error) {
      console.error("Error:", error)
      if (error.response && error.response.data) {
        toast.error(error.response.data.message || "Error en la operación del usuario")
      } else {
        toast.error(user ? "Error al actualizar el usuario" : "Error al crear el usuario")
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

      {!user && (
        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" type="password" {...register("password")} />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>
      )}

      <div>
        <Label htmlFor="role">Rol</Label>
        <Select
          {...register("role")}
          onValueChange={(value) => setValue("role", value as UserFormData["role"])}
          defaultValue={user?.role?.toUpperCase()}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
            <SelectItem value="DASHBOARD">Dashboard</SelectItem>
            <SelectItem value="CONTADOR">Contador</SelectItem>
            <SelectItem value="CLIENTE">Cliente</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="staff"
          checked={watchStaff}
          onCheckedChange={(checked) => setValue("staff", checked as boolean)}
        />
        <Label htmlFor="staff">Es staff</Label>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : user ? "Actualizar Usuario" : "Crear Usuario"}
      </Button>
    </form>
  )
}

