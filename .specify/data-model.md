Data model: Vitacora (MySQL / MariaDB)

Fecha: 2026-06-13

Entidades principales y esquema (sugerido para MySQL/MariaDB)
------------------------------------------------------------
-- Recomendación: usar UUIDs (CHAR(36)) o BINARY(16) según preferencia. A continuación se muestra un esquema SQL orientativo con CHAR(36) UUIDs.

CREATE TABLE `users` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `username` VARCHAR(150) UNIQUE,
  `password_hash` VARCHAR(255), -- bcrypt/argon2 hash, nullable si auth desactivada
  `email` VARCHAR(255),
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `habits` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `user_id` CHAR(36) NULL, -- nullable para single-user installs
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `periodicity` ENUM('daily','weekly','custom') NOT NULL DEFAULT 'daily',
  `reminder_time` TIME NULL,
  `metadata` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_habit_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `entries` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `habit_id` CHAR(36) NOT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('completed','missed','skipped') NOT NULL DEFAULT 'completed',
  `note` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_entry_habit` FOREIGN KEY (`habit_id`) REFERENCES `habits`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `ux_habit_date` (`habit_id`,`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `backups` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `origin` VARCHAR(100) NOT NULL,
  `size_bytes` BIGINT NULL,
  `checksum` VARCHAR(128) NULL,
  `path` VARCHAR(1024) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

Índices y optimizaciones
------------------------
- Índice en habits(user_id) si multiusuario o para consultas filtradas.
- Índice en entries(habit_id,date) ya cubierto por UNIQUE KEY para buscar por rango de fechas.
- Para RPi / MariaDB: ajustar innodb_buffer_pool_size y otros parámetros para memoria limitada.

Migraciones y herramientas
--------------------------
- Recomendar usar una herramienta de migraciones (Knex, TypeORM Migrations, Flyway o Alembic según stack) para aplicar y versionar cambios de esquema.
- Incluir scripts seed minimal para datos de desarrollo (user demo, ejemplo de hábito).

Consideraciones de cifrado y backups
------------------------------------
- Si se habilita cifrado opt‑in, no cifrar el nombre de hábito o campos que se usan para filtros sin planificar índices cifrados. Cifrar campos sensibles (notes) con AES-GCM y almacenar claves fuera del repo (env o KMS).
- Al restaurar, verificar checksum y compatibilidad de charset (utf8mb4) para CSV/JSON import.

Notas sobre UUID vs AUTO_INCREMENT
---------------------------------
- UUID (CHAR(36) o BINARY(16)) favorece replicación y evita colisiones entre instancias; penaliza tamaño del índice.
- AUTO_INCREMENT (INT) es más compacto y rápido en índices; pero complica merges entre instancias.

Ejemplo de comando para crear esquema (PowerShell)
-------------------------------------------------
# Ejecutar en contenedor MySQL/MariaDB. Ajustar variables según entorno
# docker exec -i mysql_container mysql -u root -p$env:MYSQL_ROOT_PASSWORD vitacora < schema.sql


