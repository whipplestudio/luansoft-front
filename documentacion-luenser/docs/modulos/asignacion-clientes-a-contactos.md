# Módulo de Asignación de Clientes a Contactos

## Introducción

El módulo de Asignación de Clientes a Contactos es una herramienta fundamental dentro del sistema de gestión fiscal de Luenser que permite establecer relaciones entre los contactos registrados en el sistema y los clientes a los que representan o con los que están vinculados. Esta asignación es crucial para garantizar una comunicación efectiva y un seguimiento adecuado de los procesos fiscales.

Este módulo utiliza una interfaz intuitiva de arrastrar y soltar (drag and drop) que facilita la asignación visual de clientes a contactos específicos, permitiendo una gestión eficiente de estas relaciones incluso cuando se manejan grandes volúmenes de datos.

## Propósito y Alcance

### Objetivo Principal

El objetivo principal de este módulo es permitir a los administradores y usuarios autorizados establecer, modificar y eliminar relaciones entre contactos y clientes de manera eficiente y visual, garantizando que cada cliente tenga asignados los contactos correctos para la comunicación y seguimiento de sus procesos fiscales.

### Casos de Uso Principales

- **Asignación inicial de clientes**: Cuando se incorpora un nuevo contacto al sistema, se utiliza este módulo para asignarle los clientes correspondientes.
- **Reasignación de clientes**: Cuando un contacto cambia de responsabilidades o deja de representar a ciertos clientes.
- **Revisión de asignaciones**: Para verificar qué clientes están asignados a cada contacto y viceversa.
- **Gestión de múltiples contactos por cliente**: Cuando un cliente tiene varios contactos con diferentes roles o responsabilidades.
- **Transferencia de responsabilidades**: Cuando las responsabilidades de un contacto deben transferirse a otro.

## Acceso al Módulo

### Ubicación en el Sistema

El módulo de Asignación de Clientes a Contactos se encuentra en la sección principal del sistema, accesible desde el menú lateral izquierdo bajo la opción "Asignación de Contactos".

### Permisos Requeridos

El acceso a este módulo está restringido según el rol del usuario:

| Rol | Ver | Crear | Editar | Eliminar |
|-----|-----|-------|--------|----------|
| Administrador | ✅ | ✅ | ✅ | ✅ |
| Contador | ❌ | ❌ | ❌ | ❌ |
| Dashboard | ❌ | ❌ | ❌ | ❌ |
| Contacto | ❌ | ❌ | ❌ | ❌ |

Si un usuario intenta acceder a este módulo sin los permisos adecuados, será redirigido a la página de inicio o se le mostrará un mensaje indicando que no tiene permisos suficientes.

## Interfaz del Módulo

La interfaz del módulo de Asignación de Clientes a Contactos está diseñada para ser intuitiva y eficiente, dividida en varias secciones principales:

### 1. Selector de Contacto

En la parte superior de la pantalla, encontrará un selector desplegable que permite elegir el contacto con el que desea trabajar. Este selector incluye:

- **Campo de búsqueda**: Permite filtrar la lista de contactos por nombre, correo electrónico o empresa.
- **Lista desplegable**: Muestra todos los contactos disponibles en el sistema.
- **Información básica**: Al seleccionar un contacto, se muestra información básica como nombre, correo electrónico y empresa.

### 2. Panel de Clientes Asignados

En el lado izquierdo de la pantalla, se muestra un panel con todos los clientes actualmente asignados al contacto seleccionado. Este panel incluye:

- **Título del panel**: "Clientes Asignados"
- **Contador de clientes**: Muestra el número total de clientes asignados.
- **Campo de búsqueda**: Permite filtrar la lista de clientes asignados.
- **Lista de clientes**: Muestra cada cliente con su nombre, tipo (Persona Física/Moral) y régimen fiscal.
- **Indicadores visuales**: Iconos que muestran el estado o tipo de cada cliente.

### 3. Panel de Clientes Disponibles

En el lado derecho de la pantalla, se muestra un panel con todos los clientes que no están asignados al contacto seleccionado. Este panel incluye:

- **Título del panel**: "Clientes Disponibles"
- **Contador de clientes**: Muestra el número total de clientes disponibles.
- **Campo de búsqueda**: Permite filtrar la lista de clientes disponibles.
- **Lista de clientes**: Muestra cada cliente con su nombre, tipo (Persona Física/Moral) y régimen fiscal.
- **Indicadores visuales**: Iconos que muestran el estado o tipo de cada cliente.

### 4. Área de Arrastrar y Soltar

El espacio entre ambos paneles funciona como área de interacción para arrastrar y soltar clientes de un panel a otro. Esta área incluye:

