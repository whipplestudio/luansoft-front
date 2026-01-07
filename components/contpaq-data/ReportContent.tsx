"use client"

import { useMemo, useState } from "react"
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
} from "lucide-react"
import Image from "next/image"

interface ReportContentProps {
  clientId: string
  month: string
  year: number
}

const er2025Periodo = [
  {
    mes: "2025-06",
    ingresos: 25980353.24,
    compras: 9454446.42,
    gastos: 10877673.53,
    prodFin: 140677.28,
    gastFin: 6869.6,
    utilidad: 5782040.97,
  },
  {
    mes: "2025-07",
    ingresos: 22176060.47,
    compras: 4022329.6,
    gastos: 10624885.63,
    prodFin: 132906.33,
    gastFin: 4606.58,
    utilidad: 7657144.99,
  },
]

const er2025YTD = [
  {
    mes: "2025-06",
    ingresosYTD: 96340814.3,
    comprasYTD: 35224615.84,
    gastosYTD: 63172515.36,
    prodFinYTD: 837469.29,
    gastFinYTD: 49503.27,
    utilidadYTD: -1268350.88,
  },
  {
    mes: "2025-07",
    ingresosYTD: 118516874.77,
    comprasYTD: 39246945.44,
    gastosYTD: 73797400.99,
    prodFinYTD: 970375.62,
    gastFinYTD: 54109.85,
    utilidadYTD: 6388794.11,
  },
]

const bg2025 = [
  {
    mes: "2025-06",
    ac: 64510533.12,
    pc: 9180070.92,
    bancos: 155946.79,
    inversiones: 20891306.57,
    clientes: 10163393.43,
    deudores: 27177918.46,
    inventario: 3162450.0,
    anticipoProv: 532966.82,
    pagosAnt: 670260.36,
    anticipoCli: 531350.32,
    capital: 59013885.97,
    utilidadEj: -1268350.88,
  },
  {
    mes: "2025-07",
    ac: 70298094.51,
    pc: 7614797.67,
    bancos: 143484.74,
    inversiones: 21015451.95,
    clientes: 16051103.88,
    deudores: 27126918.06,
    inventario: 3162450.0,
    anticipoProv: 49877.38,
    pagosAnt: 1031398.16,
    anticipoCli: 1608936.52,
    capital: 59013885.97,
    utilidadEj: 6388794.11,
  },
]

const er2024Periodo = [
  {
    mes: "2024-03",
    ingresos: 17734032.37,
    compras: 6669733.24,
    gastos: 8873748.75,
    prodFin: 145776.59,
    gastFin: 30181.07,
    utilidad: 2306145.9,
  },
  {
    mes: "2024-04",
    ingresos: 13330411.15,
    compras: 3011133.0,
    gastos: 8974237.55,
    prodFin: 177491.46,
    gastFin: 44545.28,
    utilidad: 1477986.78,
  },
  {
    mes: "2024-05",
    ingresos: 20312772.82,
    compras: 8782841.76,
    gastos: 11946691.55,
    prodFin: 165906.86,
    gastFin: 26695.93,
    utilidad: -277549.53,
  },
  {
    mes: "2024-06",
    ingresos: 23209812.43,
    compras: 11316078.43,
    gastos: 10422042.71,
    prodFin: 153353.08,
    gastFin: 25336.34,
    utilidad: 1599708.04,
  },
]

const fmt = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(n)
const pct = (v: number) => `${(v * 100).toFixed(1)}%`

