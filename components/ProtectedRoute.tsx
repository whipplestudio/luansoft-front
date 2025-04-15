"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { hasPermission, type ResourceType, type ActionType, type RoleType } from "@/lib/permissions"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: ReactNode
  resource: ResourceType
  action: ActionType
  redirectTo?: string
}

export function ProtectedRoute({ children, resource, action, redirectTo = "/" }: ProtectedRouteProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    // Verificar si hay un usuario temporal (que debe cambiar su contraseña)
    const tempUser = localStorage.getItem("tempUser")
    if (tempUser) {
      // Si hay un usuario temporal, redirigir a la página de cambio de contraseña
      router.push("/cambiar-contrasena")
      return
    }

    const userRole = localStorage.getItem("userRole") as RoleType
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true"

    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (!hasPermission(userRole, resource, action)) {
      router.push(redirectTo)
      return
    }

    setIsAuthorized(true)
    setIsLoading(false)
  }, [action, redirectTo, resource, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-green" />
      </div>
    )
  }

  return isAuthorized ? <>{children}</> : null
}
