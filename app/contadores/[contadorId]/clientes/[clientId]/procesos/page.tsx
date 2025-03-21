"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertTriangle, Clock, CheckCircle } from "lucide-react"
import type { Client, Process } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { FileUploader } from "@/components/FileUploader"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Process {
  name: string
  status: "completed" | "in_progress" | "pending"
  progress: number
  dueDate: string
  semaphore: "green" | "yellow" | "red"
}

const mockClient: Client = {
  id: "1",
  name: "Empresa A",
  company: "Corporación XYZ",
  type: "Persona Moral",
  assignedTo: "1",
  status: "active",
  processes: [
    { name: "Pago de IMSS", status: "in_progress", progress: 50, dueDate: "2025-03-15", semaphore: "yellow" },
    { name: "Pago de nómina", status: "completed", progress: 100, dueDate: "2025-03-10", semaphore: "green" },
    { name: "Carga de constancia", status: "pending", progress: 0, dueDate: "2025-03-20", semaphore: "red" },
    {
      name: "Carga de opinión de cumplimiento",
      status: "pending",
      progress: 0,
      dueDate: "2025-03-25",
      semaphore: "yellow",
    },
    { name: "Pago ante el SAT", status: "pending", progress: 0, dueDate: "2025-03-30", semaphore: "green" },
  ],
}

export default function ClienteProcesosPage() {
  const params = useParams()
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)

  useEffect(() => {
    // In a real application, you would fetch the client data here
    // For now, we'll use the mock data
    setClient(mockClient)
  }, [])

  if (!client) {
    return <div>Cargando...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Procesos activos de {client.name}</h1>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Clientes Asignados
        </Button>
      </div>
      <div className="flex gap-6">
        <div className="w-1/3">
          <div className="sticky top-6">
            <Card>
              <CardHeader>
                <CardTitle>Información del Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Nombre:</strong> {client.name}
                </p>
                <p>
                  <strong>Empresa:</strong> {client.company}
                </p>
                <p>
                  <strong>Tipo:</strong> {client.type}
                </p>
                <p>
                  <strong>Estado:</strong> {client.status === "active" ? "Activo" : "Inactivo"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="w-2/3">
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="grid gap-6">
              {client.processes
                .sort((a, b) => {
                  const order = { red: 0, yellow: 1, green: 2 }
                  return order[a.semaphore] - order[b.semaphore]
                })
                .map((process, index) => (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        {process.name}
                        {process.semaphore === "red" && <AlertTriangle className="ml-2 h-4 w-4 inline text-red-500" />}
                        {process.semaphore === "yellow" && <Clock className="ml-2 h-4 w-4 inline text-yellow-500" />}
                        {process.semaphore === "green" && (
                          <CheckCircle className="ml-2 h-4 w-4 inline text-green-500" />
                        )}
                      </CardTitle>
                      <Badge
                        variant={
                          process.semaphore === "red"
                            ? "destructive"
                            : process.semaphore === "yellow"
                              ? "warning"
                              : "default"
                        }
                      >
                        {format(new Date(process.dueDate), "dd MMM yyyy", { locale: es })}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <p>
                          <strong>Estado:</strong> {process.status}
                        </p>
                        <Progress value={process.progress} className="mt-2" />
                      </div>
                      <FileUploader
                        onFileUpload={(file) => {
                          console.log(`Archivo cargado para ${process.name}:`, file)
                          // Aquí puedes agregar la lógica para manejar el archivo cargado
                        }}
                      />
                    </CardContent>
                  </Card>
                ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

