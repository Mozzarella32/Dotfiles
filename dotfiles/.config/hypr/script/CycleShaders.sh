#!/bin/bash

override_file="$(dirname "$0")/ShaderOverridePrevend"
shader_index_file="$(dirname "$0")/ActiveShaderIndex"
shader_dir="$HOME/.config/hypr/shader"

# Alle Shader-Dateien dynamisch aus dem Verzeichnis laden und "no shader" am Anfang hinzufügen
mapfile -t shaders < <(find "$shader_dir" -type f -name "*.frag" | sort)
shaders=("NO_SHADER" "${shaders[@]}")
num_shaders=${#shaders[@]}

cycle=1  # Standard: cyclen
if [[ "$1" == "--updateOnly" ]] || [[ "$1" == "0" ]]; then
    cycle=0
fi

if [ -f "$override_file" ]; then
    hyprctl keyword decoration:screen_shader ""
    exit 0
fi

if [ -f "$shader_index_file" ]; then
    index=$(<"$shader_index_file")
else
    index=0
fi

if ! [[ "$index" =~ ^[0-9]+$ ]]; then
    index=0
fi

if [ "$cycle" -eq 1 ]; then
    new_index=$(( (index + 1) % num_shaders ))
    echo "$new_index" > "$shader_index_file"
else
    new_index="$index"
fi

selected_shader="${shaders[$new_index]}"

if [[ "$selected_shader" == "NO_SHADER" ]]; then
    hyprctl keyword debug:damage_tracking 2
    hyprctl keyword decoration:screen_shader ""
elif [[ "$selected_shader" == *_noDamage.frag ]]; then
    hyprctl keyword debug:damage_tracking 0
    hyprctl keyword decoration:screen_shader "$selected_shader"
else
    hyprctl keyword debug:damage_tracking 2
    hyprctl keyword decoration:screen_shader "$selected_shader"
fi
