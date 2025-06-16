#!/bin/bash

WORKSPACE=$1

#APP=$(hyprctl clients -j | jq -r '.[] | select(.focusHistoryID == 0) | .address')

#echo "Moving $APP to $WORKSPACE"

hyprctl dispatch movetoworkspace $WORKSPACE
