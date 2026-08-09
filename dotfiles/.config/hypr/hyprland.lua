--
--###############
--## MONITORS ###
--###############

-- See https://wiki.hyprland.org/Configuring/Monitors/

hl.monitor({
	output = "desc:InfoVision Optoelectronics (Kunshan) Co.Ltd China 0x8CBE 0x00000004", --internal
	mode = "preferred",
	position = "auto-up",
	scale = 1.00,
})

-- hl.monitor({
-- 	output = "DP-1",
-- 	mirror = "eDP-1",
-- 	mode = "preferred",
-- 	position = "auto-up",
-- 	-- scale = 2.00,
-- })

hl.monitor({
	output = "desc:NEC Corporation NP-P547UL G34000078",
	mirror = "desc:InfoVision Optoelectronics (Kunshan) Co.Ltd China 0x8CBE 0x00000004",
	position = "auto-up",
})
hl.monitor({
	output = "desc:Lenovo Group Limited P27h-20 V90CYD1H", --extern moosach
	mode = "preferred",
	position = "auto-up",
	scale = 1.00,
})

-- hl.monitor({
-- 	output = "DP-2",
-- 	mode = "preferred",
-- 	position = "auto-up",
-- 	scale = 1.00,
-- })

-- monitor=DP-2, preffered, auto-up, 1.0
-- monitor=DP-1,preferred,auto-up,1.0, mirror, eDP-1
-- monitor=DP-2,preferred,auto-up,2.0
-- monitor=DP-5,1920x1080,-1080x0,auto
-- monitor=eDP-1, 1920x1080@40.00Hz, 0x0, 1

hl.config({
	xwayland = {
		force_zero_scaling = true,
	},
})

hl.config({
	ecosystem = {
		no_donation_nag = false,
	},
})

hl.env("GDK_SCALE", 2)

hl.env("QT_QPA_PLATFORMTHEME", "qt5ct")
hl.env("QT_STYLE_OVERRIDE", "Adwaita")
hl.env("QT_QUICK_CONTROLS_STYLE", "Adwaita")
hl.env("QT_QPA_PLATFORMTHEME", "qt6ct")
hl.env("QT_QUICK_CONTROLS_STYLE", "Adwaita")

-- disable va
hl.env("LIBVA_DRIVER_NAME", "")

hl.env(
	"XDG_DATA_DIRS",
	"local_var_HOME/.local/share/flatpak/exports/share:/var/lib/flatpak/exports/share:/usr/local/share/:/usr/share/"
)

hl.config({
	render = {
		direct_scanout = 0,
	},
})

--##################
--## MY PROGRAMS ###
--##################

-- See https://wiki.hyprland.org/Configuring/Keywords/
-- Set programs that you use

local terminal = "alacritty"

--############################
--## ENVIRONMENT VARIABLES ###
--############################

-- env = WLR_NO_HARDWARE_CURSORS,1

hl.env("XCURSOR_THEME", "Bibata-My-Magenta")
hl.env("HYPRCURSOR_THEME", "Bibata-My-Magenta")

-- env = XCURSOR_THEME,Invisible

hl.env("XCURSOR_SIZE", 24)
hl.env("HYPRCURSOR_SIZE", 24)

-- env = HYPRCURSOR_THEME,Invisible

-- env = QT_QPA_PLATFORM,wayland

hl.env("GDK_BACKEND", "wayland")

-- env = AQ_DRM_DEVICES,/dev/dri/card0:/dev/dri/card1

-- env = AQ_DRM_DEVICES,/dev/dri/card0

-- See https://wiki.hyprland.org/Configuring/Environment-variables/

--####################

--## LOOK AND FEEL ###

--####################

-- Refer to https://wiki.hyprland.org/Configuring/Variables/

hl.config({
	cursor = {
		-- invisible = true,
		-- no_hardware_cursors = true,
		-- inactive_timeout = 3.0
		-- hide_on_touch = false
	},
})

