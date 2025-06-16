#!/bin/bash

VKBD_Name="wvkbd-mobintl"

PID=$(pgrep -x "$VKBD_Name")

if [ -n "$PID" ]; then
  kill "$PID"
  exit
fi  

wvkbd-mobintl -L 400 -R 20 --bg 11111100 --fg 000000B2 --fg-sp 000000B2 --press FF00FF --press-sp FF00FF&
