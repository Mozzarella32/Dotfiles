#!/bin/bash

./setup-packages.sh

./setup-boot.sh

./setup-once.sh

./setup-config.sh

./setup-languages.sh

systemctl enable ly@tty1
systemctl start ly@tty1
