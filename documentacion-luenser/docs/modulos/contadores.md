# Módulo de Contadores

## Introducción

El módulo de Contadores es una parte fundamental del sistema de gestión fiscal de Luenser, diseñado para administrar la información y actividades de los profesionales contables que trabajan con la plataforma. Este módulo permite registrar, visualizar, editar y gestionar todos los aspectos relacionados con los contadores, incluyendo sus datos personales, clientes asignados, carga de trabajo y rendimiento.

## Propósito y Funcionalidades Principales

El módulo de Contadores tiene como objetivo principal facilitar la gestión eficiente de los profesionales contables dentro del sistema, permitiendo:

- Mantener un catálogo actualizado de todos los contadores activos
- Registrar y actualizar información personal y profesional de cada contador
- Asignar y gestionar clientes a contadores específicos
- Monitorear la carga de trabajo y el rendimiento de cada contador
- Facilitar la comunicación entre administradores y contadores
- Generar reportes sobre la actividad y eficiencia de los contadores

## Acceso al Módulo

### Permisos Necesarios

El acceso al módulo de Contadores está restringido según el rol del usuario:

| Rol | Ver | Crear | Editar | Eliminar |
|-----|-----|-------|--------|----------|
| Administrador | ✅ | ✅ | ✅ | ✅ |
| Contador | ✅ | ❌ | ❌ | ❌ |
| Dashboard | ❌ | ❌ | ❌ | ❌ |
| Contacto | ❌ | ❌ | ❌ | ❌ |

### Cómo Acceder

1. Inicie sesión en el sistema con sus credenciales
2. En el menú lateral, haga clic en la opción "Contadores"
3. Se mostrará la página principal del módulo de Contadores

## Interfaz Principal

La interfaz principal del módulo de Contadores está diseñada para proporcionar una visión general de todos los contadores registrados en el sistema, con opciones para filtrar, buscar y realizar acciones específicas.

### Elementos de la Interfaz

![Interfaz del Módulo de Contadores]

La interfaz principal incluye los siguientes elementos:

1. **Barra de búsqueda**: Permite buscar contadores por nombre, correo electrónico o número de identificación
2. **Filtros avanzados**: Opciones para filtrar contadores por estado, especialidad, o carga de trabajo
3. **Botón "Nuevo Contador"**: Para crear un nuevo registro de contador
4. **Tabla de contadores**: Muestra la lista de contadores con columnas para:
   - Nombre completo
   - Correo electrónico
   - Número de teléfono
   - Número de clientes asignados
   - Estado (Activo/Inactivo)
   - Fecha de registro
   - Acciones disponibles
5. **Paginación**: Controles para navegar entre páginas de resultados
6. **Selector de vista**: Permite cambiar entre vista de tabla y vista de tarjetas

## Operaciones Principales

### Visualizar el Catálogo de Contadores

La vista principal del módulo muestra automáticamente todos los contadores registrados en el sistema. Para facilitar la navegación:

1. **Ordenar contadores**: Haga clic en el encabezado de cualquier columna para ordenar la lista según ese criterio
2. **Filtrar resultados**: Utilice los filtros disponibles en la parte superior para refinar la lista
3. **Buscar un contador específico**: Ingrese el nombre, correo o ID en la barra de búsqueda
4. **Cambiar la vista**: Utilice el selector de vista para cambiar entre formato de tabla y tarjetas

### Crear un Nuevo Contador

Para registrar un nuevo contador en el sistema:

1. Haga clic en el botón "Nuevo Contador" en la esquina superior derecha
2. Se abrirá un formulario con los siguientes campos:
   - **Información personal**:
     - Nombre completo (obligatorio)
     - Correo electrónico (obligatorio)
     - Número de teléfono (obligatorio)
     - Dirección
     - Fotografía (opcional)
   - **Información profesional**:
     - Número de identificación fiscal (obligatorio)
     - Especialidad (obligatorio)
     - Años de experiencia
     - Certificaciones
   - **Información de cuenta**:
     - Nombre de usuario (generado automáticamente)
     - Contraseña temporal (generada automáticamente)
3. Complete todos los campos obligatorios y los opcionales que desee
4. Haga clic en "Guardar" para crear el nuevo contador
5. El sistema enviará automáticamente un correo electrónico al contador con sus credenciales de acceso

### Ver Detalles de un Contador

Para acceder a la información detallada de un contador:

1. En la tabla de contadores, haga clic en el nombre del contador o en el botón "Ver detalles" (ícono de ojo)
2. Se abrirá una nueva página o modal con la información completa del contador, organizada en pestañas:
   - **Información general**: Datos personales y profesionales
   - **Clientes asignados**: Lista de clientes que gestiona el contador
   - **Procesos activos**: Procesos fiscales en curso asignados al contador
   - **Historial**: Registro de actividades y cambios
   - **Estadísticas**: Métricas de rendimiento y carga de trabajo

