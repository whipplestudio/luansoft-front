import type { Contador } from "@/types"

interface ContadorDetailsProps {
  contador: Contador
}

export function ContadorDetails({ contador }: ContadorDetailsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Nombre</h3>
        <p>{contador.name}</p>
      </div>
      <div>
        <h3 className="text-lg font-medium">Email</h3>
        <p>{contador.email}</p>
      </div>
      <div>
        <h3 className="text-lg font-medium">Estado</h3>
        <p className={contador.status === "active" ? "text-green-600" : "text-red-600"}>
          {contador.status === "active" ? "Activo" : "Inactivo"}
        </p>
      </div>
      <div>
        <h3 className="text-lg font-medium">Último acceso</h3>
        <p>{contador.lastLogin}</p>
      </div>
      <div>
        <h3 className="text-lg font-medium">Clientes asignados</h3>
        <p>{contador.clients.length}</p>
      </div>
    </div>
  )
}

