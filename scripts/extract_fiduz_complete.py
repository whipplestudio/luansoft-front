#!/usr/bin/env python3
"""
Script mejorado para extraer datos financieros de PDFs de FIDUZ
"""

import pdfplumber
import json
import re
from pathlib import Path

def clean_number(text):
    """Convierte texto con formato de número a float"""
    if not text or text == "0.00":
        return 0.0
    # Remover comas y convertir a float
    text = text.replace(",", "").strip()
    try:
        return float(text)
    except:
        return 0.0

def extract_estado_resultados(pdf_path, month_str):
    """Extrae datos del Estado de Resultados"""
    data_periodo = {"mes": month_str, "ingresos": 0, "compras": 0, "gastos": 0, "prodFin": 0, "gastFin": 0, "utilidad": 0}
    data_ytd = {"mes": month_str, "ingresosYTD": 0, "comprasYTD": 0, "gastosYTD": 0, "prodFinYTD": 0, "gastFinYTD": 0, "utilidadYTD": 0}
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text() or ""
            
            # Buscar Total INGRESOS
            ingresos_match = re.search(r'Total INGRESOS\s+([\d,\.]+)\s+[\d\.]+\s+([\d,\.]+)', text)
            if ingresos_match:
                data_periodo["ingresos"] = clean_number(ingresos_match.group(1))
                data_ytd["ingresosYTD"] = clean_number(ingresos_match.group(2))
            
            # Buscar Total COSTO (compras)
            costo_match = re.search(r'Total COSTO\s+([\d,\.]+)\s+[\d\.]+\s+([\d,\.]+)', text)
            if costo_match:
                data_periodo["compras"] = clean_number(costo_match.group(1))
                data_ytd["comprasYTD"] = clean_number(costo_match.group(2))
            
            # Buscar GASTOS GENERALES
            gastos_match = re.search(r'GASTOS GENERALES\s+([\d,\.]+)\s+[\d\.]+\s+([\d,\.]+)', text)
            if gastos_match:
                data_periodo["gastos"] = clean_number(gastos_match.group(1))
                data_ytd["gastosYTD"] = clean_number(gastos_match.group(2))
            
            # Calcular utilidad (ingresos - compras - gastos)
            data_periodo["utilidad"] = data_periodo["ingresos"] - data_periodo["compras"] - data_periodo["gastos"]
            data_ytd["utilidadYTD"] = data_ytd["ingresosYTD"] - data_ytd["comprasYTD"] - data_ytd["gastosYTD"]
            
    except Exception as e:
        print(f"Error leyendo {pdf_path}: {e}")
    
    return data_periodo, data_ytd

def extract_balance_general(pdf_path, month_str):
    """Extrae datos del Balance General"""
    data = {
        "mes": month_str,
        "ac": 0, "pc": 0, "bancos": 0, "inversiones": 0, "clientes": 0,
        "deudores": 0, "inventario": 0, "anticipoProv": 0, "pagosAnt": 0,
        "anticipoCli": 0, "capital": 0, "utilidadEj": 0, "anc": 0, "plc": 0
    }
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text() or ""
            
            # Buscar BANCOS
            bancos_match = re.search(r'BANCOS\s+([\d,\.]+)', text)
            if bancos_match:
                data["bancos"] = clean_number(bancos_match.group(1))
            
            # Buscar DEUDORES DIVERSOS
            deudores_match = re.search(r'DEUDORES DIVERSOS\s+([\d,\.]+)', text)
            if deudores_match:
                data["deudores"] = clean_number(deudores_match.group(1))
            
            # Buscar IMPUESTOS A FAVOR
            impuestos_match = re.search(r'IMPUESTOS A FAVOR\s+([\d,\.]+)', text)
            
            # Buscar IMPUESTOS RETENIDOS (activo)
            imp_ret_match = re.search(r'IMPUESTOS RETENIDOS\s+([\d,\.]+)', text)
            
            # Buscar Total ACTIVO CIRCULANTE
            ac_match = re.search(r'Total ACTIVO CIRCULANTE\s+([\d,\.]+)', text)
            if ac_match:
                data["ac"] = clean_number(ac_match.group(1))
            
            # Buscar ACREEDORES DIVERSOS
            acreedores_match = re.search(r'ACREEDORES DIVERSOS\s+([\d,\.]+)', text)
            
            # Buscar Total PASIVO CIRCULANTE
            pc_match = re.search(r'Total PASIVO CIRCULANTE\s+([\d,\.]+)', text)
            if pc_match:
                data["pc"] = clean_number(pc_match.group(1))
            
            # Calcular utilidad del ejercicio como AC - PC - capital estimado
            # Por simplicidad, utilizaremos la utilidad del estado de resultados
            
    except Exception as e:
        print(f"Error leyendo {pdf_path}: {e}")
    
    return data

