#!/bin/sh
set -e

# Run DB migrations at container start (idempotent)
if [ -f "/app/knexfile.js" ]; then
  echo "Running knex migrations..."
  # ignore non-zero exit to avoid container crash if migrations already applied
  npx knex --knexfile /app/knexfile.js migrate:latest || true
fi

# Execute the main process
exec node src/server.js

