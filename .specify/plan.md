# Plan de implementación: Vitacora (v0.1.0)

Fecha: 2026-06-13  
Spec: .specify/spec.md

Resumen ejecutivo
-----------------
Vitacora es una plataforma self-hosted ligera para control de hábitos dirigida a usuarios individuales y mantenedores únicos que despliegan en Raspberry Pi o VPS. Este plan ofrece un roadmap accionable de 12 semanas (12 sprints semanales) optimizado para un mantenedor trabajando 20–30 h/semana. Prioriza un MVP funcional (registro/visualización, export, PWA offline, backups), seguridad básica (TLS, autenticación local opt‑in) y operabilidad (Docker Compose, documentación para RPi).

Decisiones clave (resueltas)
- Stack recomendado: Backend Node.js + Fastify (ligero), Frontend React + Vite (PWA), Service Worker para offline.
- Persistencia: SQLite por defecto para instalaciones personales; MySQL/MariaDB opcional para despliegues multiusuario. Proporcionar scripts y documentación para migración desde SQLite cuando sea necesario.
- Scheduler: worker Node.js (node-cron) en contenedor separado ligero.
- Backups: mysqldump/compressed tar con rotación configurable y verificación checksum.
- Reverse proxy: Caddy (recomendado para TLS automatico) o nginx+certbot si se prefiere.

Equivalencias de estimación
- S = Pequeña = 3–6 h
- M = Mediana = 8–16 h
- L = Grande = 24–40 h

Roadmap 12 semanas (epics/hitos principales)
--------------------------------------------
Hitos principales:
1. MVP básico (UI registro/marcado, API, DB, PWA offline)
2. Backups y restauración automáticos
3. PWA y notificaciones (service worker + push)
4. Seguridad y ops (TLS, auth local opt‑in, docs RPi/VPS)
5. QA/CI y tests E2E
6. Documentación y release v0.1.0

Sprint semanal — resumen (12 sprints)
- Sprint 1-4: MVP core (backend API, DB, frontend mínimo, PWA offline)
- Sprint 5: Backups + worker scheduling
- Sprint 6: Exports CSV/JSON + restore flow
- Sprint 7: Auth local opt‑in + security basics
- Sprint 8: PWA improvements + notifications (push)
- Sprint 9: Docker Compose, RPi tweaks, ops scripts
- Sprint 10: Tests (unit, integración, E2E) + CI
- Sprint 11: Docs, quickstart RPi/VPS, smoke tests
- Sprint 12: Release v0.1.0, post-release verificación

Sprints detallados (tareas por sprint)
--------------------------------------
Nota: Responsable para todas las tareas: mantenedor único (you / cuberolopez96). Cada tarea incluye dependencias y criterio de aceptación. 6–8 tareas por sprint máximo.

Sprint 1 — Fundación: API y modelo de datos básicos
- 1.1 Inicializar repo y scaffolding (S, 4h)
  - Artefactos: estructura src/, backend/ frontend/ tests/
  - Dependencias: ninguna
  - Aceptación: repo con scripts npm/yarn (install, dev), README inicial
  - Comando/artefacto esperado: package.json, tsconfig o node setup
- 1.2 Modelado de datos y migraciones básicas (M, 12h)
  - Artefactos: migrations/, schema.sql
  - Dependencias: 1.1
  - Aceptación: migración que crea tablas User/Habit/Entry/Backup ejecutable en MySQL/MariaDB
  - Comando: npm run migrate (o script equivalente)
- 1.3 API CRUD para hábitos (M, 12h)
  - Endpoints: GET/POST/PUT/DELETE /habits
  - Dependencias: 1.2
  - Aceptación: endpoints probados con curl (ejemplos incluidos)
- 1.4 API para registros diarios (S, 6h)
  - Endpoints: POST /entries, GET /entries?date=
  - Aceptación: crear y listar registros
- 1.5 Configuración de entorno local con Docker Compose minimal (M, 12h)
  - Artefacto: docker-compose.yml (service: app, db, reverse-proxy opcional)
  - Aceptación: docker-compose up --build levanta app + db y la API responde
- 1.6 Primer UI básico (S, 6h)
  - Artefacto: frontend minimal React con página para listar/crear/ marcar hábitos
  - Aceptación: usuario puede marcar hábito desde UI y se persiste en DB

Sprint 2 — PWA y sincronización offline (core)
- 2.1 Integración Vite + React y Service Worker básico (M, 12h)
  - Aceptación: la app puede instalarse como PWA y funcionar offline para crear marcas locales
- 2.2 Sincronización simple: cola local y reconciliación (M, 12h)
  - Estrategia: IndexedDB para cache de acciones y reintento en online
  - Aceptación: crear registro en offline y sincronizar cuando vuelva conexión
