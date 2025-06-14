#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "Current Directory: $SCRIPT_DIR"

link_with_info() {
    if [ "$#" -ne 2 ]; then
        echo "Error: link_with_info needs 2 parameters"
        return 1
    fi
    ZIEL="$SCRIPT_DIR/$1"
    LINKNAME="$2"
    if [ -L "$LINKNAME" ] || [ -e "$LINKNAME" ]; then
        echo "Removing existing: $LINKNAME"
        unlink "$LINKNAME"
    fi
    echo "Creating Symlink: $LINKNAME → $ZIEL"
    ln -s "$ZIEL" "$LINKNAME"
}

# cursor 
link_with_info cursor/Bibata-My-Magenta /usr/share/icons/Bibata-My-Magenta

# desktopfiles
link_with_info desktopfiles/applications/whatsapp-web.desktop /usr/share/applications/whatsapp-web.desktop
link_with_info desktopfiles/applications/artemis.desktop /usr/share/applications/artemis.desktop
link_with_info desktopfiles/applications/moodle.desktop /usr/share/applications/moodle.desktop
link_with_info desktopfiles/applications/campusonline.desktop /usr/share/applications/campusonline.desktop

# icons
link_with_info desktopfiles/icons /usr/share/icons/manuell
