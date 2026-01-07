"use client"

import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Download,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Lightbulb,
  LineChart,
  PieChart,
  Building2,
  Activity,
  Coins,
  HandCoins,
  Banknote,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import Image from "next/image"
import type { ClienteFinancialData, EstadoResultadosPeriodo, BalanceGeneral } from "@/types/financial"
import { loadClientFinancialData, getMonthName } from "@/lib/financial-data-service"
import {
  calcularKPIsFinancieros,
  calcularVariacionPeriodos,
  formatCurrency,
  formatPercentage,
  generarRecomendaciones,
} from "@/lib/financial-calculations"

interface ReportContentDynamicProps {
  clientId: string
  month: string
  year: number
}

export function ReportContentDynamic({ clientId, month, year }: ReportContentDynamicProps) {
  const [clientData, setClientData] = useState<ClienteFinancialData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      const data = await loadClientFinancialData(clientId)
      setClientData(data)
      setIsLoading(false)
    }
    loadData()
  }, [clientId])

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)
    try {
      alert("Exportación a PDF: pendiente de integración")
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const reportData = useMemo(() => {
    if (!clientData) return null

    const yearData = clientData.years[year.toString()]
    if (!yearData) return null

    const erPeriodo = yearData.estadoResultadosPeriodo.find((er) => er.mes === month)
    const erYTD = yearData.estadoResultadosYTD.find((er) => er.mes === month)
    const bg = yearData.balanceGeneral.find((b) => b.mes === month)

    if (!erPeriodo || !erYTD || !bg) return null

    const kpis = calcularKPIsFinancieros(erPeriodo, bg)
    const recomendaciones = generarRecomendaciones(kpis, erPeriodo)

    const previousYearData = clientData.years[(year - 1).toString()]
    let variacion = null
    if (previousYearData) {
      const erPreviousYear = previousYearData.estadoResultadosPeriodo.find((er) => er.mes.endsWith(month.split("-")[1]))
      if (erPreviousYear) {
        variacion = calcularVariacionPeriodos(erPeriodo, erPreviousYear)
      }
    }

    const allPeriodos: Array<EstadoResultadosPeriodo & { anio: number }> = []
    Object.keys(clientData.years)
      .sort()
      .forEach((y) => {
        const yData = clientData.years[y]
        yData.estadoResultadosPeriodo.forEach((er) => {
          allPeriodos.push({ ...er, anio: parseInt(y) })
        })
      })

    const allBalances: Array<BalanceGeneral & { anio: number }> = []
    Object.keys(clientData.years)
      .sort()
      .forEach((y) => {
        const yData = clientData.years[y]
        yData.balanceGeneral.forEach((b) => {
          allBalances.push({ ...b, anio: parseInt(y) })
        })
      })

    return {
      erPeriodo,
      erYTD,
      bg,
      kpis,
      recomendaciones,
      variacion,
      allPeriodos,
      allBalances,
    }
  }, [clientData, year, month])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#18332f] mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando datos financieros...</p>
        </div>
      </div>
    )
  }

  if (!clientData || !reportData) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] w-full flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-amber-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Datos no disponibles</h2>
          <p className="text-slate-600">
            No se encontraron datos para {clientId} - {getMonthName(month)} {year}
          </p>
        </div>
      </div>
    )
  }

  const { erPeriodo, erYTD, bg, kpis, recomendaciones, variacion, allPeriodos, allBalances } = reportData

  const cardsTop = [
    {
      title: "Utilidad del periodo",
      value: formatCurrency(erPeriodo.utilidad),
      subtitle: `${getMonthName(month)} ${year}`,
      icon: TrendingUp,
      accent: erPeriodo.utilidad >= 0 ? "green" : "red",
    },
    {
      title: "Utilidad acumulada YTD",
      value: formatCurrency(erYTD.utilidadYTD),
      subtitle: `Acumulado a ${getMonthName(month)} ${year}`,
      icon: Activity,
      accent: erYTD.utilidadYTD >= 0 ? "green" : "red",
    },
    {
      title: "Ingresos YTD",
      value: formatCurrency(erYTD.ingresosYTD),
      subtitle: `Ingresos acumulados ${year}`,
      icon: Coins,
      accent: "slate",
    },
    {
      title: "Razón circulante",
      value: kpis.razonCirculante.toFixed(2),
      subtitle: `Liquidez a ${getMonthName(month)} ${year}`,
      icon: LineChart,
      accent: kpis.razonCirculante >= 1.5 ? "green" : "amber",
    },
    {
      title: "Margen operativo",
      value: formatPercentage(kpis.margenOperativo),
      subtitle: `Eficiencia operativa`,
      icon: PieChart,
      accent: kpis.margenOperativo >= 0.1 ? "green" : "amber",
    },
    {
      title: "Capital de trabajo",
      value: formatCurrency(kpis.capitalTrabajo),
      subtitle: "AC - PC",
      icon: Banknote,
      accent: kpis.capitalTrabajo >= 0 ? "green" : "red",
    },
  ]

  return (
    <div className="min-h-screen bg-[#f8f9fa] w-full">
      <div className="bg-[#18332f] shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Image src="/luenser-logo.png" alt="Logo" width={180} height={60} className="h-12 w-auto" />
              <div className="text-white">
                <h1 className="text-2xl font-bold">{clientData.clienteNombre}</h1>
                <p className="text-sm text-slate-300">{clientData.razonSocial}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                size="lg"
                className="bg-[#ffe48b] hover:bg-[#ffd966] text-[#18332f] font-semibold"
              >
                <Download className="mr-2 h-5 w-5" />
                {isGeneratingPDF ? "Generando PDF..." : "Exportar a PDF"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6 border-l-4 border-l-[#ffe48b]">
          <div className="text-center mb-6">
            <h2 className="text-4xl font-bold text-[#18332f] mb-3">Reporte Ejecutivo Financiero</h2>
            <div className="flex items-center justify-center gap-2 text-lg text-slate-700 mb-2">
              <span className="font-semibold">{clientData.razonSocial}</span>
              <span>•</span>
              <span>
                {getMonthName(month)} {year}
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Fecha de emisión: {new Date().toLocaleDateString("es-MX")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-8">
            {cardsTop.map((c, idx) => (
              <div key={idx} className={`bg-white rounded-lg p-6 border-l-4 shadow-sm border-l-${c.accent}-600`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${c.accent}-600`}>
                    <c.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">{c.title}</h3>
                </div>
                <p
                  className={`text-3xl font-bold ${c.accent === "amber" ? "text-amber-600" : c.accent === "slate" ? "text-slate-700" : c.accent === "red" ? "text-red-600" : "text-green-600"}`}
                >
                  {c.value}
                </p>
                <p className="text-xs text-slate-600 mt-2">{c.subtitle}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="mb-6 shadow-sm">
          <CardHeader className="bg-[#18332f] text-white">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Resumen Ejecutivo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4 text-slate-700">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-lg mb-3 text-[#18332f]">Indicadores Clave</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>Margen Neto:</span>
                      <span className={`font-semibold ${kpis.margenNeto >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatPercentage(kpis.margenNeto)}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>Prueba Ácida:</span>
                      <span className={`font-semibold ${kpis.pruebaAcida >= 1 ? "text-green-600" : "text-amber-600"}`}>
                        {kpis.pruebaAcida.toFixed(2)}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span>ROE (Retorno sobre Capital):</span>
                      <span className="font-semibold">{formatPercentage(kpis.ROE)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Días Cuentas por Cobrar:</span>
                      <span className="font-semibold">{kpis.diasCuentasCobrar.toFixed(0)} días</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Razón de Endeudamiento:</span>
                      <span
                        className={`font-semibold ${kpis.razonEndeudamiento > 0.6 ? "text-amber-600" : "text-green-600"}`}
                      >
                        {formatPercentage(kpis.razonEndeudamiento)}
                      </span>
                    </li>
                  </ul>
                </div>
                {variacion && (
                  <div>
                    <h4 className="font-semibold text-lg mb-3 text-[#18332f]">Comparación Año Anterior</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between items-center">
                        <span>Ingresos:</span>
                        <div className="flex items-center gap-2">
                          {variacion.variacionPorcentual.ingresos >= 0 ? (
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-600" />
                          )}
                          <span
                            className={`font-semibold ${variacion.variacionPorcentual.ingresos >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {variacion.variacionPorcentual.ingresos.toFixed(1)}%
                          </span>
                        </div>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>Gastos:</span>
                        <div className="flex items-center gap-2">
                          {variacion.variacionPorcentual.gastos >= 0 ? (
                            <ArrowUpRight className="h-4 w-4 text-red-600" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-green-600" />
                          )}
                          <span
                            className={`font-semibold ${variacion.variacionPorcentual.gastos >= 0 ? "text-red-600" : "text-green-600"}`}
                          >
                            {Math.abs(variacion.variacionPorcentual.gastos).toFixed(1)}%
                          </span>
                        </div>
                      </li>
                      <li className="flex justify-between items-center">
                        <span>Utilidad:</span>
                        <div className="flex items-center gap-2">
                          {variacion.variacionPorcentual.utilidad >= 0 ? (
                            <ArrowUpRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-600" />
                          )}
                          <span
                            className={`font-semibold ${variacion.variacionPorcentual.utilidad >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {Math.abs(variacion.variacionPorcentual.utilidad).toFixed(1)}%
                          </span>
                        </div>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 shadow-sm">
          <CardHeader className="bg-[#ffe48b]">
            <CardTitle className="flex items-center gap-2 text-[#18332f]">
              <Lightbulb className="h-5 w-5" />
              Recomendaciones Estratégicas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {recomendaciones.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  {rec.startsWith("✅") ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  )}
                  <p className="text-sm text-slate-700">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 shadow-sm">
          <CardHeader className="bg-slate-100">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <PieChart className="h-5 w-5" />
              Estado de Resultados Histórico
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-slate-700">Periodo</th>
                    <th className="text-right p-4 font-semibold text-slate-700">Ingresos</th>
                    <th className="text-right p-4 font-semibold text-slate-700">Compras</th>
                    <th className="text-right p-4 font-semibold text-slate-700">Gastos</th>
                    <th className="text-right p-4 font-semibold text-slate-700">Utilidad</th>
                    <th className="text-right p-4 font-semibold text-slate-700">Margen</th>
                  </tr>
                </thead>
                <tbody>
                  {allPeriodos.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-slate-100 hover:bg-slate-50 ${row.mes === month && row.anio === year ? "bg-[#ffe48b]/20" : ""}`}
                    >
                      <td className="p-4 font-medium text-slate-700">
                        {getMonthName(row.mes)} {row.anio}
                      </td>
                      <td className="text-right p-4 text-slate-600">{formatCurrency(row.ingresos)}</td>
                      <td className="text-right p-4 text-slate-600">{formatCurrency(row.compras)}</td>
                      <td className="text-right p-4 text-slate-600">{formatCurrency(row.gastos)}</td>
                      <td className={`text-right p-4 font-semibold ${row.utilidad >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(row.utilidad)}
                      </td>
                      <td className="text-right p-4 text-slate-600">
                        {formatPercentage(row.utilidad / row.ingresos)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="bg-slate-100">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Layers className="h-5 w-5" />
              Indicadores de Liquidez Históricos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-slate-700">Periodo</th>
                    <th className="text-right p-4 font-semibold text-slate-700">Activo Circulante</th>
                    <th className="text-right p-4 font-semibold text-slate-700">Pasivo Circulante</th>
                    <th className="text-right p-4 font-semibold text-slate-700">Razón Circulante</th>
                    <th className="text-right p-4 font-semibold text-slate-700">Capital Trabajo</th>
                  </tr>
                </thead>
                <tbody>
                  {allBalances.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-slate-100 hover:bg-slate-50 ${row.mes === month && row.anio === year ? "bg-[#ffe48b]/20" : ""}`}
                    >
                      <td className="p-4 font-medium text-slate-700">
                        {getMonthName(row.mes)} {row.anio}
                      </td>
                      <td className="text-right p-4 text-slate-600">{formatCurrency(row.ac)}</td>
                      <td className="text-right p-4 text-slate-600">{formatCurrency(row.pc)}</td>
                      <td className="text-right p-4 font-semibold text-green-600">{(row.ac / row.pc).toFixed(2)}</td>
                      <td className="text-right p-4 text-slate-600">{formatCurrency(row.ac - row.pc)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
