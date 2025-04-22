# Módulo de Procesos

## Índice
1. [Introducción](#introducción)
2. [Propósito y Alcance](#propósito-y-alcance)
3. [Acceso al Módulo](#acceso-al-módulo)
4. [Interfaz del Módulo](#interfaz-del-módulo)
5. [Operaciones Principales](#operaciones-principales)
   - [Visualizar Procesos](#visualizar-procesos)
   - [Crear Procesos](#crear-procesos)
   - [Ver Detalles de Procesos](#ver-detalles-de-procesos)
   - [Editar Procesos](#editar-procesos)
   - [Eliminar Procesos](#eliminar-procesos)
6. [Tipos de Procesos](#tipos-de-procesos)
7. [Estados de Procesos](#estados-de-procesos)
8. [Sistema de Semáforo](#sistema-de-semáforo)
9. [Gestión de Fechas y Plazos](#gestión-de-fechas-y-plazos)
10. [Relación con Otros Módulos](#relación-con-otros-módulos)
11. [Funcionalidades Avanzadas](#funcionalidades-avanzadas)
12. [Mejores Prácticas](#mejores-prácticas)
13. [Solución de Problemas](#solución-de-problemas)
14. [Preguntas Frecuentes](#preguntas-frecuentes)
15. [Soporte Técnico](#soporte-técnico)

## Introducción

El Módulo de Procesos es uno de los componentes centrales del sistema de gestión fiscal de Luenser. Este módulo permite crear, gestionar y dar seguimiento a todos los procesos fiscales, contables y administrativos relacionados con los clientes. Un proceso representa una tarea o conjunto de tareas que debe realizarse para un cliente en un periodo determinado, como declaraciones mensuales, anuales, trámites específicos, entre otros.

El módulo proporciona herramientas completas para la gestión eficiente de procesos, ayudando a mantener el control sobre las tareas pendientes, completadas y próximas a vencer, garantizando el cumplimiento oportuno de las obligaciones fiscales de los clientes.

## Propósito y Alcance

### Propósito

El propósito principal del Módulo de Procesos es proporcionar un sistema centralizado para:

- Crear y definir los diferentes tipos de procesos que maneja la firma contable
- Establecer y monitorear fechas límite para cada proceso
- Asignar procesos a clientes específicos
- Hacer seguimiento del estado y avance de cada proceso
- Identificar procesos en riesgo o retrasados
- Generar reportes y estadísticas de cumplimiento
- Mantener un historial de procesos completados

### Alcance

Este módulo abarca la gestión completa del ciclo de vida de los procesos:

- Definición de catálogos de procesos disponibles
- Personalización de procesos según tipo de cliente
- Programación y calendarización de procesos
- Seguimiento de estado y cumplimiento
- Documentación asociada a cada proceso
- Historial y trazabilidad de procesos completados

## Acceso al Módulo

El acceso al Módulo de Procesos está determinado por el rol del usuario en el sistema. A continuación, se detallan los permisos por rol:

| Rol | Ver | Crear | Editar | Eliminar |
|-----|-----|-------|--------|----------|
| Administrador | ✅ | ✅ | ✅ | ✅ |
| Contador | ✅ | ❌ | ❌ | ❌ |
| Dashboard | ❌ | ❌ | ❌ | ❌ |
| Contacto | ❌ | ❌ | ❌ | ❌ |

### Cómo Acceder

1. Inicie sesión en el sistema con sus credenciales
2. En el menú lateral, haga clic en la opción "Procesos"
3. El sistema mostrará la página principal del módulo de Procesos

> **Nota**: Si no puede ver la opción "Procesos" en el menú lateral, es posible que su rol no tenga permisos para acceder a este módulo. Contacte al administrador del sistema para solicitar los permisos necesarios.

## Interfaz del Módulo

La interfaz del Módulo de Procesos está diseñada para proporcionar una vista clara y organizada de todos los procesos en el sistema. A continuación, se describen los componentes principales:

### Barra Superior

- **Título del Módulo**: Muestra "Procesos" para confirmar que está en el módulo correcto
- **Botón de Nuevo Proceso**: Permite crear un nuevo proceso (solo visible para roles con permiso de creación)
- **Contador de Procesos**: Muestra el número total de procesos activos en el sistema

### Área de Filtros

- **Búsqueda por Nombre**: Permite buscar procesos por su nombre o descripción
- **Filtro por Tipo**: Desplegable para filtrar por tipo de proceso
- **Filtro por Estado**: Desplegable para filtrar por estado del proceso
- **Filtro por Fecha**: Permite filtrar procesos por fecha de vencimiento

### Tabla de Procesos

- **Columnas Principales**:
  - **Nombre**: Nombre del proceso
  - **Tipo**: Categoría del proceso (fiscal, contable, etc.)
  - **Descripción**: Breve descripción del proceso
  - **Estado**: Estado actual del proceso
  - **Fecha de Creación**: Fecha en que se creó el proceso
  - **Fecha de Vencimiento**: Fecha límite para completar el proceso
  - **Acciones**: Botones para ver detalles, editar o eliminar el proceso

### Panel de Estadísticas

- **Resumen de Procesos**: Muestra gráfica con distribución de procesos por estado
- **Procesos por Vencer**: Lista de procesos próximos a vencer
- **Procesos Retrasados**: Lista de procesos que han superado su fecha de vencimiento

## Operaciones Principales

### Visualizar Procesos

La visualización de procesos es la función principal que permite a los usuarios ver todos los procesos disponibles en el sistema según los permisos de su rol.

#### Pasos para Visualizar Procesos

1. Acceda al módulo de Procesos desde el menú lateral
2. La tabla de procesos se cargará automáticamente mostrando todos los procesos
3. Utilice los filtros para refinar la lista según sus necesidades:
   - Para buscar un proceso específico, ingrese su nombre en el campo de búsqueda
   - Para filtrar por tipo, seleccione la opción deseada en el desplegable "Tipo"
   - Para filtrar por estado, seleccione la opción deseada en el desplegable "Estado"
   - Para filtrar por fecha, utilice el selector de fechas

#### Características de la Visualización

- **Paginación**: La tabla muestra 10 procesos por página por defecto, pero puede ajustarse a 25, 50 o 100
- **Ordenamiento**: Puede ordenar la tabla haciendo clic en los encabezados de columna
- **Vista Compacta/Extendida**: Puede alternar entre estas vistas usando el botón en la esquina superior derecha
- **Exportación**: Puede exportar la lista filtrada a Excel o PDF usando los botones en la parte superior

### Crear Procesos

La creación de procesos permite definir nuevos tipos de procesos que estarán disponibles para asignar a los clientes. Esta funcionalidad está limitada a usuarios con rol de Administrador.

#### Pasos para Crear un Nuevo Proceso

1. Haga clic en el botón "+ Nuevo Proceso" en la parte superior derecha
2. Se abrirá un formulario modal con los siguientes campos:
   - **Nombre**: Nombre identificativo del proceso (obligatorio)
   - **Tipo**: Seleccione el tipo de proceso (obligatorio)
   - **Descripción**: Descripción detallada del propósito del proceso
   - **Duración Estimada**: Tiempo estimado para completar el proceso (en días)
   - **Documentos Requeridos**: Lista de documentos necesarios para el proceso
   - **Instrucciones Especiales**: Cualquier instrucción particular para este proceso
   - **Activo**: Casilla para indicar si el proceso está activo (disponible para asignación)
3. Complete todos los campos obligatorios (marcados con *)
4. Haga clic en "Guardar" para crear el proceso
5. El sistema confirmará la creación exitosa y el nuevo proceso aparecerá en la tabla

#### Consideraciones al Crear Procesos

- El nombre del proceso debe ser único
- Elija un tipo de proceso apropiado que refleje la naturaleza de la tarea
- Proporcione una descripción clara que ayude a entender el propósito del proceso
- Sea realista con la duración estimada para evitar plazos irreales
- Si no está seguro de activar el proceso inmediatamente, puede dejarlo inactivo y activarlo más tarde

### Ver Detalles de Procesos

Esta funcionalidad permite examinar toda la información relacionada con un proceso específico.

#### Pasos para Ver Detalles de un Proceso

1. En la tabla de procesos, ubique el proceso que desea examinar
2. Haga clic en el botón "Ver" (icono de ojo) en la columna "Acciones"
3. Se abrirá una ventana modal con la información detallada del proceso:
   - **Información General**: Todos los datos básicos del proceso
   - **Clientes Asignados**: Lista de clientes a los que se ha asignado este proceso
   - **Historial de Modificaciones**: Registro de cambios realizados al proceso
   - **Documentos Asociados**: Plantillas o documentos vinculados al proceso

#### Acciones Disponibles en la Vista de Detalles

- **Editar**: Permite modificar la información del proceso (solo para roles con permiso)
- **Imprimir**: Genera un reporte imprimible con la información del proceso
- **Exportar**: Permite exportar la información a diferentes formatos
- **Cerrar**: Cierra la ventana de detalles y regresa a la tabla de procesos

### Editar Procesos

La edición de procesos permite modificar la información de un proceso existente. Esta funcionalidad está limitada a usuarios con rol de Administrador.

#### Pasos para Editar un Proceso

1. En la tabla de procesos, ubique el proceso que desea modificar
2. Haga clic en el botón "Editar" (icono de lápiz) en la columna "Acciones"
3. Se abrirá un formulario modal con los datos actuales del proceso
4. Modifique los campos necesarios
5. Haga clic en "Guardar" para aplicar los cambios
6. El sistema confirmará la actualización exitosa

#### Consideraciones al Editar Procesos

- Modificar un proceso afectará a todas las asignaciones existentes de este proceso
- Si cambia el estado de un proceso de "Activo" a "Inactivo", no estará disponible para nuevas asignaciones
- El sistema mantiene un registro de todas las modificaciones realizadas
- No es posible editar el campo "Fecha de Creación"

### Eliminar Procesos

La eliminación de procesos permite remover permanentemente un proceso del sistema. Esta funcionalidad está limitada a usuarios con rol de Administrador y debe usarse con precaución.

#### Pasos para Eliminar un Proceso

1. En la tabla de procesos, ubique el proceso que desea eliminar
2. Haga clic en el botón "Eliminar" (icono de papelera) en la columna "Acciones"
3. El sistema mostrará un diálogo de confirmación
4. Haga clic en "Confirmar" para proceder con la eliminación
5. El sistema confirmará la eliminación exitosa

#### Advertencias Importantes

- La eliminación de un proceso es **permanente** y no puede deshacerse
- Si el proceso está asignado a clientes, el sistema mostrará una advertencia adicional
- Se recomienda utilizar la opción de desactivar el proceso en lugar de eliminarlo cuando sea posible
- La eliminación de un proceso no elimina el historial de procesos ya completados

## Tipos de Procesos

El sistema clasifica los procesos en diferentes tipos para facilitar su organización y gestión. Cada tipo de proceso tiene características específicas y se utiliza para diferentes propósitos.

### Procesos Fiscales

Los procesos fiscales están relacionados con obligaciones tributarias y declaraciones ante autoridades fiscales.

#### Ejemplos:
- Declaración mensual de IVA
- Declaración anual de ISR
- Declaración informativa de operaciones con terceros (DIOT)
- Declaración anual de sueldos y salarios
- Presentación de CFDI de nómina

### Procesos Contables

Los procesos contables se refieren a tareas relacionadas con el registro y organización de la información financiera.

#### Ejemplos:
- Conciliación bancaria mensual
- Cierre contable mensual
- Cierre contable anual
- Elaboración de estados financieros
- Revisión de cuentas por cobrar/pagar

### Procesos Administrativos

Los procesos administrativos abarcan tareas de gestión general y trámites diversos.

#### Ejemplos:
- Renovación de firma electrónica
- Actualización de datos en el RFC
- Trámites ante dependencias gubernamentales
- Gestión de expedientes de clientes
- Archivo y digitalización de documentos

### Procesos de Nómina

Los procesos de nómina incluyen todas las tareas relacionadas con la gestión de sueldos y obligaciones laborales.

#### Ejemplos:
- Cálculo y emisión de nómina
- Cálculo de finiquitos/liquidaciones
- Presentación de avisos al IMSS
- Declaración de cuotas obrero-patronales
- Declaración anual de prima de riesgo

### Procesos Especiales

Los procesos especiales son aquellos que no se ajustan a las categorías anteriores y suelen ser personalizados para necesidades específicas.

#### Ejemplos:
- Auditorías internas
- Due diligence
- Planeación fiscal
- Proyectos de inversión
- Regularización de situación fiscal

## Estados de Procesos

Los estados de procesos representan la situación actual de cada proceso y permiten hacer un seguimiento efectivo de su avance. El sistema utiliza los siguientes estados:

### Pendiente

Un proceso en estado "Pendiente" es aquel que ha sido creado y asignado, pero aún no se ha comenzado a trabajar en él.

**Características**:
- Se muestra en color gris en la interfaz
- No tiene fecha de inicio registrada
- Es el estado inicial de todo proceso recién asignado

### En Proceso

Un proceso en estado "En Proceso" indica que se ha comenzado a trabajar en él pero aún no se ha completado.

**Características**:
- Se muestra en color azul en la interfaz
- Tiene fecha de inicio registrada
- Puede tener progreso parcial registrado

### Completado

Un proceso en estado "Completado" es aquel que se ha finalizado satisfactoriamente.

**Características**:
- Se muestra en color verde en la interfaz
- Tiene fecha de inicio y fecha de finalización
- Puede tener documentos adjuntos que evidencian su cumplimiento

### En Riesgo

Un proceso en estado "En Riesgo" es aquel que está próximo a vencer su fecha límite y aún no se ha completado.

**Características**:
- Se muestra en color amarillo en la interfaz
- Se activa automáticamente cuando queda menos del 20% del tiempo disponible

### Vencido

Un proceso en estado "Vencido" es aquel que ha superado su fecha límite sin haber sido completado.

**Características**:
- Se muestra en color rojo en la interfaz
- Se activa automáticamente cuando se supera la fecha límite

### Cancelado

Un proceso en estado "Cancelado" es aquel que se ha interrumpido antes de su finalización por alguna razón específica.

**Características**:
- Se muestra en color gris oscuro en la interfaz
- Requiere un motivo de cancelación obligatorio
- No cuenta para estadísticas de cumplimiento

## Sistema de Semáforo

El Módulo de Procesos implementa un sistema de semáforo visual que facilita la identificación rápida del estado de los procesos según su fecha de vencimiento y progreso.

### Codificación por Colores

- **Verde**: Procesos completados o con amplio margen de tiempo para su vencimiento (más del 50% del tiempo disponible)
- **Amarillo**: Procesos en riesgo de vencimiento (entre 20% y 50% del tiempo disponible)
- **Rojo**: Procesos vencidos o con inminente vencimiento (menos del 20% del tiempo disponible)
- **Gris**: Procesos pendientes de inicio o cancelados

### Aplicación del Semáforo

El sistema de semáforo se aplica en múltiples elementos de la interfaz:

1. **En la tabla principal**: Cada fila tiene un indicador de color en su borde izquierdo
2. **En el dashboard**: Los gráficos utilizan estos colores para las estadísticas
3. **En los reportes**: Los informes utilizan esta codificación para destacar prioridades

## Gestión de Fechas y Plazos

La gestión efectiva de fechas y plazos es crucial para el módulo de Procesos. El sistema proporciona herramientas avanzadas para el manejo de tiempos.

### Tipos de Fechas

- **Fecha de Creación**: Fecha en que se crea el proceso (asignada automáticamente)
- **Fecha de Inicio**: Fecha en que se comienza a trabajar en el proceso
- **Fecha de Vencimiento**: Fecha límite para completar el proceso
- **Fecha de Finalización**: Fecha en que se completa efectivamente el proceso
- **Fecha de Próxima Repetición**: Para procesos recurrentes, indica cuándo debe iniciarse el siguiente ciclo

### Cálculo Automático de Fechas

El sistema puede calcular automáticamente las fechas relevantes basándose en reglas predefinidas:

- **Para procesos mensuales**: El sistema asigna fechas basadas en el mes en curso
- **Para procesos trimestrales**: El sistema calcula el fin de cada trimestre
- **Para procesos anuales**: El sistema establece las fechas según el ejercicio fiscal
- **Para procesos personalizados**: Se pueden definir reglas específicas

### Recordatorios y Alertas

El módulo incluye un sistema de recordatorios automáticos:

- Alertas en el dashboard
- Reportes semanales de procesos por vencer

### Gestión de Prórrogas

Cuando sea necesario, el sistema permite gestionar prórrogas:

1. En la vista de detalles del proceso, haga clic en "Solicitar Prórroga"
2. Ingrese la nueva fecha propuesta y el motivo de la prórroga
3. El sistema registrará la solicitud y, según la configuración, podrá:
   - Aprobar automáticamente la prórroga
   - Notificar a un supervisor para su aprobación
   - Rechazar la solicitud si excede límites predefinidos

## Relación con Otros Módulos

El Módulo de Procesos interactúa con varios otros módulos del sistema, creando un ecosistema integrado de gestión.

### Integración con Módulo de Clientes

- Los procesos se asignan a clientes específicos
- Cada cliente puede ver los procesos que tiene asignados
- El historial de procesos forma parte del expediente del cliente
- La información del cliente determina qué procesos son aplicables

### Integración con Módulo de Contadores

- Los contadores tienen asignados clientes y, por extensión, sus procesos
- El rendimiento de los contadores se evalúa en parte por el cumplimiento de procesos
- Los contadores pueden registrar avances en los procesos

### Integración con Módulo de Dashboard

- El dashboard muestra gráficas y estadísticas de procesos
- Se visualizan los procesos por vencer, en riesgo y vencidos
- Se presentan KPIs relacionados con el cumplimiento de procesos
- Permite acceso rápido a procesos prioritarios

### Integración con Módulo de Documentos

- Cada proceso puede tener documentos adjuntos
- Se pueden asociar plantillas específicas a cada tipo de proceso
- Los documentos completados sirven como evidencia de cumplimiento
- El sistema mantiene un repositorio organizado de documentos por proceso

## Funcionalidades Avanzadas

### Procesos Recurrentes

El sistema permite configurar procesos que se repiten periódicamente:

1. Al crear un proceso, marque la opción "Recurrente"
2. Seleccione la frecuencia (diaria, semanal, mensual, trimestral, anual)
3. Defina los parámetros específicos según la frecuencia
4. El sistema creará automáticamente las nuevas instancias del proceso según la programación

### Dependencias entre Procesos

Es posible establecer relaciones de dependencia entre procesos:

1. Al crear o editar un proceso, vaya a la sección "Dependencias"
2. Seleccione los procesos que deben completarse antes que este
3. El sistema validará que no se creen dependencias circulares
4. Los procesos dependientes no podrán marcarse como completados hasta que sus prerrequisitos lo estén

### Asignación Masiva de Procesos

Para agilizar la gestión, el sistema permite asignar procesos a múltiples clientes simultáneamente:

1. Vaya a la sección "Asignación de Procesos"
2. Seleccione el proceso a asignar
3. Filtre los clientes según criterios como tipo, régimen fiscal, etc.
4. Seleccione los clientes deseados (o use la opción "Seleccionar todos")
5. Establezca los parámetros comunes (fechas, prioridad, etc.)
6. Confirme la asignación masiva

### Plantillas de Procesos

Para facilitar la creación recurrente de conjuntos de procesos:

1. Vaya a "Configuración" > "Plantillas de Procesos"
2. Cree una nueva plantilla con un nombre descriptivo
3. Agregue los procesos que conformarán la plantilla
4. Configure las relaciones temporales entre ellos
5. Al asignar procesos, podrá seleccionar una plantilla completa en lugar de procesos individuales

## Mejores Prácticas

### Organización de Procesos

- **Establezca nomenclatura clara**: Use nombres descriptivos y consistentes
- **Agrupe procesos relacionados**: Cree categorías lógicas para facilitar la búsqueda
- **Mantenga actualizado el catálogo**: Revise periódicamente y elimine procesos obsoletos
- **Documente bien cada proceso**: Incluya instrucciones claras y recursos necesarios

### Gestión Eficiente

- **Priorice adecuadamente**: Asigne niveles de prioridad realistas a los procesos
- **Anticipe vencimientos**: Establezca fechas límite con margen de seguridad
- **Monitoree regularmente**: Revise diariamente el tablero de procesos pendientes
- **Delegue apropiadamente**: Asigne procesos considerando la carga de trabajo existente

### Seguimiento y Control

- **Actualice estados oportunamente**: Mantenga el estado de los procesos siempre al día
- **Documente excepciones**: Registre motivos cuando un proceso se retrase o cancele
- **Analice tendencias**: Use los reportes para identificar cuellos de botella
- **Implemente mejora continua**: Ajuste procesos basándose en la experiencia

### Para Administradores

- Revise semanalmente los indicadores de cumplimiento
- Ajuste la asignación de recursos según la carga de trabajo
- Actualice los tipos de procesos según cambios regulatorios
- Capacite regularmente al equipo sobre el uso óptimo del módulo

## Solución de Problemas

### Problemas Comunes y Soluciones

#### No puedo crear un nuevo proceso

**Posibles causas**:
- No tiene permisos de administrador
- Hay campos obligatorios sin completar
- Existe un proceso con el mismo nombre

**Soluciones**:
1. Verifique su rol y permisos en el sistema
2. Revise que todos los campos marcados con * estén completos
3. Elija un nombre único para el proceso

#### Un proceso no aparece en la lista

**Posibles causas**:
- Los filtros actuales están ocultando el proceso
- El proceso ha sido desactivado
- El proceso fue eliminado

**Soluciones**:
1. Limpie todos los filtros de búsqueda
2. Verifique en la configuración si tiene habilitada la opción "Mostrar inactivos"
3. Contacte a un administrador para verificar si el proceso fue eliminado

#### No puedo marcar un proceso como completado

**Posibles causas**:
- El proceso tiene dependencias pendientes
- No tiene los permisos necesarios
- Faltan documentos obligatorios

**Soluciones**:
1. Verifique si hay procesos prerrequisitos y complételos primero
2. Contacte a su supervisor para revisar sus permisos
3. Adjunte todos los documentos requeridos para el proceso

### Contacto con Soporte Técnico

Si encuentra problemas que no puede resolver, contacte al soporte técnico:

- **Correo**: soporte@luenser.com
- **Teléfono**: (XX) XXXX-XXXX
- **Horario**: Lunes a Viernes, 9:00 AM - 6:00 PM

Al contactar soporte, proporcione:
- Descripción detallada del problema
- Capturas de pantalla si es posible
- Pasos para reproducir el error
- Su nombre de usuario y rol

## Preguntas Frecuentes

### Sobre la Creación de Procesos

**P: ¿Puedo crear un proceso personalizado para un solo cliente?**

R: Sí, puede crear un proceso y asignarlo exclusivamente a un cliente específico. Al crear el proceso, marque la opción "Proceso personalizado" y luego asígnelo únicamente al cliente deseado.

**P: ¿Hay un límite en la cantidad de procesos que puedo crear?**

R: No hay un límite técnico, pero se recomienda mantener el catálogo de procesos organizado y evitar duplicaciones. Un número excesivo de procesos puede dificultar la gestión.

### Sobre la Asignación de Procesos

**P: ¿Puedo asignar el mismo proceso a un cliente más de una vez?**

R: Sí, puede asignar el mismo tipo de proceso múltiples veces a un cliente, pero con diferentes fechas o periodos. Esto es común para procesos recurrentes como declaraciones mensuales.

**P: ¿Cómo reasigno un proceso de un contador a otro?**

R: Vaya al módulo de "Asignación de Contadores", seleccione el cliente cuyo proceso desea reasignar, y muévalo al nuevo contador. Todos los procesos asociados a ese cliente se moverán automáticamente.

### Sobre el Seguimiento de Procesos

**P: ¿Existe una manera de ver todos los procesos vencidos de todos los clientes?**

R: Sí, en la pantalla principal de Procesos, utilice el filtro "Estado" y seleccione "Vencido". Esto mostrará todos los procesos vencidos en el sistema.

### Sobre la Gestión de Documentos

**P: ¿Qué tipos de archivos puedo adjuntar a un proceso?**

R: Puede adjuntar archivos PDF, Word, Excel, imágenes (JPG, PNG) y archivos ZIP. El tamaño máximo por archivo es de 10MB.

**P: ¿Los clientes pueden ver los documentos adjuntos a sus procesos?**

R: Depende de la configuración. Al adjuntar un documento, puede marcar la opción "Visible para el cliente" si desea que el cliente pueda verlo a través de su portal.

## Soporte Técnico

### Canales de Soporte

El equipo de soporte técnico está disponible para ayudarle con cualquier duda o problema relacionado con el Módulo de Procesos:

- **Soporte por Correo Electrónico**: soporte@luenser.com
- **Soporte Telefónico**: (XX) XXXX-XXXX
- **Chat en Vivo**: Disponible en horario laboral a través del portal
- **Base de Conocimientos**: Accesible en docs.luenser.com/ayuda

### Horario de Atención

- **Lunes a Viernes**: 9:00 AM - 6:00 PM
- **Sábados**: 9:00 AM - 1:00 PM
- **Domingos y Festivos**: Cerrado

### Prioridad de Tickets

Los tickets de soporte se clasifican según su impacto:

- **Críticos**: Problemas que impiden completamente el uso del módulo o que afectan a todos los usuarios
- **Altos**: Problemas que afectan a funcionalidades importantes pero permiten seguir trabajando
- **Medios**: Errores que afectan a funcionalidades específicas sin impedir el trabajo general
- **Bajos**: Mejoras, sugerencias o problemas menores que no afectan la operación

### Procedimiento para Reportar Problemas

1. Reúna toda la información relevante sobre el problema:
   - Descripción detallada del error
   - Pasos para reproducirlo
   - Capturas de pantalla o videos si es posible
   - Mensaje de error exacto (si aplica)

2. Contacte al soporte a través de cualquiera de los canales disponibles

3. Proporcione su información de identificación:
   - Nombre completo
   - Nombre de usuario
   - Rol en el sistema
   - Empresa/Organización

4. El equipo de soporte le asignará un número de ticket y comenzará a trabajar en su solicitud

5. Se le notificará cuando el problema sea resuelto, solicitando su confirmación

---

*Este documento es parte de la documentación oficial del sistema de gestión fiscal de Luenser. Última actualización: Abril 2025.*
\`\`\`

