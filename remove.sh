#!/bin/bash

sudo usermod --shell /bin/bash $(whoami)

sudo pacman -Rns --noconfirm $(cat ./files/packages) git base-devel yay

sudo cp -r ~/.ssh ~/../

sudo rm -rf ~/.*