- **Indicadores visuales**: Cuando se arrastra un cliente, se muestran indicadores que señalan dónde se puede soltar.
- **Animaciones**: Efectos visuales que facilitan la comprensión del proceso de arrastre.
- **Mensajes de confirmación**: Al soltar un cliente, se muestra un mensaje de confirmación antes de realizar la acción.

### 5. Barra de Herramientas

En la parte inferior de la pantalla, se encuentra una barra de herramientas con acciones adicionales:

- **Botón de Guardar**: Guarda todos los cambios realizados en la sesión actual.
- **Botón de Cancelar**: Descarta todos los cambios realizados en la sesión actual.
- **Botón de Ayuda**: Muestra información de ayuda sobre cómo utilizar el módulo.

## Operaciones Principales

### Seleccionar un Contacto

Para comenzar a trabajar con el módulo, primero debe seleccionar el contacto con el que desea trabajar:

1. Haga clic en el selector desplegable en la parte superior de la pantalla.
2. Utilice el campo de búsqueda para encontrar rápidamente un contacto específico (opcional).
3. Seleccione el contacto deseado de la lista.
4. La interfaz se actualizará automáticamente para mostrar los clientes asignados y disponibles para ese contacto.

**Ejemplo**: Si desea trabajar con el contacto "Juan Pérez", puede escribir "Pérez" en el campo de búsqueda y luego seleccionarlo de los resultados filtrados.

### Visualizar Clientes Asignados

Una vez seleccionado un contacto, puede ver todos los clientes que ya tiene asignados:

1. Observe el panel izquierdo titulado "Clientes Asignados".
2. Revise la lista de clientes que aparecen en este panel.
3. Utilice el campo de búsqueda para filtrar la lista si necesita encontrar un cliente específico.
4. Cada cliente muestra información básica como nombre, tipo y régimen fiscal.

**Información mostrada por cliente**:
- **Nombre del cliente**: Nombre completo o razón social.
- **Tipo de cliente**: Persona Física o Persona Moral (indicado con un icono).
- **Régimen fiscal**: Abreviatura del régimen fiscal al que pertenece.
- **Estado**: Activo, Inactivo, En proceso (indicado con un código de color).

### Visualizar Clientes Disponibles

Para ver qué clientes están disponibles para asignar al contacto seleccionado:

1. Observe el panel derecho titulado "Clientes Disponibles".
2. Revise la lista de clientes que aparecen en este panel.
3. Utilice el campo de búsqueda para filtrar la lista si necesita encontrar un cliente específico.
4. Cada cliente muestra la misma información básica que en el panel de clientes asignados.

### Asignar Clientes a un Contacto

Para asignar un cliente a un contacto, utilice la funcionalidad de arrastrar y soltar:

1. Identifique el cliente que desea asignar en el panel de "Clientes Disponibles".
2. Haga clic y mantenga presionado el mouse sobre la tarjeta del cliente.
3. Arrastre el cliente hacia el panel de "Clientes Asignados".
4. Cuando el cliente esté sobre el panel de destino, suelte el botón del mouse.
5. Aparecerá un diálogo de confirmación preguntando si desea asignar el cliente al contacto.
6. Haga clic en "Confirmar" para completar la asignación o en "Cancelar" para abortar la operación.
7. Si confirma, el cliente se moverá automáticamente al panel de "Clientes Asignados".

**Nota importante**: La asignación se guarda automáticamente en el sistema una vez confirmada. No es necesario guardar los cambios manualmente después de cada asignación.

### Desasignar Clientes de un Contacto

Para desasignar un cliente de un contacto, el proceso es similar pero en dirección opuesta:

1. Identifique el cliente que desea desasignar en el panel de "Clientes Asignados".
2. Haga clic y mantenga presionado el mouse sobre la tarjeta del cliente.
3. Arrastre el cliente hacia el panel de "Clientes Disponibles".
4. Cuando el cliente esté sobre el panel de destino, suelte el botón del mouse.
5. Aparecerá un diálogo de confirmación preguntando si desea desasignar el cliente del contacto.
6. Haga clic en "Confirmar" para completar la desasignación o en "Cancelar" para abortar la operación.
7. Si confirma, el cliente se moverá automáticamente al panel de "Clientes Disponibles".

### Buscar y Filtrar Contactos

Para encontrar rápidamente un contacto específico:

1. Haga clic en el selector desplegable de contactos.
2. Utilice el campo de búsqueda para filtrar la lista.
3. Puede buscar por:
   - Nombre del contacto
   - Apellido del contacto
   - Correo electrónico
   - Empresa
   - Teléfono

