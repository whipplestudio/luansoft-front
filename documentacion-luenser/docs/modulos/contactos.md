# Módulo de Contactos

## Introducción

El módulo de Contactos es una herramienta fundamental dentro del sistema de gestión fiscal de Luenser, diseñada para administrar de manera eficiente toda la información relacionada con los contactos de los clientes. Este módulo permite registrar, organizar y gestionar los datos de las personas con las que se mantiene comunicación en el contexto de los servicios fiscales y contables.

## Propósito y Alcance

El propósito principal del módulo de Contactos es centralizar y organizar la información de todas las personas de contacto relacionadas con los clientes de la firma. Esto facilita:

- Mantener un registro actualizado de todos los contactos
- Establecer relaciones claras entre contactos y clientes
- Facilitar la comunicación efectiva con los contactos
- Mantener un historial de interacciones con cada contacto
- Asignar responsabilidades y roles específicos a cada contacto

## Acceso al Módulo

### Ubicación en el Sistema

El módulo de Contactos se encuentra accesible desde el menú lateral de navegación, representado por un ícono de libreta de contactos. Al hacer clic en esta opción, se cargará la página principal del módulo.

### Permisos Requeridos

El acceso y las funcionalidades disponibles en el módulo de Contactos varían según el rol del usuario:

| Rol | Ver | Crear | Editar | Eliminar |
|-----|-----|-------|--------|----------|
| Administrador | ✅ | ✅ | ✅ | ✅ |
| Contador | ❌ | ❌ | ❌ | ❌ |
| Dashboard | ❌ | ❌ | ❌ | ❌ |
| Contacto | ❌ | ❌ | ❌ | ❌ |

**Nota:** Los usuarios con rol de Contador pueden ver los contactos asociados a sus clientes asignados desde el módulo de Clientes, pero no tienen acceso directo al módulo de Contactos.

## Interfaz Principal

La interfaz principal del módulo de Contactos presenta una estructura organizada que facilita la visualización y gestión de la información:

### Elementos de la Interfaz

1. **Barra de Título**: Muestra el nombre del módulo "Contactos" y el número total de contactos registrados.

2. **Barra de Herramientas**:
   - **Botón "Nuevo Contacto"**: Permite crear un nuevo registro de contacto.
   - **Campo de Búsqueda**: Facilita la localización rápida de contactos por nombre, correo o teléfono.
   - **Filtros Avanzados**: Permite filtrar contactos por cliente, tipo, estado, etc.
   - **Selector de Vista**: Permite alternar entre vista de tabla y vista de tarjetas.

3. **Tabla de Contactos**: Presenta la lista de contactos con las siguientes columnas:
   - Nombre completo
   - Correo electrónico
   - Teléfono
   - Cliente asociado
   - Tipo de contacto
   - Estado
   - Fecha de último contacto
   - Acciones disponibles

4. **Paginación**: Permite navegar entre las diferentes páginas de resultados cuando la lista es extensa.

5. **Contador de Registros**: Muestra el número de contactos visualizados y el total de registros.

## Operaciones Principales

### Visualizar el Catálogo de Contactos

1. Acceda al módulo de Contactos desde el menú lateral.
2. La tabla mostrará automáticamente todos los contactos registrados en el sistema.
3. Utilice los controles de paginación para navegar entre páginas si hay múltiples resultados.
4. Puede ordenar los resultados haciendo clic en los encabezados de columna.
5. Utilice el campo de búsqueda para encontrar contactos específicos rápidamente.

#### Filtros Disponibles

- **Por Cliente**: Muestra solo los contactos asociados a un cliente específico.
- **Por Tipo**: Filtra contactos según su clasificación (principal, secundario, etc.).
- **Por Estado**: Muestra contactos activos o inactivos.
- **Por Fecha**: Filtra contactos según la fecha de registro o última actualización.

### Crear un Nuevo Contacto

1. Haga clic en el botón "Nuevo Contacto" en la barra de herramientas.
2. Se abrirá un formulario modal con los siguientes campos:

   #### Información Personal
   - Nombre(s) *
   - Apellido Paterno *
   - Apellido Materno
   - Fecha de Nacimiento
   - Género
   - Fotografía (opcional)

   #### Información de Contacto
   - Correo Electrónico *
   - Teléfono Móvil *
   - Teléfono Fijo
   - Extensión

   #### Información Profesional
   - Puesto o Cargo
   - Departamento
   - Cliente Asociado *
   - Tipo de Contacto *
   - Es Contacto Principal (Sí/No)

   #### Dirección
   - Calle
   - Número Exterior
   - Número Interior
   - Colonia
   - Código Postal
   - Ciudad
   - Estado
   - País

   #### Configuración Adicional
   - Preferencia de Comunicación
   - Notas Adicionales
   - Estado (Activo/Inactivo)

