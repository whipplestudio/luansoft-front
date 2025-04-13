"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { hasPermission, type ResourceType, type ActionType, type RoleType } from "@/lib/permissions"

interface ProtectedRouteProps {
  children: ReactNode
  resource: ResourceType
  action: ActionType
  redirectTo?: string
}

export function ProtectedRoute({ children, resource, action, redirectTo = "/" }: ProtectedRouteProps) {
  const router = useRouter()

  useEffect(() => {
    const userRole = localStorage.getItem("userRole") as RoleType

    if (!hasPermission(userRole, resource, action)) {
      router.push(redirectTo)
    }
  }, [action, redirectTo, resource, router])

  return <>{children}</>
}
