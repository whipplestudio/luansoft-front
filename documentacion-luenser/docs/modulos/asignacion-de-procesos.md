# Módulo de Asignación de Procesos

## Introducción

El módulo de Asignación de Procesos es una herramienta fundamental en el sistema de gestión fiscal de Luenser, que permite vincular procesos específicos a clientes, establecer fechas de compromiso, definir periodos de pago y gestionar el ciclo de vida completo de cada proceso fiscal asignado.

Este módulo actúa como puente entre el catálogo de procesos y los clientes, permitiendo un seguimiento detallado del estado de cada asignación, desde su creación hasta su finalización.

## Propósito y Alcance

### Objetivo Principal

El objetivo principal del módulo de Asignación de Procesos es gestionar eficientemente la relación entre los procesos fiscales y los clientes, facilitando:

- La asignación precisa de procesos a clientes específicos
- El establecimiento de fechas de compromiso y plazos
- El seguimiento del estado de cada proceso asignado
- La documentación de los procesos completados
- La visualización centralizada de todas las asignaciones

### Alcance Funcional

Este módulo abarca:

- Creación, edición y eliminación de asignaciones de procesos
- Gestión de fechas de compromiso y días de gracia
- Configuración de frecuencias para procesos recurrentes (como nóminas)
- Establecimiento de periodos de pago (mensual o anual)
- Cambios de estado (activo, inactivo, pagado)
- Carga de comprobantes de pago
- Filtrado avanzado de asignaciones

## Acceso al Módulo

### Ruta de Acceso

El módulo de Asignación de Procesos se encuentra en la ruta:

**Menú Principal > Asignar Procesos**

### Permisos por Rol

| Rol | Ver | Crear | Editar | Eliminar | Observaciones |
|-----|-----|-------|--------|----------|---------------|
| Administrador | ✅ | ✅ | ✅ | ✅ | Acceso completo a todas las funcionalidades |
| Contador | ✅ | ✅ | ✅ | ✅ | Solo para clientes asignados al contador |
| Contacto | ❌ | ❌ | ❌ | ❌ | Sin acceso al módulo |
| Dashboard | ❌ | ❌ | ❌ | ❌ | Sin acceso al módulo |

## Interfaz del Módulo

La interfaz del módulo de Asignación de Procesos está compuesta por las siguientes secciones:

### 1. Barra Superior

Contiene:
- Título del módulo ("Asignación de Procesos")
- Botón "Asignar Proceso" para crear nuevas asignaciones
- Filtros rápidos para Cliente y Proceso

### 2. Área de Filtros

Permite filtrar las asignaciones mostradas por:
- Cliente específico (selector desplegable)
- Proceso específico (selector desplegable)

### 3. Tabla de Asignaciones

Muestra todas las asignaciones creadas con las siguientes columnas:
- Cliente
- Proceso
- Fecha de Compromiso
- Frecuencia de Nómina (cuando aplica)
- Días de Gracia
- Período de Pago
- Estado
- Acciones

### 4. Paginación

Controles para navegar entre páginas de resultados cuando hay múltiples asignaciones.

## Operaciones Principales

### Asignar un Nuevo Proceso

Para asignar un nuevo proceso a un cliente:

1. Haga clic en el botón "Asignar Proceso" en la parte superior derecha.
2. En el diálogo de asignación, seleccione:
   - **Cliente**: Seleccione el cliente al que se asignará el proceso.
   - **Proceso**: Seleccione el proceso a asignar.
   
3. Dependiendo del tipo de proceso seleccionado:
   
   **Si es proceso de nómina:**
   - Seleccione la(s) frecuencia(s) de nómina (Quincenal, Semanal).
   
   **Si es otro tipo de proceso:**
   - Establezca la fecha de compromiso usando el selector de calendario.
   - Defina los días de gracia (período adicional después de la fecha de compromiso).
   - Seleccione el período de pago (Mensual o Anual).

4. Haga clic en "Asignar Proceso" para confirmar.

### Editar una Asignación Existente

Para modificar los detalles de una asignación:

1. Localice la asignación en la tabla.
2. Haga clic en el menú de acciones (tres puntos verticales).
3. Seleccione "Editar Proceso".
4. Actualice los campos necesarios según el tipo de proceso:
   - Para procesos de nómina: frecuencias.
   - Para otros procesos: fecha de compromiso, días de gracia o período de pago.
