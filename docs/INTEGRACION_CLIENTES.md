# Integración Completa de Datos Financieros de Clientes

## ✅ Sistema Completamente Funcional

Todos los clientes con datos en `public/data/clients/` ahora pueden visualizar sus reportes financieros dinámicos usando los componentes genéricos en `components/contpaq-data/`.

## 📊 Clientes Configurados (10/10)

| Cliente ID | Nombre | Años | Meses Total | JSON |
|------------|--------|------|-------------|------|
| **fiduz** | FIDUZ | 2024-2025 | 12 | ✅ |
| **josivna** | JOSIVNA | 2024-2025 | 22 | ✅ |
| **leret** | Leret Leret | 2024-2025 | 20 | ✅ |
| **luengas** | José Manuel Luengas | 2024-2025 | 23 | ✅ |
| **luenser** | Luenser | 2024-2025 | 19 | ✅ |
| **mrm** | MRM | 2024-2025 | 23 | ✅ |
| **sedentarius** | Sedentarius | 2024-2025 | 23 | ✅ |
| **sinmsa** | SINMSA | 2024-2025 | 23 | ✅ |
| **vilego** | Vilego | 2024-2025 | 18 | ✅ |
| **whipple** | Soluciones Whipple | 2025 | 10 | ✅ |

**Total: 193 meses con datos financieros reales**

## 🔧 Componentes Genéricos

### 1. `ReportModal`
Modal principal que envuelve el reporte completo.

```tsx
<ReportModal
  isOpen={isOpen}
  onClose={onClose}
  clientId="mrm"          // ID del cliente
  month="2025-01"         // Formato: YYYY-MM
  year={2025}
/>
```

### 2. `ReportContentDynamic`
Componente que carga y renderiza datos dinámicamente desde JSON.

**Características:**
- ✅ Carga automática de datos desde `/data/clients/{clientId}.json`
- ✅ Cálculo automático de KPIs financieros
- ✅ Generación de recomendaciones basadas en datos
- ✅ Comparación con año anterior (si existe)
- ✅ Visualización de tendencias
- ✅ Loading states y manejo de errores

### 3. `ReportContent`
Componente estático con datos hardcoded (solo para MRM legacy).

## 📁 Estructura de Datos JSON

```json
{
  "clienteId": "mrm",
  "clienteNombre": "MRM",
  "razonSocial": "MRM Ingeniería Integral S. de R.L. MI",
  "years": {
    "2024": {
      "estadoResultadosPeriodo": [
        {
          "mes": "2024-01",
          "ingresos": 9123748.09,
          "compras": 1437523.48,
          "gastos": 7795008.23,
          "prodFin": 0,
          "gastFin": 0,
          "utilidad": -108783.62
        }
      ],
      "estadoResultadosYTD": [
        {
          "mes": "2024-01",
          "ingresosYTD": 9123748.09,
          "comprasYTD": 1437523.48,
          "gastosYTD": 7795008.23,
          "prodFinYTD": 0,
          "gastFinYTD": 0,
          "utilidadYTD": -108783.62
        }
      ],
      "balanceGeneral": [
        {
          "mes": "2024-01",
          "ac": 75340726.91,
          "pc": 10193073.09,
          "bancos": 273651.01,
          "inversiones": 0,
          "clientes": 0,
          "deudores": 28894634.87,
          "inventario": 0,
          "anticipoProv": 0,
          "pagosAnt": 0,
          "anticipoCli": 0,
          "capital": 0,
          "utilidadEj": 0,
          "anc": 0,
          "plc": 0
        }
      ]
    }
  }
}
```

## 🚀 Flujo de Uso

### En la Aplicación:

1. **Usuario selecciona un cliente** (ej: MRM, FIDUZ, Vilego, etc.)
2. **Abre modal de informes mensuales** (`MonthlyReportsModal`)
3. **Selecciona un mes específico**
4. **Se abre el reporte completo** (`ReportModal`)
   - Automáticamente carga datos desde `public/data/clients/{clientId}.json`
   - Convierte el mes de "Enero" → "2025-01"
   - `ReportContentDynamic` renderiza el reporte con datos reales

