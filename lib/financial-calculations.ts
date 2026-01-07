import type {
  EstadoResultadosPeriodo,
  BalanceGeneral,
  KPIFinanciero,
  AnalisisComparativo,
} from "@/types/financial"

export function calcularMargenOperativo(er: EstadoResultadosPeriodo): number {
  if (er.ingresos === 0) return 0
  return (er.ingresos - er.compras - er.gastos) / er.ingresos
}

export function calcularMargenNeto(er: EstadoResultadosPeriodo): number {
  if (er.ingresos === 0) return 0
  return er.utilidad / er.ingresos
}

export function calcularRazonCirculante(bg: BalanceGeneral): number {
  if (bg.pc === 0) return 0
  return bg.ac / bg.pc
}

export function calcularPruebaAcida(bg: BalanceGeneral): number {
  if (bg.pc === 0) return 0
  const activoDisponible = bg.ac - bg.inventario - bg.pagosAnt - bg.anticipoProv
  return activoDisponible / bg.pc
}

export function calcularCapitalTrabajo(bg: BalanceGeneral): number {
  return bg.ac - bg.pc
}

export function calcularRotacionActivos(
  ingresos: number,
  activoTotal: number
): number {
  if (activoTotal === 0) return 0
  return ingresos / activoTotal
}

export function calcularRotacionCuentasCobrar(
  ingresos: number,
  cuentasCobrar: number
): number {
  if (cuentasCobrar === 0) return 0
  return ingresos / cuentasCobrar
}

export function calcularDiasCuentasCobrar(rotacion: number): number {
  if (rotacion === 0) return 0
  return 365 / rotacion
}

export function calcularRotacionInventarios(
  costoVentas: number,
  inventario: number
): number {
  if (inventario === 0) return 0
  return costoVentas / inventario
}

export function calcularDiasInventario(rotacion: number): number {
  if (rotacion === 0) return 0
  return 365 / rotacion
}

export function calcularRazonEndeudamiento(
  pasivoTotal: number,
  activoTotal: number
): number {
  if (activoTotal === 0) return 0
  return pasivoTotal / activoTotal
}

export function calcularRazonDeuda(
  pasivoTotal: number,
  capital: number
): number {
  if (capital === 0) return 0
  return pasivoTotal / capital
}

export function calcularCoberturaIntereses(
  utilidadOperativa: number,
  gastosFinancieros: number
): number {
  if (gastosFinancieros === 0) return 0
  return utilidadOperativa / gastosFinancieros
}

export function calcularROE(utilidad: number, capital: number): number {
  if (capital === 0) return 0
  return utilidad / capital
}

export function calcularROA(utilidad: number, activoTotal: number): number {
  if (activoTotal === 0) return 0
  return utilidad / activoTotal
}

export function calcularKPIsFinancieros(
  er: EstadoResultadosPeriodo,
  bg: BalanceGeneral
): KPIFinanciero {
  const activoTotal = bg.ac + (bg.anc || 0)
  const pasivoTotal = bg.pc + (bg.plc || 0)
  const costoVentas = er.compras
  const utilidadOperativa = er.ingresos - er.compras - er.gastos

  return {
    razonCirculante: calcularRazonCirculante(bg),
    pruebaAcida: calcularPruebaAcida(bg),
    margenOperativo: calcularMargenOperativo(er),
    margenNeto: calcularMargenNeto(er),
    rotacionActivos: calcularRotacionActivos(er.ingresos, activoTotal),
    rotacionCuentasCobrar: calcularRotacionCuentasCobrar(er.ingresos, bg.clientes),
    diasCuentasCobrar: calcularDiasCuentasCobrar(
      calcularRotacionCuentasCobrar(er.ingresos, bg.clientes)
    ),
    rotacionInventarios: calcularRotacionInventarios(costoVentas, bg.inventario),
    diasInventario: calcularDiasInventario(
      calcularRotacionInventarios(costoVentas, bg.inventario)
    ),
    razonEndeudamiento: calcularRazonEndeudamiento(pasivoTotal, activoTotal),
    razonDeuda: calcularRazonDeuda(pasivoTotal, bg.capital),
    coberturaIntereses: calcularCoberturaIntereses(utilidadOperativa, er.gastFin),
    ROE: calcularROE(er.utilidad, bg.capital),
    ROA: calcularROA(er.utilidad, activoTotal),
    capitalTrabajo: calcularCapitalTrabajo(bg),
  }
}

export function calcularVariacionPeriodos(
  actual: EstadoResultadosPeriodo,
  anterior: EstadoResultadosPeriodo
): AnalisisComparativo {
  return {
    periodo: actual.mes,
    periodoAnterior: anterior.mes,
    variacionAbsoluta: {
      ingresos: actual.ingresos - anterior.ingresos,
      gastos: actual.gastos - anterior.gastos,
      utilidad: actual.utilidad - anterior.utilidad,
    },
    variacionPorcentual: {
      ingresos:
        anterior.ingresos !== 0
          ? ((actual.ingresos - anterior.ingresos) / anterior.ingresos) * 100
          : 0,
      gastos:
        anterior.gastos !== 0
          ? ((actual.gastos - anterior.gastos) / anterior.gastos) * 100
          : 0,
      utilidad:
        anterior.utilidad !== 0
          ? ((actual.utilidad - anterior.utilidad) / Math.abs(anterior.utilidad)) * 100
          : 0,
    },
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function generarRecomendaciones(
  kpis: KPIFinanciero,
  er: EstadoResultadosPeriodo
): string[] {
  const recomendaciones: string[] = []

  if (kpis.razonCirculante < 1.5) {
    recomendaciones.push(
      "⚠️ La razón circulante es baja. Considere mejorar la liquidez mediante gestión de cuentas por cobrar o reestructuración de pasivos."
    )
  } else if (kpis.razonCirculante > 3) {
    recomendaciones.push(
      "💡 La razón circulante es muy alta. Evalúe oportunidades de inversión para optimizar el uso del capital."
    )
  }

  if (kpis.pruebaAcida < 1) {
    recomendaciones.push(
      "⚠️ La prueba ácida indica posible problema de liquidez inmediata. Revise políticas de cobranza."
    )
  }

  if (kpis.margenNeto < 0) {
    recomendaciones.push(
      "🔴 Margen neto negativo. Prioridad: reducción de costos y mejora de eficiencia operativa."
    )
  } else if (kpis.margenNeto < 0.05) {
    recomendaciones.push(
      "⚠️ Margen neto bajo. Analice estructura de costos y estrategia de precios."
    )
  }

  if (kpis.diasCuentasCobrar > 60) {
    recomendaciones.push(
      "⚠️ Días de cuentas por cobrar elevados. Implemente políticas de cobranza más agresivas."
    )
  }

  if (kpis.razonEndeudamiento > 0.6) {
    recomendaciones.push(
      "⚠️ Alto nivel de endeudamiento. Considere estrategias de reducción de deuda."
    )
  }

  if (er.utilidad > 0 && kpis.margenOperativo > 0.15) {
    recomendaciones.push(
      "✅ Excelente margen operativo. Mantenga la disciplina en control de costos."
    )
  }

  if (kpis.ROE < 0.1 && kpis.ROE > 0) {
    recomendaciones.push(
      "💡 Retorno sobre capital bajo. Evalúe proyectos de inversión con mayor rentabilidad."
    )
  }

  if (kpis.capitalTrabajo < 0) {
    recomendaciones.push(
      "🔴 Capital de trabajo negativo. Situación crítica que requiere atención inmediata."
    )
  }

  return recomendaciones
}
