#!/bin/bash

override_file="$(dirname "$0")/ShaderOverridePrevend"
updateShader="./CycleShaders.sh"

touch "$override_file"
"$updateShader" --updateOnly
grim -g "$(slurp -d)" -l0 -|wl-copy
rm "$override_file"
"$updateShader" --updateOnly
