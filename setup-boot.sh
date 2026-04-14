#!/bin/bash
set -euo pipefail

# setup-arch-shim.sh
# - Sets up archshim (reuses a Microsoft-signed shim), generates/enqueues a MOK cert,
#   installs pacman hooks, attempts to create an NVRAM boot entry,
#   downloads+extracts the latest Arch ISO's 'arch' tree onto the ESP.
# - NEW: expects a block device path pointing to the BTRFS partition that contains
#   a @ subvolume (e.g. /dev/sda2). The script extracts the partition UUID and
#   replaces all occurrences of the placeholder REPLACE_ROOT_PART_REPLACE inside
#   loader entry files under $ESP_MOUNT/loader/entries with that UUID.
#
# Usage:
#   sudo ./setup-arch-shim.sh /dev/sdXn
# Example:
#   sudo ./setup-arch-shim.sh /dev/sda2
#
# Notes / constraints from user:
#

if [ "$(id -u)" -ne 0 ]; then
  echo "This script must be run as root. Use: sudo ./setup-arch-shim.sh /dev/sdXn [ESP_MOUNT]"
  exit 1
fi

# --- Arguments ---
DEVICE="$1"
ESP_MOUNT="/boot"   # default ESP mountpoint
# --- Config ---
SEC_DIR="/root/secure-boot"
ARCHSHIM_DIR="$ESP_MOUNT/EFI/archshim"
HOOK_SRC_DIR="./files/secure-boot"
HOOK_DST="/etc/pacman.d/hooks"
ISO_DOWNLOAD_DIR="${TMPDIR:-/tmp}/archiso-download"
MIRROR_INDEX="https://mirror.rackspace.com/archlinux/iso/latest/"
PLACEHOLDER="REPLACE_ROOT_PART_REPLACE"

err(){ printf '%s\n' "$*" >&2; exit 1; }
info(){ printf '%s\n' "$*"; }

# Basic validation
[ -b "$DEVICE" ] || err "Device $DEVICE not found or is not a block device."
[ -d "$ESP_MOUNT" ] || err "ESP mountpoint '$ESP_MOUNT' does not exist. Mount your ESP there and re-run."

# Check required commands
for cmd in pacman openssl mokutil sbsign efibootmgr bsdtar blkid lsblk sed find btrfs; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    # Some commands (btrfs) are only needed conditionally; still warn
    info "Warning: required command '$cmd' not found in PATH. Install it before running full script."
  fi
done

# Install minimal packages we need for the script actions (non-destructive)
pacman -S --needed --noconfirm openssl sbsigntools efibootmgr mokutil curl libarchive || true

cp ./files/boot/linux.preset /etc/mkinitcpio.d/linux.preset

# --- 1) Key/cert generation for MOK ---
mkdir -m700 -p "$SEC_DIR"
KEY="$SEC_DIR/db.key"
CRT_PEM="$SEC_DIR/db.crt"
CRT_DER="$SEC_DIR/db.der"

if [ ! -f "$KEY" ] || [ ! -f "$CRT_PEM" ]; then
  info "Generating signing key and certificate in $SEC_DIR ..."
  openssl req -newkey rsa:4096 -nodes -keyout "$KEY" \
    -new -x509 -sha256 -days 3650 -out "$CRT_PEM" \
    -subj "/CN=Mozzarella32 Secure Boot Key/" || err "openssl failed to create key/cert"
  chmod 600 "$KEY"
else
  info "Signing key and cert already exist — skipping generation."
fi

openssl x509 -in "$CRT_PEM" -outform DER -out "$CRT_DER"

info "Importing $CRT_DER into MOK (you will be prompted for an enrollment password)."
mokutil --import "$CRT_DER"
info "mokutil queued the enrollment. Reboot and complete enrollment in MokManager to make the key active."

# --- 2) Prepare archshim and copy shim (reuse Ubuntu shim if present) ---
mkdir -p "$ARCHSHIM_DIR"
if [ -f "$ESP_MOUNT/EFI/ubuntu/shimx64.efi" ]; then
  cp -f "$ESP_MOUNT/EFI/ubuntu/shimx64.efi" "$ARCHSHIM_DIR/shimx64.efi"
  info "Copied /EFI/ubuntu/shimx64.efi -> $ARCHSHIM_DIR/shimx64.efi"
elif [ -f "$HOOK_SRC_DIR/shimx64.efi" ]; then
  cp -f "$HOOK_SRC_DIR/shimx64.efi" "$ARCHSHIM_DIR/shimx64.efi"
  info "Copied provided shimx64.efi -> $ARCHSHIM_DIR/shimx64.efi"
else
  info "No shim found to copy. Place a Microsoft-signed shim at $ARCHSHIM_DIR/shimx64.efi before enabling Secure Boot."
fi

if [ -f "$HOOK_SRC_DIR/mmx64.efi" ]; then
  cp -f "$HOOK_SRC_DIR/mmx64.efi" "$ARCHSHIM_DIR/mmx64.efi"
  info "Copied provided mmx64.efi -> $ARCHSHIM_DIR/mmx64.efi"
