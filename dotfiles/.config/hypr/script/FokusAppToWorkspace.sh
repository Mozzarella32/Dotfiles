#!/bin/bash

WORKSPACE=$1

#echo "Moving $APP to $WORKSPACE"

hyprctl eval "hl.dispatch(hl.dsp.window.move({workspace = \"$WORKSPACE\"}))"