hl.config({
	general = {
		gaps_in = 3,
		gaps_out = 6,
		border_size = 2,
		-- gaps_in = 0
		-- gaps_out = 0
		-- border_size = 0
		-- https://wiki.hyprland.org/Configuring/Variables/#variable-types for info about colors
		--col.active_border = rgba(33ccffee) rgba(00ff99ee) 45deg
		--col.active_border = rgba(00ff37ff)
		--col.active_border = rgb(ff0000) rgb(ffff00) rgb(00ff00) rgb(00ffff) rgb(0000ff) rgb(ff00ff) 200deg
		--col.inactive_border = rgba(595959aa)
		--col.inactive_border = rgba(ff33ffff)
		-- col.inactive_border = rgba(880000ff) rgba(888800ff) rgba(008800ff) rgba(008888ff) rgba(000088ff) rgba(880088ff) 20deg
		--col.active_border = rgba(62aeefff)
		--col.active_border = rgba(ff0000ff) rgba(ffa500ff) rgba(ffff00ff) rgba(80ff00ff) rgba(00ff00ff) rgba(00ff80ff) rgba(00ffffff) rgba(0080ffff) rgba(0000ffff) rgba(8000ffff) 20deg
		-- col.inactive_border = rgba(6e6a86ff)
		-- Set to true enable resizing windows by clicking and dragging on borders and gaps
		resize_on_border = true,
		-- Please see https://wiki.hyprland.org/Configuring/Tearing/ before you turn this on
		allow_tearing = false,
		layout = "dwindle",
		col = {
			active_border = "rgba(ff00ffff)",
			inactive_border = "rgba(00000040)",
		},
	},
})

-- https://wiki.hyprland.org/Configuring/Variables/#decoration

hl.config({
	decoration = {
		rounding = 10,
		-- rounding = 0
		-- Change transparency of focused and unfocused windows
		active_opacity = 0.95,
		-- active_opacity = 1.0
		inactive_opacity = 0.9,
		-- inactive_opacity = 1.0
		-- screen_shader = "~/.config/hypr/shader/screenShader.frag",
		-- screen_shader=
		-- drop_shadow = true
		-- shadow_range = 4
		-- shadow_render_power = 3
		-- col.shadow = rgba(1a1a1aee)
		-- https://wiki.hyprland.org/Configuring/Variables/#blur
		blur = {
			enabled = true,
			size = 1,
			passes = 1,
			vibrancy = 0.1696,
		},
	},
})

-- https://wiki.hyprland.org/Configuring/Variables/#animations

hl.config({
	animations = {
		enabled = true,
		-- Default animations, see https://wiki.hyprland.org/Configuring/Animations/ for more
		-- animation = windowsOut,  0, $animation_speed, default, popin 80%
	},
})

-- hl.curve("myBezier", { type = "bezier", points = { { 0.10, 0.5 }, { 0.5, 1.10 } } })
hl.curve("myBezier", { type = "bezier", points = { { 0.0, 0.0 }, { 1.0, 1.0 } } })
local animation_speed = 1
hl.animation({
	leaf = "global",
	enabled = true,
	speed = animation_speed,
	bezier = "default",
})

-- See https://wiki.hyprland.org/Configuring/Dwindle-Layout/ for more

hl.config({
	dwindle = {
		-- pseudotile = true # Master switch for pseudotiling. Enabling is bound to mainMod + P in the keybinds section below
		preserve_split = true,
		-- You probably want this
		-- smart_split = true
	},
})

-- See https://wiki.hyprland.org/Configuring/Master-Layout/ for more

hl.config({
	master = {
		new_status = "master",
	},
})

-- https://wiki.hyprland.org/Configuring/Variables/#misc

