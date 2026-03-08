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

for desktopfile in "$SCRIPT_DIR"/desktopfiles/applications/*.desktop; do
    basefile=$(basename "$desktopfile")
    target="/usr/share/applications/$basefile"
    link_with_info "desktopfiles/applications/$basefile" "$target"
done

# icons
link_with_info desktopfiles/icons /usr/share/icons/manuell