- 2.3 UI: historial diario + rachas (M, 12h)
  - Aceptación: estadísticas básicas visibles y calculadas correctamente
- 2.4 Endpoints para export (M, 10h)
  - Artefacto: /export?format=csv|json
  - Aceptación: descarga válida con datos de ejemplo
- 2.5 Tests unitarios básicos para frontend/backend (S, 4h)
  - Aceptación: tests que cubren modelos y utilitarios básicos

Sprint 3 — Exports, import y UX polish
- 3.1 Export CSV/JSON robusto (M, 10h)
  - Aceptación: archivos válidos, correctos headers, manejo de caracteres y tamaños
- 3.2 Import/reconciling (opcional para MVP) (S, 6h)
  - Aceptación: importar CSV con validación básica
- 3.3 Mejoras UI/UX + accesibilidad mínima (M, 10h)
  - Aceptación: navegación usable, botones claros, pruebas manuales
- 3.4 Preparar tasks para E2E (S, 4h)
  - Aceptación: casos básicos listados (crear hábito, marcar, exportar, backup/restore)

Sprint 4 — Logging, healthchecks y configuración
- 4.1 Endpoint healthz + métricas simples (S, 4h)
  - Aceptación: /healthz retorna 200 y estado DB
- 4.2 Logging estructurado y rotación recomendada (M, 10h)
  - Aceptación: logs en stdout + archivo opcional; doc de rotación
- 4.3 Configuración env y secrets (S, 4h)
  - Aceptación: ejemplos env.sample y documentación de variables
- 4.4 Documentar arquitectura MVP en README y spec (S, 6h)

Sprint 5 — Backups y scheduler (worker)
- 5.1 Implementar worker de scheduler (M, 12h)
  - Artefacto: worker container usando node-cron con endpoint de salud
  - Aceptación: programar y ejecutar tareas de recordatorio y backups
- 5.2 Script de backup (M, 12h)
  - Estrategia: mysqldump + gzip + checksum + rotación (7 backups por defecto)
  - Aceptación: ejecutar script crea backup verificable
- 5.3 UI/ops: gestión de backups y restauración (M, 12h)
  - Aceptación: UI o instrucción para descargar y restaurar backup en host de prueba

Sprint 6 — Restore, documentación ops y compatibilidad RPi
- 6.1 Flujo de restauración (M, 10h)
  - Aceptación: restaurar backup en entorno limpio y validar datos
- 6.2 Documentación específica RPi/VPS (M, 12h)
  - Aceptación: quickstart RPi, recomendaciones swap/zram, guardar en docs/quickstart.md
- 6.3 Test de carga mínima y validación en RPi (S, 6h)
  - Aceptación: ejemplo de despliegue en RPi con 2GB y comprobación básica

Sprint 7 — Autenticación local y seguridad
- 7.1 Implementar auth local opt‑in (M, 12h)
  - Estrategia: bcrypt, sesiones JWT o cookie signed, opción desactivar para single-user
  - Aceptación: activar auth obliga login; desactivar permite modo single-user
- 7.2 Revisar TLS y reverse proxy (S, 8h)
  - Aceptación: guía para Caddy/Let's Encrypt; ejemplo docker-compose con Caddy
- 7.3 Revisar permisos y almacenamiento de secrets (S, 6h)
  - Aceptación: doc y variables de entorno

Sprint 8 — Notificaciones PWA y recordatorios
- 8.1 Notificaciones push web (M, 16h)
  - Aceptación: registrar suscripciones push y enviar notificación de recordatorio
- 8.2 Notificaciones locales y compatibilidad mobile (S, 8h)
  - Aceptación: PWA muestra notificaciones en Android/desktop compatibles
- 8.3 Worker: retries y gestión de fallos (S, 6h)

Sprint 9 — Packaging y deploy
- 9.1 Dockerfiles y optimización de imagen (M, 12h)
  - Aceptación: imágenes <200MB si es posible; multi-stage build
- 9.2 docker-compose.yml final y ejemplo de producción para VPS (M, 12h)
  - Aceptación: docker-compose up --build deja sistema operacional
- 9.3 Instrucciones para Kubernetes (documentado como opcional) (S, 6h)

Sprint 10 — Pruebas y CI
- 10.1 Tests unitarios y de integración (M, 16h)
  - Aceptación: cobertura mínima del código crítico (p. ej. modelos y API)
- 10.2 E2E tests (playwright/cypress) (M, 16h)
  - Aceptación: E2E que cubra flujo crítico (crear hábito → marcar → export)
- 10.3 GitHub Actions workflow mínimo (S, 6h) — ver sección QA

Sprint 11 — Documentación y quickstart
- 11.1 quickstart.md para RPi y VPS (M, 12h)
  - Aceptación: guía paso a paso ≤60 minutos en una RPi 2GB
