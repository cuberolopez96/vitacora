Title: Crear docker-compose mínimo (app + db)

Descripción

Crear `docker-compose.dev.yml` que permita levantar la app y una DB (MariaDB) para desarrollo local/CI.

Estimación: M (8–16h)
Labels: MVP, ops, docker

Criterios de aceptación
- `docker-compose -f docker-compose.dev.yml up --build` levanta los servicios y la API responde en /api/healthz.
- Variables env configurables mediante .env y .env.sample.
- Volúmenes persistentes para datos DB y backups.

Pasos sugeridos
1. Escribir docker-compose.dev.yml con servicios: app (build backend/), db (mariadb:10.6), adminer (opcional).
2. Añadir .env.sample con variables de ejemplo.
3. Documentar en README comandos para levantar y migrar.

Notas
- Proveer instrucciones para usar SQLite en local si se prefiere (sin MariaDB).
