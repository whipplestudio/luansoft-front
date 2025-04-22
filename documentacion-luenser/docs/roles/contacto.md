# Documentación para Usuarios con Rol de Contacto

## Introducción

Este documento describe los módulos y funcionalidades disponibles para los usuarios con el rol de **Contacto** en el sistema de gestión fiscal de Luenser. El rol de Contacto está diseñado para proporcionar acceso limitado al sistema, permitiendo a los contactos de clientes visualizar información específica relacionada con sus procesos fiscales.

## Resumen de Permisos

Como usuario con rol de Contacto, usted tiene acceso limitado al sistema con los siguientes permisos:

| Módulo | Ver | Crear | Editar | Eliminar |
|--------|-----|-------|--------|----------|
| Dashboard | ✅ | ❌ | ❌ | ❌ |
| Histórico de Procesos | ✅ | ❌ | ❌ | ❌ |
| Otros módulos | ❌ | ❌ | ❌ | ❌ |

## Módulos Accesibles

### 1. Dashboard

**Ubicación:** Página principal (inicio) del sistema

**Descripción:** El Dashboard le proporciona una vista general de la información relevante para usted como contacto. Aquí podrá visualizar:

- **Resumen de procesos:** Estadísticas básicas de los procesos asociados a su cuenta
- **Calendario fiscal:** Visualización de fechas clave para sus obligaciones fiscales

**Funcionalidades disponibles:**
- Ver estadísticas y gráficos relacionados con sus procesos
- Filtrar información por diferentes criterios

**Limitaciones:**
- No puede modificar ningún dato visualizado
- No puede crear nuevos registros
- No puede eliminar información existente

### 2. Histórico de Procesos

**Ubicación:** Menú lateral > Histórico de Procesos

**Descripción:** Este módulo le permite consultar el historial de todos los procesos fiscales asociados a su cuenta. Aquí podrá:

- Ver el listado completo de procesos históricos
- Consultar el estado y resultado de cada proceso
- Visualizar fechas de inicio y finalización
- Acceder a documentos relacionados (si están disponibles para su visualización)

**Funcionalidades disponibles:**
- Filtrar procesos por fecha, tipo o estado
- Ordenar la lista según diferentes criterios
- Ver detalles específicos de cada proceso
- Descargar documentos autorizados (si están disponibles)

**Limitaciones:**
- Solo puede ver procesos asociados a su cuenta
- No puede modificar ninguna información
- No puede crear nuevos procesos
- No puede eliminar registros históricos

## Flujos de Trabajo Comunes

### Consultar el Estado de un Proceso

1. Inicie sesión en el sistema con sus credenciales
2. En el Dashboard, visualice el resumen de procesos activos
3. Para más detalles, vaya a "Histórico de Procesos" en el menú lateral
4. Utilice los filtros para encontrar el proceso específico
5. Haga clic en el proceso para ver sus detalles completos

### Revisar Documentos Asociados a un Proceso

1. Acceda al módulo "Histórico de Procesos"
2. Localice el proceso que contiene los documentos que desea revisar
3. Haga clic en el proceso para ver sus detalles
4. En la sección de "Documentos", encontrará los archivos disponibles para su visualización
5. Haga clic en el nombre del documento para abrirlo o en el ícono de descarga para guardarlo localmente

### Verificar Fechas Importantes

1. En el Dashboard, consulte el widget de "Calendario Fiscal"
2. Las fechas próximas estarán resaltadas para su atención
3. Haga clic en una fecha específica para ver más detalles sobre las obligaciones correspondientes

## Consejos y Mejores Prácticas

- **Revise regularmente el Dashboard:** Le ayudará a mantenerse informado sobre fechas importantes y el estado de sus procesos.
- **Descargue y guarde documentos importantes:** Aunque puede acceder a ellos en cualquier momento, es recomendable mantener copias locales de documentos críticos.
- **Utilice los filtros:** Le ayudarán a encontrar rápidamente la información que necesita, especialmente si tiene muchos procesos históricos.

## Preguntas Frecuentes

**P: ¿Puedo ver información de otros contactos o clientes?**
R: No, como usuario con rol de Contacto, solo puede ver información relacionada con su cuenta y los procesos asociados a ella.

**P: ¿Cómo puedo solicitar cambios en la información que veo?**
R: Deberá contactar directamente con su contador asignado o con el administrador del sistema para solicitar cualquier modificación.

**P: ¿Puedo subir documentos al sistema?**
R: El rol de Contacto no tiene permisos para subir documentos. Deberá enviar los documentos a su contador por los canales establecidos.

**P: ¿Qué debo hacer si no puedo ver algún proceso que debería estar disponible?**
R: Contacte con su contador asignado o con soporte técnico para verificar la configuración de permisos de su cuenta.

**P: ¿Puedo cambiar mi contraseña?**
R: Sí, todos los usuarios pueden cambiar su contraseña desde la opción de perfil, independientemente de su rol.

## Soporte Técnico

Si encuentra algún problema o tiene preguntas adicionales sobre el uso del sistema con su rol de Contacto, por favor contacte al equipo de soporte técnico:

- **Correo electrónico:** soporte@luenser.com
- **Teléfono:** (XX) XXXX-XXXX
- **Horario de atención:** Lunes a Viernes, 9:00 AM - 6:00 PM

También puede contactar directamente con su contador asignado para resolver dudas específicas sobre sus procesos fiscales.

---

*Nota: Esta documentación está sujeta a cambios según las actualizaciones del sistema. Última actualización: Abril 2025.*
\`\`\`




```service file="src/regimen-fiscal/regimen-fiscal.service"
... This file was left out for brevity. Assume it is correct and does not need any modifications. ...
