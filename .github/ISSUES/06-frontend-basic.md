Title: Primer UI React mínimo (listar/crear/marcar hábitos)

Descripción

Implementar un frontend mínimo con Vite + React que permita listar hábitos, crear uno nuevo y marcar el hábito del día.

Estimación: S (3–6h)
Labels: MVP, frontend, pwa

Criterios de aceptación
- Página principal con lista de hábitos y botón para crear uno nuevo.
- Posibilidad de marcar el hábito como completado para la fecha actual; acción persiste en backend.
- Consumo de API mediante fetch a los endpoints implementados.
- Servido localmente con `npm run dev` en 5173.

Pasos sugeridos
1. Inicializar Vite React app en frontend/.
2. Implementar componentes: HabitList, HabitForm, TodayMark.
3. Conectar a backend; manejar errores básicos.

Notas
- PWA y service worker se implementan en Sprint 2. Mantener UI simple y accesible.
