#!/usr/bin/env python3
"""
Script para extraer datos financieros de PDFs y actualizar archivos JSON.
Extrae información de:
- Estado de Resultados (Periodo y YTD)
- Balance General
- Anexos del Catálogo

Uso:
    python extract_financial_data.py
"""

import os
import json
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import pdfplumber

# Configuración de rutas
BASE_DIR = Path(__file__).parent.parent
PDF_BASE_DIR = BASE_DIR / "Ejercicio Analisis MRM Vilego Luenser y otros"
JSON_BASE_DIR = BASE_DIR / "public" / "data" / "clients"

# Mapeo de clientes a sus carpetas
CLIENTS = {
    "fiduz": "FIDUZ",
    "mrm": "MRM",
    "vilego": "Vilego",
    "josivna": "Josivna",
    "leret": "Leret Leret",
    "sinmsa": "SINMSA",
    "sedentarius": "Sedentarius",
    "whipple": "Soluciones Whipple",
    "luengas": "Jose Manuel Luengas",
}

# Nombres de meses
MONTH_NAMES = {
    "01": ["Ene", "Enero", "ENERO", "January"],
    "02": ["Feb", "Febrero", "FEBRERO", "February"],
    "03": ["Mar", "Marzo", "MARZO", "March"],
    "04": ["Abr", "Abril", "ABRIL", "April"],
    "05": ["May", "Mayo", "MAYO", "May"],
    "06": ["Jun", "Junio", "JUNIO", "June"],
    "07": ["Jul", "Julio", "JULIO", "July"],
    "08": ["Ago", "Agosto", "AGOSTO", "August"],
    "09": ["Sep", "Septiembre", "SEPTIEMBRE", "September"],
    "10": ["Oct", "Octubre", "OCTUBRE", "October"],
    "11": ["Nov", "Noviembre", "NOVIEMBRE", "November"],
    "12": ["Dic", "Diciembre", "DICIEMBRE", "December"],
}


def clean_number(text: str) -> float:
    """Limpia y convierte texto a número float."""
    if not text:
        return 0.0
    
    # Remover caracteres no numéricos excepto punto, coma y signo negativo
    text = text.strip().replace("$", "").replace(",", "").replace(" ", "")
    
    # Manejar paréntesis como números negativos
    if "(" in text and ")" in text:
        text = "-" + text.replace("(", "").replace(")", "")
    
    try:
        return float(text)
    except ValueError:
        return 0.0


def extract_text_from_pdf(pdf_path: Path) -> str:
    """Extrae todo el texto de un PDF."""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text() or ""
            return text
    except Exception as e:
        print(f"❌ Error al leer {pdf_path.name}: {e}")
        return ""


def extract_estado_resultados(pdf_path: Path) -> Tuple[Dict, Dict]:
    """
    Extrae datos del Estado de Resultados (Periodo y YTD).
    Retorna: (periodo_data, ytd_data)
    """
    text = extract_text_from_pdf(pdf_path)
    if not text:
        return {}, {}
    
    periodo = {
        "ingresos": 0,
        "compras": 0,
        "gastos": 0,
        "prodFin": 0,
        "gastFin": 0,
        "utilidad": 0
    }
    
    ytd = {
        "ingresosYTD": 0,
        "comprasYTD": 0,
        "gastosYTD": 0,
        "prodFinYTD": 0,
        "gastFinYTD": 0,
        "utilidadYTD": 0
    }
    
    # Patrones para buscar valores
    patterns = {
        "ingresos": [
            r"Ingresos?\s+(?:por\s+)?(?:ventas?)?\s*[\$]?\s*([\d,\.]+)",
            r"Ventas?\s*[\$]?\s*([\d,\.]+)",
            r"INGRESOS?\s*[\$]?\s*([\d,\.]+)",
        ],
        "compras": [
            r"Costo\s+de\s+ventas?\s*[\$]?\s*([\d,\.]+)",
            r"Compras?\s*[\$]?\s*([\d,\.]+)",
            r"COSTO\s+DE\s+VENTAS?\s*[\$]?\s*([\d,\.]+)",
        ],
        "gastos": [
            r"Gastos?\s+de\s+operaci[oó]n\s*[\$]?\s*([\d,\.]+)",
            r"Gastos?\s+operativos?\s*[\$]?\s*([\d,\.]+)",
            r"GASTOS?\s+DE\s+OPERACI[OÓ]N\s*[\$]?\s*([\d,\.]+)",
        ],
        "prodFin": [
            r"Productos?\s+financieros?\s*[\$]?\s*([\d,\.]+)",
            r"PRODUCTOS?\s+FINANCIEROS?\s*[\$]?\s*([\d,\.]+)",
        ],
        "gastFin": [
            r"Gastos?\s+financieros?\s*[\$]?\s*([\d,\.]+)",
            r"GASTOS?\s+FINANCIEROS?\s*[\$]?\s*([\d,\.]+)",
        ],
        "utilidad": [
            r"Utilidad\s+(?:neta|del\s+ejercicio)\s*[\$]?\s*([\d,\.]+)",
            r"UTILIDAD\s+(?:NETA|DEL\s+EJERCICIO)\s*[\$]?\s*([\d,\.]+)",
        ],
    }
    
    # Buscar valores en el texto
    for key, pattern_list in patterns.items():
        for pattern in pattern_list:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                periodo[key] = clean_number(match.group(1))
                break
    
    # Para YTD, buscar columnas acumuladas
    # (esto puede variar según el formato del PDF)
    # Por ahora, copiar los mismos valores con sufijo YTD
    for key in periodo:
        ytd[key + "YTD"] = periodo[key]
    
    return periodo, ytd


