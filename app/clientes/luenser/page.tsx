"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, TrendingDown, AlertTriangle, CheckCircle, BookOpen, Lightbulb } from "lucide-react"
import Image from "next/image"

export default function LuenserReportPage() {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)
    try {
      // TODO: Implement PDF generation for LUENSER
      alert("Funcionalidad de PDF en desarrollo")
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header */}
      <div className="bg-[#18332f] shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Image src="/images/logo-vert-white.png" alt="Luenser" width={180} height={60} className="h-12 w-auto" />
            </div>
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

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Title Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6 border-l-4 border-l-[#ffe48b]">
          <div className="text-center mb-6">
            <h2 className="text-4xl font-bold text-[#18332f] mb-3">Reporte Ejecutivo Trimestral</h2>
            <div className="flex items-center justify-center gap-2 text-lg text-slate-700 mb-2">
              <span className="font-semibold">LUENSER SA DE CV</span>
              <span>•</span>
              <span>Primer Trimestre 2024</span>
            </div>
            <p className="text-sm text-slate-500">Enero - Marzo 2024 • Fecha de emisión: 16 de octubre de 2025</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-white rounded-lg p-6 border-l-4 border-l-red-600 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700">Pérdida Acumulada</h3>
              </div>
              <p className="text-3xl font-bold text-red-600">-$5.23M</p>
              <p className="text-xs text-slate-600 mt-2">Resultado del trimestre</p>
            </div>

            <div className="bg-white rounded-lg p-6 border-l-4 border-l-amber-500 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700">Capital Contable</h3>
              </div>
              <p className="text-3xl font-bold text-amber-600">-$230,780.15</p>
              <p className="text-xs text-slate-600 mt-2">Al cierre de marzo</p>
            </div>

            <div className="bg-white rounded-lg p-6 border-l-4 border-l-green-600 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700">Ingresos Promedio</h3>
              </div>
              <p className="text-3xl font-bold text-green-600">$229,457.34</p>
              <p className="text-xs text-slate-600 mt-2">Mensual Q1 2024</p>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <Card className="mb-6 shadow-sm border-l-4 border-l-[#ffe48b]">
          <CardHeader className="bg-[#18332f] text-white rounded-t-lg">
            <CardTitle className="text-2xl">Resumen Ejecutivo</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-slate-700 leading-relaxed text-lg">
              Evaluar el desempeño financiero de <strong>LUENSER SA DE CV</strong> durante el primer trimestre del 2024,
              identificar riesgos operativos y contables, y proporcionar recomendaciones estratégicas y formativas que
              permitan revertir pérdidas, estabilizar el flujo de efectivo y mejorar su posición patrimonial.
            </p>
          </CardContent>
        </Card>

        {/* Key Indicators Table */}
        <Card className="mb-6 shadow-sm border-l-4 border-l-[#ffe48b]">
          <CardHeader className="bg-[#18332f] text-white rounded-t-lg">
            <CardTitle className="text-2xl">Indicadores Clave por Mes</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-300 bg-slate-50">
                    <th className="text-left py-4 px-4 font-bold text-slate-800">Indicador</th>
                    <th className="text-right py-4 px-4 font-bold text-slate-800">Ene 2024</th>
                    <th className="text-right py-4 px-4 font-bold text-slate-800">Feb 2024</th>
                    <th className="text-right py-4 px-4 font-bold text-slate-800">Mar 2024</th>
                  </tr>
                </thead>
                <tbody className="text-base">
                  <tr className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="py-4 px-4 font-semibold text-slate-700">Ingresos</td>
                    <td className="text-right py-4 px-4 text-green-600 font-semibold">$228,530.27</td>
                    <td className="text-right py-4 px-4 text-green-600 font-semibold">$268,992.63</td>
                    <td className="text-right py-4 px-4 text-green-600 font-semibold">$190,849.13</td>
                  </tr>
                  <tr className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="py-4 px-4 font-semibold text-slate-700">Gastos Totales</td>
                    <td className="text-right py-4 px-4 text-red-600 font-semibold">$2,643,679.34</td>
                    <td className="text-right py-4 px-4 text-red-600 font-semibold">$3,144,743.19</td>
                    <td className="text-right py-4 px-4 text-red-600 font-semibold">$128,805.33</td>
                  </tr>
                  <tr className="border-b-2 border-slate-300 bg-slate-100">
                    <td className="py-4 px-4 font-bold text-slate-900">Utilidad (Pérdida) del mes</td>
                    <td className="text-right py-4 px-4 font-bold text-red-600">-$2,415,149.07</td>
                    <td className="text-right py-4 px-4 font-bold text-red-600">-$2,875,750.56</td>
                    <td className="text-right py-4 px-4 font-bold text-green-600">$62,043.80</td>
                  </tr>
                  <tr className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="py-4 px-4 font-semibold text-slate-700">Resultado acumulado</td>
                    <td className="text-right py-4 px-4 text-slate-700">-$2.41M</td>
                    <td className="text-right py-4 px-4 text-slate-700">-$5.29M</td>
                    <td className="text-right py-4 px-4 text-slate-700">-$5.23M</td>
                  </tr>
                  <tr className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="py-4 px-4 font-semibold text-slate-700">Bancos (fin de mes)</td>
                    <td className="text-right py-4 px-4 text-slate-700">$146,305</td>
                    <td className="text-right py-4 px-4 text-slate-700">$213,210</td>
                    <td className="text-right py-4 px-4 text-slate-700">$244,999</td>
                  </tr>
                  <tr className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="py-4 px-4 font-semibold text-slate-700">Capital Contable</td>
                    <td className="text-right py-4 px-4 text-slate-700">-$357,073.39</td>
                    <td className="text-right py-4 px-4 text-slate-700">-$292,823.95</td>
                    <td className="text-right py-4 px-4 text-slate-700">-$230,780.15</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Trend Analysis */}
        <Card className="mb-6 shadow-sm border-l-4 border-l-[#ffe48b]">
          <CardHeader className="bg-[#18332f] text-white rounded-t-lg">
            <CardTitle className="text-2xl">Análisis de Tendencias</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="bg-white rounded-lg p-6 border-l-4 border-l-green-600">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Lo positivo:
              </h3>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">•</span>
                  <span>
                    Marzo cerró con utilidad positiva, lo que indica que las medidas aplicadas ese mes fueron efectivas.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">•</span>
                  <span>Los ingresos han sido estables, mostrando una cartera de clientes activa.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-1">•</span>
                  <span>
                    Mejora progresiva del efectivo en bancos (enero a marzo), lo cual indica control del gasto y
                    cobranza moderadamente eficiente.
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 border-l-4 border-l-red-600">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                Puntos críticos:
              </h3>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold mt-1">•</span>
                  <span>Pérdida acumulada de más de $5.2M en tres meses.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold mt-1">•</span>
                  <span>En enero y febrero, los gastos superaron los ingresos más de 10 veces.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold mt-1">•</span>
                  <span>
                    Gastos no deducibles representan un gran porcentaje de los egresos: más de $5 millones acumulados.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold mt-1">•</span>
                  <span>
                    Capital contable negativo, con riesgo de imagen ante entidades financieras y clientes grandes.
                  </span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Strategic Recommendations */}
        <Card className="mb-6 shadow-sm border-l-4 border-l-[#ffe48b]">
          <CardHeader className="bg-[#18332f] text-white rounded-t-lg">
            <CardTitle className="text-2xl">Recomendaciones Estratégicas</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div className="bg-white rounded-lg p-5 border-l-4 border-l-amber-500">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  1
                </span>
                <h4 className="font-bold text-lg text-slate-900">Revisión profunda de egresos operativos</h4>
              </div>
              <ul className="space-y-2 text-slate-700 ml-10">
                <li>• Analizar gastos generales no deducibles.</li>
                <li>• Establecer topes presupuestales.</li>
                <li>• Automatizar el control de viáticos y servicios administrativos.</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-5 border-l-4 border-l-green-600">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  2
                </span>
                <h4 className="font-bold text-lg text-slate-900">Replicar medidas efectivas de marzo</h4>
              </div>
              <ul className="space-y-2 text-slate-700 ml-10">
                <li>• Documentar decisiones clave tomadas en marzo.</li>
                <li>• Aplicar los mismos principios de control de gasto, cobranza, y ritmo de operación.</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-5 border-l-4 border-l-red-600">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  3
                </span>
                <h4 className="font-bold text-lg text-slate-900">Plan de recuperación patrimonial</h4>
              </div>
              <ul className="space-y-2 text-slate-700 ml-10">
                <li>• Considerar aportaciones de socios.</li>
                <li>• Establecer metas trimestrales de utilidad mínima para salir del capital contable negativo.</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-5 border-l-4 border-l-blue-600">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  4
                </span>
                <h4 className="font-bold text-lg text-slate-900">Política activa de cobranza</h4>
              </div>
              <ul className="space-y-2 text-slate-700 ml-10">
                <li>• Los saldos de clientes se mantienen planos ($640), pero hay múltiples facturados en anexos.</li>
                <li>• Se sugiere política de cobranza con recordatorios automáticos.</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-5 border-l-4 border-l-amber-500">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  5
                </span>
                <h4 className="font-bold text-lg text-slate-900">Revisión del tratamiento fiscal</h4>
              </div>
              <ul className="space-y-2 text-slate-700 ml-10">
                <li>• Aprovechar pérdidas fiscales acumuladas.</li>
                <li>• Optimizar provisiones y deducciones antes de cerrar el ejercicio fiscal.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Training Recommendation */}
        <Card className="mb-6 shadow-sm border-l-4 border-l-[#ffe48b]">
          <CardHeader className="bg-[#18332f] text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Formación Recomendada
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#18332f] rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-slate-900 mb-3">Curso Recomendado:</h4>
                  <div className="space-y-2 text-slate-700">
                    <p>
                      <strong>Nombre:</strong> Diagnóstico Financiero y Presupuestal para Empresas en Crisis
                    </p>
                    <p>
                      <strong>Plataforma:</strong> Aprende.org (Fundación Slim)
                    </p>
                    <p>
                      <strong>URL:</strong>{" "}
                      <a
                        href="https://capacitateparaelempleo.org/pages/curso/diagnostico-financiero"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        capacitateparaelempleo.org
                      </a>
                    </p>
                    <p>
                      <strong>Duración:</strong> 6-8 horas
                    </p>
                    <p>
                      <strong>Costo:</strong> Gratis
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommended Tool */}
        <Card className="mb-6 shadow-sm border-l-4 border-l-[#ffe48b]">
          <CardHeader className="bg-[#18332f] text-white rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Lightbulb className="h-6 w-6" />
              Herramienta Recomendable
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#18332f] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-slate-900 mb-3">
                    Software de Gestión Contable + Flujo de Caja
                  </h4>
                  <div className="mb-4">
                    <p className="font-semibold text-slate-900 mb-2">Opciones sugeridas:</p>
                    <ul className="text-slate-700 space-y-1 ml-4">
                      <li>• Bind ERP</li>
                      <li>• Alegra</li>
                      <li>• CONTPAQi</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-2">Funciones:</p>
                    <ul className="text-slate-700 space-y-1 ml-4">
                      <li>• Alertas de flujo negativo</li>
                      <li>• Reportes de rentabilidad</li>
                      <li>• Integración con bancos y SAT</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conclusion */}
        <Card className="mb-6 shadow-sm border-l-4 border-l-[#ffe48b]">
          <CardHeader className="bg-[#18332f] text-white rounded-t-lg">
            <CardTitle className="text-2xl">Conclusión</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-slate-700 leading-relaxed text-lg">
              <strong>LUENSER</strong> muestra capacidad operativa para generar ingresos, pero sus gastos han sido
              excesivos e improductivos. Con la disciplina que se observó en marzo, y una estrategia financiera
              inteligente, la empresa sí puede revertir su capital negativo y estabilizar su posición.
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="bg-[#18332f] rounded-lg shadow-sm p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Image src="/luenser-logo.png" alt="Luenser" width={160} height={50} className="h-10 w-auto" />
          </div>
          <p className="text-sm text-white mb-1">www.luenser.com.mx</p>
          <p className="text-xs text-[#ffe48b]">Reporte generado el 16 de octubre de 2025</p>
        </div>
      </div>
    </div>
  )
}