3. Complete los campos requeridos (marcados con *) y cualquier información adicional relevante.
4. Haga clic en "Guardar" para crear el nuevo contacto.
5. El sistema mostrará un mensaje de confirmación y el nuevo contacto aparecerá en la lista.

### Ver Detalles de un Contacto

1. En la tabla de contactos, haga clic en el nombre del contacto o en el botón "Ver Detalles" (ícono de ojo) en la columna de acciones.
2. Se abrirá una ventana modal con toda la información del contacto organizada en pestañas:

   #### Pestaña "Información General"
   - Datos personales y de contacto
   - Fotografía (si está disponible)
   - Cliente asociado
   - Tipo de contacto y rol

   #### Pestaña "Historial de Comunicaciones"
   - Registro de llamadas, correos y reuniones
   - Fechas y asuntos tratados
   - Responsable de la comunicación

   #### Pestaña "Documentos"
   - Archivos compartidos con el contacto
   - Documentos firmados o enviados

   #### Pestaña "Notas"
   - Anotaciones relevantes sobre el contacto
   - Recordatorios y observaciones

3. Puede navegar entre las pestañas para consultar la información específica que necesite.
4. Haga clic en "Cerrar" para volver a la lista de contactos.

### Editar Información de un Contacto

1. En la tabla de contactos, haga clic en el botón "Editar" (ícono de lápiz) en la columna de acciones.
2. Se abrirá el formulario modal con los datos actuales del contacto.
3. Modifique los campos necesarios.
4. Haga clic en "Guardar" para aplicar los cambios.
5. El sistema mostrará un mensaje de confirmación y actualizará la información en la lista.

### Eliminar un Contacto

1. En la tabla de contactos, haga clic en el botón "Eliminar" (ícono de papelera) en la columna de acciones.
2. Se mostrará un diálogo de confirmación preguntando si está seguro de eliminar el contacto.
3. Haga clic en "Confirmar" para proceder con la eliminación o "Cancelar" para abortar la operación.
4. Si confirma, el sistema eliminará el contacto y mostrará un mensaje de confirmación.

**Nota importante**: La eliminación de un contacto es irreversible. Si el contacto tiene historial de comunicaciones o documentos asociados, considere marcarlo como inactivo en lugar de eliminarlo.

## Gestión de Tipos de Contactos

El sistema permite clasificar los contactos según su función o relación con el cliente. Los tipos predefinidos incluyen:

- **Principal**: Contacto primario para asuntos generales.
- **Financiero**: Responsable de asuntos financieros y pagos.
- **Legal**: Encargado de aspectos legales y contractuales.
- **Técnico**: Responsable de proporcionar información técnica.
- **Administrativo**: Encargado de trámites administrativos.
- **Otro**: Para clasificaciones que no corresponden a las anteriores.

### Personalización de Tipos

Los administradores pueden personalizar los tipos de contactos disponibles:

1. Acceda a la sección "Configuración" desde el menú principal.
2. Seleccione "Catálogos del Sistema".
3. Elija "Tipos de Contacto".
4. Aquí puede agregar, editar o desactivar los tipos según las necesidades de la organización.

## Asignación de Contactos a Clientes

Cada contacto debe estar asociado a al menos un cliente en el sistema. Esta relación es fundamental para la organización de la información.

### Asignar un Contacto a un Cliente

1. Al crear o editar un contacto, seleccione el cliente correspondiente en el campo "Cliente Asociado".
2. Si el contacto trabaja con múltiples clientes, puede agregar clientes adicionales haciendo clic en "Agregar Cliente".
3. Para cada cliente, especifique si el contacto es principal o secundario.

### Visualizar Contactos por Cliente

Para ver todos los contactos asociados a un cliente específico:

1. Acceda al módulo de Clientes.
2. Busque y seleccione el cliente deseado.
3. Navegue a la pestaña "Contactos" en la vista de detalles del cliente.
4. Se mostrará la lista de todos los contactos asociados a ese cliente.

## Gestión de Información de Contacto

### Actualización de Datos

Es importante mantener actualizada la información de contacto para garantizar una comunicación efectiva:

1. Establezca un proceso regular de verificación de datos (trimestral o semestral).
2. Aproveche las interacciones con los contactos para confirmar que sus datos siguen siendo correctos.
3. Documente cualquier cambio en la información de contacto con fecha y motivo.

### Gestión de Contactos Inactivos

Cuando un contacto deja de ser relevante para un cliente:

1. Edite el registro del contacto.
2. Cambie su estado a "Inactivo".
3. Agregue una nota explicando el motivo y la fecha de inactivación.
4. Si corresponde, indique quién es el nuevo contacto que lo reemplaza.

Los contactos inactivos no aparecerán en las listas predeterminadas, pero se pueden visualizar aplicando el filtro correspondiente.

## Integración con Otros Módulos

El módulo de Contactos está integrado con otros componentes del sistema para proporcionar una experiencia coherente:

### Integración con Módulo de Clientes