5. Haga clic en "Actualizar" para guardar los cambios.

### Marcar Proceso como Pagado/Completado

Para indicar que un proceso ha sido completado:

1. Localice la asignación activa en la tabla.
2. Haga clic en el menú de acciones.
3. Seleccione "Completar".
4. En el diálogo de carga, seleccione el comprobante de pago (archivo PDF o imagen).
5. Haga clic en "Subir comprobante".

Una vez completado, el estado del proceso cambiará a "Pagado" y el proceso se incluirá en el historial de procesos.

### Eliminar una Asignación

Para eliminar una asignación de proceso:

1. Localice la asignación en la tabla.
2. Haga clic en el menú de acciones.
3. Seleccione "Eliminar Asignación".
4. Confirme la acción en el diálogo de confirmación escribiendo "ELIMINAR".

> **Nota**: Solo se pueden eliminar asignaciones que estén en estado activo. Las asignaciones completadas (estado "Pagado") no pueden eliminarse.

### Activar un Proceso Inactivo

Para activar un proceso que estaba inactivo:

1. Localice la asignación inactiva en la tabla.
2. Haga clic en el menú de acciones.
3. Seleccione "Activar Proceso".
4. El estado del proceso cambiará a "Activo".

## Características Especiales

### Gestión de Procesos de Nómina

Los procesos identificados como "Nómina" tienen un tratamiento especial:

- No requieren fecha de compromiso, sino frecuencias de pago
- Se pueden establecer múltiples frecuencias (Quincenal, Semanal)
- El sistema genera automáticamente las fechas de vencimiento basadas en estas frecuencias

### Sistema de Días de Gracia

Los días de gracia proporcionan un período adicional después de la fecha de compromiso antes de que un proceso se considere atrasado:

- Si un proceso tiene fecha de compromiso el día 15 y 3 días de gracia:
  - Del día 1 al 15: Estado "En tiempo"
  - Del día 16 al 18 (período de gracia): Estado "En riesgo"
  - A partir del día 19: Estado "Atrasado"

### Períodos de Pago

El sistema permite definir dos tipos de períodos de pago:

- **Mensual**: Para procesos que se repiten cada mes
- **Anual**: Para procesos que se realizan una vez al año

### Sistema de Estados

Las asignaciones pueden tener tres estados principales:

- **Activo**: El proceso está en curso y se está siguiendo
- **Inactivo**: El proceso está temporalmente suspendido
- **Pagado**: El proceso ha sido completado y se ha cargado el comprobante correspondiente

## Integración con Otros Módulos

El módulo de Asignación de Procesos está integrado con:

### Módulo de Procesos

- Obtiene el catálogo de procesos disponibles para asignar
- Utiliza la información de tipo de proceso para determinar su comportamiento

### Módulo de Clientes

- Obtiene el listado de clientes activos para asignación
- Filtra los clientes según el contador conectado

### Módulo de Histórico de Procesos

- Envía los procesos completados al histórico
- Permite la recuperación y visualización de comprobantes

### Dashboard

- Proporciona datos para el semáforo de clientes
- Alimenta las estadísticas de procesos por estado

## Mejores Prácticas

### Para la Asignación Eficiente

1. **Planificación previa**: Asigne procesos con suficiente anticipación para permitir una adecuada planificación.
2. **Agrupación lógica**: Asigne procesos relacionados en bloques para facilitar su seguimiento.
3. **Establecimiento realista de fechas**: Considere la complejidad del proceso y la disponibilidad de recursos al establecer fechas de compromiso.
4. **Uso adecuado de días de gracia**: Establezca días de gracia proporcionales a la complejidad del proceso.

### Para el Seguimiento

1. **Revisión regular**: Revise periódicamente el estado de todas las asignaciones activas.
2. **Atención prioritaria**: Dé prioridad a los procesos en estado "En riesgo" o "Atrasado".
3. **Documentación oportuna**: Cargue los comprobantes de pago inmediatamente después de completar un proceso.
4. **Comunicación con clientes**: Mantenga informados a los clientes sobre el estado de sus procesos asignados.

## Solución de Problemas

### Problema: No se puede asignar un proceso específico

