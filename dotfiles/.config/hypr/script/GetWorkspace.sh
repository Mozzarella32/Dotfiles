#/bin/bash

echo $(hyprctl activeworkspace -j | jq -r '.id')
