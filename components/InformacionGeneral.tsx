import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Contador } from "@/types"

interface InformacionGeneralProps {
  contador: Contador
}

export function InformacionGeneral({ contador }: InformacionGeneralProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información del Contador</CardTitle>
        </CardHeader>
        <CardContent className="flex items-start space-x-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={contador.avatar} alt={contador.name} />
            <AvatarFallback>{contador.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{contador.name}</h2>
            <p className="text-muted-foreground">{contador.email}</p>
            <Badge variant={contador.status === "active" ? "success" : "destructive"}>
              {contador.status === "active" ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Cuenta</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-medium">ID:</dt>
                <dd>{contador.id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Rol:</dt>
                <dd className="capitalize">{contador.role}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Último acceso:</dt>
                <dd>{new Date(contador.lastLogin).toLocaleString()}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-medium">Clientes asignados:</dt>
                <dd>{contador.clients.length}</dd>
              </div>
              {/* Aquí puedes agregar más estadísticas si las tienes disponibles */}
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

