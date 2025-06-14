#!/bin/bash


#!/bin/bash

KEY="$HOME/.ssh/id_ed25519.pub"

if [ -f "$KEY" ]; then
    echo "SSH-Key $KEY exists."
    exit 0
else
    echo "Generating SSH-Key"
    ssh-keygen -t ed25519
fi

firefox https://artemis.tum.de/user-settings/ssh
