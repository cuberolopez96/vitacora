# Tareas - Vitacora (v0.1.0)

Fecha: 2026-06-13
Responsable principal: cuberolopez96

Resumen: Lista de Epics y tareas accionables, dependency-ordered y priorizadas para empezar Sprint 1 hoy. Cada tarea incluye: id (kebab-case), título corto, estimate (S/M/L con equivalencia en horas en el plan), dependencias (por id), responsable (mantenedor único), criterio de aceptación (1 línea) y notas de implementación (1–2 líneas).

---

## Epics

- Epic: MVP core (Backend & DB)
  - Descripción: API mínima, modelo de datos y migraciones, DB y scaffolding para permitir crear/visualizar/registrar hábitos.

- Epic: Frontend & PWA
  - Descripción: Interfaz React mínima con Vite, PWA (service worker) y páginas para listar/crear/marcar hábitos.

- Epic: Backups & Scheduler
  - Descripción: Worker ligero para tareas programadas y scripts de backup/restore verificables.

- Epic: Seguridad & Ops
  - Descripción: TLS/reverse-proxy guía, auth local opt‑in, env.samples y configuración para RPi/VPS.

- Epic: Packaging & Deploy
  - Descripción: Dockerfiles, docker-compose (dev/producción), y optimizaciones para RPi/VPS.

- Epic: QA & CI
  - Descripción: Tests unitarios/ integración/E2E y workflow de GitHub Actions mínimo.

- Epic: Docs & Release
  - Descripción: Quickstart RPi/VPS, release checklist, CHANGELOG y guía de verificación post‑release.

---

## Epic: MVP core (Backend & DB)

1) id: init-project
   - título: Inicializar repositorio y scaffolding
   - estimate: S (3–6h)
   - dependencias: (ninguna)
   - responsable: cuberolopez96
   - criterio de aceptación: Repo con package.json, scripts (install, dev, build), estructura inicial backend/frontend y README básico.
   - notas: Ejecutar `npm init -y` en backend/ y frontend/; crear README y .gitignore. Usar TypeScript opcional.

2) id: db-migrations
   - título: Configurar esquema y migraciones (User/Habit/Entry/Backup)
   - estimate: M (8–16h)
   - dependencias: init-project
   - responsable: cuberolopez96
   - criterio de aceptación: migrations/ con script que crea tablas User/Habit/Entry/Backup ejecutable en la BD configurada (SQLite por defecto y MySQL/MariaDB opcional); incluir test de migración para ambos motores.
   - notas: Recomendar usar Knex o TypeORM migrations; incluir comando `npm run migrate` en backend package.json.

3) id: api-habits-crud
   - título: Implementar endpoints CRUD para /api/habits
   - estimate: M (8–16h)
   - dependencias: db-migrations
   - responsable: cuberolopez96
   - criterio de aceptación: GET/POST/PUT/DELETE /api/habits funcionan y pueden probarse con curl ejemplos.
   - notas: Fastify + rutas en backend/src/routes/habits.js (o .ts). Añadir validación de payload y pruebas manuales con curl.

4) id: api-entries-crud
   - título: Implementar endpoints para registros diarios (/api/entries)
   - estimate: S (3–6h)
   - dependencias: db-migrations
   - responsable: cuberolopez96
   - criterio de aceptación: POST /api/entries y GET /api/entries?date= crean y listan registros correctamente.
   - notas: Ruta backend/src/routes/entries.js; validar unicidad (habit_id, date) según data-model.

5) id: api-export
   - título: Implementar endpoint /api/export (CSV/JSON) y tests
   - estimate: S (4–8h)
   - dependencias: api-entries-crud
   - responsable: cuberolopez96
   - criterio de aceptación: GET /api/export?format=csv|json devuelve 200 y descarga archivo válido; incluir prueba de integración y E2E.
   - notas: Implementar streaming CSV/JSON, manejar rangos y filtros; añadir tests E2E.

6) id: docker-compose-minimal
   - título: Crear docker-compose mínimo (app + db)
   - estimate: M (8–16h)
   - dependencias: init-project, db-migrations
   - responsable: cuberolopez96
   - criterio de aceptación: `docker-compose up --build` levanta app y db y `curl http://localhost:PORT/api/healthz` retorna 200.
   - notas: Incluir servicio db (mariadb/mysql), variables env en .env.sample; ejemplo `docker-compose.dev.yml`.

6) id: frontend-basic
   - título: Primer UI React mínimo (listar/crear/marcar hábitos)
   - estimate: S (3–6h)
   - dependencias: api-habits-crud, api-entries-crud, docker-compose-minimal
   - responsable: cuberolopez96
   - criterio de aceptación: Interfaz permite crear hábito y marcarlo; la acción persiste en la DB y se refleja en UI.
   - notas: Vite + React en frontend/; crear una página `src/pages/home.jsx` con llamadas fetch a la API.

---

## Epic: Frontend & PWA

