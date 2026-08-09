#!/bin/bash

OFFICIAL=0
ORPHANS=0
FLATPAK=0

OFFICIAL_RAW="$(checkupdates 2>/dev/null || true)"
OFFICIAL="$(printf '%s\n' "$OFFICIAL_RAW" | sed '/^$/d' | wc -l | tr -d ' ')"

ORPHANS="$(pacman -Qdtq 2>/dev/null | sed '/^$/d' | wc -l | tr -d ' ')"

FLATPAK_RAW="$(flatpak remote-ls --updates --app 2>/dev/null || true)"
FLATPAK="$(printf '%s\n' "$FLATPAK_RAW" | sed '/^$/d' | wc -l | tr -d ' ')"

# ensure they are integers
OFFICIAL=${OFFICIAL:-0}
ORPHANS=${ORPHANS:-0}
FLATPAK=${FLATPAK:-0}

TOTAL=$((OFFICIAL + FLATPAK + ORPHANS))

if [ "$TOTAL" -gt 0 ]; then
    OUTPUT=""
    [ "$OFFICIAL" -gt 0 ] && OUTPUT+="󰏗 $OFFICIAL"
    [ "$ORPHANS" -gt 0 ] && { [ -n "$OUTPUT" ] && OUTPUT+=" "; OUTPUT+="󱧙 $ORPHANS"; }
    if [ "$FLATPAK" -gt 0 ]; then
        [ -n "$OUTPUT" ] && OUTPUT+=" "
        OUTPUT+="󰏖 $FLATPAK"
    fi

    hyprctl notify 1 5000 "rgb(ff00ff)" "Updates: $OUTPUT" &

    echo "{\"text\": \"$OUTPUT\", \"tooltip\": \"Pacman: $OFFICIAL\\\nPacman orphans: $ORPHANS\\\nFlatpak: $FLATPAK\"}"
else
    echo "{\"text\": \"\"}"
fi
