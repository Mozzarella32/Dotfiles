#!/bin/bash

override_file="$(dirname "$0")/ShaderOverridePrevend"
updateShader="./UpdateShaderPowerProfile.sh"

touch "$override_file"
"$updateShader"
grim -g "$(slurp -d)" -l0 -|wl-copy
rm "$override_file"
"$updateShader"