### Conversión de Formato:

```typescript
// MonthlyReportsModal convierte automáticamente:
month: "Enero" → "2025-01"
month: "Diciembre" → "2024-12"

// Usando convertMonthNameToNumber()
const monthMap = {
  Enero: "01", Febrero: "02", Marzo: "03",
  Abril: "04", Mayo: "05", Junio: "06",
  Julio: "07", Agosto: "08", Septiembre: "09",
  Octubre: "10", Noviembre: "11", Diciembre: "12"
}
```

## 📊 KPIs Calculados Automáticamente

Para cada mes, el sistema calcula:

### Estado de Resultados:
- ✅ Margen bruto
- ✅ Margen operativo
- ✅ Margen neto
- ✅ EBITDA

### Balance General:
- ✅ Razón circulante (liquidez)
- ✅ Capital de trabajo
- ✅ Apalancamiento

### Comparativas:
- ✅ Variación vs mes anterior
- ✅ Variación vs mismo mes año anterior
- ✅ Tendencias acumuladas (YTD)

## 🛠️ Scripts Disponibles

### Extracción de Datos:

```bash
# Extraer datos de todos los clientes
python scripts/extract_all_clients.py

# Verificar completitud
python scripts/verify_all_clients.py
```

## 📍 Servicios Utilizados

### `lib/financial-data-service.ts`
Servicio para cargar y procesar datos financieros:

```typescript
// Cargar datos de un cliente
const data = await loadClientFinancialData("mrm")

// Obtener años disponibles
const years = getAvailableYears(data)

// Obtener meses de un año
const months = getAvailableMonths(data, 2025)

// Obtener datos de un periodo
const period = getPeriodData(data, 2025, "2025-01")
```

### `lib/financial-calculations.ts`
Cálculos financieros y formateo:

```typescript
// Calcular KPIs
const kpis = calcularKPIsFinancieros(erPeriodo, balanceGeneral)

// Calcular variaciones
const variacion = calcularVariacionPeriodos(actual, anterior)

// Generar recomendaciones
const recomendaciones = generarRecomendaciones(kpis, erPeriodo)

// Formatear moneda
const formatted = formatCurrency(1234567.89) // "$1,234,567.89"
```

## ✨ Características del Sistema

### ✅ Completamente Dinámico
- No hay datos hardcoded (excepto `ReportContent` legacy)
- Todos los clientes cargan desde JSON
- Configuración centralizada en `CLIENTS_MAP`

### ✅ Escalable
- Agregar nuevos clientes solo requiere:
  1. Agregar JSON en `public/data/clients/`
  2. Agregar entrada en `CLIENTS_MAP`

### ✅ Mantenible
- Separación clara entre datos y presentación
- Componentes reutilizables
- Scripts de extracción automatizados

### ✅ Robusto
- Manejo de errores en carga de datos
- Estados de loading
- Validación de datos
- Fallbacks para datos faltantes

## 🔄 Actualización de Datos

Para actualizar datos cuando lleguen nuevos PDFs:

1. Colocar PDFs en carpeta correspondiente:
   ```
   Ejercicio Analisis MRM Vilego Luenser y otros/{CLIENTE}/{AÑO}/{MES}/
   ```

2. Ejecutar script de extracción:
   ```bash
   python scripts/extract_all_clients.py
   ```

3. Los JSON se actualizan automáticamente en `public/data/clients/`

## 📝 Notas Importantes

- ⚠️ Los nombres de mes deben estar en español
- ⚠️ El formato de mes interno es YYYY-MM
- ⚠️ Todos los montos están en pesos mexicanos
- ⚠️ Los datos YTD son acumulados desde enero

## 🎯 Estado Actual: 100% Funcional

✅ 10/10 clientes con datos  
✅ 193 meses procesados  
✅ Componentes genéricos implementados  
✅ Scripts de extracción funcionando  
✅ Servicio de datos completo  
✅ Cálculos financieros automatizados  
✅ Sistema completamente integrado  