def process_fiduz_complete():
    """Procesa toda la carpeta FIDUZ y genera JSON completo"""
    base_path = Path(__file__).parent.parent / "Ejercicio Analisis MRM Vilego Luenser y otros" / "FIDUZ"
    
    all_data = {
        "clienteId": "fiduz",
        "clienteNombre": "FIDUZ",
        "razonSocial": "FIDUZ S.A. de C.V.",
        "years": {}
    }
    
    # Procesar 2024
    year_2024_data = {
        "estadoResultadosPeriodo": [],
        "estadoResultadosYTD": [],
        "balanceGeneral": []
    }
    
    year_2024 = base_path / "2024"
    if year_2024.exists():
        print("Procesando 2024-12...")
        er_file = year_2024 / "12 2024 Estado de Resultados.pdf"
        bg_file = year_2024 / "12 2024 balance general.pdf"
        
        if er_file.exists():
            periodo, ytd = extract_estado_resultados(er_file, "2024-12")
            year_2024_data["estadoResultadosPeriodo"].append(periodo)
            year_2024_data["estadoResultadosYTD"].append(ytd)
            print(f"  Gastos periodo: {periodo['gastos']}, YTD: {ytd['gastosYTD']}")
        
        if bg_file.exists():
            bg = extract_balance_general(bg_file, "2024-12")
            year_2024_data["balanceGeneral"].append(bg)
            print(f"  AC: {bg['ac']}, PC: {bg['pc']}, Bancos: {bg['bancos']}")
    
    all_data["years"]["2024"] = year_2024_data
    
    # Procesar 2025
    year_2025_data = {
        "estadoResultadosPeriodo": [],
        "estadoResultadosYTD": [],
        "balanceGeneral": []
    }
    
    year_2025 = base_path / "2025"
    if year_2025.exists():
        for month_num in range(1, 12):
            month_folder = year_2025 / f"{month_num:02d}"
            if month_folder.exists():
                month_str = f"2025-{month_num:02d}"
                print(f"Procesando {month_str}...")
                
                er_files = list(month_folder.glob("*EDO DE RESULTADOS.pdf")) or list(month_folder.glob("*Estado de Resultados.pdf"))
                bg_files = list(month_folder.glob("*balance general.pdf"))
                
                if er_files:
                    periodo, ytd = extract_estado_resultados(er_files[0], month_str)
                    year_2025_data["estadoResultadosPeriodo"].append(periodo)
                    year_2025_data["estadoResultadosYTD"].append(ytd)
                    print(f"  Gastos periodo: {periodo['gastos']}, YTD: {ytd['gastosYTD']}")
                
                if bg_files:
                    bg = extract_balance_general(bg_files[0], month_str)
                    year_2025_data["balanceGeneral"].append(bg)
                    print(f"  AC: {bg['ac']}, PC: {bg['pc']}, Bancos: {bg['bancos']}")
    
    all_data["years"]["2025"] = year_2025_data
    
    # Guardar JSON
    output_path = Path(__file__).parent.parent / "public" / "data" / "clients" / "fiduz.json"
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ JSON generado exitosamente en: {output_path}")
    return all_data

if __name__ == "__main__":
    print("="*60)
    print("EXTRACTOR COMPLETO DE DATOS FIDUZ")
    print("="*60)
    data = process_fiduz_complete()
    print("\n" + "="*60)
    print("COMPLETADO")
    print("="*60)
