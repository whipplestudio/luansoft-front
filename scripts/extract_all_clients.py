#!/usr/bin/env python3
"""
Script para extraer datos financieros de PDFs de TODOS los clientes
"""

import pdfplumber
import json
import re
from pathlib import Path

# Mapeo de nombres de carpetas a IDs de clientes
CLIENT_MAPPING = {
    "FIDUZ": {"id": "fiduz", "nombre": "FIDUZ", "razon": "FIDUZ S.A. de C.V."},
    "Jose Manuel Luengas": {"id": "luengas", "nombre": "José Manuel Luengas", "razon": "José Manuel Luengas S.A. de C.V."},
    "Josivna": {"id": "josivna", "nombre": "JOSIVNA", "razon": "JOSIVNA S.A. de C.V."},
    "Leret Leret": {"id": "leret", "nombre": "Leret Leret", "razon": "Leret Leret S.A. de C.V."},
    "Luenser": {"id": "luenser", "nombre": "Luenser", "razon": "Luenser S.A. de C.V."},
    "MRM": {"id": "mrm", "nombre": "MRM", "razon": "MRM Ingeniería Integral S. de R.L. MI"},
    "SINMSA": {"id": "sinmsa", "nombre": "SINMSA", "razon": "SINMSA S.A. de C.V."},
    "Sedentarius": {"id": "sedentarius", "nombre": "Sedentarius", "razon": "Sedentarius S.A. de C.V."},
    "Soluciones Whipple": {"id": "whipple", "nombre": "Soluciones Whipple", "razon": "Soluciones Whipple S.A. de C.V."},
    "Vilego": {"id": "vilego", "nombre": "Vilego", "razon": "Vilego S.A. de C.V."}
}

def clean_number(text):
    """Convierte texto con formato de número a float"""
    if not text or text == "0.00":
        return 0.0
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
            
            # Buscar Total COSTO
            costo_match = re.search(r'Total COSTO\s+([\d,\.]+)\s+[\d\.]+\s+([\d,\.]+)', text)
            if costo_match:
                data_periodo["compras"] = clean_number(costo_match.group(1))
                data_ytd["comprasYTD"] = clean_number(costo_match.group(2))
            
            # Buscar GASTOS GENERALES
            gastos_match = re.search(r'(?:GASTOS GENERALES|Total GASTOS)\s+([\d,\.]+)\s+[\d\.]+\s+([\d,\.]+)', text)
            if gastos_match:
                data_periodo["gastos"] = clean_number(gastos_match.group(1))
                data_ytd["gastosYTD"] = clean_number(gastos_match.group(2))
            
            # Calcular utilidad
            data_periodo["utilidad"] = data_periodo["ingresos"] - data_periodo["compras"] - data_periodo["gastos"]
            data_ytd["utilidadYTD"] = data_ytd["ingresosYTD"] - data_ytd["comprasYTD"] - data_ytd["gastosYTD"]
            
    except Exception as e:
        print(f"  ⚠️  Error leyendo {pdf_path.name}: {e}")
    
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
            
            # Buscar CLIENTES
            clientes_match = re.search(r'CLIENTES\s+([\d,\.]+)', text)
            if clientes_match:
                data["clientes"] = clean_number(clientes_match.group(1))
            
            # Buscar Total ACTIVO CIRCULANTE
            ac_match = re.search(r'Total ACTIVO CIRCULANTE\s+([\d,\.]+)', text)
            if ac_match:
                data["ac"] = clean_number(ac_match.group(1))
            
            # Buscar Total PASIVO CIRCULANTE
            pc_match = re.search(r'Total PASIVO CIRCULANTE\s+([\d,\.]+)', text)
            if pc_match:
                data["pc"] = clean_number(pc_match.group(1))
            
    except Exception as e:
        print(f"  ⚠️  Error leyendo {pdf_path.name}: {e}")
    
    return data