- 11.2 Documentación de backup/restore y seguridad (M, 10h)
- 11.3 Smoke tests automatizados (S, 6h)

Sprint 12 — Release v0.1.0
- 12.1 Checklist de release y tagging (S, 4h)
  - Aceptación: tag v0.1.0 creado y push de release artifacts
- 12.2 Build/push de imágenes docker (S, 6h)
- 12.3 Verificación post-release en RPi/VPS (M, 12h)
  - Aceptación: despliegue replicado y verificación checklist completa

Entregables por hito
--------------------
- MVP: backend (src/backend), frontend (src/frontend), docker-compose.yml, migrations, especificación .specify/spec.md actualizada
- Backups: scripts/backup.sh, worker container image, documentación restore
- PWA: service worker, manifest.json, pruebas offline
- Seguridad/ops: docker-compose-prod.yml (Caddy/nginx), env.sample, TLS guide
- Docs/release: docs/quickstart.md (RPi/VPS), CHANGELOG, release tag v0.1.0
- QA: tests unitarios, integración, E2E, GitHub Actions workflow
- Artifacts adicionales: imágenes Docker, release notes, sample DB dump (sanitizado)

Plan de QA y pruebas + CI
-------------------------
Estrategia:
- Unit: Jest (frontend/backend) o equivalentes — ejecutan lógica de negocio.
- Integración: pruebas que arrancan DB MySQL via docker-compose test y prueban endpoints.
- E2E: Playwright or Cypress que prueban flujo crítico.
- Smoke: un job de CI que arranca servicios y valida /healthz y export básica.

Ejemplo mínimo GitHub Actions (workflow.yaml):
(archivo: .github/workflows/ci.yml)
name: CI

on: [push, pull_request]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mariadb:10.6
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: vitacora_test
        ports: ['3306:3306']
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install
        run: npm ci
      - name: Build
        run: npm run build --if-present
      - name: Unit tests
        run: npm test --silent
      - name: Integration / Smoke
        run: npm run test:integration --silent
      # Optional: build image and publish to registry (on release)

Plan de despliegue y release (v0.1.0)
-------------------------------------
Pre-release
- Actualizar CHANGELOG.md
- Asegurar tests unitarios/integración/E2E pasan en CI
- Actualizar docs/quickstart.md y README
- Bump version en package.json / metadata

Checklist de release
- [ ] Tests pasan en CI
- [ ] docker images build correctamente
- [ ] docs/quickstart.md incluye pasos para RPi/VPS
- [ ] Backup script probado y verificado
- [ ] Tag y release notes listos

Comandos de tagging y publicación (sugeridos)
- Crear tag local:
  - git tag -a v0.1.0 -m "Release v0.1.0"
  - git push origin v0.1.0
- Build/push image (ejemplo docker hub):
  - docker build -t youruser/vitacora:0.1.0 .
  - docker push youruser/vitacora:0.1.0

Verificación post-release
- Desplegar docker-compose en un host limpio (RPi o VPS) y ejecutar quickstart checklist:
  - docker-compose up -d
  - curl -f http://localhost:PORT/healthz
  - Crear hábito, marcar y exportar
  - Ejecutar restore desde backup

Riesgos principales y mitigaciones
----------------------------------
1. Riesgo: Recursos limitados en RPi (ALTA)
   - Mitigación: usar MariaDB ligero; limitar memoria de contenedores; ofrecer modo SQLite para instalaciones muy ligeras (documentado como alternativa).
2. Riesgo: Complejidad de push notifications en navegadores (MEDIO)
   - Mitigación: documentar fallbacks (recordatorios locales con worker); marcar push como mejora progresiva.
3. Riesgo: Mantenedor único — deuda técnica (ALTA)
   - Mitigación: priorizar documentación, tests y scripts de mantenimiento; mantener scope reducido para MVP.
4. Riesgo: TLS en entornos sin Internet (MEDIO)
   - Mitigación: documentar proceso para certificados manuales y configuración de Caddy/nginx sin Let's Encrypt.

Recomendaciones operativas y política de mantenimiento semanal
--------------------------------------------------------------
- Monitorización ligera:
  - Health endpoint (/healthz), logs a stdout, y un script simple de comprobación (cron) que notifica si /healthz falla.
- Backups:
  - Ejecutar backup diario; conservar 7 rotativos; verificar checksum semanal.
- Rotación de logs:
  - Usar logrotate en host o montar volumen y rotar con configuración (guardar 14 días).
- Política semanal (rutina del mantenedor, ~1–2 h/semana):
  - Verificar backups (1x), actualizar dependencias críticas (1x), revisar issues y backlog (1x).
- Política de seguridad:
  - Revisar dependencias y CVEs mensualmente; priorizar parches críticos.