hl.config({
	misc = {
		force_default_wallpaper = 1,
		-- Set to 0 or 1 to disable the anime mascot wallpapers
		disable_hyprland_logo = true,
		-- If true disables the random hyprland logo / anime girl background. :(
	},
})

hl.config({
	debug = {
		-- damage_tracking = 0
		-- damage_blink = true
		-- overlay = true
		-- pass = true
		-- disable_logs = false
	},
})

--############
--## INPUT ###
--############

-- https://wiki.hyprland.org/Configuring/Variables/#input

hl.config({
	input = {
		kb_layout = "de",
		kb_variant = "",
		kb_model = "",
		kb_options = "caps:swapescape",
		kb_rules = "",
		follow_mouse = 1,
		sensitivity = 0,
		-- -1.0 - 1.0, 0 means no modification.
		touchpad = {
			natural_scroll = true,
		},
	},
})

-- https://wiki.hyprland.org/Configuring/Variables/#gestures

hl.config({
	gestures = {
		-- fingers = 3
		-- action = "workspace"
		-- workspace_swipe_cancel_ratio = 0.05
		-- workspace_swipe_distance = 150
		-- workspace_swipe_forever  = true
	},
})

-- Example per-device config

-- See https://wiki.hyprland.org/Configuring/Keywords/#per-device-input-configs for more

hl.device({
	name = "epic-mouse-v1",
	sensitivity = -0.5,
})

--##################
--## KEYBINDINGS ###
--##################

-- See https://wiki.hyprland.org/Configuring/Keywords/

-- Sets "Windows" key as main modifier
local mainMod = "SUPER"

-- Screenshot into clipboard
hl.bind("Print", hl.dsp.exec_cmd("~/.config/hypr/script/WithoutShader.sh hyprshot --freeze -m region -o ~/Pictures"))
hl.bind(mainMod .. " + " .. "O", hl.dsp.exec_cmd("hyprlock"))
hl.bind(mainMod .. " + " .. "Return", hl.dsp.exec_cmd(terminal), { repeating = true })
hl.bind(mainMod .. " + " .. "B", hl.dsp.exec_cmd("firefox"))
hl.bind(mainMod .. " + " .. "SHIFT" .. " + " .. "B", hl.dsp.exec_cmd("firefox --private-window"))
hl.bind(mainMod .. " + " .. "Q", hl.dsp.exec_cmd("hyprctl kill"))

-- bind = $mainMod, C, killactive,

-- hl.bind(mainMod .. " + " .. "C", hl.dsp.exec_cmd("~/.config/hypr/script/KillAktive.sh"))
hl.bind(mainMod .. " + " .. "C", hl.dsp.window.close())

-- bind = $mainMod, K, killactive

-- bind = $mainMod, M, exit,

hl.bind(mainMod .. " + " .. "M", hl.dsp.workspace.move({ monitor = "+1" }), { repeating = true })

hl.bind(mainMod .. " + " .. "E", hl.dsp.exec_cmd("~/.config/hypr/script/WithoutShader.sh hyprpicker"))
hl.bind(mainMod .. " + " .. "V", hl.dsp.window.float(), { repeating = true })
hl.bind(mainMod .. " + " .. "P", hl.dsp.window.pseudo(), { repeating = true })

-- dwindle

--bind = $mainMod,  SUPER_L, exec, $menu

hl.bind(mainMod .. " + " .. "SPACE", hl.dsp.exec_cmd("~/.config/hypr/script/MoveOrStartWofi.sh"))

--bind = $mainMod, R, exec, $menu

hl.bind(mainMod .. " + " .. "X", hl.dsp.layout("togglesplit"), { repeating = true })

-- dwindle

hl.bind(mainMod .. " + " .. "Y", hl.dsp.layout("swapsplit"), { repeating = true })

-- dwindle

-- bind = $mainMod, Y, exec, systemctl suspend-then-hibernate
-- bind = $mainMod, B, exec, bluetoothctl connect C8:7B:23:D7:2F:AE
-- bind = $mainMod, N, exec, systemctl hibernate

hl.bind(mainMod .. " + " .. "N", hl.dsp.exec_cmd("~/.config/hypr/script/MoveFokusAppToFreeWorkspace.sh"))

-- bind = $mainMode, J, exec, ~/.config/hypr/script/MenuInNewWorkSpace "$menu"

hl.bind(mainMod .. " + " .. "W", hl.dsp.exec_cmd("pkill waybar || waybar"))
hl.bind(mainMod .. " + " .. "R", hl.dsp.exec_cmd("hyprctl reload"))
hl.bind(mainMod .. " + " .. "F", hl.dsp.window.fullscreen(), { repeating = true })
hl.bind(mainMod .. " + " .. "S", hl.dsp.exec_cmd("~/.config/hypr/script/CycleShaders.sh -f"), { repeating = true })
hl.bind(
	mainMod .. " + " .. "SHIFT" .. " + " .. "S",
	hl.dsp.exec_cmd("~/.config/hypr/script/CycleShaders.sh -b"),
	{ repeating = true }
)

-- Move focus with mainMod + arrow keys

hl.bind(mainMod .. " + " .. "h", hl.dsp.focus({ direction = "left" }), { repeating = true })
hl.bind(mainMod .. " + " .. "l", hl.dsp.focus({ direction = "right" }), { repeating = true })
hl.bind(mainMod .. " + " .. "k", hl.dsp.focus({ direction = "up" }), { repeating = true })
hl.bind(mainMod .. " + " .. "j", hl.dsp.focus({ direction = "down" }), { repeating = true })

-- Switch workspaces with mainMod + [0-9]

for i = 1, 10 do
	local key = (i == 10) and "0" or tostring(i)
	hl.bind(mainMod .. " + " .. key, hl.dsp.focus({ workspace = i }))
end

-- Move Split
hl.bind(
	mainMod .. " + " .. "CTRL" .. " + " .. "h",
	hl.dsp.window.resize({ x = -20, y = 0, relative = true }),
	{ repeating = true }
)
hl.bind(
	mainMod .. " + " .. "CTRL" .. " + " .. "l",
	hl.dsp.window.resize({ x = 20, y = 0, relative = true }),
	{ repeating = true }
)
hl.bind(
	mainMod .. " + " .. "CTRL" .. " + " .. "k",
	hl.dsp.window.resize({ x = 0, y = -20, relative = true }),
	{ repeating = true }
)
hl.bind(
	mainMod .. " + " .. "CTRL" .. " + " .. "j",
	hl.dsp.window.resize({ x = 0, y = 20, relative = true }),
	{ repeating = true }
)

-- Move window
hl.bind(mainMod .. " + " .. "SHIFT" .. " + " .. "h", hl.dsp.window.move({ direction = "l" }), { repeating = true })
hl.bind(mainMod .. " + " .. "SHIFT" .. " + " .. "l", hl.dsp.window.move({ direction = "r" }), { repeating = true })
hl.bind(mainMod .. " + " .. "SHIFT" .. " + " .. "k", hl.dsp.window.move({ direction = "u" }), { repeating = true })
hl.bind(mainMod .. " + " .. "SHIFT" .. " + " .. "j", hl.dsp.window.move({ direction = "d" }), { repeating = true })

-- Move active window to a workspace with mainMod + SHIFT + [0-9]

for i = 1, 10 do
	local key = (i == 10) and "0" or tostring(i)
	hl.bind(mainMod .. " + SHIFT + " .. key, hl.dsp.window.move({ workspace = i }))
end

-- Example special workspace (scratchpad)

-- bind = $mainMod, S, togglespecialworkspace, magic

-- bind = $mainMod SHIFT, S, movetoworkspace, special:magic

-- Scroll through existing workspaces with mainMod + scroll
hl.bind(mainMod .. " + " .. "mouse_down", hl.dsp.focus({ workspace = "e+1" }))
hl.bind(mainMod .. " + " .. "mouse_up", hl.dsp.focus({ workspace = "e-1" }))

-- Move/resize windows with mainMod + LMB/RMB and dragging
hl.bind(mainMod .. " + " .. "mouse:272", hl.dsp.window.drag(), { mouse = true })
hl.bind(mainMod .. " + " .. "mouse:273", hl.dsp.window.resize(), { mouse = true })

-- Laptop multimedia keys for volume and LCD brightness

hl.bind(
	"XF86AudioRaiseVolume",
	hl.dsp.exec_cmd("wpctl set-volume @DEFAULT_AUDIO_SINK@ 2%+"),
	{ locked = true, repeating = true }
)
hl.bind(
	"XF86AudioLowerVolume",
	hl.dsp.exec_cmd("wpctl set-volume @DEFAULT_AUDIO_SINK@ 2%-"),
	{ locked = true, repeating = true }
)
hl.bind("XF86AudioMute", hl.dsp.exec_cmd("wpctl set-mute @DEFAULT_AUDIO_SINK@ toggle"), { locked = true })
hl.bind("XF86AudioMicMute", hl.dsp.exec_cmd("wpctl set-mute @DEFAULT_AUDIO_SOURCE@ toggle"), { locked = true })
hl.bind("XF86MonBrightnessUp", hl.dsp.exec_cmd("brightnessctl s 5%+"), { locked = true, repeating = true })
hl.bind("XF86MonBrightnessDown", hl.dsp.exec_cmd("brightnessctl s 5%-"), { locked = true, repeating = true })

-- Requires playerctl

hl.bind("XF86AudioNext", hl.dsp.exec_cmd("playerctl next"), { locked = true })
hl.bind("XF86AudioPause", hl.dsp.exec_cmd("playerctl play-pause"), { locked = true })
hl.bind("XF86AudioPlay", hl.dsp.exec_cmd("playerctl play-pause"), { locked = true })
hl.bind("XF86AudioPrev", hl.dsp.exec_cmd("playerctl previous"), { locked = true })

-- Lid hyprlock

-- bindl=,switch:Lid Switch, exec, hyprlock

--#############################
--## WINDOWS AND WORKSPACES ###
--#############################

-- See https://wiki.hyprland.org/Configuring/Window-Rules/ for more

-- See https://wiki.hyprland.org/Configuring/Workspace-Rules/ for workspace rules

hl.env("ELECTRON_OZONE_PLATFORM_HINT", "auto")

-- Ignore maximize requests from apps. You'll probably like this.
-- windowrule = match:class .* suppressevent maximize

hl.window_rule({
	name = "ontop",
	match = {
		class = "polkit-gnome-authentication-agent-1",
	},
	stay_focused = true,
	pin = true,
})

hl.window_rule({
	name = "ontop",
	match = {
		class = "wofi",
	},
	stay_focused = true,
	pin = true,
})
-- windowrule = match:class jetbrains-idea, opacity 0.9
-- windowrule = match:class cc.cubocore.CoreKeyboard, float on
-- windowrule = match:class cc.cubocore.CoreKeyboard, pin on

--################
--## AUTOSTART ###
--################

-- Autostart
hl.on("hyprland.start", function()
	hl.exec_cmd("alacritty")
	hl.exec_cmd("waybar & hyprpaper & swaync")
	hl.exec_cmd("/usr/lib/polkit-gnome/polkit-gnome-authentication-agent-1")
	hl.exec_cmd("/usr/bin/gnome-keyring-daemon --start --components=secrets,ssh,pkcs11")
end)

-- Exec (run every reload)
hl.on("config.reloaded", function()
	hl.exec_cmd("~/.config/hypr/script/CycleShaders.sh --updateOnly")
	hl.exec_cmd("gsettings set org.gnome.desktop.interface color-scheme prefer-dark")
	hl.exec_cmd("gsettings set org.gnome.desktop.interface gtk-theme adw-gtk3")
	hl.exec_cmd("gsettings set org.gnome.desktop.wm.preferences button-layout ':'")
end)
