#!/bin/bash

URL=$1

if ! pgrep -x "firefox" > /dev/null; then
    hyprctl dispatch workspace empty
    firefox "$URL" &
    exit 0
fi

firefox "$URL"

hyprctl dispatch focuswindow class:firefox

