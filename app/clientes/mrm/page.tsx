"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, TrendingUp, AlertTriangle, CheckCircle, BookOpen, Lightbulb, LineChart, PieChart, Building2, Activity, Coins, HandCoins, Banknote, Layers } from "lucide-react"
import Image from "next/image"

/**
 * Reporte Ejecutivo Financiero — MRM Ingeniería Integral S. de R.L. MI
 * Cobertura: Ene-2024 a Jul-2025
 *
 * Este componente sustituye los textos simulados por métricas REALES extraídas de los PDFs que compartiste,
 * principalmente de 2025 (junio y julio) y de 2024 (mar-jun recopilados en sesiones previas).
 *
 * Puedes conectar estas constantes con tu backend/ETL cuando lo tengas listo.
 */

// ======================
//  Datos duros (resumen)
// ======================

// Estado de Resultados — 2025 (valores del PERIODO)
const er2025Periodo = [
  // Mes, Ingresos, Compras, Gastos Generales, ProdFin, GastFin, Utilidad
  // (Disponibles con precisión de los PDFs cargados más recientes)
  { mes: "2025-06", ingresos: 25980353.24, compras: 9454446.42, gastos: 10877673.53, prodFin: 140677.28, gastFin: 6869.60, utilidad: 5782040.97 }, // JUN 2025
  { mes: "2025-07", ingresos: 22176060.47, compras: 4022329.60, gastos: 10624885.63, prodFin: 132906.33, gastFin: 4606.58, utilidad: 7657144.99 },   // JUL 2025
]

// Estado de Resultados — 2025 (YTD a fin de mes)
const er2025YTD = [
  { mes: "2025-06", ingresosYTD: 96340814.30, comprasYTD: 35224615.84, gastosYTD: 63172515.36, prodFinYTD: 837469.29, gastFinYTD: 49503.27, utilidadYTD: -1268350.88 },
  { mes: "2025-07", ingresosYTD: 118516874.77, comprasYTD: 39246945.44, gastosYTD: 73797400.99, prodFinYTD: 970375.62, gastFinYTD: 54109.85, utilidadYTD: 6388794.11 },
]

// Balance General — 2025 (cortes a fin de mes)
const bg2025 = [
  // Mes, Activo Circulante, Pasivo Circulante, Bancos, Inversiones, Clientes, Deudores, Inventario, AnticipoProv, PagosAnt, AnticipoCli, Capital, UtilidadEj
  { mes: "2025-06", ac: 64510533.12, pc: 9180070.92, bancos: 155946.79, inversiones: 20891306.57, clientes: 10163393.43, deudores: 27177918.46, inventario: 3162450.00, anticipoProv: 532966.82, pagosAnt: 670260.36, anticipoCli: 531350.32, capital: 59013885.97, utilidadEj: -1268350.88 },
  { mes: "2025-07", ac: 70298094.51, pc: 7614797.67, bancos: 143484.74, inversiones: 21015451.95, clientes: 16051103.88, deudores: 27126918.06, inventario: 3162450.00, anticipoProv: 49877.38, pagosAnt: 1031398.16, anticipoCli: 1608936.52, capital: 59013885.97, utilidadEj: 6388794.11 },
]

// 2024 — extracto de meses validados (puedes ampliar con tu ETL)
const er2024Periodo = [
  { mes: "2024-03", ingresos: 17734032.37, compras: 6669733.24, gastos: 8873748.75, prodFin: 145776.59, gastFin: 30181.07, utilidad: 2306145.90 },
  { mes: "2024-04", ingresos: 13330411.15, compras: 3011133.00, gastos: 8974237.55, prodFin: 177491.46, gastFin: 44545.28, utilidad: 1477986.78 },
  { mes: "2024-05", ingresos: 20312772.82, compras: 8782841.76, gastos: 11946691.55, prodFin: 165906.86, gastFin: 26695.93, utilidad: -277549.53 },
  { mes: "2024-06", ingresos: 23209812.43, compras: 11316078.43, gastos: 10422042.71, prodFin: 153353.08, gastFin: 25336.34, utilidad: 1599708.04 },
]

