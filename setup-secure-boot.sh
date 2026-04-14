#!/bin/bash
set -euo pipefail

# This script sets up an Arch "archshim" using an existing Microsoft-signed shim,
# generates/enqueues a MOK certificate, installs hooks, and (optionally) creates
# an NVRAM boot entry. Run as root: sudo /root/setup-arch-shim.sh
#
# Review the script before running. It will prompt during mokutil --import for
# an enrollment password; you must reboot and complete enrollment in MokManager.

# Run as root
if [ "$EUID" -ne 0 ]; then
  echo "This script must be run as root. Use: sudo -i ./setup-arch-shim.sh"
  exit 1
fi

# Configuration - adjust if your ESP is mounted elsewhere or your files live elsewhere
SEC_DIR="/root/secure-boot"
ESP_MOUNT="/boot"                      # change if your ESP is mounted elsewhere
ARCHSHIM_DIR="$ESP_MOUNT/EFI/archshim"
HOOK_SRC_DIR="./files/secure-boot"      # adjust if your helper files are stored elsewhere
HOOK_DST="/etc/pacman.d/hooks"

# 1) Ensure required packages are installed
pacman -S --needed --noconfirm openssl sbsigntools efibootmgr

# 2) Make secure key directory
mkdir -m700 -p "$SEC_DIR"

# 3) Create key+cert (PEM) and DER (if not already present)
KEY="$SEC_DIR/db.key"
CRT_PEM="$SEC_DIR/db.crt"
CRT_DER="$SEC_DIR/db.der"

if [ ! -f "$KEY" ] || [ ! -f "$CRT_PEM" ]; then
  echo "Generating new signing key and certificate in $SEC_DIR ..."
  openssl req -newkey rsa:4096 -nodes -keyout "$KEY" \
    -new -x509 -sha256 -days 3650 -out "$CRT_PEM" \
    -subj "/CN=Mozzarella32 Secure Boot Key/"
  chmod 600 "$KEY"
  echo "Key and PEM certificate created."
else
  echo "Key and PEM certificate already exist in $SEC_DIR — skipping generation."
fi

# convert PEM -> DER for mokutil
openssl x509 -in "$CRT_PEM" -outform DER -out "$CRT_DER"

# 4) Import DER cert to MOK (prompts for enrollment password)
echo "Importing $CRT_DER into MOK. You will be asked to set an enrollment password."
mokutil --import "$CRT_DER"
echo "mokutil queued the enrollment. Reboot and complete enrollment in MokManager."

# 5) Prepare archshim and copy a shim into it (prefer existing ubuntu shim on ESP)
mkdir -p "$ARCHSHIM_DIR"

if [ -f "$ESP_MOUNT/EFI/ubuntu/shimx64.efi" ]; then
  cp -f "$ESP_MOUNT/EFI/ubuntu/shimx64.efi" "$ARCHSHIM_DIR/shimx64.efi"
  echo "Copied /EFI/ubuntu/shimx64.efi -> $ARCHSHIM_DIR/shimx64.efi"
elif [ -f "$HOOK_SRC_DIR/shimx64.efi" ]; then
  cp -f "$HOOK_SRC_DIR/shimx64.efi" "$ARCHSHIM_DIR/shimx64.efi"
  echo "Copied provided shimx64.efi -> $ARCHSHIM_DIR/shimx64.efi"
else
  echo "Warning: no shim found at $ESP_MOUNT/EFI/ubuntu/shimx64.efi or $HOOK_SRC_DIR/shimx64.efi."
  echo "Place a Microsoft-signed shim at $ARCHSHIM_DIR/shimx64.efi before enabling Secure Boot."
fi

# Optionally copy MokManager (mmx64.efi) if a copy is available
if [ -f "$HOOK_SRC_DIR/mmx64.efi" ]; then
  cp -f "$HOOK_SRC_DIR/mmx64.efi" "$ARCHSHIM_DIR/mmx64.efi"
  echo "Copied provided mmx64.efi -> $ARCHSHIM_DIR/mmx64.efi"
fi

# 6) Install pacman hooks (if provided)
if [ -f "$HOOK_SRC_DIR/99-sign-kernel.hook" ]; then
  cp -f "$HOOK_SRC_DIR/99-sign-kernel.hook" "$HOOK_DST/99-sign-kernel.hook"
  echo "Installed kernel hook to $HOOK_DST/99-sign-kernel.hook"
fi
if [ -f "$HOOK_SRC_DIR/99-sign-systemd-boot.hook" ]; then
  cp -f "$HOOK_SRC_DIR/99-sign-systemd-boot.hook" "$HOOK_DST/99-sign-systemd-boot.hook"
  echo "Installed systemd-boot hook to $HOOK_DST/99-sign-systemd-boot.hook"
fi

# 7) Ensure systemd-boot is installed to the ESP
bootctl install || true
echo "bootctl install attempted. Verify /boot/loader exists."

# 8) Copy loader config/entries if provided under ./files/boot
if [ -d "./files/boot" ]; then
  mkdir -p "$ESP_MOUNT/loader"
  cp -a ./files/boot/* "$ESP_MOUNT/loader/" 2>/dev/null || true
  echo "Copied loader config (if any) to $ESP_MOUNT/loader/"
fi

# 9) Create an NVRAM entry for the copied shim (attempt; may fail on some firmwares)
ESP_DEV=$(findmnt -n -o SOURCE --target "$ESP_MOUNT" || true)
if [ -z "$ESP_DEV" ]; then
  echo "Cannot determine ESP device for mountpoint $ESP_MOUNT. Skipping efibootmgr step."
else
  # Determine backing disk and partition number in a robust way
  PKNAME=$(lsblk -no pkname "$ESP_DEV" 2>/dev/null || true)
  if [ -n "$PKNAME" ]; then
    DISK="/dev/$PKNAME"
    PARTNUM=$(lsblk -no PARTNUM "$ESP_DEV")
  else
    DISK=$(echo "$ESP_DEV" | sed 's/[0-9]\+$//')
    PARTNUM=$(echo "$ESP_DEV" | grep -o '[0-9]\+$' || true)
  fi

  if [ -n "$DISK" ] && [ -n "$PARTNUM" ]; then
    echo "Attempting to create UEFI boot entry pointing to $ARCHSHIM_DIR/shimx64.efi on $DISK part $PARTNUM ..."
    efibootmgr -c -d "$DISK" -p "$PARTNUM" -L "Arch Shim" -l \\EFI\\archshim\\shimx64.efi || \
      echo "efibootmgr failed; check dmesg and efivarfs mount/permissions."
    echo "Run 'efibootmgr -v' to inspect the new entry."
  else
    echo "Could not derive disk/partition for ESP ($ESP_DEV). Please create the boot entry manually if desired."
  fi
fi

echo ""
echo "DONE."
echo "Important next steps:"
echo " - Reboot and complete the MOK enrollment in MokManager (Enroll MOK -> provide the password you set)."
echo " - After enrollment, sign systemd-boot (create $ARCHSHIM_DIR/grubx64.efi signed with your key) and your kernels,"
echo "   or reinstall systemd/linux packages to trigger the pacman hooks you installed."