7) id: pwa-setup
   - título: Integrar Vite + React y configurar Service Worker (PWA)
   - estimate: M (8–16h)
   - dependencias: frontend-basic
   - responsable: cuberolopez96
   - criterio de aceptación: La app puede instalarse como PWA y carga en modo offline las vistas básicas.
   - notas: Usar Workbox o la plantilla Vite PWA; añadir manifest.json y registro de service worker.

8) id: offline-sync
   - título: Implementar cola local (IndexedDB) y reconciliación básica
   - estimate: M (8–16h)
   - dependencias: pwa-setup, api-entries-crud
   - responsable: cuberolopez96
   - criterio de aceptación: Crear registro offline y sincronizarlo correctamente cuando vuelve la conexión.
   - notas: Usar idb/keyval o una librería ligera; documentar flujo en README.

9) id: ui-stats-and-history
   - título: Panel de historial diario y rachas
   - estimate: M (8–16h)
   - dependencias: frontend-basic, api-entries-crud
   - responsable: cuberolopez96
   - criterio de aceptación: Estadísticas básicas (frecuencia, rachas) calculadas y visibles en UI.
   - notas: Implementar utilitarios en frontend/src/utils/stats.js; pruebas manuales con datos seed.

---

## Epic: Backups & Scheduler

10) id: worker-scheduler
    - título: Implementar worker Node.js para scheduler (node-cron)
    - estimate: M (8–16h)
    - dependencias: docker-compose-minimal
    - responsable: cuberolopez96
    - criterio de aceptación: Worker en contenedor ejecuta tareas programadas y expone /healthz.
    - notas: Contenedor separado worker/, añadir servicio en docker-compose; usar node-cron y health endpoint.

11) id: backup-script
    - título: Script de backup (mysqldump + gzip + checksum)
    - estimate: M (8–16h)
    - dependencias: worker-scheduler
    - responsable: cuberolopez96
    - criterio de aceptación: Ejecutar script crea backup comprimido con checksum y lo lista en tabla backups.
    - notas: scripts/backup.sh (bash) y scripts/backup.ps1 (opcional). Incluir ejemplo `docker exec mysql_container mysqldump ...`.

12) id: backup-ui-and-restore
    - título: UI/ops para listar backups y restauración manual
    - estimate: M (8–16h)
    - dependencias: backup-script
    - responsable: cuberolopez96
    - criterio de aceptación: Se puede descargar backup y restaurarlo en entorno limpio siguiendo instrucciones.
    - notas: Endpoint /api/backups y página en frontend/ops/backups.jsx; documentar pasos restore en docs/.

---

## Epic: Security & Ops

13) id: auth-local-optin
    - título: Implementar autenticación local opt‑in (bcrypt + JWT/cookies)
    - estimate: M (8–16h)
    - dependencias: db-migrations
    - responsable: cuberolopez96
    - criterio de aceptación: Activar auth obliga a login; desactivar permite modo single-user (configurable en .env).
    - notas: Añadir middleware auth en backend/src/middleware/auth.js; usar bcrypt y emitir JWT o cookie firmada.

14) id: tls-and-reverse-proxy-doc
    - título: Documentar TLS y ejemplo con Caddy (o nginx + certbot)
    - estimate: S (3–6h)
    - dependencias: docker-compose-minimal
    - responsable: cuberolopez96
    - criterio de aceptación: Documentación con docker-compose ejemplo para Caddy y pasos para obtener TLS.
    - notas: docs/tls.md con `docker-compose.caddy.yml` ejemplo; incluir Caddyfile básico.

15) id: env-samples-and-secrets
    - título: Crear .env.sample y notas de manejo de secrets
    - estimate: S (3–6h)
    - dependencias: init-project
    - responsable: cuberolopez96
    - criterio de aceptación: .env.sample incluido y docs con instrucciones de variables necesarias.
    - notas: Incluir MYSQL_ROOT_PASSWORD, DB_NAME, JWT_SECRET, BACKUP_PATH, etc.

---

## Epic: Packaging & Deploy

16) id: dockerfiles-and-optimizations
    - título: Dockerfiles multi-stage y optimización de imágenes
    - estimate: M (8–16h)
    - dependencias: init-project, frontend-basic
    - responsable: cuberolopez96
    - criterio de aceptación: Dockerfiles para backend/fronted construyen imágenes funcionales y preferiblemente <200MB (si posible).
    - notas: Multi-stage builds, reducir devDependencies y limpiar cache; probar `docker build`.

17) id: docker-compose-prod
    - título: docker-compose producción (Caddy/nginx + app + db + worker)
    - estimate: M (8–16h)
    - dependencias: dockerfiles-and-optimizations, tls-and-reverse-proxy-doc
    - responsable: cuberolopez96
    - criterio de aceptación: `docker-compose -f docker-compose.prod.yml up --build` deja sistema operativo y documentado para VPS.
    - notas: Variables de entorno y volúmenes persistentes; ejemplo en docs/quickstart.md.