**Ejemplos de búsqueda**:
- Para encontrar todos los contactos de una empresa específica, escriba el nombre de la empresa.
- Para encontrar un contacto por su correo, escriba parte de la dirección de correo electrónico.

### Buscar y Filtrar Clientes

Para encontrar rápidamente clientes específicos en cualquiera de los dos paneles:

1. Utilice el campo de búsqueda ubicado en la parte superior de cada panel.
2. Escriba el término de búsqueda deseado.
3. La lista se filtrará automáticamente para mostrar solo los clientes que coincidan con el término de búsqueda.
4. Puede buscar por:
   - Nombre del cliente
   - RFC
   - Régimen fiscal
   - Tipo de cliente

**Ejemplos de búsqueda**:
- Para encontrar todos los clientes que son personas físicas, escriba "física".
- Para encontrar clientes por su régimen fiscal, escriba la abreviatura del régimen (ej. "RESICO").

## Funcionalidades Avanzadas

### Asignación Masiva de Clientes

Para asignar múltiples clientes a un contacto simultáneamente:

1. En el panel de "Clientes Disponibles", mantenga presionada la tecla Ctrl (o Cmd en Mac).
2. Haga clic en cada cliente que desea seleccionar.
3. Una vez seleccionados todos los clientes deseados, haga clic derecho sobre cualquiera de ellos.
4. Seleccione la opción "Asignar seleccionados" del menú contextual.
5. Confirme la acción en el diálogo que aparece.
6. Todos los clientes seleccionados se moverán al panel de "Clientes Asignados".

### Gestión de Contactos Principales y Secundarios

Cuando un cliente tiene múltiples contactos asignados, puede designar contactos principales y secundarios:

1. Asigne el cliente a todos los contactos necesarios utilizando el procedimiento estándar.
2. Vaya al módulo de "Clientes" y seleccione el cliente específico.
3. En la sección de "Contactos Asignados", verá todos los contactos vinculados al cliente.
4. Utilice la opción "Establecer como principal" para designar un contacto como el principal.
5. Los demás contactos se considerarán automáticamente como secundarios.

**Nota**: El contacto principal será el destinatario predeterminado de todas las comunicaciones relacionadas con el cliente, mientras que los contactos secundarios recibirán copias según la configuración del sistema.

### Resolución de Conflictos de Asignación

En ocasiones, pueden surgir conflictos cuando se intenta asignar un cliente a un contacto que no debería tener acceso a él. El sistema maneja estos casos de la siguiente manera:

1. Si intenta asignar un cliente a un contacto con restricciones de acceso, aparecerá un diálogo de advertencia.
2. El diálogo explicará la naturaleza del conflicto y las posibles soluciones.
3. Tendrá las siguientes opciones:
   - Cancelar la asignación
   - Proceder con la asignación (solo disponible para administradores)
   - Solicitar aprobación para la asignación (crea una notificación para un administrador)

## Integración con Otros Módulos

El módulo de Asignación de Clientes a Contactos está estrechamente integrado con otros módulos del sistema:

### Integración con el Módulo de Contactos

- Los contactos disponibles en este módulo se gestionan desde el módulo de Contactos.
- Cualquier cambio en la información de un contacto se refleja automáticamente en este módulo.
- La desactivación de un contacto en el módulo de Contactos afecta su disponibilidad en este módulo.

### Integración con el Módulo de Clientes

- Los clientes disponibles en este módulo se gestionan desde el módulo de Clientes.
- Cualquier cambio en la información de un cliente se refleja automáticamente en este módulo.
- La desactivación de un cliente en el módulo de Clientes afecta su disponibilidad en este módulo.

### Flujo de Trabajo Completo

Un flujo de trabajo típico que involucra este módulo podría ser:

1. Se crea un nuevo contacto en el módulo de Contactos.
2. Se accede al módulo de Asignación de Clientes a Contactos.
3. Se selecciona el nuevo contacto y se le asignan los clientes correspondientes.
4. Cuando el contacto accede al sistema, solo ve información de los clientes que tiene asignados.

## Mejores Prácticas

Para obtener el máximo beneficio de este módulo, recomendamos seguir estas mejores prácticas:

### Organización de Asignaciones

- **Asigne contactos por área de responsabilidad**: Agrupe las asignaciones según las responsabilidades específicas de cada contacto.
- **Mantenga un número manejable de clientes por contacto**: Evite asignar demasiados clientes a un solo contacto para prevenir sobrecarga.
- **Revise periódicamente las asignaciones**: Establezca un calendario para revisar y actualizar las asignaciones regularmente.

### Eficiencia en la Gestión

