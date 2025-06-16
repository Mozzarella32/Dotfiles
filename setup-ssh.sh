#!/bin/bash


#!/bin/bash

sudo cp ~/../.ssh ~/.ssh

KEY="$HOME/.ssh/id_ed25519.pub"

if [ -f "$KEY" ]; then
    echo "SSH-Key $KEY exists."
    exit 0
else
    echo "Generating SSH-Key"
    ssh-keygen -q -t ed25519 -f ~/.ssh/ed25519
fi