def process_client_folder(client_folder, client_info):
    """Procesa la carpeta de un cliente"""
    print(f"\n{'='*70}")
    print(f"📂 PROCESANDO: {client_info['nombre']}")
    print(f"{'='*70}")
    
    all_data = {
        "clienteId": client_info["id"],
        "clienteNombre": client_info["nombre"],
        "razonSocial": client_info["razon"],
        "years": {}
    }
    
    # Buscar carpetas de años
    for year_folder in sorted(client_folder.iterdir()):
        if not year_folder.is_dir():
            continue
        
        year_name = year_folder.name
        
        # Verificar si es un año válido
        if not (year_name.isdigit() and len(year_name) == 4):
            continue
        
        print(f"\n📅 Año {year_name}")
        
        year_data = {
            "estadoResultadosPeriodo": [],
            "estadoResultadosYTD": [],
            "balanceGeneral": []
        }
        
        # Buscar archivos directamente en la carpeta del año (como 2024)
        direct_files = list(year_folder.glob("*.pdf"))
        if direct_files:
            # Archivos directos en carpeta de año
            er_files = [f for f in direct_files if "resultados" in f.name.lower() or "edo" in f.name.lower()]
            bg_files = [f for f in direct_files if "balance" in f.name.lower() or "posicion" in f.name.lower()]
            
            # Extraer mes del nombre del archivo - dos formatos posibles:
            # Formato 1: "12 2024 Estado de Resultados.pdf"
            # Formato 2: "Estado de Resultados 01 Ene 2024.pdf"
            for er_file in er_files:
                month_num = None
                
                # Intentar formato 1: "12 2024"
                month_match = re.search(r'(\d{2})\s*' + year_name, er_file.name)
                if month_match:
                    month_num = month_match.group(1)
                else:
                    # Intentar formato 2: "01 Ene 2024" o solo "01"
                    month_match = re.search(r'(\d{2})\s*(?:Ene|Feb|Mar|Abr|May|Jun|Jul|Ago|Sep|Oct|Nov|Dic)', er_file.name)
                    if month_match:
                        month_num = month_match.group(1)
                
                if month_num:
                    month_str = f"{year_name}-{month_num}"
                    print(f"  ├─ Mes {month_num}")
                    
                    periodo, ytd = extract_estado_resultados(er_file, month_str)
                    year_data["estadoResultadosPeriodo"].append(periodo)
                    year_data["estadoResultadosYTD"].append(ytd)
                    
                    # Buscar balance correspondiente
                    bg_file = next((f for f in bg_files if month_num in f.name), None)
                    if bg_file:
                        bg = extract_balance_general(bg_file, month_str)
                        year_data["balanceGeneral"].append(bg)
        
        # Buscar subcarpetas de meses (varios formatos posibles)
        for month_folder in sorted(year_folder.iterdir()):
            if not month_folder.is_dir():
                continue
            
            folder_name = month_folder.name
            month_num = None
            
            # Formato 1: Solo número "01", "02"
            if folder_name.isdigit() and len(folder_name) == 2:
                month_num = folder_name
            else:
                # Formato 2: "01 ENERO", "02.-Febrero", "1.ENERO 2024", etc.
                # Extraer los primeros 1-2 dígitos
                match = re.match(r'(\d{1,2})', folder_name)
                if match:
                    month_num = match.group(1).zfill(2)  # Asegurar 2 dígitos
            
            if not month_num:
                continue
            
            month_str = f"{year_name}-{month_num}"
            print(f"  ├─ Mes {month_num}")
            
            er_files = list(month_folder.glob("*EDO*RESULTADOS*.pdf")) or \
                      list(month_folder.glob("*Estado*Resultados*.pdf")) or \
                      list(month_folder.glob("*ESTADO*RESULTADOS*.pdf")) or \
                      list(month_folder.glob("*resultados*.pdf"))
            bg_files = list(month_folder.glob("*balance*.pdf")) or \
                      list(month_folder.glob("*BALANCE*.pdf"))
            
            if er_files:
                periodo, ytd = extract_estado_resultados(er_files[0], month_str)
                year_data["estadoResultadosPeriodo"].append(periodo)
                year_data["estadoResultadosYTD"].append(ytd)
            
            if bg_files:
                bg = extract_balance_general(bg_files[0], month_str)
                year_data["balanceGeneral"].append(bg)
        
        if year_data["estadoResultadosPeriodo"]:
            all_data["years"][year_name] = year_data
            print(f"  └─ ✅ {len(year_data['estadoResultadosPeriodo'])} meses procesados")
    
    return all_data

def main():
    """Procesa todos los clientes"""
    base_path = Path(__file__).parent.parent / "Ejercicio Analisis MRM Vilego Luenser y otros"
    output_dir = Path(__file__).parent.parent / "public" / "data" / "clients"
    
    print("="*70)
    print("🚀 EXTRACTOR MASIVO DE DATOS FINANCIEROS")
    print("="*70)
    
    if not base_path.exists():
        print(f"❌ ERROR: No se encuentra la carpeta {base_path}")
        return
    
    processed = 0
    errors = 0
    
    for folder_name, client_info in CLIENT_MAPPING.items():
        client_folder = base_path / folder_name
        
        if not client_folder.exists():
            print(f"\n⚠️  ADVERTENCIA: No se encuentra carpeta '{folder_name}'")
            errors += 1
            continue
        
        try:
            data = process_client_folder(client_folder, client_info)
            
            # Guardar JSON
            output_path = output_dir / f"{client_info['id']}.json"
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            print(f"\n✅ JSON guardado: {output_path.name}")
            processed += 1
            
        except Exception as e:
            print(f"\n❌ ERROR procesando {folder_name}: {e}")
            errors += 1
    
    print("\n" + "="*70)
    print("📊 RESUMEN FINAL")
    print("="*70)
    print(f"✅ Clientes procesados: {processed}")
    print(f"❌ Errores: {errors}")
    print(f"📁 Total clientes: {len(CLIENT_MAPPING)}")
    print("="*70)

if __name__ == "__main__":
    main()
