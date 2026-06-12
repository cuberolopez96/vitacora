Constitución de Vitacora

Versión: 1.0.0 | Ratified: 2026-06-12

Misión
Crear una plataforma self-hosted, ligera y práctica para el control personal de hábitos: seguimiento diario, estadísticas, recordatorios y exportación clara de historial.

Principios
- Privacidad y control de datos: el usuario tiene control total; datos exportables y eliminables; sin telemetría por defecto.
- Simplicidad y ligereza: dependencias pequeñas, fácil despliegue en VPS y Raspberry Pi.
- Autonomía: soporte Docker Compose (mínimo) y Kubernetes (opcional); PWA y capacidades offline.
- Seguridad práctica: TLS en producción; cifrado en reposo opcional; autenticación opcional con hashing seguro.
- Auditabilidad: registros exportables con timestamps.

Reglas de decisión
- Priorizar features que reduzcan fricción de despliegue y consumo de recursos.
- Para decisiones ambiguas, escoger la opción con menor coste operativo para el mantenedor único.
- Breaking changes requieren RFC y plan de migración.

Governance
Mantenedor principal tiene decisión final. Cambios arquitectónicos requieren RFC, discusión pública y aprobación del mantenedor. Para equipos >1, aplicar mayoría simple para cambios marcados "major".

Deploy & Constraints
- Requisitos: Docker Compose, PWA, exportación CSV/JSON, backups automáticos, docs de despliegue en RPi.
- DB: SQLite por defecto para instalaciones personales; Postgres para multiusuario.

Licencia
- Opciones: MIT (permite wide adoption) o AGPL (protege que las modificaciones self-hosted permanezcan libres). Elegir MIT para mayor adopción; elegir AGPL si es prioridad que mejoras permanezcan libres en instancias publicadas.

MVP Checklist
- Registro y tracking diario de hábitos
- Exportación CSV/JSON
- Deploy reproducible con Docker Compose + quickstart RPi/VPS
- PWA instalable con cache básico
- Backups automáticos y restauración documentada

Mandatos clave
- Datos exportables siempre
- No telemetría por defecto
- Documentar despliegue RPi/VPS
- Docker Compose mínimo
- Backups automáticos
- TLS obligatorio en producción
- Auth opcional con bcrypt/argon2
- Mantener footprint bajo
- Registrar cambios críticos
- Tests mínimos antes de release
- Documentar limpieza/exportación de datos
- RFC para breaking changes

Decisiones tecnológicas recomendadas
- Frontend: Svelte (recomendado) / React (alternativa) / Vanilla (ligero)
- Backend: Go (recomendado) / Node.js (alternativa) / Python FastAPI (alternativa)
- DB: SQLite (MVP) / PostgreSQL (escala)

Diseño para un mantenedor único: priorizar caminos mínimos y documentar todo para reducir soporte.