- **Utilice la búsqueda y filtros**: Aproveche las funcionalidades de búsqueda para encontrar rápidamente contactos y clientes.
- **Aprenda los atajos de teclado**: Familiarícese con los atajos de teclado para agilizar las operaciones.
- **Realice asignaciones masivas cuando sea posible**: Para grandes volúmenes de asignaciones, utilice la funcionalidad de asignación masiva.

### Seguridad y Cumplimiento

- **Verifique las asignaciones críticas**: Confirme dos veces las asignaciones para clientes con información sensible o procesos críticos.
- **Documente los cambios importantes**: Mantenga un registro de los cambios significativos en las asignaciones.
- **Respete las políticas de privacidad**: Asegúrese de que las asignaciones cumplan con las políticas de privacidad y acceso a la información.

## Solución de Problemas Comunes

### Problema: Un cliente no aparece en la lista de disponibles

**Posibles causas y soluciones**:
1. **El cliente está inactivo**: Verifique el estado del cliente en el módulo de Clientes.
2. **El cliente ya está asignado al contacto**: Revise el panel de Clientes Asignados.
3. **Hay un filtro activo**: Limpie cualquier término de búsqueda en el campo de filtro.
4. **Problema de permisos**: Verifique que tiene los permisos necesarios para ver ese cliente.

### Problema: No se puede arrastrar un cliente

**Posibles causas y soluciones**:
1. **Problema de interfaz**: Actualice la página para refrescar la interfaz.
2. **Cliente bloqueado**: El cliente puede estar en un estado que impide su asignación.
3. **Permisos insuficientes**: Verifique que tiene permisos para modificar asignaciones.
4. **Conflicto de datos**: Otro usuario puede estar modificando el mismo contacto simultáneamente.

### Problema: Los cambios no se guardan

**Posibles causas y soluciones**:
1. **Problema de conexión**: Verifique su conexión a internet.
2. **Sesión expirada**: Inicie sesión nuevamente en el sistema.
3. **Error del servidor**: Contacte al soporte técnico si el problema persiste.
4. **Conflicto de datos**: Otro usuario puede haber realizado cambios que entran en conflicto.

## Preguntas Frecuentes

### Generales

**P: ¿Puedo asignar un cliente a múltiples contactos?**
R: Sí, un cliente puede estar asignado a tantos contactos como sea necesario. Cada contacto tendrá acceso a la información del cliente según sus permisos.

**P: ¿Las asignaciones se guardan automáticamente?**
R: Sí, cada vez que asigna o desasigna un cliente, el cambio se guarda automáticamente en el sistema después de la confirmación.

### Técnicas

**P: ¿Por qué algunos clientes aparecen en gris en la lista?**
R: Los clientes en gris están inactivos o en un estado que limita su asignación. Pase el cursor sobre el cliente para ver más detalles.

**P: ¿Existe un límite de clientes que puedo asignar a un contacto?**
R: No hay un límite técnico, pero por razones de rendimiento y gestión eficiente, recomendamos mantener un número manejable de clientes por contacto.

**P: ¿Puedo exportar la lista de asignaciones?**
R: Actualmente, la exportación directa desde este módulo no está disponible. Sin embargo, puede generar reportes de asignaciones desde el módulo de Reportes.

### Permisos

**P: ¿Quién puede modificar las asignaciones de clientes a contactos?**
R: Solo los usuarios con rol de Administrador tienen permisos para acceder y modificar las asignaciones en este módulo.

**P: ¿Los contactos pueden ver a qué clientes están asignados?**
R: Sí, los contactos pueden ver la lista de clientes que tienen asignados, pero no pueden modificar estas asignaciones.

**P: ¿Los contadores pueden modificar las asignaciones de contactos?**
R: No, los contadores no tienen acceso a este módulo. Solo pueden ver qué contactos están asignados a sus clientes desde el módulo de Clientes.

## Soporte Técnico

Si encuentra problemas al utilizar el módulo de Asignación de Clientes a Contactos o tiene preguntas adicionales, puede contactar al equipo de soporte técnico:

- **Correo electrónico**: soporte@luenser.com
- **Teléfono**: (XX) XXXX-XXXX
- **Horario de atención**: Lunes a Viernes, 9:00 AM - 6:00 PM

Al reportar un problema, por favor incluya:
- Una descripción detallada del problema
- Los pasos para reproducirlo
- Capturas de pantalla si es posible
- Información sobre su navegador y sistema operativo

---

*Nota: Esta documentación está sujeta a cambios según las actualizaciones del sistema. Última actualización: Abril 2025.*
\`\`\`

```service file="src/regimen-fiscal/regimen-fiscal.service"
... This file was left out for brevity. Assume it is correct and does not need any modifications. ...