fi

# --- 3) Install pacman hooks if present ---
mkdir -p "$HOOK_DST"
if [ -f "$HOOK_SRC_DIR/99-sign-kernel.hook" ]; then
  cp -f "$HOOK_SRC_DIR/99-sign-kernel.hook" "$HOOK_DST/99-sign-kernel.hook"
  info "Installed kernel pacman hook."
fi
if [ -f "$HOOK_SRC_DIR/99-sign-systemd-boot.hook" ]; then
  cp -f "$HOOK_SRC_DIR/99-sign-systemd-boot.hook" "$HOOK_DST/99-sign-systemd-boot.hook"
  info "Installed systemd-boot pacman hook."
fi

# --- 4) Ensure systemd-boot installed (optional) ---
if command -v bootctl >/dev/null 2>&1; then
  info "Installing systemd-boot to ESP (bootctl install)."
  bootctl install || info "bootctl install returned non-zero; check manually."
else
  info "bootctl not present; skip auto install. Run 'bootctl install' after installing systemd if desired."
fi

# --- 5) Attempt NVRAM entry creation (best-effort) ---
ESP_DEV=$(findmnt -n -o SOURCE --target "$ESP_MOUNT" || true)
if [ -z "$ESP_DEV" ]; then
  info "Cannot determine ESP device for mountpoint $ESP_MOUNT. Skipping efibootmgr step."
else
  PKNAME=$(lsblk -no pkname "$ESP_DEV" 2>/dev/null || true)
  if [ -n "$PKNAME" ]; then
    DISK="/dev/$PKNAME"
    PARTNUM=$(lsblk -no PARTNUM "$ESP_DEV")
  else
    DISK=$(echo "$ESP_DEV" | sed 's/[0-9]\+$//')
    PARTNUM=$(echo "$ESP_DEV" | grep -o '[0-9]\+$' || true)
  fi

  if [ -n "$DISK" ] && [ -n "$PARTNUM" ]; then
    info "Attempting to create UEFI boot entry pointing to $ARCHSHIM_DIR/shimx64.efi on $DISK part $PARTNUM ..."
    efibootmgr -c -d "$DISK" -p "$PARTNUM" -L "Arch Shim" -l \\EFI\\archshim\\shimx64.efi || \
      info "efibootmgr failed; check dmesg and efivarfs mount/permissions."
    info "Inspect entries with: efibootmgr -v"
  else
    info "Could not derive disk/partition for ESP ($ESP_DEV). Create the boot entry manually if desired."
  fi
fi

# ------------------------
# 6) New behavior: obtain UUID for supplied BTRFS device and verify @ subvolume
# ------------------------
info "Obtaining partition UUID for $DEVICE ..."
PART_UUID=$(blkid -s UUID -o value "$DEVICE" || true)
if [ -z "$PART_UUID" ]; then
  info "No UUID found for $DEVICE via blkid; trying PARTUUID ..."
  PART_UUID=$(blkid -s PARTUUID -o value "$DEVICE" || true)
fi
[ -n "$PART_UUID" ] || err "Could not determine UUID for $DEVICE."

info "Partition UUID: $PART_UUID"

# ------------------------
# 7) Replace placeholders in loader entries under ESP without creating any new entries
# ------------------------
ENTRIES_DIR="$ESP_MOUNT/loader/entries"
if [ ! -d "$ENTRIES_DIR" ]; then
  info "Loader entries directory $ENTRIES_DIR does not exist; skipping placeholder replacement."
else
  info "Replacing placeholder ${PLACEHOLDER} with UUID ${PART_UUID} in files under $ENTRIES_DIR ..."
  FOUND=0
  while IFS= read -r -d '' file; do
    FOUND=1
    # backup before modifying
    cp -a "$file" "$file.bak" || err "Failed to backup $file"
    # perform replacement (UUID contains no slashes, safe to use as-is)
    sed -i "s/${PLACEHOLDER}/${PART_UUID}/g" "$file" || err "Failed to edit $file"
    info "Updated $file (backup at $file.bak)"
  done < <(find "$ENTRIES_DIR" -type f -name '*.conf' -print0)

  if [ "$FOUND" -eq 0 ]; then
    info "No .conf entries found under $ENTRIES_DIR; nothing replaced."
  fi
fi

# ------------------------
# 8) Download latest Arch ISO, verify signature if possible, extract 'arch' tree,
#    and SIGN the extracted kernel and systemd-boot copy using the generated MOK
# ------------------------
rm -rf "$ISO_DOWNLOAD_DIR"
mkdir -p "$ISO_DOWNLOAD_DIR"

info "Fetching mirror index to determine latest ISO..."
INDEX_HTML=""
if command -v curl >/dev/null 2>&1; then
  INDEX_HTML=$(curl -fsS "$MIRROR_INDEX") || true
elif command -v wget >/dev/null 2>&1; then
  INDEX_HTML=$(wget -qO- "$MIRROR_INDEX") || true
