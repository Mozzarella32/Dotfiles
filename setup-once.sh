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
        echo "Removing existing: $DEST"
        rm -rf "$DEST"
    fi

    echo "Copying: $SRC → $DEST"
    cp -r "$SRC" "$DEST"
}

copy_with_info dotfiles/.gitconfig ~/.gitconfig

set -e

if [ ! -d "$HOME/.oh-my-zsh" ]; then
    echo "Installing oh-my-zsh..."
    export RUNZSH=no
    export CHSH=no
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
else
    echo "oh-my-zsh already installed."
fi

if [ "$SHELL" != "$(command -v zsh)" ]; then
    echo "Changing default shell to zsh for $USER..."
    chsh -s "$(command -v zsh)"
fi

copy_with_info dotfiles/archcraft.zsh-theme ~/.oh-my-zsh/custom/themes/archcraft.zsh-theme

copy_with_info dotfiles/.zshrc ~/.zshrc

echo "oh-my-zsh with Archcraft theme setup complete!"