---

## Epic: QA & CI

18) id: unit-and-integration-tests
    - título: Añadir tests unitarios e integración básicos (Jest)
    - estimate: M (8–16h)
    - dependencias: api-habits-crud, api-entries-crud
    - responsable: cuberolopez96
    - criterio de aceptación: Tests de modelos y utilitarios pasan localmente (`npm test`).
    - notas: Configurar jest, scripts `test` y `test:integration`; usar docker-compose test DB.

19) id: e2e-playwright
    - título: Configurar E2E (Playwright) para flujo crítico
    - estimate: M (8–16h)
    - dependencias: frontend-basic, docker-compose-minimal
    - responsable: cuberolopez96
    - criterio de aceptación: E2E que cubre crear hábito → marcar → export pasa en CI/local.
    - notes: Añadir tests/e2e/ y job en GitHub Actions para ejecutarlos.

20) id: ci-workflow
    - título: Crear GitHub Actions workflow mínimo (build + tests)
    - estimate: S (3–6h)
    - dependencias: unit-and-integration-tests
    - responsable: cuberolopez96
    - criterio de aceptación: Workflow `.github/workflows/ci.yml` ejecuta install, build y tests en push/PR.
    - notas: Incluir servicio mysql (mariadb) en workflow per plan.md example.

---

## Epic: Docs & Release

21) id: quickstart-rpi-vps
    - título: Quickstart para RPi/VPS (docs/quickstart.md)
    - estimate: M (8–16h)
    - dependencias: docker-compose-prod, tls-and-reverse-proxy-doc
    - responsable: cuberolopez96
    - criterio de aceptación: Guía paso a paso <=60 minutos para desplegar en RPi/VPS y verificar /healthz.
    - notas: Incluir recomendaciones swap/zram, volumes y restauración desde backup.

22) id: release-checklist
    - título: Preparar checklist de release y CHANGELOG
    - estimate: S (3–6h)
    - dependencias: ci-workflow, unit-and-integration-tests
    - responsable: cuberolopez96
    - criterio de aceptación: CHECKLIST que incluye tests CI verificados, build images y pasos para tag/push.
    - notas: Añadir CHANGELOG.md y comandos sugeridos para tag y push (ver plan.md).

---

## Sprint 1 — Tareas listadas (priorizadas para empezar hoy)

Las siguientes tareas son prioridad para Sprint 1 (MVP core). Marcar y ejecutar en el orden dado; pueden iniciarse paralelamente donde las dependencias lo permitan.

- [X] init-project — Inicializar repositorio y scaffolding (S)
- [X] db-migrations — Configurar esquema y migraciones (M)
- [X] api-habits-crud — Implementar endpoints CRUD para /api/habits (M)
- [X] api-entries-crud — Implementar endpoints para registros diarios (S)
- [X] docker-compose-minimal — Crear docker-compose mínimo (M)
- [X] frontend-basic — Primer UI React mínimo (S)

## Automated progress (agent run 2026-06-13)

- [X] pwa-setup — Integrar Vite + PWA y configurar Service Worker
- [X] offline-sync — Implementar cola local y reconciliación básica
- [X] ui-stats-and-history — Añadir utilitarios de estadísticas (streaks, frecuencia)
- [X] worker-scheduler — Añadir worker ligero con /healthz
- [X] backup-script — Añadir scripts/backup.sh y scripts/backup.ps1

---

## Dependencias y orden de ejecución (resumen)

1. init-project -> db-migrations
2. db-migrations -> api-habits-crud, api-entries-crud
3. init-project, db-migrations -> docker-compose-minimal
4. api-habits-crud, api-entries-crud, docker-compose-minimal -> frontend-basic
5. docker-compose-minimal -> worker-scheduler -> backup-script -> backup-ui-and-restore
6. db-migrations -> auth-local-optin

---

## Notas generales de implementación

- Todas las tareas tienen como responsable único a `cuberolopez96` (mantenedor). Ajustar si se incorpora colaboración externa.
- Estimaciones siguen el plan.md: S = 3–6h, M = 8–16h, L = 24–40h.
- Para RPi preferir MariaDB image y optimizaciones de memoria; documentar alternativas SQLite para instalaciones ultraligeras.
- Comandos útiles:
  - Iniciar dev backend: `cd backend && npm install && npm run dev`
  - Ejecutar migraciones: `cd backend && npm run migrate`
  - Levantar local: `docker-compose -f docker-compose.dev.yml up --build`

---

## Conteo y validación

- Total epics: 7
- Total tareas generadas: 22
- Sprint 1 tareas: 6

Todas las tareas son concisas y contienen rutas/artefactos sugeridos; pueden copiarse y pegarse como cuerpo de issue. Si desea que convierta cada tarea en un issue markdown completo (template con checklist, pasos de verificación y comandos), puedo generarlos uno por uno.
