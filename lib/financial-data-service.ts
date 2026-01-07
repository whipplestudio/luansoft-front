import type { ClienteFinancialData } from "@/types/financial"

const CLIENTS_MAP: Record<string, string> = {
  luenser: "Luenser",
  mrm: "MRM",
  vilego: "Vilego",
  fiduz: "FIDUZ",
  josivna: "Josivna",
  leret: "Leret Leret",
  sinmsa: "SINMSA",
  sedentarius: "Sedentarius",
  whipple: "Soluciones Whipple",
  luengas: "Jose Manuel Luengas",
}

// Mapeo inverso: de nombre de cliente a slug de archivo
function getClientSlugFromName(clientName: string): string | null {
  const normalizedName = clientName.trim().toLowerCase()
  
  // Buscar coincidencia exacta primero
  for (const [slug, name] of Object.entries(CLIENTS_MAP)) {
    if (name.toLowerCase() === normalizedName) {
      return slug
    }
  }
  
  // Buscar coincidencia parcial (contiene el nombre)
  for (const [slug, name] of Object.entries(CLIENTS_MAP)) {
    if (normalizedName.includes(name.toLowerCase()) || name.toLowerCase().includes(normalizedName)) {
      return slug
    }
  }
  
  // Casos especiales comunes
  const specialCases: Record<string, string> = {
    "mrm ingeniería integral": "mrm",
    "mrm ingenieria integral": "mrm",
    "jose manuel luengas": "luengas",
    "josé manuel luengas": "luengas",
    "soluciones whipple": "whipple",
    "leret leret": "leret",
  }
  
  if (specialCases[normalizedName]) {
    return specialCases[normalizedName]
  }
  
  return null
}

export async function loadClientFinancialData(
  clientId: string
): Promise<ClienteFinancialData | null> {
  try {
    // Intentar normalizar el clientId (podría ser nombre o slug)
    let slug = clientId.toLowerCase().trim()
    
    // Si no existe en CLIENTS_MAP, intentar convertir de nombre a slug
    if (!CLIENTS_MAP[slug]) {
      const foundSlug = getClientSlugFromName(clientId)
      if (foundSlug) {
        slug = foundSlug
      }
    }
    
    const response = await fetch(`/data/clients/${slug}.json`)
    if (!response.ok) {
      console.error(`Failed to load data for client: ${clientId} (using slug: ${slug})`)
      return null
    }
    const data: ClienteFinancialData = await response.json()
    return data
  } catch (error) {
    console.error(`Error loading financial data for ${clientId}:`, error)
    return null
  }
}

export function getClientName(clientId: string): string {
  return CLIENTS_MAP[clientId.toLowerCase()] || clientId
}

export function getAllClientIds(): string[] {
  return Object.keys(CLIENTS_MAP)
}

export function getAvailableYears(data: ClienteFinancialData): number[] {
  return Object.keys(data.years)
    .map((y) => parseInt(y))
    .sort((a, b) => b - a)
}

export function getAvailableMonths(
  data: ClienteFinancialData,
  year: number
): string[] {
  const yearData = data.years[year.toString()]
  if (!yearData) return []
  return yearData.estadoResultadosPeriodo.map((er) => er.mes).sort()
}

export function getMonthName(mes: string): string {
  const monthNames: Record<string, string> = {
    "01": "Enero",
    "02": "Febrero",
    "03": "Marzo",
    "04": "Abril",
    "05": "Mayo",
    "06": "Junio",
    "07": "Julio",
    "08": "Agosto",
    "09": "Septiembre",
    "10": "Octubre",
    "11": "Noviembre",
    "12": "Diciembre",
  }
  const monthNum = mes.split("-")[1]
  return monthNames[monthNum] || mes
}

export function getPeriodData(
  data: ClienteFinancialData,
  year: number,
  month: string
) {
  const yearData = data.years[year.toString()]
  if (!yearData) return null

  const erPeriodo = yearData.estadoResultadosPeriodo.find((er) => er.mes === month)
  const erYTD = yearData.estadoResultadosYTD.find((er) => er.mes === month)
  const bg = yearData.balanceGeneral.find((bg) => bg.mes === month)

  return {
    erPeriodo,
    erYTD,
    bg,
  }
}

export function getComparativeData(
  data: ClienteFinancialData,
  currentYear: number,
  currentMonth: string
) {
  const currentYearData = data.years[currentYear.toString()]
  const previousYear = currentYear - 1
  const previousYearData = data.years[previousYear.toString()]

  if (!currentYearData) return null

  const currentPeriods = currentYearData.estadoResultadosPeriodo
  const previousPeriods = previousYearData?.estadoResultadosPeriodo || []

  return {
    currentYear: currentPeriods,
    previousYear: previousPeriods,
    hasPreviousYear: previousPeriods.length > 0,
  }
}
