#!/bin/bash

#sddm
#!/bin/bash

# Enable SDDM service (assumes systemd)
echo "Enabling sddm.service..."
sudo systemctl enable sddm.service
sudo systemctl start sddm.service

# Download and install the SDDM Minecraft theme
THEME_NAME="sddm-minecraft"
THEME_REPO="https://github.com/xylotism/sddm-minecraft"
THEME_DIR="/usr/share/sddm/themes/$THEME_NAME"

TMP_DIR=$(mktemp -d)
echo "Cloning Minecraft SDDM theme to $TMP_DIR..."
git clone --depth=1 "$THEME_REPO" "$TMP_DIR/$THEME_NAME"

echo "Installing theme to $THEME_DIR..."
sudo mkdir -p "$THEME_DIR"
sudo cp -r "$TMP_DIR/$THEME_NAME/"* "$THEME_DIR"

# Set the theme in SDDM config
SDDM_CONF="/etc/sddm.conf"
if [ ! -f "$SDDM_CONF" ]; then
    sudo touch "$SDDM_CONF"
fi

if grep -q "\[Theme\]" "$SDDM_CONF"; then
    sudo sed -i "s|^Current=.*|Current=$THEME_NAME|" "$SDDM_CONF"
else
    echo -e "[Theme]\nCurrent=$THEME_NAME" | sudo tee -a "$SDDM_CONF" >/dev/null
fi

echo "Cleaning up..."
rm -rf "$TMP_DIR"

echo "SDDM Minecraft theme installed and enabled!"

./setup-ssh.sh

