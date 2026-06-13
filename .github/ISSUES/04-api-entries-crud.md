Title: Implementar endpoints para registros diarios

Descripción

Implementar endpoints para crear y listar registros diarios (entries). Usar ruta anidada RESTful: POST /api/habits/{habitId}/entries y GET /api/entries?date=.

Estimación: S (3–6h)
Labels: MVP, backend, api

Criterios de aceptación
- POST /api/habits/{habitId}/entries crea registro con 201 y body JSON.
- GET /api/entries?date= devuelve registros filtrados por fecha; soportar filtros por habitId opcional.
- Se valida unicidad (habitId + date) y devuelve 409 en duplicado.
- Tests de integración que cubran crear y listar.

Pasos sugeridos
1. Implementar rutas en backend/src/routes/entries.js.
2. Añadir validaciones y manejo de errores (409 para duplicados).
3. Añadir test de integración.

Notas
- Usar enum status: completed|missed|skipped.
