#!/bin/bash

sudo pacman -S --needed --noconfirm $(cat ./files/packages-pacman)

if ! command -v yay >/dev/null 2>&1; then
    sudo pacman -S --needed --noconfirm git base-devel
    git clone https://aur.archlinux.org/yay.git
    cd yay
    makepkg -si --noconfirm
    cd ..
    rm -rf yay
fi

yay -S --needed --noconfirm $(cat ./files/packages-aur) intellij-idea-ultimate-edition
