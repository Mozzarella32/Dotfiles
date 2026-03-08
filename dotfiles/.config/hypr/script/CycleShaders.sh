#!/bin/bash

override_file="$(dirname "$0")/ShaderOverridePrevend"
shader_index_file="$(dirname "$0")/ActiveShaderIndex"
shader_dir="$HOME/.config/hypr/shader"

mapfile -t shaders < <(find "$shader_dir" -type f -name "*.frag" | sort)
shaders=("NO_SHADER" "${shaders[@]}")
num_shaders=${#shaders[@]}

cycle=1  # Standard: cyclen
direction="forward" # Default direction

case "$1" in
    "--updateOnly"|"0")
        cycle=0
        ;;
    "--backward"|"-b")
        direction="backward"
        ;;
    "--forward"|"-f")
        direction="forward"
        ;;
esac

if [ -f "$override_file" ]; then
    hyprctl keyword decoration:screen_shader ""
    hyprctl notify 1 2000 "rgb(ff00ff)" "Shader override active. No shader applied."
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
    if [ "$direction" = "forward" ]; then
        new_index=$(( (index + 1) % num_shaders ))
    else
        new_index=$(( (index - 1 + num_shaders) % num_shaders ))
    fi
    echo "$new_index" > "$shader_index_file"
else
    new_index="$index"
fi

selected_shader="${shaders[$new_index]}"

if echo "$(basename "$selected_shader")" | grep -qi cursor; then
    hyprctl keyword cursor:invisible true
else
    hyprctl keyword cursor:invisible false
fi

if [[ "$selected_shader" == "NO_SHADER" ]]; then
    hyprctl keyword debug:damage_tracking 2
    hyprctl keyword decoration:screen_shader ""
    hyprctl notify 1 2000 "rgb(ff00ff)" "No shader"
elif [[ "$selected_shader" == *_noDamage.frag ]]; then
    hyprctl keyword debug:damage_tracking 0
    hyprctl keyword decoration:screen_shader "$selected_shader"
    shader_name="$(basename "$selected_shader" | sed 's/_noDamage\.frag$//')"
    hyprctl notify 1 2000 "rgb(ff00ff)" "$shader_name"
else
    hyprctl keyword debug:damage_tracking 2
    hyprctl keyword decoration:screen_shader "$selected_shader"
    shader_name="$(basename "$selected_shader" .frag)"
    hyprctl notify 1 2000 "rgb(ff00ff)" "$shader_name"
fi
