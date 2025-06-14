#/bin/bash

clients_json=$(hyprctl clients -j)

window_1=$(echo "$clients_json" | jq -r '.[] | select(.focusHistoryID == 1) | .address')

hyprctl dispatch killactive

if [ -n "$window_1" ]; then
    hyprctl dispatch focuswindow address:"$window_1"
    ~/.config/hypr/script/CompressWorkspaces.sh
    exit 0
fi

