# Módulo de Usuarios

## Introducción

El Módulo de Usuarios es una herramienta fundamental del sistema Luenser que permite la gestión completa de las cuentas de usuario que tienen acceso a la plataforma. Este módulo centraliza todas las operaciones relacionadas con la administración de usuarios, incluyendo la creación, edición, desactivación y asignación de roles y permisos.

## Acceso al Módulo

Para acceder al Módulo de Usuarios:

1. Inicie sesión en el sistema con sus credenciales
2. En el menú lateral, haga clic en la opción "Usuarios"

**Nota sobre permisos**: Solo los usuarios con rol de Administrador tienen acceso completo a este módulo. Los usuarios con otros roles no podrán ver esta opción en su menú.

## Interfaz Principal

La interfaz principal del Módulo de Usuarios presenta una tabla con todos los usuarios registrados en el sistema, mostrando la siguiente información:

- **Nombre**: Nombre completo del usuario
- **Correo electrónico**: Dirección de correo electrónico asociada a la cuenta
- **Rol**: Rol asignado al usuario (Administrador, Contador, Dashboard, Contacto)
- **Estado**: Estado actual de la cuenta (Activo/Inactivo)
- **Fecha de creación**: Fecha en que se creó la cuenta
- **Última conexión**: Fecha y hora de la última vez que el usuario inició sesión
- **Acciones**: Botones para realizar operaciones sobre el usuario

### Elementos de la Interfaz

![Interfaz del Módulo de Usuarios](../assets/images/modulos/usuarios-interfaz.png)

1. **Barra de búsqueda**: Permite filtrar usuarios por nombre, correo electrónico o rol
2. **Botón "Nuevo Usuario"**: Abre el formulario para crear un nuevo usuario
3. **Filtros avanzados**: Permite filtrar por estado, rol, fecha de creación, etc.
4. **Tabla de usuarios**: Muestra la lista de usuarios con sus datos principales
5. **Paginación**: Controles para navegar entre páginas de resultados
6. **Selector de registros por página**: Permite elegir cuántos usuarios mostrar por página

## Operaciones Principales

### Crear un Nuevo Usuario

Para crear un nuevo usuario en el sistema:

1. Haga clic en el botón "Nuevo Usuario" ubicado en la parte superior derecha de la interfaz
2. Complete el formulario con la información requerida:
   - **Nombre completo**: Nombre y apellidos del usuario
   - **Correo electrónico**: Dirección de correo que servirá como identificador único
   - **Contraseña**: Contraseña inicial (el usuario deberá cambiarla en su primer inicio de sesión)
   - **Confirmar contraseña**: Repetición de la contraseña para verificación
   - **Rol**: Seleccione el rol que tendrá el usuario (Administrador, Contador, Dashboard, Contacto)
   - **Estado**: Activo o Inactivo
   - **Información adicional**: Campos opcionales como teléfono, departamento, etc.
3. Haga clic en "Guardar" para crear el usuario

**Consideraciones importantes**:
- El correo electrónico debe ser único en el sistema
- La contraseña debe cumplir con los requisitos de seguridad (mínimo 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales)
- Se enviará automáticamente un correo electrónico al nuevo usuario con sus credenciales de acceso

### Ver Detalles de Usuario

Para ver la información completa de un usuario:

1. En la tabla de usuarios, haga clic en el nombre del usuario o en el icono de "Ver detalles" en la columna de Acciones
2. Se abrirá una ventana modal con toda la información del usuario, incluyendo:
   - Datos personales
   - Historial de actividad
   - Roles y permisos asignados
   - Estadísticas de uso del sistema

### Editar Usuario

Para modificar la información de un usuario existente:

1. En la tabla de usuarios, haga clic en el icono de "Editar" (lápiz) en la columna de Acciones
2. Se abrirá el formulario con los datos actuales del usuario
3. Modifique los campos necesarios
4. Haga clic en "Guardar" para aplicar los cambios

**Nota**: Al editar un usuario, puede modificar cualquier campo excepto el correo electrónico, que es el identificador único del usuario en el sistema.

### Cambiar Contraseña de Usuario

Para restablecer la contraseña de un usuario:

