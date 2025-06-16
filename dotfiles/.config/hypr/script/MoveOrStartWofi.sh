#!/bin/bash

clients=$(hyprctl clients -j)

wofi_id=$(echo "$clients" | jq -r '.[] | select(.class == "wofi") | .address')
wofi_ws=$(echo "$clients" | jq -r ".[] | select(.class == \"wofi\") | .workspace.id")

current_ws=$(hyprctl activeworkspace -j | jq -r '.id')

if [ -n "$wofi_id" ]; then
    if [ "$wofi_ws" != "$current_ws" ]; then
        hyprctl dispatch movetoworkspacesilent "$current_ws",address:"$wofi_id"
        hyprctl dispatch focuswindow address:"$wofi_id"
    else
        hyprctl dispatch killwindow address:"$wofi_id"
    fi
else
    wofi --show drun&
fi

