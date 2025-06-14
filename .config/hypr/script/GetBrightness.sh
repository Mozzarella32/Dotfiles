#!/bin/bash

Max=$(brightnessctl max)
Cur=$(brightnessctl get)

Pro=$(echo "$Cur * 100 / $Max" | bc)

# Icons basierend auf der Helligkeit
if [ "$Pro" -le 10 ]; then
    Icon=""
elif [ "$Pro" -le 20 ]; then
    Icon=""
elif [ "$Pro" -le 30 ]; then
    Icon=""
elif [ "$Pro" -le 40 ]; then
    Icon=""
elif [ "$Pro" -le 50 ]; then
    Icon=""
elif [ "$Pro" -le 60 ]; then
    Icon=""
elif [ "$Pro" -le 70 ]; then
    Icon=""
elif [ "$Pro" -le 80 ]; then
    Icon=""
else
    Icon=""
fi

echo "$Pro% $Icon"

