"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, FileText, TrendingUp, Activity, DollarSign, BarChart3, Download } from "lucide-react"
import { MonthlyReportsModal } from "@/components/MonthlyReportsModal"
import { loadClientFinancialData, getAvailableYears, getAvailableMonths, getMonthName } from "@/lib/financial-data-service"
import type { ClienteFinancialData } from "@/types/financial"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/financial-calculations"

export default function ClientDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [clientCompany, setClientCompany] = useState<string>("")
  const [clientData, setClientData] = useState<ClienteFinancialData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMonthlyReportsModalOpen, setIsMonthlyReportsModalOpen] = useState(false)
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [latestPeriodData, setLatestPeriodData] = useState<any>(null)

  useEffect(() => {
    const userRole = localStorage.getItem("userRole")
    const userData = localStorage.getItem("user")

    if (!userData || userRole !== "contacto") {
      router.push("/clientes")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)

    const company = parsedUser.client?.company || parsedUser.company
    if (company) {
      setClientCompany(company)
      loadFinancialData(company)
    } else {
      setIsLoading(false)
    }
  }, [router])

  const loadFinancialData = async (company: string) => {
    setIsLoading(true)
    try {
      const data = await loadClientFinancialData(company)
      if (data) {
        setClientData(data)
        const years = getAvailableYears(data)
        setAvailableYears(years)

        if (years.length > 0) {
          const latestYear = years[0]
          const months = getAvailableMonths(data, latestYear)
          if (months.length > 0) {
            const latestMonth = months[months.length - 1]
            const yearData = data.years[latestYear.toString()]
            const erPeriodo = yearData.estadoResultadosPeriodo.find((er) => er.mes === latestMonth)
            const erYTD = yearData.estadoResultadosYTD.find((er) => er.mes === latestMonth)
            const bg = yearData.balanceGeneral.find((b) => b.mes === latestMonth)

            setLatestPeriodData({
              month: latestMonth,
              year: latestYear,
              erPeriodo,
              erYTD,
              bg,
            })
          }
        }
      }
    } catch (error) {
      console.error("Error loading financial data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#18332f] mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando información financiera...</p>
        </div>
      </div>
    )
  }

  if (!clientData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Sin datos disponibles</h2>
              <p className="text-slate-600">
                No se encontraron datos financieros para tu cuenta.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#18332f] mb-2">
          Bienvenido, {user?.firstName} {user?.lastName}
        </h1>
        <p className="text-lg text-slate-600">{clientData.razonSocial}</p>
      </div>

      {latestPeriodData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-l-4 border-l-green-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Ingresos del Mes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(latestPeriodData.erPeriodo?.ingresos || 0)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {getMonthName(latestPeriodData.month)} {latestPeriodData.year}
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Utilidad del Periodo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${latestPeriodData.erPeriodo?.utilidad >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(latestPeriodData.erPeriodo?.utilidad || 0)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Resultado mensual
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Utilidad Acumulada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${latestPeriodData.erYTD?.utilidadYTD >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(latestPeriodData.erYTD?.utilidadYTD || 0)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  YTD {latestPeriodData.year}
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Activo Circulante
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(latestPeriodData.bg?.ac || 0)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Balance General
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8 border-l-4 border-l-[#ffe48b]">
            <CardHeader className="bg-[#18332f] text-white">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resumen Ejecutivo - {getMonthName(latestPeriodData.month)} {latestPeriodData.year}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-lg mb-3 text-[#18332f]">Estado de Resultados</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-slate-600">Ingresos</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(latestPeriodData.erPeriodo?.ingresos || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-slate-600">Compras</span>
                      <span className="font-semibold text-slate-700">
                        {formatCurrency(latestPeriodData.erPeriodo?.compras || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-slate-600">Gastos</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(latestPeriodData.erPeriodo?.gastos || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b-2 border-slate-300 pb-2 pt-2">
                      <span className="font-bold text-slate-800">Utilidad</span>
                      <span className={`font-bold ${latestPeriodData.erPeriodo?.utilidad >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(latestPeriodData.erPeriodo?.utilidad || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3 text-[#18332f]">Balance General</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-slate-600">Activo Circulante</span>
                      <span className="font-semibold text-slate-700">
                        {formatCurrency(latestPeriodData.bg?.ac || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-slate-600">Pasivo Circulante</span>
                      <span className="font-semibold text-slate-700">
                        {formatCurrency(latestPeriodData.bg?.pc || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-slate-600">Bancos</span>
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(latestPeriodData.bg?.bancos || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b-2 border-slate-300 pb-2 pt-2">
                      <span className="font-bold text-slate-800">Capital de Trabajo</span>
                      <span className={`font-bold ${(latestPeriodData.bg?.ac - latestPeriodData.bg?.pc) >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency((latestPeriodData.bg?.ac || 0) - (latestPeriodData.bg?.pc || 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="bg-[#18332f] text-white">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Reportes Mensuales
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-slate-600 mb-4">
              Accede a tus reportes financieros mensuales detallados.
            </p>
            <Button
              onClick={() => setIsMonthlyReportsModalOpen(true)}
              className="w-full bg-[#18332f] hover:bg-[#18332f]/90"
            >
              <FileText className="mr-2 h-4 w-4" />
              Ver Reportes Mensuales
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-[#18332f] text-white">
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Exportar Datos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-slate-600 mb-4">
              Descarga tus reportes en formato PDF.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => alert("Funcionalidad de exportación en desarrollo")}
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar Reporte PDF
            </Button>
          </CardContent>
        </Card>
      </div>

      {availableYears.length > 0 && (
        <Card className="mt-6">
          <CardHeader className="bg-[#18332f] text-white">
            <CardTitle>Datos Disponibles</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {availableYears.map((year) => {
                const months = getAvailableMonths(clientData, year)
                return (
                  <div key={year} className="bg-slate-50 rounded-lg p-4 flex-1 min-w-[200px]">
                    <h4 className="font-bold text-lg text-[#18332f] mb-2">{year}</h4>
                    <p className="text-sm text-slate-600">{months.length} meses disponibles</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <MonthlyReportsModal
        isOpen={isMonthlyReportsModalOpen}
        onClose={() => setIsMonthlyReportsModalOpen(false)}
        clientId={clientCompany}
        clientName={clientData.clienteNombre}
      />
    </div>
  )
}
