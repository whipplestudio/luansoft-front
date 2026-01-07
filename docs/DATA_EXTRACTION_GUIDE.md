# Guía de Extracción de Datos de PDFs

## 📋 Objetivo

Extraer datos financieros reales de los PDFs ubicados en `/Ejercicio Analisis MRM Vilego Luenser y otros/` para completar los archivos JSON de cada cliente.

## 📁 Estructura de Archivos por Cliente

Cada cliente tiene PDFs organizados por año y mes:

```
{Cliente}/
├── 2024/
│   ├── 1.ENERO 2024/
│   │   ├── 1.ANEXOS DEL CATALOGO ENERO {CLIENTE} 2024.pdf
│   │   ├── 1.BALANCE GENERAL ENERO {CLIENTE} 2024.pdf
│   │   └── 1.ESTADO DE RESULTADOS ENERO {CLIENTE} 2024.pdf
│   ├── 2.FEB 2024/
│   └── ...
└── 2025/
    └── ...
```

## 📊 Orden de Extracción Recomendado

### Prioridad 1: Estado de Resultados (ER)
**Archivo**: `ESTADO DE RESULTADOS {MES} {CLIENTE} {AÑO}.pdf`

#### Datos a Extraer (por mes):

1. **Ingresos** (Income/Revenue)
   - Ventas totales
   - Servicios prestados
   - Otros ingresos operativos

2. **Compras** (Cost of Sales/COGS)
   - Costo de ventas
   - Compras de mercancía
   - Costo de servicios

3. **Gastos** (Operating Expenses)
   - Gastos de operación
   - Gastos administrativos
   - Gastos de venta

4. **Productos Financieros** (Financial Income)
   - Intereses ganados
   - Rendimientos de inversiones

5. **Gastos Financieros** (Financial Expenses)
   - Intereses pagados
   - Comisiones bancarias

6. **Utilidad** (Net Income)
   - Utilidad neta del período
   - Resultado del ejercicio

#### Ejemplo de Extracción:

```
Estado de Resultados - Marzo 2024
═══════════════════════════════════════
Ingresos por Ventas:           $17,734,032.37
Costo de Ventas:                $6,669,733.24
                                ──────────────
Utilidad Bruta:                $11,064,299.13

Gastos de Operación:            $8,873,748.75
                                ──────────────
Utilidad Operativa:             $2,190,550.38

Productos Financieros:            $145,776.59
Gastos Financieros:               ($30,181.07)
                                ──────────────
Utilidad Neta:                  $2,306,145.90
```

**JSON a completar**:
```json
{
  "mes": "2024-03",
  "ingresos": 17734032.37,
  "compras": 6669733.24,
  "gastos": 8873748.75,
  "prodFin": 145776.59,
  "gastFin": 30181.07,
  "utilidad": 2306145.90
}
```

### Prioridad 2: Estado de Resultados YTD

**Fuente**: Mismo PDF del Estado de Resultados (columna acumulada o separado)

#### Datos a Extraer:

Suma acumulada desde enero hasta el mes actual de:
- Ingresos YTD
- Compras YTD
- Gastos YTD
- Productos Financieros YTD
- Gastos Financieros YTD
- Utilidad YTD

#### Cálculo Manual (si no está en PDF):

```
Enero:        Ingresos = 15,000,000
Febrero:      Ingresos = 14,500,000
Marzo:        Ingresos = 17,734,032.37
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Marzo YTD:    Ingresos = 47,234,032.37
```

**JSON a completar**:
```json
{
  "mes": "2024-03",
  "ingresosYTD": 51377228.37,
  "comprasYTD": 18463599.24,
  "gastosYTD": 26621496.30,
  "prodFinYTD": 469232.18,
  "gastFinYTD": 104908.41,
  "utilidadYTD": 6656456.60
}
```

### Prioridad 3: Balance General (BG)
**Archivo**: `BALANCE GENERAL {MES} {CLIENTE} {AÑO}.pdf`

#### Sección 1: Activos

**Activo Circulante**:
- Bancos (Cash)
- Inversiones temporales (Short-term Investments)
- Clientes / Cuentas por Cobrar (Accounts Receivable)
- Deudores Diversos (Other Receivables)
- Inventarios (Inventory)
- Anticipo a Proveedores (Advances to Suppliers)
- Pagos Anticipados (Prepaid Expenses)

**Activo No Circulante** (opcional):
- Propiedad, planta y equipo
- Activos intangibles
- Inversiones a largo plazo

#### Sección 2: Pasivos

**Pasivo Circulante**:
- Proveedores (Accounts Payable)
- Acreedores Diversos (Other Payables)
- Anticipo de Clientes (Customer Advances)
- Impuestos por pagar (Taxes Payable)

**Pasivo a Largo Plazo** (opcional):
- Deuda a largo plazo
- Créditos bancarios

#### Sección 3: Capital

- Capital Social (Contributed Capital)
- Resultados Acumulados (Retained Earnings)
- Utilidad del Ejercicio (Current Year Income)

#### Ejemplo de Extracción:

