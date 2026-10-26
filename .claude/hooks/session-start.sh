#!/bin/bash
set -euo pipefail

# Recreates cl-typer/.env.local on every fresh cloud container from the
# environment's stored secrets (Edit environment -> Network secrets),
# since .env.local is gitignored and never persists across container resets.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

ENV_FILE="$CLAUDE_PROJECT_DIR/cl-typer/.env.local"

if [ -f "$ENV_FILE" ] && grep -q "^SUPABASE_URL=" "$ENV_FILE" 2>/dev/null; then
  exit 0
fi

if [ -z "${SUPABASE_URL:-}" ] || [ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  echo "session-start: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set in environment secrets, skipping .env.local setup" >&2
  exit 0
fi

SESSION_SECRET_VALUE="${SESSION_SECRET:-$(openssl rand -base64 32)}"

cat > "$ENV_FILE" << EOF
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
SESSION_SECRET=${SESSION_SECRET_VALUE}
EOF

echo "session-start: wrote cl-typer/.env.local from environment secrets" >&2
