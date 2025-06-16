#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "Current Directory: $SCRIPT_DIR"

link_with_info() {
    if [ "$#" -ne 2 ]; then
        echo "Error: link_with_info needs 2 parameters"
        return 1
    fi
    ZIEL="$SCRIPT_DIR/$1"
    LINKNAME="$2"
    if [ -L "$LINKNAME" ] || [ -e "$LINKNAME" ]; then
        echo "Removing existing: $LINKNAME"
        rm -rf "$LINKNAME"
    fi
    echo "Creating Symlink: $LINKNAME → $ZIEL"
    ln -s "$ZIEL" "$LINKNAME"
}

link_with_info dotfiles/.config/helix ~/.config/helix
link_with_info dotfiles/.config/hypr ~/.config/hypr
link_with_info dotfiles/.config/waybar ~/.config/waybar
link_with_info dotfiles/.config/kitty ~/.config/kitty
link_with_info dotfiles/.config/hyprpanel ~/.config/hyprpanel
link_with_info dotfiles/.config/background ~/.config/background
link_with_info dotfiles/.config/wofi ~/.config/wofi
link_with_info dotfiles/.config/commit_all_and_push.sh ~/.config/commit_all_and_push.sh
