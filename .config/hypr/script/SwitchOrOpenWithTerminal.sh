#!/bin/bash

TERMINAL=$1
APP=$2

# echo "SwitchOrOpenWithTerminal" > ~/.config/hypr/script/Log.txt

# echo "Terminal \"$TERMINAL\", App \"$APP\"" >> ~/.config/hypr/script/Log.txt

if pgrep "$APP"  > /dev/null; then
    WS=$(hyprctl clients -j | jq -r ".[] | select(.title == \"$APP\") | .workspace.id" | head -n 1)
    # echo "$APP läuft bereits switch to $WS" >> ~/.config/hypr/script/Log.txt
    hyprctl dispatch workspace "$WS"
else
    workspace_id=$(~/.config/hypr/script/FreeWorkspace.sh)
        # echo "$APP will be startet in $workspace_id with $TERMINAL" >> ~/.config/hypr/script/Log.txt
    hyprctl dispatch workspace "$workspace_id"
    $TERMINAL -e $APP &
fi
