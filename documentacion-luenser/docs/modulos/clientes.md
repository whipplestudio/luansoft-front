# Módulo de Clientes

## Introducción

El módulo de Clientes es una parte fundamental del sistema de gestión fiscal de Luenser, diseñado para administrar toda la información relacionada con los clientes de la empresa. Este módulo permite crear, visualizar, editar y eliminar registros de clientes, así como gestionar su información fiscal, asignar contadores responsables y dar seguimiento a sus procesos fiscales.

## Propósito y Alcance

El propósito principal del módulo de Clientes es centralizar toda la información de los clientes en un solo lugar, facilitando:

- El registro y mantenimiento de datos generales de clientes
- La clasificación de clientes según su tipo (Persona Física o Moral)
- La asignación de regímenes fiscales correspondientes
- La vinculación con contadores responsables
- El seguimiento de procesos fiscales asociados
- La consulta del historial de operaciones

## Acceso al Módulo

### Ubicación en el Sistema

El módulo de Clientes se encuentra accesible desde el menú lateral de navegación, representado por un ícono de usuarios y la etiqueta "Clientes".

### Permisos Requeridos

El acceso y las operaciones disponibles en este módulo dependen del rol asignado al usuario:

| Rol | Ver | Crear | Editar | Eliminar |
|-----|-----|-------|--------|----------|
| Administrador | ✅ | ✅ | ✅ | ✅ |
| Contador | ✅ | ✅ | ✅ | ✅ |
| Dashboard | ❌ | ❌ | ❌ | ❌ |
| Contacto | ❌ | ❌ | ❌ | ❌ |

## Interfaz Principal

La interfaz principal del módulo de Clientes está compuesta por los siguientes elementos:

### Barra Superior

- **Título del Módulo**: Muestra "Clientes" como identificador del módulo actual.
- **Botón de Nuevo Cliente**: Permite iniciar el proceso de creación de un nuevo cliente.
- **Campo de Búsqueda**: Facilita la localización de clientes específicos por nombre, RFC u otros criterios.
- **Filtros Avanzados**: Permite filtrar la lista de clientes por diferentes criterios como tipo de cliente, régimen fiscal, contador asignado, etc.

### Tabla de Clientes

La tabla principal muestra la lista de clientes con las siguientes columnas:

- **Nombre/Razón Social**: Nombre del cliente o razón social en caso de personas morales.
- **RFC**: Registro Federal de Contribuyentes del cliente.
- **Tipo**: Indica si es Persona Física o Moral.
- **Régimen Fiscal**: Muestra el régimen fiscal asignado al cliente.
- **Contador Asignado**: Nombre del contador responsable del cliente.
- **Estado**: Indica si el cliente está activo o inactivo.
- **Acciones**: Botones para ver detalles, editar o eliminar el cliente.

### Paginación

En la parte inferior se encuentra el control de paginación que permite navegar entre las diferentes páginas de resultados cuando la lista de clientes es extensa.

## Operaciones Principales

### Visualización de Clientes

1. **Acceder al Módulo**: Haga clic en "Clientes" en el menú lateral.
2. **Navegar por la Lista**: La tabla muestra todos los clientes a los que tiene acceso.
3. **Buscar Clientes**: Utilice el campo de búsqueda para encontrar clientes específicos.
4. **Filtrar Resultados**: Use los filtros avanzados para refinar la lista según criterios específicos.
5. **Ordenar Resultados**: Haga clic en los encabezados de columna para ordenar la lista según ese criterio.

### Creación de Nuevos Clientes

1. **Iniciar Creación**: Haga clic en el botón "Nuevo Cliente" en la barra superior.
2. **Completar Formulario**: Se abrirá un diálogo con el formulario de creación que incluye:
   - **Información General**:
     - Nombre/Razón Social
     - RFC
     - Tipo de Persona (Física/Moral)
     - Correo Electrónico
     - Teléfono
     - Dirección
   - **Información Fiscal**:
     - Régimen Fiscal (seleccionar de la lista disponible)
     - Fecha de Inicio de Operaciones
     - Obligaciones Fiscales
   - **Asignación**:
     - Contador Responsable (seleccionar de la lista de contadores)
3. **Validar Información**: El sistema verificará que todos los campos obligatorios estén completos y que el RFC tenga el formato correcto.
4. **Guardar Cliente**: Haga clic en "Guardar" para crear el nuevo registro de cliente.
5. **Confirmación**: El sistema mostrará un mensaje de confirmación y el nuevo cliente aparecerá en la lista.

### Visualización de Detalles de Cliente