### Editar Información de un Contador

Para modificar los datos de un contador existente:

1. En la tabla de contadores, haga clic en el botón "Editar" (ícono de lápiz)
2. Se abrirá el formulario con los datos actuales del contador
3. Realice los cambios necesarios en cualquiera de los campos
4. Haga clic en "Guardar" para aplicar los cambios
5. El sistema registrará automáticamente quién realizó los cambios y cuándo

### Eliminar un Contador

Para eliminar un contador del sistema:

1. En la tabla de contadores, haga clic en el botón "Eliminar" (ícono de papelera)
2. Se mostrará un diálogo de confirmación con las siguientes opciones:
   - **Desactivar**: Mantiene el registro pero marca al contador como inactivo
   - **Eliminar**: Elimina permanentemente el registro del contador
3. Si elige "Eliminar", se le pedirá una confirmación adicional
4. Si el contador tiene clientes asignados, el sistema le advertirá y le pedirá que reasigne estos clientes antes de eliminar

> **Nota importante**: Se recomienda desactivar contadores en lugar de eliminarlos para mantener la integridad de los datos históricos.

## Gestión de Clientes Asignados

### Ver Clientes Asignados

Para ver los clientes asignados a un contador específico:

1. Acceda a los detalles del contador como se explicó anteriormente
2. Seleccione la pestaña "Clientes asignados"
3. Se mostrará una lista con todos los clientes actualmente asignados al contador, incluyendo:
   - Nombre del cliente
   - Tipo de cliente
   - Régimen fiscal
   - Número de procesos activos
   - Fecha de asignación
   - Estado (Activo/Inactivo)

### Asignar Nuevos Clientes

Para asignar un nuevo cliente a un contador:

1. Desde la pestaña "Clientes asignados", haga clic en el botón "Asignar cliente"
2. Se abrirá un modal con la lista de clientes disponibles (no asignados a otros contadores)
3. Utilice la barra de búsqueda para encontrar clientes específicos
4. Seleccione uno o varios clientes marcando las casillas correspondientes
5. Haga clic en "Asignar seleccionados" para completar la asignación

Alternativamente, puede asignar contadores desde el módulo de "Asignación de Contadores":

1. Acceda al módulo "Asignación de Contadores" desde el menú lateral
2. Seleccione los clientes que desea asignar
3. Elija el contador al que desea asignarlos
4. Confirme la asignación

### Reasignar Clientes

Para cambiar la asignación de un cliente a otro contador:

1. En la lista de clientes asignados, haga clic en el botón "Reasignar" junto al cliente
2. Se abrirá un modal con la lista de contadores disponibles
3. Seleccione el nuevo contador para el cliente
4. Opcionalmente, añada un comentario explicando el motivo de la reasignación
5. Haga clic en "Confirmar reasignación"

## Análisis de Rendimiento

El módulo de Contadores ofrece herramientas para analizar el rendimiento y la carga de trabajo de cada contador.

### Métricas Disponibles

En la pestaña "Estadísticas" de los detalles del contador, puede visualizar:

1. **Carga de trabajo actual**:
   - Número total de clientes asignados
   - Número de procesos activos
   - Distribución de procesos por tipo
   - Distribución de procesos por estado (en tiempo, en riesgo, atrasados)

2. **Métricas de rendimiento**:
   - Porcentaje de procesos completados a tiempo
   - Tiempo promedio de resolución por tipo de proceso
   - Tasa de satisfacción de clientes (si está disponible)
   - Comparativa con el promedio del sistema

3. **Tendencias temporales**:
   - Evolución de la carga de trabajo en los últimos meses
   - Evolución del rendimiento en los últimos meses
   - Proyección de carga futura basada en tendencias

### Exportar Reportes

Para generar reportes sobre el rendimiento de los contadores:

1. En la vista de estadísticas, haga clic en "Exportar reporte"
2. Seleccione el formato deseado (PDF, Excel, CSV)
3. Elija el rango de fechas para el reporte
4. Seleccione las métricas que desea incluir
5. Haga clic en "Generar reporte"

## Integración con Otros Módulos

El módulo de Contadores está integrado con otros módulos del sistema para proporcionar una experiencia coherente y completa.

### Integración con el Módulo de Clientes

- Desde el módulo de Contadores, puede acceder directamente a los detalles de cualquier cliente asignado
- Los cambios en la información del cliente se reflejan automáticamente en la vista del contador
- Las asignaciones y reasignaciones de clientes se pueden gestionar desde ambos módulos

### Integración con el Módulo de Procesos

- Los procesos asignados a los clientes de un contador aparecen en su lista de procesos activos
- El rendimiento del contador se calcula en base al estado de estos procesos

### Integración con el Módulo de Usuarios