def extract_balance_general(pdf_path: Path) -> Dict:
    """Extrae datos del Balance General."""
    text = extract_text_from_pdf(pdf_path)
    if not text:
        return {}
    
    balance = {
        "ac": 0,
        "pc": 0,
        "bancos": 0,
        "inversiones": 0,
        "clientes": 0,
        "deudores": 0,
        "inventario": 0,
        "anticipoProv": 0,
        "pagosAnt": 0,
        "anticipoCli": 0,
        "capital": 0,
        "utilidadEj": 0,
        "anc": 0,
        "plc": 0
    }
    
    patterns = {
        "ac": [
            r"Activo\s+circulante\s*[\$]?\s*([\d,\.]+)",
            r"ACTIVO\s+CIRCULANTE\s*[\$]?\s*([\d,\.]+)",
        ],
        "pc": [
            r"Pasivo\s+circulante\s*[\$]?\s*([\d,\.]+)",
            r"PASIVO\s+CIRCULANTE\s*[\$]?\s*([\d,\.]+)",
        ],
        "bancos": [
            r"Bancos?\s*[\$]?\s*([\d,\.]+)",
            r"Efectivo\s*[\$]?\s*([\d,\.]+)",
        ],
        "inversiones": [
            r"Inversiones?\s+temporales?\s*[\$]?\s*([\d,\.]+)",
            r"INVERSIONES?\s*[\$]?\s*([\d,\.]+)",
        ],
        "clientes": [
            r"Clientes?\s*[\$]?\s*([\d,\.]+)",
            r"Cuentas\s+por\s+cobrar\s*[\$]?\s*([\d,\.]+)",
        ],
        "deudores": [
            r"Deudores?\s+diversos?\s*[\$]?\s*([\d,\.]+)",
        ],
        "inventario": [
            r"Inventarios?\s*[\$]?\s*([\d,\.]+)",
        ],
        "capital": [
            r"Capital\s+contable\s*[\$]?\s*([\d,\.]+)",
            r"CAPITAL\s+CONTABLE\s*[\$]?\s*([\d,\.]+)",
        ],
    }
    
    for key, pattern_list in patterns.items():
        for pattern in pattern_list:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                balance[key] = clean_number(match.group(1))
                break
    
    return balance


def find_pdf_files(client_folder: Path, year: str, month: str) -> Dict[str, Optional[Path]]:
    """
    Busca los 3 archivos PDF de un mes específico.
    Retorna dict con keys: 'estado_resultados', 'balance_general', 'anexos'
    """
    year_path = client_folder / year
    if not year_path.exists():
        return {"estado_resultados": None, "balance_general": None, "anexos": None}
    
    pdfs = {"estado_resultados": None, "balance_general": None, "anexos": None}
    
    # Buscar en carpetas de mes o archivos directos
    month_variations = MONTH_NAMES.get(month, [])
    
    # Opción 1: Buscar en carpeta de mes
    for item in year_path.iterdir():
        if item.is_dir() and any(var in item.name for var in month_variations + [month]):
            # Dentro de la carpeta del mes
            for pdf in item.glob("*.pdf"):
                name_lower = pdf.name.lower()
                if "estado" in name_lower and "resultado" in name_lower:
                    pdfs["estado_resultados"] = pdf
                elif "balance" in name_lower or "posicion" in name_lower:
                    pdfs["balance_general"] = pdf
                elif "anexo" in name_lower or "catalogo" in name_lower:
                    pdfs["anexos"] = pdf
            break
    
    # Opción 2: Buscar archivos directos en carpeta del año
    if not pdfs["estado_resultados"]:
        for pdf in year_path.glob("*.pdf"):
            name = pdf.name
            # Verificar si el nombre contiene el mes
            if any(var in name for var in month_variations + [month]):
                name_lower = name.lower()
                if "estado" in name_lower and "resultado" in name_lower:
                    pdfs["estado_resultados"] = pdf
                elif "balance" in name_lower or "posicion" in name_lower:
                    pdfs["balance_general"] = pdf
                elif "anexo" in name_lower or "catalogo" in name_lower:
                    pdfs["anexos"] = pdf
    
    return pdfs