1. **Acceder a Detalles**: Haga clic en el botón "Ver Detalles" (ícono de ojo) en la fila correspondiente al cliente.
2. **Navegar por Pestañas**: La vista de detalles incluye varias pestañas:
   - **Información General**: Datos básicos del cliente.
   - **Información Fiscal**: Detalles del régimen fiscal y obligaciones.
   - **Procesos Activos**: Lista de procesos fiscales en curso.
   - **Historial**: Registro de operaciones y documentos anteriores.
   - **Documentos**: Archivos asociados al cliente.
3. **Acciones Disponibles**: Desde la vista de detalles puede:
   - Editar la información del cliente
   - Asignar nuevos procesos
   - Ver documentos
   - Generar reportes

### Edición de Información de Clientes

1. **Iniciar Edición**: Haga clic en el botón "Editar" (ícono de lápiz) en la fila correspondiente al cliente.
2. **Modificar Datos**: Se abrirá un diálogo similar al de creación, pero con los campos prellenados con la información actual.
3. **Actualizar Información**: Realice los cambios necesarios en cualquiera de las secciones.
4. **Guardar Cambios**: Haga clic en "Guardar" para actualizar el registro.
5. **Confirmación**: El sistema mostrará un mensaje confirmando que los cambios se han guardado correctamente.

### Eliminación de Clientes

1. **Iniciar Eliminación**: Haga clic en el botón "Eliminar" (ícono de papelera) en la fila correspondiente al cliente.
2. **Confirmar Acción**: Se mostrará un diálogo de confirmación advirtiendo sobre las implicaciones de eliminar el cliente.
3. **Proporcionar Motivo**: En algunos casos, el sistema puede solicitar un motivo para la eliminación.
4. **Confirmar Eliminación**: Haga clic en "Eliminar" para confirmar la acción.
5. **Confirmación**: El sistema mostrará un mensaje confirmando que el cliente ha sido eliminado.

> **Nota importante**: La eliminación de clientes puede ser lógica (desactivación) en lugar de física, dependiendo de la configuración del sistema. Los clientes eliminados lógicamente pueden ser reactivados posteriormente.

## Gestión de Tipos de Clientes

El sistema maneja dos tipos principales de clientes:

### Persona Física

- Individuos con actividad empresarial o profesional
- Requiere datos personales como CURP, fecha de nacimiento, etc.
- Tiene regímenes fiscales específicos disponibles

### Persona Moral

- Empresas y organizaciones
- Requiere datos como razón social, representante legal, etc.
- Tiene regímenes fiscales específicos disponibles

Para cambiar el tipo de cliente:

1. Edite el cliente existente
2. Cambie la selección en el campo "Tipo de Persona"
3. Note que algunos campos pueden aparecer o desaparecer según el tipo seleccionado
4. Los regímenes fiscales disponibles se actualizarán automáticamente

## Asignación de Regímenes Fiscales

Cada cliente debe tener asignado un régimen fiscal que determina sus obligaciones tributarias:

1. Al crear o editar un cliente, seleccione el régimen fiscal apropiado del menú desplegable
2. El sistema mostrará solo los regímenes compatibles con el tipo de persona seleccionado
3. Al cambiar el régimen fiscal, se actualizarán automáticamente las obligaciones fiscales asociadas
4. El sistema puede mostrar advertencias si detecta incompatibilidades

> **Nota**: La modificación del régimen fiscal puede afectar a los procesos activos del cliente. El sistema notificará sobre posibles implicaciones.

## Asignación de Contadores a Clientes

Cada cliente debe tener asignado un contador responsable:

1. Al crear o editar un cliente, seleccione el contador en el campo "Contador Asignado"
2. Solo se mostrarán los contadores activos en el sistema
3. Un cliente solo puede tener un contador asignado a la vez
4. Para cambiar el contador asignado, simplemente seleccione uno diferente al editar el cliente

Para una gestión más avanzada de asignaciones:

1. Acceda al módulo "Asignación de Contadores" desde el menú lateral
2. Este módulo permite asignar múltiples clientes a un contador o viceversa de forma masiva

## Gestión de Procesos Asociados

Desde el módulo de Clientes, puede gestionar los procesos fiscales asociados:

1. En la vista de detalles del cliente, acceda a la pestaña "Procesos Activos"
2. Aquí verá una lista de todos los procesos fiscales en curso
3. Para asignar un nuevo proceso:
   - Haga clic en "Asignar Nuevo Proceso"
   - Seleccione el tipo de proceso
   - Configure las fechas y parámetros
   - Asigne responsables si es necesario
   - Guarde el nuevo proceso
4. Para ver detalles de un proceso, haga clic en "Ver Detalles" en la fila correspondiente
5. Para editar un proceso, haga clic en "Editar" en la fila correspondiente

## Visualización del Historial

El sistema mantiene un registro completo de todas las operaciones relacionadas con cada cliente:

1. En la vista de detalles del cliente, acceda a la pestaña "Historial"
2. Aquí encontrará:
   - Cambios en la información del cliente
   - Procesos completados
   - Documentos presentados
   - Comunicaciones registradas