fi

if [ -n "$INDEX_HTML" ]; then
  ISO_FILENAME=$(printf '%s\n' "$INDEX_HTML" | grep -oE 'archlinux-[0-9]{4}\.[0-9]{2}\.[0-9]{2}-x86_64\.iso' | head -n1 || true)
  if [ -n "$ISO_FILENAME" ]; then
    ISO_URL="${MIRROR_INDEX}${ISO_FILENAME}"
    ISO_PATH="$ISO_DOWNLOAD_DIR/$ISO_FILENAME"
    SIG_URL="${ISO_URL}.sig"
    SIG_PATH="${ISO_PATH}.sig"

    info "Downloading ISO: $ISO_URL"
    if command -v curl >/dev/null 2>&1; then
      curl -fL --progress-bar -o "$ISO_PATH" "$ISO_URL" || err "ISO download failed."
    else
      wget -q --show-progress -O "$ISO_PATH" "$ISO_URL" || err "ISO download failed."
    fi

    info "Attempting to download detached signature: $SIG_URL"
    SIG_DL_OK=0
    if command -v curl >/dev/null 2>&1; then
      if curl -sfL -o "$SIG_PATH" "$SIG_URL"; then SIG_DL_OK=1; fi
    else
      if wget -q -O "$SIG_PATH" "$SIG_URL"; then SIG_DL_OK=1; fi
    fi

    # Verify signature if signature present
    SIG_VERIFIED=0
    if [ "$SIG_DL_OK" -eq 1 ]; then
      info "Signature downloaded to $SIG_PATH. Verifying with gpg..."
      if ! command -v gpg >/dev/null 2>&1; then
        pacman -S --needed --noconfirm gnupg || true
      fi
      # Try verification (Arch's ISO signing key should be in keyring; if not, user must import)
      if gpg --verify "$SIG_PATH" "$ISO_PATH" >/dev/null 2>&1; then
        info "GPG signature verified."
        SIG_VERIFIED=1
      else
        info "GPG verification failed or key missing. Signature not trusted."
        SIG_VERIFIED=0
      fi
    else
      info "Detached signature not found; skipping GPG verification."
    fi

    # Extract only if signature verified (or if user chooses to proceed; here we require verification)
    if [ "$SIG_VERIFIED" -eq 1 ]; then
      info "Extracting 'arch' directory into $ESP_MOUNT/EFI/archiso ..."
      mkdir -p "$ESP_MOUNT/EFI/archiso"
      bsdtar -x --no-same-permissions --strip-components 1 -f "$ISO_PATH" arch -C "$ESP_MOUNT/EFI/archiso" || err "Extraction failed."
      info "Extraction complete."

      # SIGN the extracted kernel for secure boot
      VMLINZ="$ESP_MOUNT/EFI/archiso/boot/x86_64/vmlinuz-linux"
      if [ -f "$VMLINZ" ]; then
        VMLINZ_SIG="${VMLINZ}.signed"
        info "Signing extracted kernel: $VMLINZ -> $VMLINZ_SIG"
        if sbsign --key "$KEY" --cert "$CRT_PEM" --output "$VMLINZ_SIG" "$VMLINZ"; then
          info "Kernel signed successfully: $VMLINZ_SIG"
        else
          info "Kernel signing failed for $VMLINZ"
        fi
      else
        info "Extracted kernel not found at $VMLINZ; skipping kernel signing."
      fi
    else
      info "ISO signature not verified; skipping extraction and signing to avoid using unverified content."
    fi

  else
    info "Could not determine ISO filename from index. Skipping ISO download/extract/sign."
  fi
else
  info "Could not fetch mirror index from $MIRROR_INDEX. Skipping ISO download/extract/sign."
fi

# ------------------------
# 9) Summary / next steps
# ------------------------
info ""
info "All done."
info "Summary:"
info " - MOK import queued: reboot and complete enrollment in MokManager (Enroll MOK) to activate the key."
info " - Signing key: $KEY (keep secure, chmod 600)."
info " - archshim directory: $ARCHSHIM_DIR (shim copied if available)."
info " - Loader entries under $ENTRIES_DIR had placeholder replacement attempted (backups saved as *.bak)."
info " - Arch ISO (if downloaded) extracted to: $ESP_MOUNT/EFI/archiso"
info ""
info "Important notes:"
info " - This script intentionally does NOT create or overwrite any loader entries (per your request)."
info " - If you want the signed systemd-boot second-stage in $ARCHSHIM_DIR/grubx64.efi, run:"
info "     sbsign --key $KEY --cert $CRT_PEM --output $ARCHSHIM_DIR/grubx64.efi /usr/lib/systemd/boot/efi/systemd-bootx64.efi"
info " - To sign kernels, example:"
info "     sbsign --key $KEY --cert $CRT_PEM --output /boot/arch/vmlinuz-linux.signed /boot/arch/vmlinuz-linux"
info ""
info "If anything failed, check the .bak files in $ENTRIES_DIR and restore as needed."
exit 0
