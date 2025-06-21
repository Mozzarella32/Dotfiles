#!/bin/bash

./setup-packages.sh

./setup-once.sh

./setup-config.sh

./setup-languages.sh

systemctl enable ly

systemctl start ly
