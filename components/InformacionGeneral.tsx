"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Contador } from "@/types"

interface InformacionGeneralProps {
  contador: Contador
}

export function InformacionGeneral({ contador }: InformacionGeneralProps) {
  // Obtener las iniciales del nombre para el avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const fullName = `${contador.name}`
  const initials = getInitials(fullName)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <Badge variant={contador.status === "active" ? "default" : "destructive"}>
              {contador.status === "active" ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          <div className="space-y-2 flex-1">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nombre</p>
              <p className="text-base">{fullName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-base">{contador.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rol</p>
              <p className="text-base capitalize">{contador.role}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Clientes Asignados</p>
              <p className="text-base">{contador.clientCount || contador.clients?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Último Acceso</p>
              <p className="text-base">
                {contador.lastLogin ? new Date(contador.lastLogin).toLocaleDateString() : "No disponible"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