def update_json_file(client_id: str, year: str, month: str, periodo_data: Dict, ytd_data: Dict, balance_data: Dict):
    """Actualiza el archivo JSON del cliente con los datos extraídos."""
    json_path = JSON_BASE_DIR / f"{client_id}.json"
    
    if not json_path.exists():
        print(f"❌ Archivo JSON no encontrado: {json_path}")
        return
    
    # Leer JSON actual
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    # Verificar estructura
    if year not in data.get("years", {}):
        print(f"⚠️  Año {year} no encontrado en {client_id}.json")
        return
    
    mes_str = f"{year}-{month}"
    
    # Actualizar Estado de Resultados Periodo
    periodo_list = data["years"][year]["estadoResultadosPeriodo"]
    periodo_item = {"mes": mes_str, **periodo_data}
    
    # Buscar y actualizar o agregar
    found = False
    for i, item in enumerate(periodo_list):
        if item["mes"] == mes_str:
            periodo_list[i] = periodo_item
            found = True
            break
    if not found:
        periodo_list.append(periodo_item)
    
    # Actualizar Estado de Resultados YTD
    ytd_list = data["years"][year]["estadoResultadosYTD"]
    ytd_item = {"mes": mes_str, **ytd_data}
    
    found = False
    for i, item in enumerate(ytd_list):
        if item["mes"] == mes_str:
            ytd_list[i] = ytd_item
            found = True
            break
    if not found:
        ytd_list.append(ytd_item)
    
    # Actualizar Balance General
    balance_list = data["years"][year]["balanceGeneral"]
    balance_item = {"mes": mes_str, **balance_data}
    
    found = False
    for i, item in enumerate(balance_list):
        if item["mes"] == mes_str:
            balance_list[i] = balance_item
            found = True
            break
    if not found:
        balance_list.append(balance_item)
    
    # Guardar JSON actualizado
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Actualizado: {client_id} - {year}/{month}")


def process_client_month(client_id: str, client_folder: str, year: str, month: str):
    """Procesa un mes específico de un cliente."""
    client_path = PDF_BASE_DIR / client_folder
    
    if not client_path.exists():
        print(f"⚠️  Carpeta no encontrada: {client_path}")
        return
    
    # Buscar los 3 PDFs
    pdfs = find_pdf_files(client_path, year, month)
    
    if not pdfs["estado_resultados"]:
        print(f"⚠️  PDFs no encontrados para {client_id} {year}/{month}")
        return
    
    print(f"\n📄 Procesando {client_id} - {year}/{month}")
    print(f"   Estado de Resultados: {pdfs['estado_resultados'].name if pdfs['estado_resultados'] else 'No encontrado'}")
    print(f"   Balance General: {pdfs['balance_general'].name if pdfs['balance_general'] else 'No encontrado'}")
    print(f"   Anexos: {pdfs['anexos'].name if pdfs['anexos'] else 'No encontrado'}")
    
    # Extraer datos
    periodo_data = {}
    ytd_data = {}
    balance_data = {}
    
    if pdfs["estado_resultados"]:
        periodo_data, ytd_data = extract_estado_resultados(pdfs["estado_resultados"])
    
    if pdfs["balance_general"]:
        balance_data = extract_balance_general(pdfs["balance_general"])
    
    # Actualizar JSON
    if periodo_data or balance_data:
        update_json_file(client_id, year, month, periodo_data, ytd_data, balance_data)


def main():
    """Función principal."""
    print("🚀 Iniciando extracción de datos financieros de PDFs...")
    print(f"📁 Directorio PDFs: {PDF_BASE_DIR}")
    print(f"📁 Directorio JSONs: {JSON_BASE_DIR}")
    print("\n" + "="*60)
    
    # Ejemplo: FIDUZ 2025/01
    print("\n🔍 EJEMPLO: FIDUZ 2025/01")
    process_client_month("fiduz", "FIDUZ", "2025", "01")
    
    print("\n" + "="*60)
    print("\n¿Deseas procesar todos los clientes? (s/n): ", end="")
    respuesta = input().strip().lower()
    
    if respuesta == "s":
        # Procesar todos los clientes
        for client_id, client_folder in CLIENTS.items():
            client_path = PDF_BASE_DIR / client_folder
            
            if not client_path.exists():
                continue
            
            # Buscar años
            for year_path in sorted(client_path.glob("202*")):
                if not year_path.is_dir():
                    continue
                
                year = year_path.name
                
                # Procesar cada mes (01-12)
                for month in ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]:
                    try:
                        process_client_month(client_id, client_folder, year, month)
                    except Exception as e:
                        print(f"❌ Error en {client_id} {year}/{month}: {e}")
        
        print("\n✅ Proceso completado!")
    else:
        print("\n✅ Proceso terminado. Usa este script como ejemplo para procesar más clientes.")


if __name__ == "__main__":
    main()
