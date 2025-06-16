#!/bin/bash

# Hole die fokussierten Fensterinformationen
focused_window=$(hyprctl clients -j | jq '.[] | select(.focusHistoryID == 0)')

# Prüfe, ob ein Fenster fokussiert ist
if [ -z "$focused_window" ]; then
  exit 0 
fi

# Prüfe, ob das Fenster XWayland verwendet
is_xwayland=$(echo "$focused_window" | jq '.xwayland')

if [ "$is_xwayland" == "true" ]; then
  echo " X"  # XWayland-Fenster
fi


