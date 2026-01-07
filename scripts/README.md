# Scripts de Extracción de Datos

## Extractor FIDUZ

### Instalación

```bash
pip install pdfplumber
```

### Uso

```bash
python scripts/extract_fiduz_data.py
```

### Proceso

1. **Primera ejecución**: El script mostrará el texto extraído de los PDFs para análisis
2. **Ajustar patrones**: Modifica las funciones `extract_*` con los patrones regex correctos
3. **Segunda ejecución**: Generará el JSON con los datos reales

### Alternativas si no funciona pdfplumber

#### Opción 1: Usar tabula-py (para tablas en PDFs)
```bash
pip install tabula-py
```

#### Opción 2: Convertir PDFs a texto manualmente
1. Abre cada PDF
2. Copia los valores
3. Pégalos en un archivo temporal
4. El script puede leerlos desde ahí

#### Opción 3: Extracción manual estructurada
Crea un archivo CSV temporal con el formato:
```csv
mes,ingresos,compras,gastos,utilidad
2024-12,1000,500,300,200
```

Luego convertimos el CSV a JSON automáticamente.
