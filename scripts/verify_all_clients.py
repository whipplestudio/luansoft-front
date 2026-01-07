#!/usr/bin/env python3
"""
Script para verificar completitud de datos de todos los clientes
"""

import json
from pathlib import Path

def verify_client_data(client_file):
    """Verifica completitud de datos de un cliente"""
    with open(client_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    client_id = data['clienteId']
    client_name = data['clienteNombre']
    
    print(f"\n{'='*70}")
    print(f"📊 {client_name.upper()} ({client_id})")
    print(f"{'='*70}")
    
    total_months = 0
    has_data = False
    
    for year, year_data in data['years'].items():
        er_count = len(year_data.get('estadoResultadosPeriodo', []))
        bg_count = len(year_data.get('balanceGeneral', []))
        
        if er_count > 0 or bg_count > 0:
            has_data = True
            total_months += er_count
            print(f"  📅 Año {year}: {er_count} meses")
            
            # Verificar si hay datos reales (no solo ceros)
            has_real_data = False
            for er in year_data.get('estadoResultadosPeriodo', []):
                if er.get('gastos', 0) > 0 or er.get('ingresos', 0) > 0:
                    has_real_data = True
                    break
            
            if has_real_data:
                # Mostrar resumen de datos
                for er in year_data['estadoResultadosPeriodo'][:3]:  # Primeros 3 meses
                    print(f"    ├─ {er['mes']}: Ingresos=${er['ingresos']:,.0f}, Gastos=${er['gastos']:,.0f}")
                
                if er_count > 3:
                    print(f"    └─ ... y {er_count - 3} meses más")
            else:
                print(f"    ⚠️  Datos extraídos pero todos son ceros")
    
    if not has_data:
        print(f"  ❌ SIN DATOS EXTRAÍDOS")
        return False, 0
    elif total_months == 0:
        print(f"  ⚠️  Estructura creada pero sin meses")
        return False, 0
    else:
        print(f"  ✅ Total: {total_months} meses con datos")
        return True, total_months

def main():
    clients_dir = Path(__file__).parent.parent / "public" / "data" / "clients"
    
    print("="*70)
    print("🔍 VERIFICACIÓN DE DATOS DE TODOS LOS CLIENTES")
    print("="*70)
    
    clients_ok = []
    clients_empty = []
    total_months = 0
    
    for json_file in sorted(clients_dir.glob("*.json")):
        has_data, months = verify_client_data(json_file)
        
        if has_data:
            clients_ok.append(json_file.stem)
            total_months += months
        else:
            clients_empty.append(json_file.stem)
    
    print("\n" + "="*70)
    print("📈 RESUMEN GENERAL")
    print("="*70)
    print(f"✅ Clientes con datos: {len(clients_ok)}")
    print(f"   {', '.join(clients_ok)}")
    print(f"\n❌ Clientes sin datos: {len(clients_empty)}")
    print(f"   {', '.join(clients_empty)}")
    print(f"\n📊 Total meses procesados: {total_months}")
    print("="*70)

if __name__ == "__main__":
    main()
