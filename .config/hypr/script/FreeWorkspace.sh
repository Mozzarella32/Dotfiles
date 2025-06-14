#!/bin/bash

workspace_id=1
while true; do
    if ! hyprctl workspaces -j | jq -e ".[] | select(.id == $workspace_id)" > /dev/null; then
        break
    fi
    workspace_id=$((workspace_id + 1))
done
# echo "FreeWorkspace $workspace_id" >> ~/.config/hypr/script/Log.txt
echo $workspace_id	