1. En la tabla de usuarios, haga clic en el icono de "Cambiar contraseña" en la columna de Acciones
2. Se abrirá una ventana modal para confirmar la acción
3. Ingrese la nueva contraseña y confírmela
4. Haga clic en "Guardar"

**Consideraciones de seguridad**:
- Solo los administradores pueden cambiar la contraseña de otros usuarios
- Se notificará al usuario por correo electrónico sobre el cambio de contraseña
- El sistema solicitará al usuario cambiar esta contraseña temporal en su próximo inicio de sesión

### Desactivar/Activar Usuario

Para cambiar el estado de un usuario:

1. En la tabla de usuarios, haga clic en el interruptor de estado en la columna "Estado"
2. Confirme la acción en la ventana modal que aparecerá
3. El estado del usuario cambiará inmediatamente

**Importante**:
- Los usuarios desactivados no pueden iniciar sesión en el sistema
- La desactivación no elimina al usuario ni sus datos, solo impide su acceso
- Puede reactivar un usuario desactivado en cualquier momento siguiendo el mismo proceso

### Eliminar Usuario

Para eliminar permanentemente un usuario del sistema:

1. En la tabla de usuarios, haga clic en el icono de "Eliminar" (papelera) en la columna de Acciones
2. Se abrirá una ventana de confirmación advirtiendo sobre las consecuencias de esta acción
3. Escriba "ELIMINAR" en el campo de confirmación
4. Haga clic en "Confirmar"

**Advertencia**: La eliminación de un usuario es permanente y no se puede deshacer. Todos los datos asociados al usuario serán eliminados o desvinculados. Se recomienda desactivar usuarios en lugar de eliminarlos para mantener la integridad de los datos históricos.

## Gestión de Roles y Permisos

### Asignar Rol a Usuario

Para cambiar el rol de un usuario:

1. Edite el usuario siguiendo los pasos descritos anteriormente
2. En el campo "Rol", seleccione el nuevo rol del menú desplegable
3. Guarde los cambios

**Roles disponibles**:
- **Administrador**: Acceso completo a todos los módulos y funcionalidades
- **Contador**: Acceso a gestión de clientes, procesos y reportes
- **Dashboard**: Acceso de solo lectura al dashboard y estadísticas
- **Contacto**: Acceso limitado a sus propios procesos y documentos

### Permisos Personalizados

El sistema también permite asignar permisos específicos a usuarios individuales, independientemente de su rol:

1. En la vista de detalles del usuario, haga clic en la pestaña "Permisos"
2. Verá una lista de todos los módulos del sistema con casillas de verificación para cada tipo de permiso (Ver, Crear, Editar, Eliminar)
3. Marque o desmarque las casillas según los permisos que desee otorgar
4. Haga clic en "Guardar permisos"

**Nota**: Los permisos personalizados tienen prioridad sobre los permisos del rol. Si un rol no tiene acceso a un módulo pero se otorga permiso específico al usuario, este podrá acceder a dicho módulo.

## Funciones Avanzadas

### Importación Masiva de Usuarios

Para añadir múltiples usuarios al sistema simultáneamente:

1. En la interfaz principal, haga clic en el botón "Importar usuarios"
2. Descargue la plantilla Excel proporcionada
3. Complete la plantilla con la información de los usuarios
4. Suba el archivo completado
5. Revise la vista previa de los usuarios a importar
6. Confirme la importación

**Formato de la plantilla**:
- La primera fila contiene los encabezados (no modificar)
- Cada fila siguiente representa un usuario
- Las columnas obligatorias son: Nombre, Correo electrónico, Rol
- Las contraseñas se generarán automáticamente si no se proporcionan

### Exportación de Usuarios

Para exportar la lista de usuarios a un archivo:

1. En la interfaz principal, haga clic en el botón "Exportar"
2. Seleccione el formato deseado (Excel, CSV, PDF)
3. Elija si desea exportar todos los usuarios o solo los filtrados actualmente
4. Haga clic en "Exportar"
5. El archivo se descargará automáticamente

### Registro de Actividad

El sistema mantiene un registro detallado de todas las acciones realizadas en el módulo de usuarios:

1. En el menú lateral del módulo, haga clic en "Registro de actividad"
2. Verá una tabla con todas las operaciones realizadas, incluyendo:
   - Fecha y hora
   - Usuario que realizó la acción
   - Tipo de acción (Creación, Edición, Eliminación, etc.)
   - Usuario afectado
   - Detalles de los cambios realizados
