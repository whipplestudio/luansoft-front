import type { User } from "@/types"

interface UserDetailsProps {
  user: User
}

export function UserDetails({ user }: UserDetailsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Nombre</h3>
        <p>{user.name}</p>
      </div>
      <div>
        <h3 className="text-lg font-medium">Email</h3>
        <p>{user.email}</p>
      </div>
      <div>
        <h3 className="text-lg font-medium">Rol</h3>
        <p className="capitalize">{user.role}</p>
      </div>
      <div>
        <h3 className="text-lg font-medium">Estado</h3>
        <p className={user.status === "active" ? "text-green-600" : "text-red-600"}>
          {user.status === "active" ? "Activo" : "Inactivo"}
        </p>
      </div>
      <div>
        <h3 className="text-lg font-medium">Último acceso</h3>
        <p>{user.lastLogin || "Nunca"}</p>
      </div>
    </div>
  )
}

