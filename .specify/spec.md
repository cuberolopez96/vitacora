# Especificación inicial: Vitacora (v0.1.0)

Fecha: 2026-06-12

Resumen
-------
Vitacora es una plataforma self-hosted para el control de hábitos personal. Permite registro diario de hábitos, visualización de estadísticas, recordatorios, exportación de historial (CSV/JSON) y backups automáticos. Diseñada para un mantenedor único y despliegue sencillo en Raspberry Pi o VPS.

Misión
------
Ofrecer a usuarios individuales una herramienta ligera, privada y fácil de desplegar para seguir y mejorar sus hábitos, con control total sobre sus datos y opciones de exportación y copia de seguridad.

Usuarios objetivo
-----------------
- Persona individual que desea seguimiento de hábitos sin depender de servicios externos.
- Mantenedor único responsable del despliegue y operación (Raspberry Pi o VPS).
- Usuarios ocasionales que necesitan PWA con capacidades offline.

Alcance (qué incluye)
----------------------
- Registro diario de hábitos (marcar como hecho/no hecho, comentarios opcionales).
- Panel de estadísticas básicas (frecuencia, rachas, tendencias simples).
- Recordatorios configurables por hábito (notificaciones locales / push según plataforma).
- Exportación del historial en CSV y JSON.
- Backups automáticos programables y restauración sencilla.
- Opcional: autenticación local (activable) y cifrado en reposo opcional.
- PWA con soporte offline básico.

Fuera de alcance (MVP)
----------------------
- Integraciones multiusuario complejas y roles avanzados (se pueden añadir más adelante).
- Integraciones con servicios externos por defecto (telemetría deshabilitada).

Requisitos clave (testables)
----------------------------
1. Despliegue: Se puede ejecutar con Docker Compose en un VPS o Raspberry Pi con 2GB RAM.
2. Offline: La PWA permite registrar hábitos sin conexión y sincronizar cuando haya conectividad.
3. Exportación: Usuarios pueden exportar todo su historial como CSV y JSON desde la interfaz.
4. Backups: El sistema realiza backups automáticos programados que pueden descargarse o almacenarse localmente. Debe soportar procedimientos de backup/restore para SQLite (archivo .db + WAL) y para MySQL/MariaDB (mysqldump).
5. Seguridad: TLS para comunicación; opción para cifrado en reposo y autenticación activable.
6. Peso y dependencias: Instalación ligera; seleccionar por defecto una base de datos embebida (SQLite) para instalaciones personales.
7. Eliminación de datos: Los usuarios deben poder solicitar y ejecutar la eliminación irreversible de sus datos personales (API/endpoint), y esta operación deberá estar cubierta por pruebas y por logs de auditoría.

MVP Checklist
-------------
- [ ] UI básica para marcar hábitos y ver historial diario
- [ ] PWA instalado y funcionando en modo offline básico
- [ ] Exportar historial en CSV y JSON desde la UI
- [ ] Backups automáticos configurables y restauración manual
- [ ] Docker Compose para despliegue simple (documentado para RPi/VPS)
- [ ] TLS habilitado en la guía de despliegue (Let's Encrypt o instrucciones)
- [ ] Opcional: autenticación activable (registro/login local)

Criterios de aceptación (medibles)
----------------------------------
- Un mantenedor puede desplegar la aplicación en una Raspberry Pi (4/2GB) o VPS con 2GB RAM siguiendo la guía en ≤60 minutos.
- Usuarios pueden completar el registro de un hábito y marcarlo en ≤30 segundos desde la pantalla principal.
- Al menos el 95% de las exportaciones (CSV/JSON) generan archivos válidos que incluyen todo el historial solicitado.
- Backups automáticos aparecen en la ubicación configurada y una restauración completa se puede completar en ≤10 minutos para una base de datos de 50MB.

Entidades clave (datos)
-----------------------
- Usuario (opcional): id, nombre, correo (opcional), preferencia de autenticación
- Hábito: id, nombre, descripción, periodicidad, recordatorio (hora/fecha), metadata
- Registro diario (Entry): id, fecha, estado ( campo técnico: `status` — enum: `completed` | `missed` | `skip` ), nota.
  - Notas: en la UI los valores se muestran como "completado" / "omitido" / "no aplica"; la API y la BD usarán los tokens estables anteriores (usar english tokens por compatibilidad con migraciones y tests).
  - Regla de unicidad: (habit_id, date) unique
- Backup: timestamp, origen, tamaño, checksum

Decisiones técnicas recomendadas (orientativas)
-----------------------------------------------
- Mecanismo de despliegue principal: Docker Compose (fácil para mantenedor único). Kubernetes documentado como opción avanzada.
- Base de datos por defecto: SQLite para instalaciones personales (bajo mantenimiento). Soporte opcional para Postgres en despliegues multiusuario.
- PWA + Service Worker para capacidades offline (sin dependencias externas para sincronización básica).
- Interfaz y API: Mantener separada la capa de datos y la UI para facilitar backups y exportación.

Notas operativas para Raspberry Pi / VPS
---------------------------------------
- Requisitos mínimos: Raspberry Pi 4 (2GB), o VPS con 2GB RAM y 10GB disco.
- Recomendaciones: habilitar swap zram si el sistema lo soporta; mantener backups fuera del SDCard en RPi (disco USB o servidor remoto).
- TLS: usar un proxy inverso (nginx/caddy) para gestionar certificados Let’s Encrypt; documentar cómo configurar certificados manualmente para entornos sin acceso a Internet.
- Backups: programar con cron dentro del contenedor o en el host; conservar al menos 7 backups rotativos.
- Restauración: documentar pasos para detener servicio, reemplazar archivo de BD y arrancar.

Suposiciones
-----------
- Mantenedor dispone de conocimientos básicos de Docker y SSH.
- Los usuarios valoran la privacidad y prefieren opciones self-hosted.

Notas adicionales
----------------
- Mantener la documentación de despliegue y un quickstart específico para Raspberry Pi y VPS en docs/quickstart.md.
- Registrar las decisiones arquitectónicas en RFCs cuando impliquen cambios de compatibilidad.

Clarificaciones y decisiones recientes
-------------------------------------
- Modelo de usuarios (decisión 2026-06-12): Instalación orientada a un único mantenedor/usuario. Autenticación local opcional para proteger el acceso; no se requiere multiusuario en el MVP.
- Licencia (decisión 2026-06-12): MIT — licencia permisiva para facilitar adopción y despliegue en entornos personales.
- Persistencia (decisión 2026-06-12): SQLite por defecto para instalaciones personales; MySQL/MariaDB opcional para despliegues multiusuario. Documentar migraciones y trade‑offs entre opciones.
- Cifrado en reposo (decisión 2026-06-12): Opt‑in — cifrado documentado y activable; por defecto deshabilitado para facilitar recuperación en dispositivos con recursos limitados.
- Recordatorios (decisión 2026-06-12): Scheduler interno ligero en contenedor; soportar notificaciones locales y PWA push. Documentar cómo ejecutar el worker con Docker Compose.

Firma
-----
Mantenedor principal: cuberolopez96
