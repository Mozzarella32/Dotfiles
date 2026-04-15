#!/bin/bash

EXTERN_SSH="$HOME/../.ssh"

# Only copy if the external .ssh directory exists
if [ -d "$EXTERN_SSH" ]; then
    sudo cp -r "$EXTERN_SSH" "$HOME/.ssh"
    sudo chown -R $(whoami):$(whoami) "$HOME/.ssh"
fi
