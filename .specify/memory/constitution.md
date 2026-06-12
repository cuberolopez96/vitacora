<!--
SYNC IMPACT REPORT
- Version change: unknown → 1.0.0
- Modified principles: (new constitution created)
  - Privacidad de datos → Control de datos y exportabilidad
  - Simplicidad → Preferencia por ligereza y autopublicación
  - Auditabilidad → Registro y exportación verificable
- Added sections: Deployment & Constraints; Development Workflow
- Removed sections: none
- Templates requiring updates:
  - .specify/templates/plan-template.md ⚠ pending (actualizar "Constitution Check" para reflejar nuevos mandatos)
  - .specify/templates/spec-template.md ⚠ pending (alinear requisitos obligatorios: exportación, offline, deploy docs)
  - .specify/templates/tasks-template.md ⚠ pending (incluir tareas relacionadas con backups y Raspberry Pi)
- Follow-up TODOs:
  - TODO(RATIFICATION_DATE): confirmar fecha de ratificación si difiere
-->

# Constitución de Vitacora
<!-- Example: Spec Constitution, TaskFlow Constitution, etc. -->

## Core Principles

### Privacidad y control de datos
<!-- Example: I. Library-First -->
Los usuarios TIENEN control total sobre sus datos. Datos personales siempre exportables y eliminables. Por defecto NO se envía telemetría externa.
<!-- Example: Every feature starts as a standalone library; Libraries must be self-contained, independently testable, documented; Clear purpose required - no organizational-only libraries -->

### Simplicidad y ligereza
<!-- Example: II. CLI Interface -->
El sistema debe ser ligero y fácil de desplegar en VPS y Raspberry Pi. Evitar dependencias pesadas; priorizar eficiencia y tolerancia a entornos con recursos limitados.
<!-- Example: Every library exposes functionality via CLI; Text in/out protocol: stdin/args → stdout, errors → stderr; Support JSON + human-readable formats -->

### Autonomía y self-hosting
<!-- Example: III. Test-First (NON-NEGOTIABLE) -->
Diseñado para operar offline con caché local y para desplegarse vía Docker Compose o Kubernetes. La experiencia mínima no depende de servicios SaaS.
<!-- Example: TDD mandatory: Tests written → User approved → Tests fail → Then implement; Red-Green-Refactor cycle strictly enforced -->

### Seguridad práctica
<!-- Example: IV. Integration Testing -->
Cifrado en tránsito (TLS) y opción de cifrado en reposo. Autenticación opcional; cuando esté habilitada, seguir buenas prácticas (hashing, 2FA opcional).
<!-- Example: Focus areas requiring integration tests: New library contract tests, Contract changes, Inter-service communication, Shared schemas -->

### Auditabilidad y transparencia
<!-- Example: V. Observability, VI. Versioning & Breaking Changes, VII. Simplicity -->
Todas las operaciones críticas deben poder auditarse y exportarse; los cambios en datos sensibles deben registrarse con marca temporal.
<!-- Example: Text I/O ensures debuggability; Structured logging required; Or: MAJOR.MINOR.BUILD format; Or: Start simple, YAGNI principles -->

## Deployment & Constraints
<!-- Example: Additional Constraints, Security Requirements, Performance Standards, etc. -->

Requisitos clave: Docker Compose/Kubernetes, PWA móvil, exportación CSV/JSON, backups automáticos. Preferir SQLite para instalaciones personales; Postgres si se espera multiusuario. Documentar despliegue en Raspberry Pi y VPS.
<!-- Example: Technology stack requirements, compliance standards, deployment policies, etc. -->

## Development Workflow
<!-- Example: Development Workflow, Review Process, Quality Gates, etc. -->

Trabajo orientado a PRs pequeños, tests mínimos y documentación de despliegue. Mantener issues y RFCs para cambios mayores. Las decisiones técnicas se registran en RFCs y se preceden por un plan y checklist de migración.
<!-- Example: Code review requirements, testing gates, deployment approval process, etc. -->

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

Mantenedor principal (único desarrollador o equipo pequeño) tiene autoridad para merges y releases. Cambios grandes (nuevas arquitecturas, licencia, eliminación de principios) REQUIEREN RFC abierto, discusión en issue y aprobación por el mantenedor. Para equipos >1, aplicar aprobación por mayoría simple en PRs etiquetadas "major".
<!-- Example: All PRs/reviews must verify compliance; Complexity must be justified; Use [GUIDANCE_FILE] for runtime development guidance -->

**Version**: 1.0.0 | **Ratified**: 2026-06-12 | **Last Amended**: 2026-06-12
<!-- Example: Version: 2.1.1 | Ratified: 2025-06-13 | Last Amended: 2025-07-16 -->
