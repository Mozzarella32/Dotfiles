#!/bin/bash

sudo pacman -S --needed --noconfirm waybar hyprland wofi kitty fzf zoxide ttf-jetbrains-mono-nerd hyprpaper helix firefox zsh timeshift wl-clipboard openssh sddm unzip bubblewrap brightnessctl python

if ! command -v yay >/dev/null 2>&1; then
    sudo pacman -S --needed --noconfirm git base-devel
    git clone https://aur.archlinux.org/yay.git
    cd yay
    makepkg -si --noconfirm
    cd ..
    rm -rf yay
fi

yay -S --needed --noconfirm intellij-idea-ultimate-edition
