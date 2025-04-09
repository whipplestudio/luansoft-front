import type { Contacto } from "@/types"
import { format, subDays } from "date-fns"

// Generar datos mock para contactos
export const mockContactos: Contacto[] = Array.from({ length: 50 }, (_, i) => {
  const id = `contacto-${i + 1}`
  const firstName = ["Juan", "María", "Carlos", "Ana", "Pedro", "Laura", "Miguel", "Sofía", "José", "Lucía"][
    Math.floor(Math.random() * 10)
  ]
  const lastName = [
    "García",
    "Rodríguez",
    "López",
    "Martínez",
    "González",
    "Pérez",
    "Sánchez",
    "Ramírez",
    "Torres",
    "Flores",
  ][Math.floor(Math.random() * 10)]
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@example.com`
  const phone = Math.random() > 0.1 ? `+52 ${Math.floor(Math.random() * 1000000000)}` : null
  const status = Math.random() > 0.2 ? "ACTIVE" : "INACTIVE"
  const clientId = Math.random() > 0.3 ? `client-${Math.floor(Math.random() * 20) + 1}` : undefined
  const client = clientId
    ? {
        id: clientId,
        company: `Empresa ${Math.floor(Math.random() * 20) + 1}`,
      }
    : undefined
  const createdAt = format(subDays(new Date(), Math.floor(Math.random() * 365)), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
  const updatedAt = format(subDays(new Date(), Math.floor(Math.random() * 30)), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")

  return {
    id,
    firstName,
    lastName,
    email,
    phone,
    status,
    clientId,
    client,
    createdAt,
    updatedAt,
  }
})
