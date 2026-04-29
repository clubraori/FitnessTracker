#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$ROOT_DIR/.blockkeeper.pid"

if [[ ! -f "$PID_FILE" ]]; then
  exit 0
fi

SERVER_PID="$(cat "$PID_FILE")"
if kill -0 "$SERVER_PID" >/dev/null 2>&1; then
  kill "$SERVER_PID"
fi

rm -f "$PID_FILE"
