#!/bin/bash

OFFICIAL=$(checkupdates 2>/dev/null | wc -l)

AUR=$(yay -Qua 2>/dev/null | wc -l)

TOTAL=$((OFFICIAL + AUR))

if [ "$TOTAL" -gt 0 ]; then
    OUTPUT=""
    if [ "$OFFICIAL" -gt 0 ]; then
        OUTPUT+="󰏗 $OFFICIAL"
    fi

    if [ "$AUR" -gt 0 ]; then
        [ -n "$OUTPUT" ] && OUTPUT+=" "
        OUTPUT+="󰚰 $AUR"
    fi
    
    echo "{\"text\": \"$OUTPUT\", \"tooltip\": \"Official: $OFFICIAL\\nAUR: $AUR\"}"
else
    echo "{\"text\": \"\"}"
fi
