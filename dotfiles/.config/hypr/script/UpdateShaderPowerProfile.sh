#!/bin/bash


toggle_file="$(dirname "$0")/ShaderRGBAnimated"
override_file="$(dirname "$0")/ShaderOverridePrevend"
default_shader="$HOME/.config/hypr/shader/screenShader.frag"
animated_shader="$HOME/.config/hypr/shader/animatedScreenShader.frag"
wild_shader="$HOME/.config/hypr/shader/wildScreenShader.frag"

hyprctl keyword debug:damage_tracking 2
hyprctl keyword decoration:screen_shader "$default_shader"

 exit #disable the shader

# Aktuellen Shader abrufen und Leerzeichen entfernen
current_shader=$(hyprctl getoption decoration:screen_shader | awk '{print $NF}' | head -n 1)

if [ -f "$override_file" ]; then
    hyprctl keyword decoration:screen_shader ""
    hyprctl keyword debug:damage_tracking 2
    exit
fi

if [ "$(powerprofilesctl get)" = "power-saver" ]; then
    hyprctl keyword debug:damage_tracking 0
    if [ "$current_shader" != "$default_shader" ]; then
        hyprctl keyword decoration:screen_shader "$default_shader"
    fi
else
    hyprctl keyword debug:damage_tracking 0
    if [ -f "$toggle_file" ]; then
        if [ "$current_shader" != "$wild_shader" ]; then
            hyprctl keyword decoration:screen_shader "$wild_shader"
        fi
    else
        if [ "$current_shader" != "$animated_shader" ]; then
            hyprctl keyword decoration:screen_shader "$animated_shader"
        fi
    fi
fi
