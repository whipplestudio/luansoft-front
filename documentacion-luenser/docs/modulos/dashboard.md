# Módulo Dashboard

## Descripción General

El Dashboard es el módulo principal de visualización de datos del sistema, diseñado para proporcionar una visión general del estado de los procesos fiscales, clientes y métricas clave. Este módulo está accesible para todos los roles, aunque con diferentes niveles de detalle según los permisos.

## Componentes Principales

### 1. Resumen General

![Resumen General](../assets/images/dashboard-resumen.png)

Esta sección muestra las métricas clave del sistema:

- **Total de clientes**: Número total de clientes registrados
- **Procesos activos**: Cantidad de procesos fiscales en curso
- **Procesos completados**: Cantidad de procesos fiscales finalizados
- **Procesos en riesgo**: Cantidad de procesos que requieren atención inmediata

### 2. Semáforo de Clientes

El semáforo de clientes proporciona una visualización rápida del estado de los clientes según el progreso de sus procesos fiscales:

- **Verde**: Clientes con todos sus procesos al día
- **Amarillo**: Clientes con procesos que requieren atención próximamente
- **Rojo**: Clientes con procesos atrasados o en riesgo

### 3. Gráficos de Rendimiento

Esta sección incluye gráficos interactivos que muestran:

- **Distribución de procesos por estado**: Gráfico circular que muestra la proporción de procesos en cada estado
- **Tendencia mensual**: Gráfico de líneas que muestra la evolución de procesos completados por mes
- **Distribución por tipo de proceso**: Gráfico de barras que muestra la cantidad de cada tipo de proceso

### 4. Listado de Procesos Recientes

Tabla que muestra los procesos más recientes con la siguiente información:

- Nombre del proceso
- Cliente asociado
- Fecha de inicio
- Fecha de vencimiento
- Estado actual
- Contador asignado

## Funcionalidades

### Filtros Disponibles

El Dashboard permite filtrar la información mostrada según varios criterios:

- **Período de tiempo**: Filtrar por día, semana, mes, trimestre o año
- **Tipo de proceso**: Filtrar por categoría de proceso fiscal
- **Estado**: Filtrar por estado del proceso (completado, en progreso, en riesgo, atrasado)
- **Contador**: Filtrar por contador asignado (solo disponible para administradores)

### Visualización

El Dashboard ofrece diferentes opciones de visualización:

- **Vista de cuadrícula**: Muestra los componentes en formato de tarjetas
- **Vista de tabla**: Muestra la información en formato tabular
- **Modo pantalla completa**: Expande el Dashboard para ocupar toda la pantalla

### Actualización de Datos

Los datos del Dashboard se actualizan:

- Automáticamente cada 5 minutos
- Manualmente mediante el botón de actualización

## Acceso según Rol

| Rol | Nivel de Acceso | Restricciones |
|-----|-----------------|---------------|
| Administrador | Completo | Ninguna |
| Contador | Parcial | Solo ve información de sus clientes asignados |
| Contacto | Limitado | Solo ve información relacionada con sus procesos |
| Dashboard | Solo lectura | Solo puede ver, sin acceso a detalles específicos |

## Preguntas Frecuentes

**P: ¿Puedo personalizar los widgets que se muestran en mi Dashboard?**  
R: Actualmente la personalización de widgets no está disponible, pero está planificada para futuras actualizaciones.

**P: ¿Puedo exportar los datos del Dashboard?**  
R: Los usuarios con rol de Administrador y Contador pueden exportar los datos en formato Excel o PDF.

**P: ¿Con qué frecuencia se actualizan los datos?**  
R: Los datos se actualizan automáticamente cada 5 minutos, pero puede forzar una actualización manual con el botón de actualización.

---

*Última actualización: Abril 2025*
