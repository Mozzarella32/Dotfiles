#!/bin/bash

EXTERN_SSH="$HOME/../.ssh"

# Only copy if the external .ssh directory exists
if [ -d "$EXTERN_SSH" ]; then
    sudo cp -r "$EXTERN_SSH" "$HOME/.ssh"
    sudo chown -R $(whoami):$(whoami) "$HOME/.ssh"
fi

KEY="$HOME/.ssh/id_ed25519.pub"

if [ -f "$KEY" ]; then
    echo "SSH-Key $KEY exists."
    exit 0
else
    echo "Generating SSH-Key"
    ssh-keygen -t ed25519
fi