**Posibles causas y soluciones**:
- **El proceso ya está asignado al cliente**: Verifique las asignaciones existentes.
- **El cliente está inactivo**: Asegúrese de que el cliente tenga estado activo.
- **El proceso está inactivo**: Verifique que el proceso esté activo en el catálogo de procesos.
- **Faltan permisos**: Confirme que tiene los permisos necesarios para realizar asignaciones.

### Problema: No se puede cargar un comprobante de pago

**Posibles causas y soluciones**:
- **Formato de archivo no soportado**: Asegúrese de usar formatos PDF o imágenes comunes (JPG, PNG).
- **Tamaño de archivo excesivo**: Reduzca el tamaño del archivo a menos de 5MB.
- **Proceso no activo**: Verifique que el proceso esté en estado activo antes de intentar completarlo.
- **Problemas de conexión**: Compruebe su conexión a internet e intente nuevamente.

### Problema: La fecha de compromiso no se muestra correctamente

**Posibles causas y soluciones**:
- **Problema de zona horaria**: Verifique la configuración de zona horaria de su navegador.
- **Error en formato de fecha**: Asegúrese de ingresar la fecha en el formato correcto usando el selector de calendario.
- **Error de sincronización**: Cierre sesión, vuelva a iniciar sesión e inténtelo nuevamente.

## Preguntas Frecuentes

### Generales

**P: ¿Puedo asignar el mismo proceso a un cliente más de una vez?**  
R: No, cada combinación de cliente y proceso debe ser única. Si necesita una nueva instancia del mismo proceso, primero debe completar o eliminar la asignación existente.

**P: ¿Qué ocurre con las asignaciones cuando un cliente se inactiva?**  
R: Las asignaciones permanecen en el sistema, pero automáticamente pasan a estado "Inactivo" hasta que el cliente vuelva a activarse.

**P: ¿Puedo editar un proceso marcado como "Pagado"?**  
R: No, una vez que un proceso ha sido marcado como "Pagado", no se puede editar. Para realizar cambios, contacte a un administrador del sistema.

### Sobre Fechas y Plazos

**P: ¿Cómo se calculan las fechas de vencimiento para procesos de nómina?**  
R: Para procesos de nómina, el sistema calcula automáticamente las fechas basándose en las frecuencias seleccionadas:
- Quincenal: los días 15 y último de cada mes
- Semanal: cada viernes

**P: ¿Qué significa exactamente "días de gracia"?**  
R: Los días de gracia son un período adicional después de la fecha de compromiso durante el cual el proceso se considera "En riesgo" pero aún no "Atrasado". Sirven como un período de tolerancia antes de considerar que el proceso está completamente vencido.

**P: ¿Puedo establecer fechas de compromiso en fines de semana o días festivos?**  
R: Sí, el sistema permite seleccionar cualquier fecha. Sin embargo, se recomienda considerar los días hábiles al establecer fechas de compromiso.

### Sobre Documentos y Comprobantes

**P: ¿Qué tipos de archivo puedo cargar como comprobantes de pago?**  
R: Puede cargar archivos PDF o imágenes (JPG, PNG, GIF) con un tamaño máximo de 5MB.

**P: ¿Se pueden descargar los comprobantes de pago una vez cargados?**  
R: Sí, los comprobantes de pago pueden descargarse desde el módulo de Histórico de Procesos.

**P: ¿Puedo reemplazar un comprobante de pago después de haberlo cargado?**  
R: No directamente. Una vez cargado un comprobante, el proceso se marca como "Pagado" y no puede modificarse. Para casos especiales, contacte al administrador del sistema.

## Soporte y Ayuda Adicional

Si encuentra algún problema o tiene preguntas adicionales sobre el uso del módulo de Asignación de Procesos, por favor contacte al equipo de soporte técnico:

- **Correo electrónico:** soporte@luenser.com
- **Teléfono:** (XX) XXXX-XXXX
- **Horario de atención:** Lunes a Viernes, 9:00 AM - 6:00 PM

Para formación adicional sobre este módulo, consulte los recursos de capacitación disponibles en la sección de ayuda del sistema o solicite una sesión de entrenamiento personalizada con nuestro equipo de soporte.

---

*Última actualización: Abril 2025*