- Los contactos se asocian directamente a los clientes.
- Desde la ficha de un cliente, se puede acceder a la lista de sus contactos.
- Al crear un nuevo cliente, se puede registrar simultáneamente su contacto principal.

### Integración con Módulo de Comunicaciones

- El sistema registra automáticamente las comunicaciones realizadas con cada contacto.
- Los correos electrónicos enviados desde la plataforma quedan vinculados al historial del contacto.
- Las llamadas y reuniones registradas se asocian a los contactos correspondientes.

### Integración con Módulo de Procesos

- Al asignar responsables para un proceso, se pueden seleccionar contactos del cliente.

### Registro de Información

- Complete todos los campos posibles, no solo los obligatorios.
- Utilice un formato consistente para teléfonos y direcciones.
- Incluya fotografías de los contactos cuando sea posible para facilitar su identificación.
- Mantenga actualizadas las notas con información relevante sobre preferencias o particularidades.

### Organización

- Designe claramente los contactos principales para cada cliente.
- Utilice los tipos de contacto de manera consistente.
- Revise y actualice periódicamente la información.
- Archive (marque como inactivos) los contactos que ya no son relevantes en lugar de eliminarlos.

### Comunicación

- Registre todas las interacciones significativas con los contactos.
- Documente acuerdos o compromisos establecidos en las comunicaciones.
- Utilice las preferencias de comunicación registradas para cada contacto.

## Solución de Problemas Comunes

### Problema: No se puede crear un nuevo contacto

**Posibles causas y soluciones:**
- Verifique que tiene los permisos necesarios (rol de Administrador).
- Asegúrese de completar todos los campos obligatorios.
- Compruebe que el correo electrónico no esté ya registrado en el sistema.
- Verifique que el cliente asociado exista y esté activo.

### Problema: No se visualizan todos los contactos

**Posibles causas y soluciones:**
- Revise los filtros aplicados en la tabla.
- Verifique que no esté activado el filtro "Solo activos".
- Compruebe sus permisos de acceso.
- Intente refrescar la página o cerrar y volver a abrir el módulo.

### Problema: Error al editar un contacto

**Posibles causas y soluciones:**
- Verifique su conexión a internet.
- Compruebe que otro usuario no esté editando el mismo contacto simultáneamente.
- Asegúrese de que el contacto no haya sido eliminado por otro usuario.
- Intente refrescar la página y realizar la edición nuevamente.

## Preguntas Frecuentes

### Generales

**P: ¿Puedo tener un contacto sin cliente asociado?**
R: No, cada contacto debe estar asociado a al menos un cliente en el sistema.

**P: ¿Puedo asociar un mismo contacto a varios clientes?**
R: Sí, un contacto puede estar vinculado a múltiples clientes, especialmente útil cuando una persona representa a varias empresas.

**P: ¿Cómo puedo saber quién es el contacto principal de un cliente?**
R: En la lista de contactos, los contactos principales están marcados con un indicador especial. También puede filtrar por "Contactos Principales".

### Permisos y Acceso

**P: ¿Quién puede ver la información de contactos?**
R: Solo los usuarios con rol de Administrador tienen acceso completo al módulo de Contactos. Los Contadores pueden ver los contactos de sus clientes asignados desde el módulo de Clientes.

**P: ¿Se notifica a los contactos cuando se actualiza su información?**
R: No, el sistema no envía notificaciones automáticas a los contactos cuando se modifica su información.

### Funcionalidades

**P: ¿Puedo importar contactos desde un archivo Excel?**
R: Sí, el sistema permite importar contactos masivamente. Acceda a la opción "Importar" en la barra de herramientas y siga las instrucciones.

**P: ¿Cómo puedo exportar la lista de contactos?**
R: Utilice el botón "Exportar" en la barra de herramientas. Puede elegir entre formatos Excel, CSV o PDF.

**P: ¿Se puede programar un recordatorio para contactar a una persona?**
R: Sí, desde la ficha del contacto, vaya a la pestaña "Notas" y utilice la función "Agregar Recordatorio".

## Soporte Técnico

Si encuentra algún problema o tiene preguntas adicionales sobre el uso del módulo de Contactos, por favor contacte al equipo de soporte técnico:

- **Correo electrónico:** soporte@luenser.com
- **Teléfono:** (XX) XXXX-XXXX
- **Horario de atención:** Lunes a Viernes, 9:00 AM - 6:00 PM

Al reportar un problema, incluya:
- Descripción detallada del inconveniente
- Capturas de pantalla si es posible
- Pasos para reproducir el error
- Fecha y hora en que ocurrió

---

*Nota: Esta documentación está sujeta a cambios según las actualizaciones del sistema. Última actualización: Abril 2025.*
\`\`\`

```service file="src/regimen-fiscal/regimen-fiscal.service"
... This file was left out for brevity. Assume it is correct and does not need any modifications. ...
