#!/bin/bash


toggle_file="$(dirname "$0")/ShaderRGBAnimated"

default_shader="$HOME/.config/hypr/shader/screenShader.frag"
animated_shader="$HOME/.config/hypr/shader/animatedScreenShader.frag"
wild_shader="$HOME/.config/hypr/shader/screenShaderAnimated.frag"

if [ -f "$toggle_file" ]; then
    # echo "RGB Off"
    # hyprctl keyword debug:damage_tracking 2
    # hyprctl keyword decoration:screen_shader "$default_shader"

    if pgrep -f "pipes.sh" > /dev/null; then
        pkill -f "pipes.sh"
    fi
    
    rm "$toggle_file"
else
    # echo "RGB On"
    # hyprctl keyword debug:damage_tracking 0
    # hyprctl keyword decoration:screen_shader "$animated_shader"

    # if ! pgrep -f "pipes.sh" > /dev/null; then
    #     kitty -e pipes.sh 
    # fi

    CURRENT_WS=$(hyprctl activeworkspace -j | jq -r '.id')

    PIPES_WINDOW=$(hyprctl clients -j | jq -r '.[] | select(.title | test("pipes.sh")) | .address')

    if [[ -n "$PIPES_WINDOW" ]]; then
        hyprctl dispatch movetoworkspace "$CURRENT_WS", address:$PIPES_WINDOW
    else
        kitty -e pipes.sh &
    fi

    touch "$toggle_file"
fi

~/.config/hypr/script/UpdateShaderPowerProfile.sh
