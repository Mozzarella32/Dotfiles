#!/bin/bash
exit 0

# echo "CompressWorkspaces" >> Log.txt

# active_window=$(hyprctl activewindow -j | jq -r '.address')

# clients_json=$(hyprctl clients -j)
# used_workspaces=$(echo "$clients_json" | jq '.[].workspace.id' | sort -n | uniq)

# mapfile -t old_ids <<< "$used_workspaces"
# declare -A ws_map

# for i in "${!old_ids[@]}"; do
#     old_id="${old_ids[$i]}"
#     new_id=$((i + 1))
#     ws_map["$old_id"]="$new_id"
# done

# for old_id in "${old_ids[@]}"; do
#     new_id="${ws_map[$old_id]}"

#     if [ "$old_id" -eq "$new_id" ]; then
#         continue
#     fi

#     # hyprctl dispatch workspace "$old_id"
#     # sleep 0.1  # kurz warten für History-Effekt

#     window_addrs=$(echo "$clients_json" | jq -r --argjson wid "$old_id" '.[] | select(.workspace.id == $wid) | .address')

#     for addr in $window_addrs; do
#         hyprctl dispatch movetoworkspacesilent "$new_id,address:$addr"
#     done
# done

# if [ -n "$active_window" ]; then
#     hyprctl dispatch focuswindow address:"$active_window"
# fi
