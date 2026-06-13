Title: Implementar endpoints CRUD para /api/habits

Descripción

Implementar API REST mínima para gestionar hábitos: crear, listar, actualizar y borrar.

Estimación: M (8–16h)
Labels: MVP, backend, api

Criterios de aceptación
- Endpoints implementados: POST /api/habits, GET /api/habits, PUT /api/habits/:id, DELETE /api/habits/:id.
- POST devuelve 201 con body JSON que incluye id; GET devuelve lista que incluye el nuevo registro.
- Validación básica de payload (nombre requerido, max 255 chars).
- Tests de integración que cubran el flujo CRUD.

Pasos sugeridos
1. Añadir ruta en backend/src/routes/habits.js y conectarla al servidor.
2. Usar Knex para operaciones DB.
3. Añadir tests de integración básicos (curl scripts o Jest).

Notas
- Mantener respuestas JSON y códigos HTTP estándar (201 para creación, 200/204 para actualizaciones/eliminación).
