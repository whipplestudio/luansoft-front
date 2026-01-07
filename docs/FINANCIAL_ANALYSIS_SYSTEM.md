# Sistema de Análisis Financiero MRM

## 📋 Descripción General

Sistema completo de análisis financiero diseñado para gestionar y analizar datos históricos de **10 clientes** con cálculos automáticos de KPIs, comparaciones año a año, y generación de reportes ejecutivos.

## 🏗️ Arquitectura del Sistema

### Estructura de Datos

El sistema utiliza **archivos JSON por cliente** ubicados en `/public/data/clients/` con la siguiente estructura:

```
public/data/clients/
├── luenser.json      (Datos reales completos 2024-2025)
├── mrm.json          (Estructura lista para datos)
├── vilego.json       (Estructura lista para datos)
├── fiduz.json        (Estructura lista para datos)
├── josivna.json      (Estructura lista para datos)
├── leret.json        (Estructura lista para datos)
├── sinmsa.json       (Estructura lista para datos)
├── sedentarius.json  (Estructura lista para datos)
├── whipple.json      (Estructura lista para datos)
└── luengas.json      (Estructura lista para datos)
```

### Esquema de Datos JSON

Cada archivo de cliente contiene:

```typescript
{
  "clienteId": "string",
  "clienteNombre": "string",
  "razonSocial": "string",
  "years": {
    "2024": {
      "estadoResultadosPeriodo": [...],
      "estadoResultadosYTD": [...],
      "balanceGeneral": [...]
    },
    "2025": { ... }
  }
}
```

## 📊 Componentes del Sistema

### 1. Tipos de Datos (`/types/financial.ts`)

Define las interfaces TypeScript para:
- **EstadoResultadosPeriodo**: Datos mensuales del estado de resultados
- **EstadoResultadosYTD**: Datos acumulados año a fecha
- **BalanceGeneral**: Datos de balance por mes
- **ClienteFinancialData**: Estructura completa del cliente
- **KPIFinanciero**: 14 indicadores financieros clave
- **AnalisisComparativo**: Comparaciones período a período

### 2. Utilidades de Cálculo (`/lib/financial-calculations.ts`)

Funciones para calcular **14 KPIs financieros**:

#### Ratios de Liquidez
- `calcularRazonCirculante()`: AC / PC
- `calcularPruebaAcida()`: (AC - Inventario - Pagos Ant.) / PC
- `calcularCapitalTrabajo()`: AC - PC

#### Ratios de Rentabilidad
- `calcularMargenOperativo()`: (Ingresos - Compras - Gastos) / Ingresos
- `calcularMargenNeto()`: Utilidad / Ingresos
- `calcularROE()`: Utilidad / Capital
- `calcularROA()`: Utilidad / Activo Total

#### Ratios de Eficiencia
- `calcularRotacionActivos()`: Ingresos / Activo Total
- `calcularRotacionCuentasCobrar()`: Ingresos / Clientes
- `calcularDiasCuentasCobrar()`: 365 / Rotación
- `calcularRotacionInventarios()`: Costo Ventas / Inventario
- `calcularDiasInventario()`: 365 / Rotación

#### Ratios de Endeudamiento
- `calcularRazonEndeudamiento()`: Pasivo Total / Activo Total
- `calcularRazonDeuda()`: Pasivo Total / Capital
- `calcularCoberturaIntereses()`: Utilidad Operativa / Gastos Financieros

#### Análisis Comparativo
- `calcularVariacionPeriodos()`: Compara dos períodos con variación absoluta y porcentual
- `generarRecomendaciones()`: Genera recomendaciones inteligentes basadas en KPIs

### 3. Servicio de Datos (`/lib/financial-data-service.ts`)

Funciones para gestionar datos:

- `loadClientFinancialData(clientId)`: Carga datos JSON del cliente
- `getClientName(clientId)`: Obtiene nombre del cliente
- `getAllClientIds()`: Lista todos los IDs de clientes disponibles
- `getAvailableYears(data)`: Años disponibles para un cliente
- `getAvailableMonths(data, year)`: Meses disponibles para un año
- `getMonthName(mes)`: Convierte "2024-06" a "Junio"
- `getPeriodData(data, year, month)`: Obtiene datos de un período específico
- `getComparativeData(data, currentYear, currentMonth)`: Datos comparativos entre años

### 4. Componente de Reporte (`/components/MRMReportContentDynamic.tsx`)

