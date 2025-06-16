#!/bin/bash

sudo usermod --shell /bin/bash $(whoami)

yay -Rns --noconfirm $(cat ./files/packages-aur)

sudo pacman -Rns --noconfirm $(cat ./files/packages-pacman) git base-devel yay

sudo cp -r ~/.ssh ~/../

sudo rm -rf ~/.*
