#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT=4173
PID_FILE="$ROOT_DIR/.blockkeeper.pid"
LOG_FILE="$ROOT_DIR/.blockkeeper-server.log"
URL="http://127.0.0.1:$PORT"

if [[ -f "$PID_FILE" ]]; then
  EXISTING_PID="$(cat "$PID_FILE")"
  if kill -0 "$EXISTING_PID" >/dev/null 2>&1; then
    open "$URL"
    exit 0
  fi
  rm -f "$PID_FILE"
fi

cd "$ROOT_DIR"
nohup python3 -m http.server "$PORT" --bind 127.0.0.1 > "$LOG_FILE" 2>&1 &
SERVER_PID=$!
echo "$SERVER_PID" > "$PID_FILE"
sleep 1
open "$URL"
