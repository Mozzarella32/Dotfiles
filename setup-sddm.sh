#!/bin/bash

set -e

# Enable and start SDDM (Simple Desktop Display Manager)
echo "Enabling and starting sddm.service..."
sudo systemctl enable sddm.service
sudo systemctl start sddm.service

# Clone the sddm-theme-minesddm repository to a temporary directory
TMP_DIR=$(mktemp -d)
REPO_URL="https://github.com/Davi-S/sddm-theme-minesddm.git"
THEME_NAME="minesddm"
THEME_DIR="/usr/share/sddm/themes/$THEME_NAME"

echo "Cloning sddm-theme-minesddm repository..."
git clone --depth=1 "$REPO_URL" "$TMP_DIR"

# Copy the theme to the SDDM themes directory
echo "Installing theme to $THEME_DIR..."
sudo mkdir -p "$THEME_DIR"
sudo cp -r "$TMP_DIR"/* "$THEME_DIR"

# Set the SDDM theme in /etc/sddm.conf
SDDM_CONF="/etc/sddm.conf"

if [ ! -f "$SDDM_CONF" ]; then
    echo "Creating $SDDM_CONF ..."
    sudo touch "$SDDM_CONF"
fi

if grep -q "^\[Theme\]" "$SDDM_CONF"; then
    if grep -q "^Current=" "$SDDM_CONF"; then
        sudo sed -i "s|^Current=.*|Current=$THEME_NAME|" "$SDDM_CONF"
    else
        sudo sed -i "/^\[Theme\]/a Current=$THEME_NAME" "$SDDM_CONF"
    fi
else
    echo -e "\n[Theme]\nCurrent=$THEME_NAME" | sudo tee -a "$SDDM_CONF" >/dev/null
fi

# Clean up temporary files
echo "Cleaning up..."
rm -rf "$TMP_DIR"

echo "SDDM has been enabled and the minesddm theme from @Davi-S/sddm-theme-minesddm is now installed and set as default!"

read

systemctl start sddm