// Helper para formato MXN
const fmt = (n: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(n)
const pct = (v: number) => `${(v * 100).toFixed(1)}%`

export default function MRMReportPage() {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)
    try {
      // Aquí puedes integrar pdfmake / react-pdf, o generar en el backend
      alert("Exportación a PDF: pendiente de integración")
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  // Derivados clave
  const kpisJul2025 = useMemo(() => {
    const ytd = er2025YTD.find((r) => r.mes === "2025-07")!
    const bg = bg2025.find((r) => r.mes === "2025-07")!
    const razonCirculante = bg.ac / bg.pc // ~9.23
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

  // Tabla comparativa de resultados (2024-2025, meses seleccionados)
  const tablaResultados = [
    ...er2024Periodo.map((r) => ({ ...r, anio: 2024 })),
    ...er2025Periodo.map((r) => ({ ...r, anio: 2025 })),
  ]

  // Tabla de liquidez (jun-jul 2025)
  const tablaLiquidez = bg2025

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
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
        {/* Title Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6 border-l-4 border-l-[#ffe48b]">
          <div className="text-center mb-6">
            <h2 className="text-4xl font-bold text-[#18332f] mb-3">Reporte Ejecutivo Financiero</h2>
            <div className="flex items-center justify-center gap-2 text-lg text-slate-700 mb-2">
              <span className="font-semibold">MRM INGENIERÍA INTEGRAL S. de R.L. MI</span>
              <span>•</span>
              <span>Cobertura: Ene 2024 – Jul 2025</span>
            </div>
            <p className="text-sm text-slate-500">Último corte: 31-jul-2025 • Fecha de emisión: 30-oct-2025</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-8">
            {cardsTop.map((c, idx) => (
              <div key={idx} className={`bg-white rounded-lg p-6 border-l-4 shadow-sm border-l-${c.accent}-600`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${c.accent}-600`}>
                    <c.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">{c.title}</h3>
                </div>
                <p className={`text-3xl font-bold ${c.accent === "amber" ? "text-amber-600" : c.accent === "slate" ? "text-slate-700" : "text-green-600"}`}>{c.value}</p>
                <p className="text-xs text-slate-600 mt-2">{c.subtitle}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen Ejecutivo */}
        <Card className="mb-6 shadow-sm border-l-4 border-l-[#ffe48b]">
          <CardHeader className="bg-[#18332f] text-white rounded-t-lg">
            <CardTitle className="text-2xl">Resumen Ejecutivo</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4 text-slate-700 leading-relaxed text-lg">
            <p>
              La compañía mantiene <strong>liquidez holgada</strong> (Razón circulante ~9.23 en jul-2025),
              <strong> recuperación de rentabilidad</strong> en 2T–3T de 2025 (utilidad mensual de {fmt(5782040.97)} en jun y {fmt(7657144.99)} en jul),
              y <strong>bajo endeudamiento</strong> de corto plazo.
            </p>
            <p>
              El <strong>capital de trabajo</strong> muestra concentración relevante en <strong>Deudores Diversos (~{fmt(27126918.06)})</strong> y en
              <strong> Inversiones ({fmt(21015451.95)})</strong>. Se recomienda plan de reducción gradual de deudores y definir un
              buffer mínimo de caja directa.
            </p>
          </CardContent>
        </Card>

        {/* Indicadores por Mes — Resultados */}
        <Card className="mb-6 shadow-sm border-l-4 border-l-[#ffe48b]">
          <CardHeader className="bg-[#18332f] text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2"><LineChart className="h-6 w-6"/>Resultados por mes (extracto)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-300 bg-slate-50">
                    <th className="text-left py-3 px-4 font-bold text-slate-800">Mes</th>
                    <th className="text-right py-3 px-4 font-bold text-slate-800">Ingresos</th>
                    <th className="text-right py-3 px-4 font-bold text-slate-800">Compras</th>
                    <th className="text-right py-3 px-4 font-bold text-slate-800">Gastos generales</th>
                    <th className="text-right py-3 px-4 font-bold text-slate-800">Resultado financiero</th>
                    <th className="text-right py-3 px-4 font-bold text-slate-800">Utilidad</th>
                    <th className="text-right py-3 px-4 font-bold text-slate-800">Margen operativo %</th>
                  </tr>
                </thead>
                <tbody className="text-base">
                  {tablaResultados.map((r) => {
                    const resFin = (r as any).prodFin - (r as any).gastFin
                    const mOp = (r.ingresos - r.compras - r.gastos) / r.ingresos
                    return (
                      <tr key={r.mes} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="py-3 px-4 font-semibold text-slate-700">{r.mes} ({(r as any).anio})</td>
                        <td className="text-right py-3 px-4 text-slate-700">{fmt(r.ingresos)}</td>
                        <td className="text-right py-3 px-4 text-slate-700">{fmt(r.compras)}</td>
                        <td className="text-right py-3 px-4 text-slate-700">{fmt(r.gastos)}</td>
                        <td className="text-right py-3 px-4 text-slate-700">{fmt(resFin)}</td>
                        <td className={`text-right py-3 px-4 font-semibold ${r.utilidad >= 0 ? "text-green-600" : "text-red-600"}`}>{fmt(r.utilidad)}</td>
                        <td className="text-right py-3 px-4 text-slate-700">{pct(mOp)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Liquidez y Capital de Trabajo */}
        <Card className="mb-6 shadow-sm border-l-4 border-l-[#ffe48b]">
          <CardHeader className="bg-[#18332f] text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2"><PieChart className="h-6 w-6"/>Liquidez y capital de trabajo</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-300 bg-slate-50">
                    <th className="text-left py-3 px-4 font-bold text-slate-800">Mes</th>
                    <th className="text-right py-3 px-4 font-bold text-slate-800">Activo Circulante</th>
                    <th className="text-right py-3 px-4 font-bold text-slate-800">Pasivo Circulante</th>
                    <th className="text-right py-3 px-4 font-bold text-slate-800">Razón Circulante</th>
                    <th className="text-right py-3 px-4 font-bold text-slate-800">Prueba Ácida (aprox.)</th>
                    <th className="text-right py-3 px-4 font-bold text-slate-800">Bancos</th>
                    <th className="text-right py-3 px-4 font-bold text-slate-800">Inversiones</th>
                    <th className="text-right py-3 px-4 font-bold text-slate-800">Clientes</th>
                    <th className="text-right py-3 px-4 font-bold text-slate-800">Deudores Diversos</th>
                    <th className="text-right py-3 px-4 font-bold text-slate-800">Inventario</th>
                    <th className="text-right py-3 px-4 font-bold text-slate-800">Anticipo de Clientes</th>
                  </tr>
                </thead>
                <tbody className="text-base">
                  {tablaLiquidez.map((b) => {
                    const rc = b.ac / b.pc
                    const pa = (b.ac - b.inventario - b.pagosAnt - b.anticipoProv) / b.pc
                    return (
                      <tr key={b.mes} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="py-3 px-4 font-semibold text-slate-700">{b.mes}</td>
                        <td className="text-right py-3 px-4">{fmt(b.ac)}</td>
                        <td className="text-right py-3 px-4">{fmt(b.pc)}</td>
                        <td className="text-right py-3 px-4 font-semibold">{rc.toFixed(2)}</td>
                        <td className="text-right py-3 px-4">{pa.toFixed(2)}</td>
                        <td className="text-right py-3 px-4">{fmt(b.bancos)}</td>
                        <td className="text-right py-3 px-4">{fmt(b.inversiones)}</td>
                        <td className="text-right py-3 px-4">{fmt(b.clientes)}</td>
                        <td className="text-right py-3 px-4">{fmt(b.deudores)}</td>
                        <td className="text-right py-3 px-4">{fmt(b.inventario)}</td>
                        <td className="text-right py-3 px-4">{fmt(b.anticipoCli)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recomendaciones Estratégicas */}
        <Card className="mb-6 shadow-sm border-l-4 border-l-[#ffe48b]">
          <CardHeader className="bg-[#18332f] text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2"><Building2 className="h-6 w-6"/>Recomendaciones Estratégicas</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div className="bg-white rounded-lg p-5 border-l-4 border-l-amber-500">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</span>
                <h4 className="font-bold text-lg text-slate-900">Capital de trabajo</h4>
              </div>
              <ul className="space-y-2 text-slate-700 ml-10">
                <li>• Reducir Deudores Diversos (~{fmt(27126918.06)}) con metas mensuales y política de nuevos préstamos.</li>
                <li>• Mantener buffer de caja directa (no solo inversiones) ≥ 1–1.5 meses de gastos fijos.</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-5 border-l-4 border-l-green-600">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">2</span>
                <h4 className="font-bold text-lg text-slate-900">Gasto y margen</h4>
              </div>
              <ul className="space-y-2 text-slate-700 ml-10">
                <li>• Límites dinámicos a Gastos Generales (alerta si &gt; 65–70% de ingresos del mes).</li>
                <li>• Sostener el margen operativo observado en jun-jul 2025 con disciplina de compras y calendarización de gastos.</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-5 border-l-4 border-l-blue-600">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">3</span>
                <h4 className="font-bold text-lg text-slate-900">Comercial y crecimiento</h4>
              </div>
              <ul className="space-y-2 text-slate-700 ml-10">
                <li>• Gestionar anticipos de clientes (volatilidad may-jun-jul) con checklists de consumo por proyecto.</li>
                <li>• Diversificar mix de clientes/proyectos y priorizar cuentas ancla rentables.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Formación & Herramientas (opcionales) */}
              <Card className="mb-6 shadow-sm border-l-4 border-l-[#ffe48b]">
            <CardHeader className="bg-[#18332f] text-white rounded-t-lg">
              <CardTitle className="text-2xl flex items-center gap-2"><BookOpen className="h-6 w-6"/>Formación Recomendada</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 text-slate-700">
              <p className="mb-2 font-semibold">Objetivo:</p>
              <p className="mb-4">Fortalecer modelo comercial, control presupuestal y gestión de capital de trabajo.</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Gestión financiera aplicada (DSO, DPO, DIO y forecast 12m).</li>
                <li>Control de gastos por naturaleza y centros de costo.</li>
              </ul>
            </CardContent>
          </Card>

        {/* Conclusión */}
        <Card className="mb-6 shadow-sm border-l-4 border-l-[#ffe48b]">
          <CardHeader className="bg-[#18332f] text-white rounded-t-lg">
            <CardTitle className="text-2xl">Conclusión</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-slate-700 leading-relaxed text-lg">
              MRM presenta <strong>mejora sostenida de resultados en 2025</strong>, liquidez sobresaliente y bajo endeudamiento.
              Los focos de atención son la <strong>concentración en Deudores Diversos</strong> y la <strong>volatilidad de anticipos de clientes</strong>.
              Con disciplina de gasto y una gestión activa del capital de trabajo, la empresa está en posición de <strong>crecer de forma saludable</strong>.
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="bg-[#18332f] rounded-lg shadow-sm p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Image src="/luenser-logo.png" alt="Luenser" width={160} height={50} className="h-10 w-auto" />
          </div>
          <p className="text-sm text-white mb-1">www.luenser.com.mx</p>
          <p className="text-xs text-[#ffe48b]">Reporte generado el 30 de octubre de 2025</p>
        </div>
      </div>
    </div>
  )
}
