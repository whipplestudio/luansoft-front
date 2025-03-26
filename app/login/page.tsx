"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { toast, Toaster } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import axiosInstance from "@/api/config"
import { Logo } from "@/components/Logo"

const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "a.pulido@whipple.com",
      password: "Admin12345.",
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.post("/auth/login", data)

      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data.data

        // Map the API role to our internal role format
        const roleMapping = {
          ADMINISTRADOR: "admin",
          CONTADOR: "contador",
          CLIENTE: "cliente",
          DASHBOARD: "dashboard",
        }

        const mappedRole = roleMapping[user.role] || "cliente"

        localStorage.setItem("accessToken", accessToken)
        localStorage.setItem("refreshToken", refreshToken)
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...user,
            name: `${user.firstName} ${user.lastName}`,
            role: mappedRole,
          }),
        )
        localStorage.setItem("isAuthenticated", "true")
        localStorage.setItem("userRole", mappedRole)

        router.push("/")
      } else {
        throw new Error(response.data.message || "Error de inicio de sesión")
      }
    } catch (error) {
      console.error("Error durante el inicio de sesión:", error)
      toast.error(error.message || "Error al iniciar sesión. Por favor, intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-light-gray">
      <Toaster position="top-center" />
      <Card className="w-full max-w-md border-primary-green/20 shadow-lg">
        <CardHeader className="bg-primary-green text-white rounded-t-lg">
          <div className="flex justify-center mb-4">
            <Logo variant="vertical" color="white" width={300} height={320}  />
          </div>
          <CardTitle className="text-center">Iniciar sesión</CardTitle>
          <CardDescription className="text-light-gray text-center">
            Ingresa tus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" {...register("email")} className="border-primary-green/20" />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" {...register("password")} className="border-primary-green/20" />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full bg-primary-green hover:bg-primary-green/90" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