Research (Phase 0) — decisiones y alternativas (resolver NEEDS CLARIFICATION)
-----------------------------------------------------------------------------
Decision: Stack principal
- Elegido: Node.js (18+) + Fastify para backend; React + Vite para frontend (PWA).
- Racional: ecosistema maduro, rápido desarrollo, buena compatibilidad con RPi, numerosas bibliotecas PWA y herramientas de bundling ligeras.
- Alternativas: Go (binario único, menor consumo) — buena alternativa si se desea binario único; Python (FastAPI) — igualmente válido si preferencia del mantenedor.

Decision: Base de datos
- Elegido: MySQL como motor por defecto; en RPi usar MariaDB (compatibilidad/paquetes).
- Racional: demanda del proyecto (usuario indicó MySQL), replicable en VPS; se proveen scripts para instalar MariaDB en RPi y para conversiones desde SQLite.
- Alternativas: SQLite para instalaciones personales ultra‑ligeras (documentado como opción de compatibilidad).

Decision: Scheduler/recordatorios
- Elegido: Worker Node.js ligero usando node-cron en contenedor separado.
- Racional: separado del servidor web para permitir reinicios independientes y escalar/aislar fallos.

Decision: TLS
- Elegido: Caddy como reverse-proxy recomendado (TLS automatico). Nginx+certbot como alternativa manual.
- Racional: Caddy simplifica mucho el mantenimiento de certificados.

Decision: Backups
- Estrategia: mysqldump + gzip + checksum; almacenar en host o remoto (sftp/rsync) según configuración del usuario.

Data model (data-model.md)
--------------------------
Entidades principales:
- User (opcional)
  - id (UUID)
  - username (string)
  - password_hash (string, bcrypt) — nullable si auth desactivada
  - email (nullable)
  - created_at, updated_at
- Habit
  - id (UUID)
  - user_id (nullable)
  - name (string)
  - description (string)
  - periodicity (enum: daily/weekly/custom)
  - reminder_time (time, nullable)
  - metadata (json, nullable)
  - created_at, updated_at
- Entry (Registro diario)
  - id (UUID)
  - habit_id (UUID)
  - date (date)
  - status (enum: completed/missed/skip)
  - note (text nullable)
  - created_at, updated_at
- Backup
  - id (UUID)
  - timestamp (datetime)
  - origin (string)
  - size_bytes (int)
  - checksum (string)
  - path (string)

Validaciones
- Habit.name required, max 255 chars
- Entry.date unique per habit per date
- Backup checksum validated at restore

Contracts (API) — sugerencia (carpetas /contracts/)
- Contract: REST JSON API
  - POST /api/habits {name, description, periodicity, reminder_time} -> 201 {habit}
  - GET /api/habits -> 200 [{habit}]
  - POST /api/habits/{id}/entries {date, status, note} -> 201 {entry}
  - GET /api/entries?start=&end= -> 200 [{entry}]
  - GET /api/export?format=csv|json -> 200 application/octet-stream
  - POST /api/auth/login -> 200 {token} (si auth activada)
  - GET /api/healthz -> 200 {status: ok}
  - Documentar en /contracts/openapi.yaml (opcional mínimo)

Quickstart (docs/quickstart.md) — resumen
- Prerequisitos: Docker, Docker Compose
- Comandos:
  - cp .env.sample .env && editar variables (DB_ROOT_PASSWORD, etc.)
  - docker-compose up -d --build
  - curl -f http://localhost:8080/healthz
  - Acceder a http://localhost:8080 en navegador, crear primer hábito
- RPi notes:
  - usar MariaDB image optimizada; evitar escribir en SD card (usar disco USB)

Actualización de contexto del agente (manual)
--------------------------------------------
Localiza `.github/copilot-instructions.md` y actualiza el bloque entre:
<!-- SPECKIT START -->
y
<!-- SPECKIT END -->

para apuntar a la ruta absoluta/repo-relative de este plan: `.specify/plan.md`

Ejemplo (fragmento que debes insertar entre markers):
<!-- SPECKIT START -->
.plan: .specify/plan.md
<!-- SPECKIT END -->

(GUARDAR CAMBIO manualmente si procede)

Gates y Constitution Check
--------------------------
- GATE: Debe confirmarse motor de BD (resuelto: MySQL/MariaDB).
- GATE: Debe aprobarse el uso de Node.js + React (resuelto en Research).
- Si alguna puerta queda violada por limitaciones del mantenedor o hardware, marcar y justificar (complejidad tracking).

Tareas siguientes y tareas no incluidas (scope)
----------------------------------------------
- Integraciones externas (p. ej. servicios de notificación externos) quedan fuera del MVP.
- Autenticación federada y multiusuario quedan fuera de v0.1.0.

