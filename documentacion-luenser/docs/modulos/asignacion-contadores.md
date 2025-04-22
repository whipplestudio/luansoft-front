# Módulo de Asignación de Contadores

## Introducción

El módulo de Asignación de Contadores es una herramienta fundamental en el sistema de gestión fiscal de Luenser que permite administrar la relación entre contadores y clientes. Este módulo facilita la asignación y desasignación de clientes a contadores específicos, permitiendo una gestión eficiente de la carga de trabajo y responsabilidades.

## Propósito y Alcance

El propósito principal de este módulo es proporcionar una interfaz intuitiva para:

- Visualizar qué contadores están asignados a qué clientes
- Asignar nuevos clientes a contadores
- Reasignar clientes entre diferentes contadores
- Desasignar clientes de contadores
- Equilibrar la carga de trabajo entre el equipo de contadores

Este módulo es esencial para la operación diaria del despacho contable, ya que establece la base para la gestión de procesos fiscales y la responsabilidad sobre los expedientes de los clientes.

## Acceso al Módulo

### Permisos por Rol

| Rol | Ver | Crear | Editar | Eliminar |
|-----|-----|-------|--------|----------|
| Administrador | ✅ | ✅ | ✅ | ✅ |
| Contador | ✅ | ❌ | ❌ | ❌ |
| Dashboard | ❌ | ❌ | ❌ | ❌ |
| Contacto | ❌ | ❌ | ❌ | ❌ |

### Cómo Acceder

1. Inicie sesión en el sistema con sus credenciales
2. En el menú lateral, haga clic en la opción "Asignación de Contadores"
3. El sistema mostrará la interfaz principal del módulo

## Interfaz Principal

La interfaz del módulo de Asignación de Contadores está diseñada para ser intuitiva y eficiente, dividida en las siguientes secciones:

### Sección de Selección de Contador

- **Selector de Contador**: Desplegable que permite seleccionar el contador con el que se desea trabajar
- **Información del Contador**: Muestra datos básicos del contador seleccionado (nombre, número de clientes asignados, carga de trabajo)
- **Buscador de Contadores**: Permite filtrar la lista de contadores por nombre o ID

### Sección de Clientes Asignados

- **Lista de Clientes Asignados**: Muestra todos los clientes actualmente asignados al contador seleccionado
- **Buscador de Clientes Asignados**: Permite filtrar la lista de clientes asignados por nombre, RFC o régimen fiscal
- **Indicadores de Estado**: Muestra el estado actual de cada cliente (al día, en riesgo, atrasado)

### Sección de Clientes No Asignados

- **Lista de Clientes No Asignados**: Muestra todos los clientes que no están asignados a ningún contador o que están disponibles para asignación
- **Buscador de Clientes No Asignados**: Permite filtrar la lista de clientes no asignados
- **Indicadores de Prioridad**: Muestra la prioridad de asignación para cada cliente

## Operaciones Principales

### Seleccionar un Contador

1. Haga clic en el desplegable "Seleccionar Contador"
2. Busque el contador deseado escribiendo su nombre o ID
3. Seleccione el contador de la lista desplegable
4. El sistema actualizará automáticamente las listas de clientes asignados y no asignados

### Asignar Clientes a un Contador

#### Método de Arrastrar y Soltar

1. Seleccione el contador al que desea asignar clientes
2. En la sección de "Clientes No Asignados", identifique el cliente que desea asignar
3. Haga clic y mantenga presionado sobre la tarjeta del cliente
4. Arrastre la tarjeta hacia la sección de "Clientes Asignados"
5. Suelte el botón del mouse para completar la asignación
6. El sistema mostrará un diálogo de confirmación
7. Haga clic en "Confirmar" para finalizar la asignación

#### Método de Selección Múltiple

1. Seleccione el contador al que desea asignar clientes
2. En la sección de "Clientes No Asignados", marque las casillas de verificación de los clientes que desea asignar
3. Haga clic en el botón "Asignar Seleccionados"
4. El sistema mostrará un diálogo de confirmación
5. Haga clic en "Confirmar" para finalizar la asignación

### Desasignar Clientes de un Contador

#### Método de Arrastrar y Soltar