```
Balance General al 31 de Marzo 2024
═════════════════════════════════════════════

ACTIVO CIRCULANTE
─────────────────────────────────────────────
Bancos                                $185,234.56
Inversiones Temporales             $18,765,432.10
Clientes                            $9,234,567.89
Deudores Diversos                  $24,567,890.12
Inventarios                         $2,987,654.32
Anticipo a Proveedores                $456,789.01
Pagos Anticipados                     $612,345.67
                                   ──────────────
Total Activo Circulante            $58,420,650.28

ACTIVO NO CIRCULANTE               $15,234,567.89
                                   ──────────────
TOTAL ACTIVO                       $73,655,218.17

PASIVO CIRCULANTE
─────────────────────────────────────────────
Proveedores                         $3,456,789.12
Anticipo de Clientes                  $478,901.23
Otros Pasivos                       $5,020,543.83
                                   ──────────────
Total Pasivo Circulante             $8,956,234.18

PASIVO LARGO PLAZO                  $3,456,789.12
                                   ──────────────
TOTAL PASIVO                       $12,413,023.30

CAPITAL CONTABLE
─────────────────────────────────────────────
Capital Social                     $30,000,000.00
Resultados Acumulados              $23,128,976.45
Utilidad del Ejercicio              $6,656,456.60
                                   ──────────────
TOTAL CAPITAL                      $59,785,433.05

TOTAL PASIVO + CAPITAL             $73,655,218.17
```

**JSON a completar**:
```json
{
  "mes": "2024-03",
  "ac": 58420650.28,
  "pc": 8956234.18,
  "bancos": 185234.56,
  "inversiones": 18765432.10,
  "clientes": 9234567.89,
  "deudores": 24567890.12,
  "inventario": 2987654.32,
  "anticipoProv": 456789.01,
  "pagosAnt": 612345.67,
  "anticipoCli": 478901.23,
  "capital": 59785433.05,
  "utilidadEj": 6656456.60,
  "anc": 15234567.89,
  "plc": 3456789.12
}
```

## ✅ Validación de Datos

### Verificación 1: Utilidad del Mes

```
Utilidad = Ingresos - Compras - Gastos + ProdFin - GastFin
```

**Ejemplo**:
```
$2,306,145.90 = $17,734,032.37 - $6,669,733.24 - $8,873,748.75 + $145,776.59 - $30,181.07
```

### Verificación 2: Balance General Cuadrado

```
Activo Total = Pasivo Total + Capital
```

**Ejemplo**:
```
$73,655,218.17 = $12,413,023.30 + $59,785,433.05
```

### Verificación 3: Utilidad YTD vs Balance

```
Utilidad YTD del ER = Utilidad del Ejercicio del BG
```

## 🔧 Herramientas Recomendadas

### Opción 1: Extracción Manual
- Abrir PDF
- Copiar valores a Excel/Google Sheets
- Transferir a JSON

### Opción 2: Extracción Semi-Automática
- Adobe Acrobat (función de exportar a Excel)
- Tabula (herramienta gratuita para extraer tablas de PDFs)
- Google Cloud Vision API (OCR)

### Opción 3: Script Python
```python
import PyPDF2
import re

def extraer_datos_er(pdf_path):
    # Leer PDF
    # Buscar patrones con regex
    # Extraer números
    # Generar JSON
    pass
```

## 📝 Plantilla de Trabajo

### Para cada cliente, crear archivo CSV temporal:

```csv
Mes,Ingresos,Compras,Gastos,ProdFin,GastFin,Utilidad
2024-01,0,0,0,0,0,0
2024-02,0,0,0,0,0,0
2024-03,17734032.37,6669733.24,8873748.75,145776.59,30181.07,2306145.90
...
```

Luego convertir a JSON con script o manualmente.

## 🎯 Clientes a Procesar

| # | Cliente | Meses 2024 | Meses 2025 | Prioridad |
|---|---------|-----------|-----------|-----------|
| 1 | ✅ Luenser | 4 meses | 2 meses | Completo |
| 2 | MRM | 12 meses | 11 meses | Alta |
| 3 | Vilego | 12 meses | 6 meses | Alta |
| 4 | FIDUZ | 1 mes | 11 meses | Media |
| 5 | Josivna | 12 meses | 11 meses | Media |
| 6 | Leret Leret | 12 meses | 10 meses | Media |
| 7 | SINMSA | 12 meses | 11 meses | Media |
| 8 | Sedentarius | 12 meses | 11 meses | Baja |
| 9 | Whipple | 12 meses | 5 meses | Baja |
| 10 | Luengas | 12 meses | 11 meses | Baja |

## ⚡ Tips para Acelerar el Proceso

1. **Estandarizar formato**: Crear plantilla Excel con las columnas necesarias
2. **Batch processing**: Procesar todos los meses de un año a la vez
3. **Validación automática**: Crear fórmulas en Excel para validar
4. **División de trabajo**: Asignar diferentes clientes a diferentes personas
5. **Control de calidad**: Revisar 2-3 meses aleatorios de cada cliente

## 📊 Tiempo Estimado

- **Por mes de datos**: 5-10 minutos (extracción manual)
- **Por cliente completo (12 meses)**: 1-2 horas
- **Todos los clientes (9 restantes)**: 15-20 horas de trabajo

## 🚀 Siguientes Pasos

1. Empezar con **MRM** (prioridad alta, datos completos)
2. Continuar con **Vilego** (prioridad alta)
3. Procesar clientes de prioridad media
4. Finalizar con clientes de prioridad baja
5. Validar todos los reportes generados
6. Hacer pruebas de comparación año a año

---

**Nota**: Los datos extraídos deben ser **exactamente como aparecen en los PDFs**. No inventar ni aproximar números.
