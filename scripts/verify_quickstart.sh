#!/usr/bin/env bash
set -euo pipefail

# Simple quickstart verifier
# Usage: ./scripts/verify_quickstart.sh [timeout_seconds]
# Default timeout_seconds: 3600 (60 minutes)

TIMEOUT=${1:-3600}
START_TS=$(date +%s)

echo "[verify_quickstart] Starting quickstart verification (timeout ${TIMEOUT}s)"

echo "[verify_quickstart] Bringing up docker-compose..."
docker-compose -f docker-compose.yml up --build -d

HEALTH_URL="http://localhost:8080/api/healthz"

# Wait for healthz
while true; do
  if curl -sf "$HEALTH_URL" >/dev/null 2>&1; then
    echo "[verify_quickstart] /healthz is healthy"
    break
  fi
  NOW_TS=$(date +%s)
  ELAPSED=$((NOW_TS - START_TS))
  if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
    echo "[verify_quickstart] Timeout after ${ELAPSED}s waiting for /healthz"
    exit 2
  fi
  sleep 5
done

# Create a sample habit to ensure API is responsive
CREATE_URL="http://localhost:8080/api/habits"
RESPONSE_FILE="/tmp/verify_quickstart_create.json"

HTTP_CODE=$(curl -s -o "$RESPONSE_FILE" -w "%{http_code}" -X POST -H "Content-Type: application/json" -d '{"name":"verify habit","periodicity":"daily"}' "$CREATE_URL" || true)

if [ "$HTTP_CODE" != "201" -a "$HTTP_CODE" != "200" ]; then
  echo "[verify_quickstart] Unexpected HTTP code when creating habit: $HTTP_CODE"
  echo "Response:" && cat "$RESPONSE_FILE" || true
  exit 3
fi

END_TS=$(date +%s)
TOTAL=$((END_TS - START_TS))

echo "[verify_quickstart] Quickstart completed in ${TOTAL}s"

if [ "$TOTAL" -gt "$TIMEOUT" ]; then
  echo "[verify_quickstart] Exceeded timeout (${TIMEOUT}s)"
  exit 4
fi

# Success
echo "[verify_quickstart] SUCCESS"
exit 0