3. Puede filtrar este registro por fecha, tipo de acción o usuario

## Integración con Otros Módulos

El Módulo de Usuarios está estrechamente integrado con otros componentes del sistema:

- **Módulo de Contadores**: Los usuarios con rol de Contador aparecerán disponibles para asignación en este módulo
- **Módulo de Clientes**: Los permisos de usuario determinan qué clientes puede ver y gestionar cada usuario
- **Módulo de Procesos**: Los permisos de usuario controlan el acceso a los diferentes procesos

## Mejores Prácticas

Para una gestión eficiente y segura de los usuarios del sistema, recomendamos seguir estas mejores prácticas:

1. **Principio de privilegio mínimo**: Asigne a cada usuario solo los permisos necesarios para realizar su trabajo
2. **Revisión periódica**: Audite regularmente la lista de usuarios y sus permisos
3. **Desactivación vs. Eliminación**: Desactive usuarios en lugar de eliminarlos para mantener el historial
4. **Contraseñas seguras**: Establezca y haga cumplir políticas de contraseñas robustas
5. **Documentación**: Mantenga un registro de quién tiene acceso a qué y por qué
6. **Capacitación**: Asegúrese de que los administradores comprendan las implicaciones de seguridad de la gestión de usuarios

## Solución de Problemas Comunes

### Usuario no puede iniciar sesión

**Posibles causas y soluciones**:
- **Cuenta desactivada**: Verifique el estado del usuario en la tabla principal
- **Contraseña incorrecta**: Restablezca la contraseña del usuario
- **Bloqueo por intentos fallidos**: Desbloquee la cuenta desde la vista de detalles del usuario
- **Sesión activa en otro dispositivo**: Cierre todas las sesiones activas desde la vista de detalles

### Error al crear un nuevo usuario

**Posibles causas y soluciones**:
- **Correo electrónico duplicado**: Verifique que el correo no esté ya registrado
- **Campos obligatorios faltantes**: Asegúrese de completar todos los campos requeridos
- **Formato de correo inválido**: Verifique que el formato del correo sea correcto
- **Contraseña no cumple requisitos**: Revise las políticas de contraseñas

### Permisos no se aplican correctamente

**Posibles causas y soluciones**:
- **Caché del navegador**: Pida al usuario que cierre sesión y vuelva a iniciar
- **Conflicto entre rol y permisos personalizados**: Revise la configuración de permisos
- **Cambios recientes no sincronizados**: Espere unos minutos para que los cambios se propaguen

## Preguntas Frecuentes

**P: ¿Puedo tener dos usuarios con el mismo correo electrónico?**
R: No, el correo electrónico es el identificador único de cada usuario en el sistema.

**P: ¿Qué sucede con los datos asociados cuando elimino un usuario?**
R: Dependiendo de la configuración, los datos pueden ser eliminados, anonimizados o reasignados a otro usuario. Por esta razón, se recomienda desactivar usuarios en lugar de eliminarlos.

**P: ¿Cómo puedo ver qué usuarios están actualmente conectados?**
R: En la sección "Usuarios activos" del panel de administración puede ver todos los usuarios con sesiones activas.

**P: ¿Puedo cambiar el correo electrónico de un usuario existente?**
R: No, el correo electrónico es el identificador único y no puede ser modificado. Si necesita cambiar el correo, deberá crear un nuevo usuario y transferir los datos.

**P: ¿Cómo puedo forzar a un usuario a cambiar su contraseña?**
R: En la vista de detalles del usuario, active la opción "Forzar cambio de contraseña". La próxima vez que el usuario inicie sesión, se le solicitará crear una nueva contraseña.

## Soporte Técnico

Si encuentra problemas o tiene preguntas adicionales sobre el Módulo de Usuarios, contacte al equipo de soporte técnico:

- **Correo electrónico**: soporte@luenser.com
- **Teléfono**: (XX) XXXX-XXXX
- **Horario de atención**: Lunes a Viernes, 9:00 AM - 6:00 PM

---

*Última actualización: Abril 2025*
\`\`\`

```service file="src/regimen-fiscal/regimen-fiscal.service"
... This file was left out for brevity. Assume it is correct and does not need any modifications. ...
