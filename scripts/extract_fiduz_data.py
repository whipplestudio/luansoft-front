#!/usr/bin/env python3
"""
Script para extraer datos financieros de PDFs de FIDUZ y generar el JSON
Requiere: pip install pdfplumber
"""

import pdfplumber
import json
import os
import re
from pathlib import Path

def extract_estado_resultados(pdf_path):
    """Extrae datos del Estado de Resultados"""
    data = {
        "mes": "",
        "ingresos": 0,
        "compras": 0,
        "gastos": 0,
        "prodFin": 0,
        "gastFin": 0,
        "utilidad": 0
    }
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text() or ""
            
            # Aquí necesitas ajustar los patrones según el formato exacto de tus PDFs
            print(f"\n=== ESTADO DE RESULTADOS: {pdf_path.name} ===")
            print(text[:500])  # Imprime primeras líneas para análisis
            
            # Buscar valores (ajustar según el formato real)
            # Ejemplo de patrón: buscar números con formato $xxx,xxx.xx
            
    except Exception as e:
        print(f"Error leyendo {pdf_path}: {e}")
    
    return data

def extract_balance_general(pdf_path):
    """Extrae datos del Balance General"""
    data = {
        "mes": "",
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
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text() or ""
            
            print(f"\n=== BALANCE GENERAL: {pdf_path.name} ===")
            print(text[:500])  # Imprime primeras líneas para análisis
            
    except Exception as e:
        print(f"Error leyendo {pdf_path}: {e}")
    
    return data

def process_fiduz_folder(base_path):
    """Procesa toda la carpeta FIDUZ"""
    base_path = Path(base_path)
    all_data = {
        "clienteId": "fiduz",
        "clienteNombre": "FIDUZ",
        "razonSocial": "FIDUZ S.A. de C.V.",
        "years": {}
    }
    
    # Procesar 2024
    year_2024 = base_path / "2024"
    if year_2024.exists():
        print(f"\n{'='*60}\nPROCESANDO AÑO 2024\n{'='*60}")
        er_file = year_2024 / "12 2024 Estado de Resultados.pdf"
        bg_file = year_2024 / "12 2024 balance general.pdf"
        
        if er_file.exists():
            extract_estado_resultados(er_file)
        if bg_file.exists():
            extract_balance_general(bg_file)
    
    # Procesar 2025
    year_2025 = base_path / "2025"
    if year_2025.exists():
        print(f"\n{'='*60}\nPROCESANDO AÑO 2025\n{'='*60}")
        for month_folder in sorted(year_2025.iterdir()):
            if month_folder.is_dir():
                month = month_folder.name
                print(f"\n--- Mes {month} ---")
                
                # Buscar archivos
                er_files = list(month_folder.glob("*EDO DE RESULTADOS.pdf")) or list(month_folder.glob("*Estado de Resultados.pdf"))
                bg_files = list(month_folder.glob("*balance general.pdf"))
                
                if er_files:
                    extract_estado_resultados(er_files[0])
                if bg_files:
                    extract_balance_general(bg_files[0])
    
    return all_data

if __name__ == "__main__":
    fiduz_path = Path(__file__).parent.parent / "Ejercicio Analisis MRM Vilego Luenser y otros" / "FIDUZ"
    
    print("="*60)
    print("EXTRACTOR DE DATOS FINANCIEROS FIDUZ")
    print("="*60)
    print(f"\nRuta: {fiduz_path}")
    
    if not fiduz_path.exists():
        print(f"ERROR: No se encuentra la carpeta {fiduz_path}")
        exit(1)
    
    print("\n1. Instalando dependencias...")
    print("   Ejecuta: pip install pdfplumber")
    
    print("\n2. Este script mostrará el contenido de los PDFs")
    print("   para que puedas identificar los patrones de datos\n")
    
    data = process_fiduz_folder(fiduz_path)
    
    print("\n" + "="*60)
    print("ANÁLISIS COMPLETADO")
    print("="*60)
    print("\nSiguientes pasos:")
    print("1. Revisa el texto extraído arriba")
    print("2. Identifica los patrones de los valores")
    print("3. Actualiza las funciones extract_* con regex apropiados")
    print("4. Ejecuta de nuevo para generar el JSON")