- Cada contador tiene una cuenta de usuario asociada en el sistema
- Los cambios en la información del contador se sincronizan con su perfil de usuario
- Las credenciales y permisos se gestionan a través del módulo de Usuarios

## Mejores Prácticas

Para aprovechar al máximo el módulo de Contadores, recomendamos seguir estas mejores prácticas:

### Gestión Eficiente de Contadores

1. **Mantener información actualizada**: Actualice regularmente la información de contacto y profesional de los contadores
2. **Equilibrar la carga de trabajo**: Distribuya los clientes entre los contadores de manera equitativa, considerando la complejidad de cada cliente
3. **Revisar periódicamente el rendimiento**: Analice las métricas de rendimiento mensualmente para identificar áreas de mejora
4. **Documentar cambios importantes**: Al realizar cambios significativos, utilice el campo de comentarios para documentar los motivos

### Optimización del Flujo de Trabajo

1. **Asignar clientes por especialidad**: Considere la especialidad de cada contador al asignar nuevos clientes
2. **Implementar un sistema de respaldo**: Asigne contadores de respaldo para clientes críticos
3. **Establecer reuniones periódicas**: Programe revisiones regulares con los contadores para discutir su carga de trabajo y rendimiento
4. **Capacitación continua**: Utilice las métricas de rendimiento para identificar necesidades de capacitación

## Solución de Problemas Comunes

### Problemas de Acceso

**Problema**: Un contador no puede acceder al sistema o a ciertos módulos.

**Solución**:
1. Verifique que la cuenta del contador esté activa en el módulo de Usuarios
2. Confirme que tiene asignado el rol correcto (Contador)
3. Verifique que no haya restricciones de IP o dispositivo aplicadas a su cuenta
4. Si es necesario, restablezca su contraseña desde el módulo de Usuarios

### Problemas de Asignación

**Problema**: No se pueden asignar ciertos clientes a un contador.

**Solución**:
1. Verifique que el cliente no esté ya asignado a otro contador
2. Confirme que tanto el contador como el cliente estén marcados como activos
3. Verifique que no haya restricciones específicas que impidan la asignación
4. Si el problema persiste, intente la asignación desde el módulo de Asignación de Contadores

### Problemas de Rendimiento

**Problema**: Las métricas de rendimiento no se actualizan correctamente.

**Solución**:
1. Verifique que todos los procesos tengan correctamente registradas sus fechas de inicio y vencimiento
2. Confirme que el estado de los procesos esté actualizado
3. Ejecute manualmente el cálculo de métricas desde la sección de administración
4. Si el problema persiste, contacte al soporte técnico

## Preguntas Frecuentes

### Generales

**P: ¿Cuántos clientes se pueden asignar a un contador?**

R: No hay un límite técnico en el sistema, pero se recomienda no exceder los 30-40 clientes por contador para mantener un servicio de calidad, dependiendo de la complejidad de los clientes y procesos.

**P: ¿Se puede asignar un cliente a múltiples contadores?**

R: No, cada cliente solo puede estar asignado a un contador principal en un momento dado. Sin embargo, se puede designar un contador de respaldo en caso de ausencia del contador principal.

**P: ¿Qué sucede con los clientes cuando se desactiva un contador?**

R: Los clientes permanecen asignados al contador desactivado, pero se muestra una alerta en el sistema indicando que deben ser reasignados. El sistema no permitirá asignar nuevos clientes a un contador desactivado.

### Técnicas

**P: ¿Con qué frecuencia se actualizan las métricas de rendimiento?**

R: Las métricas básicas se actualizan en tiempo real. Las métricas más complejas y los análisis comparativos se actualizan diariamente durante la madrugada.

**P: ¿Se pueden personalizar las métricas de rendimiento?**

R: Los administradores pueden configurar qué métricas se muestran y los umbrales para cada una desde la sección de configuración del sistema.

**P: ¿Es posible exportar toda la información de los contadores?**

R: Sí, los administradores pueden exportar la información completa de todos los contadores en formato Excel o CSV desde la opción "Exportar datos" en la vista principal del módulo.

## Soporte Técnico

Si encuentra problemas al utilizar el módulo de Contadores o tiene preguntas adicionales, puede contactar al equipo de soporte técnico:

- **Correo electrónico**: soporte@luenser.com
- **Teléfono**: (XX) XXXX-XXXX
- **Horario de atención**: Lunes a Viernes, 9:00 AM - 6:00 PM

Al reportar un problema, por favor incluya:
- Descripción detallada del problema
- Capturas de pantalla si es posible
- Pasos para reproducir el problema
- Nombre de usuario y rol

---

*Nota: Esta documentación está sujeta a cambios según las actualizaciones del sistema. Última actualización: Abril 2025.*
\`\`\`

```service file="src/regimen-fiscal/regimen-fiscal.service"
... This file was left out for brevity. Assume it is correct and does not need any modifications. ...
