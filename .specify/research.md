Research: decisiones técnicas para Vitacora

Fecha: 2026-06-13

Resumen
-------
Documento breve que recoge las decisiones de investigación tomadas durante el plan temprano: stack recomendado, alternativas y razones. Está pensado para referencia del mantenedor y para incluir en .specify/research.md.

Decisiones principales
---------------------
- Stack recomendado (selección actual):
  - Backend: Node.js (v18+) con Fastify — razón: framework ligero, alto rendimiento y ecosistema amplio.
  - Frontend: React + Vite (PWA) — razón: facilidad para PWA, tooling rápido y familiaridad.
  - Worker/scheduler: Worker Node.js separado (node-cron o bull-lite) en contenedor propio.

- Base de datos:
  - Motor por defecto: MySQL (puede usarse MariaDB en RPi para compatibilidad). Razón: decisión del mantenedor y facilidad de migración desde MySQL; buen soporte en infra VPS.
  - Alternativa ligera: SQLite para instalaciones ultra‑ligeras y single‑user; documentar proceso de migración si se elige SQLite para prototipos.

- Backups:
  - Estrategia: mysqldump + gzip + checksum + rotación (7 copias por defecto). Almacenar localmente o vía SFTP/rsync según configuración del usuario.

- Reverse proxy / TLS:
  - Recomendado: Caddy (renovación automática TLS). Alternativa: nginx + certbot o configuración manual de certificados.

- Notificaciones / Scheduler:
  - Scheduler interno en contenedor (worker). Evitar dependencia en cron del host para consistencia en Docker Compose y facilidad de despliegue en RPi.

Alternativas y compensaciones
----------------------------
- Go como backend: ventaja en footprint y binario único; coste adicional en tiempo de desarrollo si el mantenedor no lo domina.
- Python (FastAPI): ventaja en productividad; considerar si mantenedor prefiere Python.
- SQLite por defecto: mínimo de dependencias y fácil para RPi; limita multiusuario y concurrencia.

Riesgos identificados
---------------------
- RPi con recursos limitados: mitigar usando MariaDB optimizado, límites de memoria en containers, y opción SQLite para pruebas locales.
- Notificaciones web: complejidad entre navegadores; planificar fallbacks (notificaciones locales) y marcar push como mejora progresiva.

Recomendaciones operativas rápidas
---------------------------------
- Usar MariaDB en RPi y MySQL en VPS si se busca consistencia con el ecosistema del mantenedor.
- Mantener scripts de backup y restore versionados en scripts/backup.sh.
- Documentar claramente la opción SQLite como camino alternativo y proporcionar scripts de migración.

Referencias rápidas
-------------------
- Caddy: https://caddyserver.com
- node-cron: https://www.npmjs.com/package/node-cron
- mysqldump: https://dev.mysql.com/doc/refman/en/mysqldump.html


