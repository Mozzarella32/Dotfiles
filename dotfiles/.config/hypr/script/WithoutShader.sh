#!/bin/bash
set -euo pipefail

override_file="$(dirname "$0")/ShaderOverridePrevend"
updateShader="$(dirname "$0")/CycleShaders.sh"

cmd="${1:-}"
if [[ -z "$cmd" ]]; then
  echo "Usage: $0 <command...>"
  exit 1
fi

touch "$override_file"
"$updateShader" --updateOnly
"$@" || true
rm "$override_file"
"$updateShader" --updateOnly
