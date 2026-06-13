Title: Configurar esquema y migraciones (User/Habit/Entry/Backup)

Descripción

Configurar migraciones reproducibles para crear las tablas principales (users, habits, entries, backups) soportando SQLite por defecto y MySQL/MariaDB opcional.

Estimación: M (8–16h)
Labels: MVP, backend, db

Criterios de aceptación
- `backend/migrations/` contiene migración que crea las tablas según data-model.
- `npm run migrate` aplica migraciones en SQLite (local) y MySQL (cuando DB_CLIENT=mysql).
- Incluye un test de migración que verifica la existencia de tablas en ambos motores (script de integración ligera).

Pasos sugeridos
1. Añadir Knex (o chosen migration tool) y knexfile.js con configuración para sqlite/mysql.
2. Escribir migración 0001_create_tables.
3. Añadir seed inicial (ej. 1 hábito de ejemplo).
4. Documentar comando `npm run migrate`.

Notas
- Usar UUIDs (crypto.randomUUID()) para ids por compatibilidad con futuras sincronizaciones.
