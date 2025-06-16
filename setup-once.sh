#!/bin/bash

./setup-ssh.sh

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
copy_with_info dotfiles/.zshrc ~/.zshrc

set -e

if [ ! -d "$HOME/.oh-my-zsh" ]; then
    echo "Installing oh-my-zsh..."
    export RUNZSH=no
    export CHSH=no
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
else
    echo "oh-my-zsh already installed."
fi

sudo usermod --shell /bin/zsh $(whoami)

copy_with_info dotfiles/archcraft.zsh-theme ~/.oh-my-zsh/custom/themes/archcraft.zsh-theme

copy_with_info dotfiles/.zshrc ~/.zshrc

echo "oh-my-zsh with Archcraft theme setup complete!"
