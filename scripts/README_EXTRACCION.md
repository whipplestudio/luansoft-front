# Script de Extracción de Datos Financieros

Este script automatiza la extracción de datos de los PDFs financieros y actualiza los archivos JSON.

## 🚀 Instalación

### 1. Instalar Python 3.8+

```bash
# Verificar versión
python3 --version
```

### 2. Instalar dependencias

```bash
cd scripts
pip3 install -r requirements.txt
```

## 📖 Uso

### Modo Ejemplo (FIDUZ 2025/01)

```bash
python3 extract_financial_data.py
```

El script primero procesará FIDUZ 2025/01 como ejemplo y te preguntará si deseas continuar con todos los clientes.

### Procesamiento Completo

Cuando el script pregunte:
```
¿Deseas procesar todos los clientes? (s/n):
```

Responde **`s`** para procesar todos los clientes automáticamente.

## 📊 ¿Qué hace el script?

### Por cada mes de cada cliente:

1. **Busca los 3 PDFs:**
   - Estado de Resultados
   - Balance General
   - Anexos del Catálogo

2. **Extrae datos usando patrones:**
   - Ingresos, Compras, Gastos
   - Productos financieros, Gastos financieros
   - Utilidad neta
   - Activo/Pasivo Circulante
   - Bancos, Inversiones, Clientes
   - Capital contable, etc.

3. **Actualiza el JSON correspondiente:**
   - Reemplaza los valores en 0 con datos reales
   - Mantiene la estructura existente
   - No sobrescribe datos manualmente agregados

## 🎯 Ejemplo de Salida

```
🚀 Iniciando extracción de datos financieros de PDFs...
📁 Directorio PDFs: /Users/.../Ejercicio Analisis MRM Vilego Luenser y otros
📁 Directorio JSONs: /Users/.../public/data/clients

============================================================

🔍 EJEMPLO: FIDUZ 2025/01

📄 Procesando fiduz - 2025/01
   Estado de Resultados: 01 2025 EDO DE RESULTADOS.pdf
   Balance General: 01 2025 balance general.pdf
   Anexos: 01 2025 Anexos del Catalogo.pdf

✅ Actualizado: fiduz - 2025/01

============================================================

¿Deseas procesar todos los clientes? (s/n):
```

## ⚙️ Estructura de Carpetas Soportada

El script maneja automáticamente diferentes estructuras:

### Tipo 1: Archivos directos por año
```
Cliente/
  └── 2024/
      ├── Estado de Resultados 01 Ene 2024.pdf
      ├── balance general 01 Ene 2024.pdf
      └── Anexos del Catalogo 01 Ene 2024.pdf
```

### Tipo 2: Carpetas por mes
```
Cliente/
  └── 2024/
      └── 01.-Enero/
          ├── Estado de Resultados.pdf
          ├── balance general.pdf
          └── Anexos del Catalogo.pdf
```

## 🔧 Personalización

### Agregar nuevos patrones de búsqueda

Edita las secciones `patterns` en las funciones:
- `extract_estado_resultados()` - Para Estado de Resultados
- `extract_balance_general()` - Para Balance General

### Agregar nuevos clientes

Modifica el diccionario `CLIENTS` en el script:

```python
CLIENTS = {
    "nuevo_cliente": "Nombre Carpeta Cliente",
    # ...
}
```

## ⚠️ Limitaciones

### El script usa **expresiones regulares** para buscar valores:

✅ **Funciona bien con:**
- PDFs con texto seleccionable
- Formatos consistentes de reportes
- Etiquetas claras (Ingresos, Gastos, etc.)

❌ **Puede fallar con:**
- PDFs escaneados (imágenes sin OCR)
- Formatos muy diferentes entre meses
- Tablas complejas sin etiquetas claras

### Si el script no encuentra valores:

1. **Verifica el PDF manualmente** - ¿tiene texto seleccionable?
2. **Revisa los patrones** - Puede que las etiquetas sean diferentes
3. **Extrae manualmente** ese mes y deja que el script haga el resto

## 📝 Validación Manual

Después de ejecutar el script, **siempre verifica**:

1. **Abre un JSON actualizado:**
   ```bash
   cat public/data/clients/fiduz.json
   ```

2. **Compara con el PDF original** para un mes
3. **Verifica que los números coincidan**
4. **Calcula manualmente:** 
   ```
   utilidad = ingresos - compras - gastos + prodFin - gastFin
   ```

## 🐛 Solución de Problemas

### Error: "No module named 'pdfplumber'"
```bash
pip3 install pdfplumber
```

### Error: "Permission denied"
```bash
chmod +x extract_financial_data.py
```

### Error: "PDFs no encontrados"
- Verifica que la ruta base sea correcta
- Revisa la estructura de carpetas del cliente
- Asegúrate de que los PDFs existen

### Valores extraídos son 0
- El PDF puede ser una imagen escaneada
- Los patrones no coinciden con las etiquetas del PDF
- Extrae ese mes manualmente

## 💡 Consejos

1. **Empieza con FIDUZ** - Solo 12 meses, perfecto para probar
2. **Valida cada cliente** antes de continuar con el siguiente
3. **Guarda backups** de los JSONs antes de ejecutar el script
4. **Revisa los logs** - El script indica qué PDFs procesa
5. **Itera gradualmente** - Si algo falla, ajusta y continúa

## 🎯 Próximos Pasos

Una vez que el script haya procesado los datos:

1. **Abre la aplicación** en el navegador
2. **Prueba el reporte** de cada cliente
3. **Verifica los KPIs** calculados
4. **Compara** con los PDFs originales
5. **Corrige manualmente** cualquier discrepancia

---

## 📞 Apoyo

Si encuentras problemas:
1. Revisa los logs del script
2. Verifica los PDFs manualmente
3. Ajusta los patrones de búsqueda
4. Extrae manualmente los meses problemáticos

**Recuerda:** Este script es una **herramienta de ayuda**. Siempre valida los datos extraídos comparándolos con los PDFs originales.