1. Seleccione el contador del que desea desasignar clientes
2. En la sección de "Clientes Asignados", identifique el cliente que desea desasignar
3. Haga clic y mantenga presionado sobre la tarjeta del cliente
4. Arrastre la tarjeta hacia la sección de "Clientes No Asignados"
5. Suelte el botón del mouse para completar la desasignación
6. El sistema mostrará un diálogo de confirmación
7. Haga clic en "Confirmar" para finalizar la desasignación

#### Método de Selección Múltiple

1. Seleccione el contador del que desea desasignar clientes
2. En la sección de "Clientes Asignados", marque las casillas de verificación de los clientes que desea desasignar
3. Haga clic en el botón "Desasignar Seleccionados"
4. El sistema mostrará un diálogo de confirmación
5. Haga clic en "Confirmar" para finalizar la desasignación

### Buscar y Filtrar

#### Buscar Contadores

1. Haga clic en el campo de búsqueda en la sección de selección de contador
2. Escriba el nombre o ID del contador que desea encontrar
3. El sistema filtrará la lista de contadores mientras escribe
4. Seleccione el contador deseado de los resultados filtrados

#### Filtrar Clientes Asignados

1. Haga clic en el campo de búsqueda en la sección de clientes asignados
2. Escriba el nombre, RFC o régimen fiscal del cliente que desea encontrar
3. El sistema filtrará la lista de clientes asignados mientras escribe
4. Opcionalmente, utilice los filtros avanzados para filtrar por:
   - Estado del cliente (al día, en riesgo, atrasado)
   - Tipo de cliente (persona física, persona moral)
   - Régimen fiscal

#### Filtrar Clientes No Asignados

1. Haga clic en el campo de búsqueda en la sección de clientes no asignados
2. Escriba el nombre, RFC o régimen fiscal del cliente que desea encontrar
3. El sistema filtrará la lista de clientes no asignados mientras escribe
4. Opcionalmente, utilice los filtros avanzados para filtrar por:
   - Tipo de cliente (persona física, persona moral)
   - Régimen fiscal
   - Prioridad de asignación

## Funcionalidades Avanzadas

### Visualización de Carga de Trabajo

El módulo proporciona una visualización gráfica de la carga de trabajo de cada contador, lo que permite:

- Identificar contadores con exceso de carga
- Identificar contadores con capacidad disponible
- Equilibrar la distribución de clientes entre contadores

Para acceder a esta visualización:

1. Haga clic en el botón "Ver Carga de Trabajo" en la parte superior de la interfaz
2. El sistema mostrará un gráfico comparativo de la carga de trabajo de todos los contadores
3. Utilice los filtros disponibles para ajustar la visualización según sus necesidades

### Asignación Masiva

Para situaciones en las que se necesita asignar múltiples clientes a varios contadores:

1. Haga clic en el botón "Asignación Masiva" en la parte superior de la interfaz
2. El sistema mostrará una interfaz especial para asignación masiva
3. Seleccione los contadores y clientes que desea incluir en la operación
4. Configure las reglas de asignación (por ejemplo, distribución equitativa, por tipo de cliente, etc.)
5. Haga clic en "Previsualizar" para ver cómo quedarían las asignaciones
6. Si está conforme, haga clic en "Aplicar Cambios"
7. Confirme la operación en el diálogo de confirmación

### Historial de Asignaciones

El sistema mantiene un registro completo de todas las asignaciones y desasignaciones realizadas:

1. Haga clic en el botón "Historial" en la parte superior de la interfaz
2. El sistema mostrará una tabla con todas las operaciones realizadas
3. Utilice los filtros disponibles para buscar operaciones específicas por:
   - Fecha
   - Contador
   - Cliente
   - Usuario que realizó la operación
   - Tipo de operación (asignación o desasignación)

## Integración con Otros Módulos

El módulo de Asignación de Contadores está estrechamente integrado con otros módulos del sistema:

### Integración con el Módulo de Contadores

- Los cambios en la información de los contadores se reflejan automáticamente en este módulo
- La carga de trabajo calculada en este módulo se refleja en el perfil del contador

### Integración con el Módulo de Clientes

- Los cambios en la información de los clientes se reflejan automáticamente en este módulo
- La asignación de un cliente a un contador se refleja en el perfil del cliente

### Integración con el Módulo de Procesos