Componente React que:
- Carga datos dinámicamente por `clientId`, `month`, `year`
- Calcula automáticamente todos los KPIs
- Muestra 6 tarjetas de indicadores principales
- Genera resumen ejecutivo con análisis inteligente
- Compara con año anterior (si hay datos disponibles)
- Genera recomendaciones estratégicas automáticas
- Muestra tablas históricas de:
  - Estado de Resultados (todos los períodos)
  - Indicadores de Liquidez (todos los períodos)
- Resalta el período actual en las tablas

## 🎯 Clientes Disponibles

| Cliente ID | Nombre Completo | Razón Social | Estado de Datos |
|------------|----------------|--------------|-----------------|
| `luenser` | Luenser | MRM INGENIERÍA INTEGRAL S. de R.L. MI | ✅ Completo (2024-2025) |
| `mrm` | MRM | MRM INGENIERÍA INTEGRAL S.A. de C.V. | ⏳ Estructura lista |
| `vilego` | Vilego | VILEGO S.A. de C.V. | ⏳ Estructura lista |
| `fiduz` | FIDUZ | FIDUZ S.A. de C.V. | ⏳ Estructura lista |
| `josivna` | Josivna | JOSIVNA S.A. de C.V. | ⏳ Estructura lista |
| `leret` | Leret Leret | LERET LERET S.A. de C.V. | ⏳ Estructura lista |
| `sinmsa` | SINMSA | SINMSA S.A. de C.V. | ⏳ Estructura lista |
| `sedentarius` | Sedentarius | SEDENTARIUS S.A. de C.V. | ⏳ Estructura lista |
| `whipple` | Soluciones Whipple | SOLUCIONES WHIPPLE S.A. de C.V. | ⏳ Estructura lista |
| `luengas` | Jose Manuel Luengas | JOSE MANUEL LUENGAS S.A. de C.V. | ⏳ Estructura lista |

## 📝 Cómo Agregar Datos de Clientes

### Paso 1: Ubicar el archivo JSON del cliente

Archivo: `/public/data/clients/{clienteId}.json`

### Paso 2: Completar datos del Estado de Resultados

Para cada mes, agregar a `estadoResultadosPeriodo`:

```json
{
  "mes": "2024-01",
  "ingresos": 0.00,
  "compras": 0.00,
  "gastos": 0.00,
  "prodFin": 0.00,
  "gastFin": 0.00,
  "utilidad": 0.00
}
```

**Fuente de datos**: PDF "ESTADO DE RESULTADOS {MES} {CLIENTE} {AÑO}.pdf"

### Paso 3: Completar datos YTD

Para cada mes, agregar a `estadoResultadosYTD`:

```json
{
  "mes": "2024-01",
  "ingresosYTD": 0.00,
  "comprasYTD": 0.00,
  "gastosYTD": 0.00,
  "prodFinYTD": 0.00,
  "gastFinYTD": 0.00,
  "utilidadYTD": 0.00
}
```

**Cálculo**: Suma acumulada desde enero hasta el mes actual

### Paso 4: Completar Balance General

Para cada mes, agregar a `balanceGeneral`:

```json
{
  "mes": "2024-01",
  "ac": 0.00,
  "pc": 0.00,
  "bancos": 0.00,
  "inversiones": 0.00,
  "clientes": 0.00,
  "deudores": 0.00,
  "inventario": 0.00,
  "anticipoProv": 0.00,
  "pagosAnt": 0.00,
  "anticipoCli": 0.00,
  "capital": 0.00,
  "utilidadEj": 0.00,
  "anc": 0.00,
  "plc": 0.00,
  "proveedores": 0.00,
  "acreedores": 0.00,
  "capitalSocial": 0.00,
  "resultadosAcum": 0.00
}
```

**Fuente de datos**: PDF "BALANCE GENERAL {MES} {CLIENTE} {AÑO}.pdf"

### Campos Clave del Balance:
- **ac**: Activo Circulante
- **pc**: Pasivo Circulante  
- **anc**: Activo No Circulante (opcional)
- **plc**: Pasivo a Largo Plazo (opcional)
- **capital**: Capital Contable
- **utilidadEj**: Utilidad del Ejercicio (debe coincidir con YTD)

## 🔧 Uso del Sistema

### Ejemplo 1: Mostrar reporte de cliente

```tsx
import { MRMReportContentDynamic } from "@/components/MRMReportContentDynamic"

<MRMReportContentDynamic 
  clientId="luenser" 
  month="2025-07" 
  year={2025} 
/>
```

### Ejemplo 2: Cargar datos de cliente programáticamente

```typescript
import { loadClientFinancialData } from "@/lib/financial-data-service"

const data = await loadClientFinancialData("luenser")
if (data) {
  console.log(data.clienteNombre) // "Luenser"
  console.log(data.years["2025"].estadoResultadosPeriodo)
}
```