export function ReportContent({ clientId, month, year }: ReportContentProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

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

  const kpisJul2025 = useMemo(() => {
    const ytd = er2025YTD.find((r) => r.mes === "2025-07")!
    const bg = bg2025.find((r) => r.mes === "2025-07")!
    const razonCirculante = bg.ac / bg.pc
    const margenOperativo = (val: { ingresos: number; compras: number; gastos: number }) =>
      (val.ingresos - val.compras - val.gastos) / val.ingresos
    const erJul = er2025Periodo.find((r) => r.mes === "2025-07")!
    return {
      utilidadYTD: ytd.utilidadYTD,
      ingresosYTD: ytd.ingresosYTD,
      razonCirculante,
      pruebaAcidaAprox: (bg.ac - bg.inventario - bg.pagosAnt - bg.anticipoProv) / bg.pc,
      margenOperativoJulPct: margenOperativo(erJul),
      deudoresDiversos: bg.deudores,
      anticipoClientes: bg.anticipoCli,
      efectivoEInversiones: bg.bancos + bg.inversiones,
    }
  }, [])

  const cardsTop = [
    {
      title: "Utilidad acumulada YTD",
      value: fmt(kpisJul2025.utilidadYTD),
      subtitle: "A jul-2025 (del ER)",
      icon: TrendingUp,
      accent: "green",
    },
    {
      title: "Razón circulante",
      value: kpisJul2025.razonCirculante.toFixed(2),
      subtitle: "Liquidez jul-2025 (BG)",
      icon: Activity,
      accent: "green",
    },
    {
      title: "Efectivo + Inversiones",
      value: fmt(kpisJul2025.efectivoEInversiones),
      subtitle: "Bancos + Inversiones (jul-2025)",
      icon: Coins,
      accent: "slate",
    },
    {
      title: "Deudores Diversos",
      value: fmt(kpisJul2025.deudoresDiversos),
      subtitle: "Capital inmovilizado (jul-2025)",
      icon: HandCoins,
      accent: "amber",
    },
    {
      title: "Anticipo de Clientes",
      value: fmt(kpisJul2025.anticipoClientes),
      subtitle: "Pasivo corriente (jul-2025)",
      icon: Banknote,
      accent: "amber",
    },
    {
      title: "Margen operativo (jul)",
      value: pct(kpisJul2025.margenOperativoJulPct),
      subtitle: "(Ingresos - Compras - Gtos) / Ingresos",
      icon: LineChart,
      accent: "green",
    },
  ]

  const tablaResultados = [
    ...er2024Periodo.map((r) => ({ ...r, anio: 2024 })),
    ...er2025Periodo.map((r) => ({ ...r, anio: 2025 })),
  ]

  const tablaLiquidez = bg2025

  return (
    <div className="min-h-screen bg-[#f8f9fa] w-full">
      <div className="bg-[#18332f] shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Image src="/luenser-logo.png" alt="Luenser" width={180} height={60} className="h-12 w-auto" />
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
              <span className="font-semibold">Cliente</span>
              <span>•</span>
              <span>
                {month} {year}
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Último corte: 31-jul-2025 • Fecha de emisión: {new Date().toLocaleDateString("es-MX")}
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
                  className={`text-3xl font-bold ${c.accent === "amber" ? "text-amber-600" : c.accent === "slate" ? "text-slate-700" : "text-green-600"}`}
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
              <p className="leading-relaxed">
                <strong>Recuperación significativa en julio 2025:</strong> La utilidad acumulada (YTD) pasó de{" "}
                <span className="text-red-600 font-semibold">-$1.27M</span> en junio a{" "}
                <span className="text-green-600 font-semibold">+$6.39M</span> en julio, reflejando una mejora operativa
                sustancial.
              </p>
              <p className="leading-relaxed">
                <strong>Liquidez robusta:</strong> La razón circulante de{" "}
                <span className="font-semibold">9.23</span> indica una posición de liquidez muy sólida, con activos
                circulantes ampliamente superiores a los pasivos de corto plazo.
              </p>
              <p className="leading-relaxed">
                <strong>Áreas de atención:</strong> Los deudores diversos representan{" "}
                <span className="text-amber-600 font-semibold">{fmt(kpisJul2025.deudoresDiversos)}</span>, capital que
                podría optimizarse. Se recomienda revisar políticas de cobranza y gestión de cuentas por cobrar.
              </p>
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
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">Optimización de capital de trabajo</h4>
                    <p className="text-sm text-slate-600">
                      Implementar estrategias para reducir deudores diversos y mejorar la rotación de cuentas por
                      cobrar.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">Gestión de anticipos</h4>
                    <p className="text-sm text-slate-600">
                      Monitorear el incremento en anticipos de clientes para asegurar cumplimiento de compromisos.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">Control de gastos operativos</h4>
                    <p className="text-sm text-slate-600">
                      Mantener la tendencia positiva del margen operativo mediante control estricto de gastos generales.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">Diversificación de ingresos</h4>
                    <p className="text-sm text-slate-600">
                      Evaluar oportunidades para estabilizar flujos de ingresos y reducir volatilidad mensual.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 shadow-sm">
          <CardHeader className="bg-slate-100">
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <PieChart className="h-5 w-5" />
              Estado de Resultados Comparativo
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
                  </tr>
                </thead>
                <tbody>
                  {tablaResultados.map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-700">
                        {row.mes.split("-")[1]}-{row.anio}
                      </td>
                      <td className="text-right p-4 text-slate-600">{fmt(row.ingresos)}</td>
                      <td className="text-right p-4 text-slate-600">{fmt(row.compras)}</td>
                      <td className="text-right p-4 text-slate-600">{fmt(row.gastos)}</td>
                      <td
                        className={`text-right p-4 font-semibold ${row.utilidad >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {fmt(row.utilidad)}
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
              Indicadores de Liquidez (2025)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-slate-700">Mes</th>
                    <th className="text-right p-4 font-semibold text-slate-700">Activo Circulante</th>
                    <th className="text-right p-4 font-semibold text-slate-700">Pasivo Circulante</th>
                    <th className="text-right p-4 font-semibold text-slate-700">Razón Circulante</th>
                    <th className="text-right p-4 font-semibold text-slate-700">Bancos</th>
                    <th className="text-right p-4 font-semibold text-slate-700">Inversiones</th>
                  </tr>
                </thead>
                <tbody>
                  {tablaLiquidez.map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-700">{row.mes}</td>
                      <td className="text-right p-4 text-slate-600">{fmt(row.ac)}</td>
                      <td className="text-right p-4 text-slate-600">{fmt(row.pc)}</td>
                      <td className="text-right p-4 font-semibold text-green-600">{(row.ac / row.pc).toFixed(2)}</td>
                      <td className="text-right p-4 text-slate-600">{fmt(row.bancos)}</td>
                      <td className="text-right p-4 text-slate-600">{fmt(row.inversiones)}</td>
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