- La asignación de un cliente a un contador determina qué procesos son responsabilidad de cada contador
- Los procesos de un cliente se transfieren automáticamente cuando el cliente es reasignado a otro contador

## Mejores Prácticas

Para obtener el máximo beneficio del módulo de Asignación de Contadores, recomendamos seguir estas mejores prácticas:

### Equilibrio de Carga

- Distribuya los clientes entre los contadores de manera equitativa, considerando:
  - Número total de clientes por contador
  - Complejidad de los regímenes fiscales de los clientes
  - Volumen de procesos asociados a cada cliente

### Especialización

- Considere asignar clientes a contadores según su especialización:
  - Régimen fiscal
  - Sector de actividad
  - Tamaño del cliente

### Revisión Periódica

- Revise regularmente las asignaciones para:
  - Identificar desequilibrios en la carga de trabajo
  - Reasignar clientes según sea necesario
  - Ajustar asignaciones cuando hay cambios en el personal

## Solución de Problemas Comunes

### El cliente no aparece en la lista de no asignados

**Posibles causas:**
- El cliente ya está asignado a otro contador
- El cliente está inactivo en el sistema
- El cliente ha sido eliminado

**Solución:**
1. Verifique si el cliente está asignado a otro contador utilizando el buscador global
2. Verifique el estado del cliente en el módulo de Clientes
3. Si el problema persiste, contacte al soporte técnico

### No se puede arrastrar un cliente para asignarlo

**Posibles causas:**
- Problemas de permisos
- Problemas técnicos con la interfaz de arrastrar y soltar
- El cliente tiene restricciones de asignación

**Solución:**
1. Verifique que tiene los permisos necesarios para realizar asignaciones
2. Intente refrescar la página
3. Intente utilizar el método de selección múltiple en lugar de arrastrar y soltar
4. Si el problema persiste, contacte al soporte técnico

### La carga de trabajo no se actualiza después de una asignación

**Posibles causas:**
- Retraso en la actualización de los cálculos
- Problema de caché del navegador
- Error en el sistema

**Solución:**
1. Espere unos minutos y refresque la página
2. Limpie la caché de su navegador
3. Cierre sesión y vuelva a iniciar sesión
4. Si el problema persiste, contacte al soporte técnico

## Preguntas Frecuentes

### ¿Puedo asignar un cliente a múltiples contadores?

No, en el sistema actual cada cliente solo puede estar asignado a un contador a la vez. Esto garantiza una clara línea de responsabilidad para cada cliente.

### ¿Qué sucede con los procesos cuando reasigno un cliente?

Cuando un cliente es reasignado de un contador a otro, todos sus procesos activos y futuros se transfieren automáticamente al nuevo contador. Los procesos históricos mantienen el registro del contador que los gestionó originalmente.

### ¿Cómo se calcula la carga de trabajo de un contador?

La carga de trabajo se calcula considerando:
- Número total de clientes asignados
- Número de procesos activos
- Complejidad de los regímenes fiscales de los clientes
- Fechas límite de los procesos pendientes

### ¿Puedo ver el historial de asignaciones de un cliente específico?

Sí, puede ver el historial de asignaciones de un cliente específico de dos maneras:
1. A través del historial general de asignaciones, filtrando por el cliente deseado
2. A través del perfil del cliente, en la sección "Historial de Asignaciones"

### ¿Los contadores pueden ver a qué clientes están asignados?

Sí, los contadores pueden ver la lista de clientes que tienen asignados a través de su dashboard personal y del módulo de clientes, aunque no pueden modificar estas asignaciones.

## Soporte Técnico

Si encuentra algún problema o tiene preguntas adicionales sobre el uso del módulo de Asignación de Contadores, por favor contacte al equipo de soporte técnico:

- **Correo electrónico:** soporte@luenser.com
- **Teléfono:** (XX) XXXX-XXXX
- **Horario de atención:** Lunes a Viernes, 9:00 AM - 6:00 PM

---

*Nota: Esta documentación está sujeta a cambios según las actualizaciones del sistema. Última actualización: Abril 2025.*
\`\`\`

```service file="src/regimen-fiscal/regimen-fiscal.service"
... This file was left out for brevity. Assume it is correct and does not need any modifications. ...
