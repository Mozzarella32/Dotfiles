#!/bin/bash

sudo pacman -S --needed waybar hyprland wofi kitty fzf zoxide ttf-jetbrains-mono-nerd hyprpaper helix firefox zsh timeshift wl-clipboard openssh sddm 

sudo pacman -S --needed git base-devel && git clone https://aur.archlinux.org/yay.git && cd yay && makepkg -si && cd .. && rm -rf yay

yay -S --needed intellij-idea-ultimate-edition