### Ejemplo 3: Calcular KPIs manualmente

```typescript
import { calcularKPIsFinancieros } from "@/lib/financial-calculations"

const kpis = calcularKPIsFinancieros(erPeriodo, balanceGeneral)
console.log(kpis.razonCirculante) // 9.23
console.log(kpis.margenNeto) // 0.345
```

## 📈 KPIs Calculados Automáticamente

El sistema calcula y muestra:

1. **Utilidad del período** - Resultado del mes
2. **Utilidad acumulada YTD** - Resultado año a la fecha
3. **Ingresos YTD** - Ingresos acumulados
4. **Razón circulante** - Liquidez general
5. **Margen operativo** - Eficiencia operativa
6. **Capital de trabajo** - Solvencia a corto plazo
7. **Margen neto** - Rentabilidad final
8. **Prueba ácida** - Liquidez inmediata
9. **ROE** - Retorno sobre capital
10. **Días cuentas por cobrar** - Eficiencia de cobranza
11. **Razón de endeudamiento** - Nivel de apalancamiento

## 🎨 Características del Reporte

### Visualizaciones
- ✅ 6 tarjetas de KPIs principales con código de colores
- ✅ Resumen ejecutivo con análisis narrativo
- ✅ Comparación año anterior con indicadores de tendencia
- ✅ Recomendaciones estratégicas automáticas
- ✅ Tabla histórica de Estado de Resultados
- ✅ Tabla histórica de Indicadores de Liquidez
- ✅ Resaltado del período actual

### Código de Colores
- 🟢 **Verde**: Indicadores positivos/saludables
- 🟡 **Ámbar**: Indicadores de atención/precaución
- 🔴 **Rojo**: Indicadores negativos/críticos
- ⚪ **Gris**: Indicadores neutrales

### Recomendaciones Inteligentes

El sistema genera recomendaciones basadas en:
- Liquidez baja/alta
- Margen neto negativo/bajo
- Días de cobranza elevados
- Nivel de endeudamiento alto
- Capital de trabajo negativo
- Rentabilidad baja

## 🔄 Próximos Pasos

### Para cada cliente restante:

1. **Extraer datos de PDFs** en la carpeta del cliente:
   - Estado de Resultados por mes
   - Balance General por mes

2. **Completar archivos JSON** con datos reales

3. **Verificar consistencia**:
   - Utilidad del mes debe ser calculable: `ingresos - compras - gastos + prodFin - gastFin`
   - Utilidad YTD debe coincidir con utilidadEj del Balance
   - Activo Circulante y Pasivo Circulante deben coincidir entre ER y BG

4. **Probar el reporte** con el componente MRMReportContentDynamic

## 💡 Ventajas del Sistema JSON

### ✅ Ventajas
- **Separación por cliente**: Fácil mantenimiento
- **Versionable**: Control en Git
- **Histórico completo**: Todos los años y meses en un lugar
- **Acceso rápido**: Sin base de datos necesaria
- **Portabilidad**: Fácil de copiar/compartir
- **Cálculos en tiempo real**: KPIs siempre actualizados

### 📊 Alternativas Consideradas
- ❌ Base de datos SQL: Sobrecarga para datos estáticos
- ❌ CSV: Difícil estructura jerárquica
- ❌ Excel: No integrable con app web
- ✅ **JSON**: Equilibrio perfecto

## 🚀 Integración con MRMModal

El componente existente `MRMModal` ya está configurado para usar los datos:

```tsx
<MRMModal 
  isOpen={isOpen}
  onClose={onClose}
  clientId="luenser"
  month="2025-07"
  year={2025}
/>
```

Para usar el nuevo componente dinámico, actualizar la importación en MRMModal:

```tsx
import { MRMReportContentDynamic } from "@/components/MRMReportContentDynamic"

// Reemplazar MRMReportContent con MRMReportContentDynamic
<MRMReportContentDynamic clientId={clientId} month={month} year={year} />
```

## 📞 Soporte

Para agregar más clientes o modificar cálculos, revisar:
- `/types/financial.ts` - Agregar nuevos campos
- `/lib/financial-calculations.ts` - Agregar nuevos KPIs
- `/lib/financial-data-service.ts` - Agregar nuevos servicios
- `/components/MRMReportContentDynamic.tsx` - Modificar presentación

---

**Sistema desarrollado por**: Expert Finance & Accounting AI Assistant  
**Versión**: 1.0.0  
**Fecha**: Diciembre 2025
