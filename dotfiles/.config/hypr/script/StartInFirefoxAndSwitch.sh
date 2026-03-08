#!/usr/bin/env bash
# Open a URL in Firefox, but:
# - if Firefox is NOT running: create an empty workspace and launch it there
# - if Firefox IS running and there is a Firefox window on the CURRENT workspace:
#     open the tab and do NOT change workspace or focus anything
# - if Firefox IS running but NO Firefox window is on the CURRENT workspace:
#     open the tab and focus a Firefox window (so the workspace will change)
#
# This uses hyprctl (Hyprland) and jq when available. If hyprctl/jq aren't found,
# it falls back to the previous behavior (best-effort).

set -euo pipefail

URL="${1:-}"

if [[ -z "$URL" ]]; then
  # echo "Usage: $0 <url>"
  exit 2
fi

# prefer --new-tab so an existing instance receives the URL
FIREFOX_CMD=(firefox --new-tab "$URL")

# Detect whether any firefox process exists
if ! pgrep -x firefox >/dev/null 2>&1 && ! pgrep -f "firefox-bin" >/dev/null 2>&1; then
  # No firefox at all: create an empty workspace and launch firefox there
  if command -v hyprctl >/dev/null 2>&1; then
    hyprctl dispatch workspace empty || true
  fi

  "${FIREFOX_CMD[@]}" &
  exit 0
fi

# From here: firefox is running somewhere. Try to detect if a firefox window is on the current workspace.
firefox_on_current_ws=false
hyprctl_ok=false
jq_ok=false

if command -v hyprctl >/dev/null 2>&1; then
  hyprctl_ok=true
fi
if command -v jq >/dev/null 2>&1; then
  jq_ok=true
fi

if $hyprctl_ok && $jq_ok; then
  # Try several hyprctl JSON endpoints to extract the current workspace name/id and client info.
  # Different hyprctl versions expose slightly different JSON; we be permissive.

  # 1) get focused workspace name/id from monitors -> .activeWorkspace.name or .activeWorkspace.id
  current_ws=$(hyprctl -j monitors 2>/dev/null \
    | jq -r '.[]
      | select(.focused==true)
      | (.activeWorkspace.name // .activeWorkspace.id // empty)' \
    | head -n1 || true)

  # 2) fallback: hyprctl -j workspaces -> .focused == true
  if [[ -z "$current_ws" ]]; then
    current_ws=$(hyprctl -j workspaces 2>/dev/null \
      | jq -r '.[] | select(.focused==true) | (.name // .id // empty)' \
      | head -n1 || true)
  fi

  # As a final fallback try activewindow textual output and extract workspace if possible
  if [[ -z "$current_ws" ]]; then
    if hyprctl activewindow >/dev/null 2>&1; then
      current_ws=$(hyprctl activewindow 2>/dev/null | awk -F: '/workspace/ {gsub(/ /,"",$2); print $2; exit}')
    fi
  fi

  # If we have a current workspace, check for Firefox clients assigned to it
  if [[ -n "$current_ws" ]]; then
    # hyprctl -j clients can contain fields like .class, .appTitle, .workspace
    firefox_on_current_ws=$(hyprctl -j clients 2>/dev/null \
      | jq --arg ws "$current_ws" -r '
          .[] |
          ( (.class // "" ) + " " + (.appTitle // "") + " " + (.workspace // "") ) as $s |
          if ($s | ascii_downcase) | test("firefox") then
            # attempt multiple workspace fields to compare (workspace, workspaceName, workspaceId)
            ( (.workspace // "") , (.workspaceName // "") , ((.workspaceId|tostring) // "") ) | any(. == $ws)
          else
            false
          end
        ' \
      | grep -q true && echo true || echo false) || firefox_on_current_ws=false
  fi
fi

# If hyprctl/jq detection failed, fallback to a heuristic:
# Check if any visible firefox window belongs to the same XDG_SESSION or the same PID tree.
# This is imperfect; in that case, we will conservatively open the tab then focus firefox.
if [[ "$hyprctl_ok" == "false" || "$jq_ok" == "false" ]]; then
  # We don't know which workspace is current; safest behavior is:
  # - open the tab in the existing instance (firefox --new-tab ...)
  # - then try to focus a firefox window (as before)
  "${FIREFOX_CMD[@]}" &
  # best-effort focus if hyprctl present
  if command -v hyprctl >/dev/null 2>&1; then
    hyprctl dispatch focuswindow class:firefox || true
  fi
  exit 0
fi

# At this point we have a reliable determination in firefox_on_current_ws (string "true" or "false")
if [[ "$firefox_on_current_ws" == "true" ]]; then
  # There's already a Firefox window on the current workspace.
  # Just open the URL in an existing instance and do not change focus/workspace.
  "${FIREFOX_CMD[@]}" &
  exit 0
else
  # No Firefox window on the current workspace: open the URL and focus a Firefox window.
  "${FIREFOX_CMD[@]}" &

  # Give the browser a moment to register the new tab/window (tweakable)
  sleep 0.15

  # Try to focus the client that most likely received the tab. We attempt a few strategies:
  # 1) If hyprctl -j clients exposes a 'lastActivity' or 'lastFocus' timestamp, pick the most recent.
  # 2) Otherwise fallback to the simple class-based focus (existing behavior).
  if hyprctl -j clients >/dev/null 2>&1; then
    # pick the firefox client with the largest 'lastActivity' or 'lastFocus' field if present
    client_id=$(hyprctl -j clients 2>/dev/null \
      | jq -r '
          map(select((.class // "") | ascii_downcase | contains("firefox"))) as $ff |
          if ($ff | length) == 0 then
            empty
          else
            # try several timestamp-like fields
            ($ff
              | map({id: (.id // .handle // .address // ""), ts: (.lastActivity // .lastFocus // .lastActive // 0)}) )
            | sort_by(.ts) | last | .id
          end
        ' | head -n1 || true)

    if [[ -n "$client_id" ]]; then
      # attempt to focus by the client id if hyprctl accepts it
      # hyprctl dispatch focuswindow address:<id> or id:<id> - behavior varies; try address then id then class
      if hyprctl dispatch focuswindow address:"$client_id" >/dev/null 2>&1; then
        exit 0
      elif hyprctl dispatch focuswindow id:"$client_id" >/dev/null 2>&1; then
        exit 0
      fi
    fi
  fi

  # final fallback: class-based focus (what you had before)
  hyprctl dispatch focuswindow class:firefox || true
  exit 0
fi