3. Utilice los filtros para refinar la vista por fecha, tipo de operación, etc.
4. Haga clic en cualquier entrada para ver más detalles

## Integración con Otros Módulos

El módulo de Clientes está integrado con otros módulos del sistema:

### Contadores

- Asignación de contadores a clientes
- Visualización de la carga de trabajo de cada contador
- Reasignación de clientes entre contadores

### Procesos

- Creación y asignación de procesos fiscales a clientes
- Seguimiento del estado de los procesos

### Regímenes Fiscales

- Asignación de regímenes a clientes
- Actualización automática de obligaciones fiscales
- Validación de compatibilidad

### Documentos

- Almacenamiento de documentos asociados a clientes
- Organización por categorías y fechas
- Control de versiones

## Mejores Prácticas

Para una gestión eficiente de clientes, se recomienda:

1. **Mantener información actualizada**: Revisar y actualizar periódicamente los datos de los clientes.
2. **Verificar RFC**: Asegurarse de que el RFC ingresado sea válido y corresponda al cliente.
3. **Documentar cambios**: Registrar notas explicativas al realizar cambios significativos.
4. **Revisar asignaciones**: Verificar regularmente que los clientes tengan el contador adecuado asignado.
5. **Equilibrar cargas**: Distribuir los clientes entre los contadores de manera equilibrada.
6. **Categorizar clientes**: Utilizar etiquetas o notas para clasificar clientes según su complejidad o prioridad.
7. **Verificar procesos**: Revisar periódicamente que todos los clientes tengan sus procesos fiscales correctamente asignados.

## Solución de Problemas Comunes

### El cliente no aparece en la lista

- Verifique que tiene los permisos necesarios para ver el cliente
- Compruebe si los filtros activos están limitando la visualización
- Confirme que el cliente no ha sido desactivado

### No se puede crear un nuevo cliente

- Verifique que todos los campos obligatorios estén completos
- Compruebe que el formato del RFC sea correcto
- Confirme que no existe ya un cliente con el mismo RFC

### Error al asignar régimen fiscal

- Verifique que el régimen seleccionado sea compatible con el tipo de persona
- Compruebe si hay restricciones específicas configuradas en el sistema
- Contacte al administrador si persiste el problema

### No se pueden ver los procesos de un cliente

- Verifique que tiene permisos para ver procesos
- Compruebe si el cliente tiene procesos asignados
- Confirme que los procesos no han sido archivados

## Preguntas Frecuentes

### Gestión de Clientes

**P: ¿Puedo tener dos clientes con el mismo RFC?**
R: No, el sistema no permite duplicar RFC ya que es un identificador único para cada contribuyente.

**P: ¿Qué sucede si necesito cambiar el tipo de persona de un cliente?**
R: Puede cambiar el tipo de persona al editar el cliente, pero tenga en cuenta que esto puede afectar al régimen fiscal asignado y a los procesos activos.

**P: ¿Cómo puedo desactivar temporalmente a un cliente sin eliminarlo?**
R: Edite el cliente y cambie su estado a "Inactivo". Esto mantendrá todos sus datos pero lo excluirá de las operaciones regulares.

### Asignación de Contadores

**P: ¿Puedo asignar más de un contador a un cliente?**
R: No, cada cliente solo puede tener un contador responsable asignado a la vez.

**P: ¿Qué sucede con los procesos cuando cambio el contador asignado a un cliente?**
R: Los procesos activos se transfieren automáticamente al nuevo contador asignado.

**P: ¿Cómo puedo ver qué clientes están asignados a un contador específico?**
R: Puede utilizar el filtro "Contador Asignado" en la lista de clientes o acceder al módulo "Asignación de Contadores".

### Regímenes Fiscales

**P: ¿Puedo cambiar el régimen fiscal de un cliente que tiene procesos activos?**
R: Sí, pero el sistema le advertirá sobre posibles implicaciones y podría requerir ajustes en los procesos existentes.

**P: ¿El sistema verifica automáticamente la compatibilidad del régimen fiscal?**
R: Sí, el sistema solo muestra regímenes compatibles con el tipo de persona seleccionado y puede mostrar advertencias adicionales.

## Soporte Técnico

Si encuentra problemas al utilizar el módulo de Clientes o tiene preguntas adicionales, contacte al equipo de soporte técnico:

- **Correo electrónico**: soporte@luenser.com
- **Teléfono**: (XX) XXXX-XXXX
- **Horario de atención**: Lunes a Viernes, 9:00 AM - 6:00 PM

---

*Nota: Esta documentación está sujeta a cambios según las actualizaciones del sistema. Última actualización: Abril 2025.*
\`\`\`

```service file="src/regimen-fiscal/regimen-fiscal.service"
... This file was left out for brevity. Assume it is correct and does not need any modifications. ...
