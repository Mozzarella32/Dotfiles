#!/bin/bash

sudo pacman -S --needed waybar hyprland wofi kitty fzf zoxide ttf-jetbrains-mono-nerd hyprpaper helix firefox zsh timeshift wl-clipboard openssh sddm unzip bubblewrap

if ! command -v yay >/dev/null 2>&1; then
    sudo pacman -S --needed git base-devel
    git clone https://aur.archlinux.org/yay.git
    cd yay
    makepkg -si --noconfirm
    cd ..
    rm -rf yay
fi

yay -S --needed intellij-idea-ultimate-edition
