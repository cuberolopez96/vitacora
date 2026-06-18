# Vitacora — Sprint 1 (Fundación)

Proyecto minimal para un habit tracker self-hosted.

Quickstart (local, rápido):

1. Copia el archivo de entorno y edita valores si es necesario:

   copy .env.sample .env  # Windows Powershell: Copy-Item .env.sample .env

2. Instalar dependencias (backend y frontend):

   cd backend
   npm install

   cd ../frontend
   npm install

3. (Opcional) Levantar servicios con Docker Compose (usa MariaDB):

   docker compose -f docker-compose.dev.yml up --build

4. Ejecutar migraciones (desde backend/):

   cd backend
   npm run migrate
   npm run seed

5. Ejecutar en desarrollo:

   # backend
   npm run dev

   # frontend (en otra terminal)
   cd frontend
   npm run dev

Endpoints principales:
- POST /api/habits
- GET /api/habits
- PUT /api/habits/:id
- DELETE /api/habits/:id
- POST /api/habits/:id/entries
- GET /api/entries?date=
- GET /api/habits/:id/entries
- GET /api/export?format=csv|json
- GET /api/healthz

Ejemplos curl (bash / PowerShell):

# Health check
curl -f http://localhost:8080/api/healthz

# Crear un hábito
curl -X POST http://localhost:8080/api/habits \
  -H "Content-Type: application/json" \
  -d '{"name":"Leer 30 minutos","description":"Leer antes de dormir","periodicity":"daily"}'

# Listar hábitos
curl http://localhost:8080/api/habits

# Marcar un registro para hoy (reemplaza <HABIT_ID>)
curl -X POST http://localhost:8080/api/habits/<HABIT_ID>/entries \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-06-13","status":"completed"}'

# Exportar historial (CSV)
curl -s -o export.csv "http://localhost:8080/api/export?format=csv&start=2026-06-01&end=2026-06-13"

Notas:
- Reemplaza <HABIT_ID> por el id real devuelto al crear el hábito.
- Los ejemplos usan JSON; en PowerShell reemplaza comillas simples por comillas dobles o usa --% para pasar literales.
- Estos comandos son ejemplos rápidos para desarrollo; agrega autenticación si la habilitas.

Notas:
- Implementación mínima y conservadora para Sprint 1. Ver TODOs en código para ampliaciones (autenticación, tests, validación, docs, etc.)

Política de merges:
- La rama main requiere que el check de CI "Image size check" pase antes de mergear.
- No se requieren aprobaciones de PR (required_approving_review_count = 0); el propietario del repositorio puede fusionar PRs cuando los checks pasen.
- Para cambios importantes (p. ej. seguridad, esquemas de BD, encriptación), se recomienda abrir PR y solicitar una revisión antes de mergear, aunque la política no la exija.

Si quieres cambiar esta política, contacta al mantenedor del repositorio.
