export interface EstadoResultadosPeriodo {
  mes: string
  ingresos: number
  compras: number
  gastos: number
  prodFin: number
  gastFin: number
  utilidad: number
}

export interface EstadoResultadosYTD {
  mes: string
  ingresosYTD: number
  comprasYTD: number
  gastosYTD: number
  prodFinYTD: number
  gastFinYTD: number
  utilidadYTD: number
}

export interface BalanceGeneral {
  mes: string
  ac: number
  pc: number
  bancos: number
  inversiones: number
  clientes: number
  deudores: number
  inventario: number
  anticipoProv: number
  pagosAnt: number
  anticipoCli: number
  capital: number
  utilidadEj: number
  anc?: number
  plc?: number
  proveedores?: number
  acreedores?: number
  capitalSocial?: number
  resultadosAcum?: number
}

export interface ClienteFinancialData {
  clienteId: string
  clienteNombre: string
  razonSocial: string
  years: {
    [year: string]: {
      estadoResultadosPeriodo: EstadoResultadosPeriodo[]
      estadoResultadosYTD: EstadoResultadosYTD[]
      balanceGeneral: BalanceGeneral[]
    }
  }
}

export interface KPIFinanciero {
  razonCirculante: number
  pruebaAcida: number
  margenOperativo: number
  margenNeto: number
  rotacionActivos: number
  rotacionCuentasCobrar: number
  diasCuentasCobrar: number
  rotacionInventarios: number
  diasInventario: number
  razonEndeudamiento: number
  razonDeuda: number
  coberturaIntereses: number
  ROE: number
  ROA: number
  capitalTrabajo: number
}

export interface AnalisisComparativo {
  periodo: string
  periodoAnterior: string
  variacionAbsoluta: {
    ingresos: number
    gastos: number
    utilidad: number
  }
  variacionPorcentual: {
    ingresos: number
    gastos: number
    utilidad: number
  }
}


 https://whipplestudio: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@github.com/whipplestudio/luansoft-front 