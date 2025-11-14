#!/bin/sh
set -e

DB_HOST="${PROD_DB_HOSTNAME:-${DB_HOST:-db}}"
DB_PORT="${DB_PORT:-5432}"
MAX_RETRIES="${DB_WAIT_RETRIES:-30}"

echo "Waiting for database at ${DB_HOST}:${DB_PORT}..."

RETRY_COUNT=0
until nc -z "$DB_HOST" "$DB_PORT"; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
    echo "Database is still unavailable after ${MAX_RETRIES} attempts, exiting."
    exit 1
  fi
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is up - running migrations and seeds..."

npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

echo "Starting backend server..."

exec node index.js
