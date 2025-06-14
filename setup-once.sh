#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$(readlink -f "$0")")" && pwd)"
echo "Current Directory: $SCRIPT_DIR"

copy_with_info() {
    if [ "$#" -ne 2 ]; then
        echo "Error: copy_with_info needs 2 parameters"
        return 1
    fi
    SRC="$SCRIPT_DIR/$1"
    DEST="$2"

    if [ -e "$DEST" ] || [ -L "$DEST" ]; then
        read -p "File $DEST exists. Replace it? [j/N] " answer
        answer=${answer,,}  # to lower-case
        if [[ "$answer" == "j" ]]; then
            echo "Removing existing: $DEST"
            rm -rf "$DEST"
        else
            echo "Skipping $DEST"
            return 0
        fi
    fi

    echo "Copying: $SRC → $DEST"
    cp -r "$SRC" "$DEST"
}

copy_with_info dotfiles/.zshrc ~/.zshrc
copy_with_info dotfiles/.gitconfig ~/.gitconfig
copy_with_info dotfiles/.oh-my-zsh ~/.oh-my-zsh
