#!/bin/bash

sudo pacman -S --needed hyprland wofi kitty fzf zoxide ttf-jetbrains-mono-nerd hyprpaper helix firefox zsh timeshift wl-clipboard openssh sddm

sudo pacman -S --needed git base-devel && git clone https://aur.archlinux.org/yay.git && cd yay && makepkg -si

yay -S --needed intellij-idea-ultimate-edition

yay -Scc
