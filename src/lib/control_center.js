import { Widget } from "resource:///com/github/Aylur/ags/widget.js";
import Center from "./notification_center.js"
import { Box } from "./misc.js"
import { Uptime, Daytime, User } from "./variables.js";
import { NetworkSection } from "./network.js";
import { BluetoothButton } from "./bluetooth.js"
import { AudioSection, AppVolumeMixer } from "./audio.js";
import { PopupWindow } from "./misc.js";

import Tray from "./tray.js";
import { MusicController } from './music.js'
import DiskManager from "./disk.js";

export var config = {
    preferredPlayer: 0,
    preferredSpeaker: 0
}

const StackButton = (stack, icon, item, is_first=false, is_last=false) => Widget.Button({
    // if is_first and is_last is false, the button is in the center
    class_name: `dashboard-control-center-stack-button dashboard-control-center-stack-button-${is_first == false && is_last == false ? 'center' : is_first == true ? 'first' : 'last'}`,
    hexpand: true,
    vexpand: false,
    child: Widget.Icon({
        icon: icon,
        size: 16,
    }),
    on_primary_click: (self,_) => {
        stack.shown=item
    },
    connections: [
        [stack, (self, _) => {
            self.toggleClassName("toggle", stack.shown === item)
        }, "notify::shown"]
    ]
})

export const UserName = () => {
    let user = User.charAt(0).toUpperCase() + User.slice(1)

    return Widget.Label({
        class_name: "dashboard-control-center-user",
        xalign: 0,
        label: user,
    })
}

export const Section = (name, lbl_class="") => Widget.Box({
    hexpand: true,
    vertical: true,
    children: [
        Widget.Label({
            xalign: 0,
            label: name,
            class_name: lbl_class,
        }),
        Box([], "section")
    ]
})

export const QuickSettings = () => Widget.Box({
    vertical: true,
    spacing: 10,
    children: [
        Box([
            Box([
                Widget.Label({
                    class_name: "dashboard-control-center-uptime",
                    xalign: 0,
                    hexpand: true,
                    binds: [
                        ["label", Uptime, "value"]
                    ]
                }),
                Widget.Icon({
                    vpack: 'end',
                    size: 24,
                    binds: [
                        ["icon", Daytime, "value"]
                    ]
                })
            ], "", false, 0),
            UserName(),
        ], "", true, 0),
        NetworkSection(),
        BluetoothButton(),
    ]
})

export const LeftDashBoard = () => PopupWindow({
    name: "dashboard-left",
    child: Center(),
    margins: [0,10,5,5],
    anchor: ['left', 'top', 'bottom'],
    transition: "slide_right"
})

export const RightDashBoard = () => {
    var stack = Widget.Stack({
        vexpand: false,
        items: [
            ["audio", AudioSection()],
            ["volume-mixer", AppVolumeMixer()],
            ["system-tray", Tray()],
            ["disk-tray", DiskManager()]
        ],
        transition: 'slide_left_right',
    })

    var btts = Box([
        StackButton(stack, "audio-volume-high-symbolic", "audio"),
        StackButton(stack, "microphone-sensitivity-high-symbolic", "volume-mixer"),
        StackButton(stack, "system-run-symbolic", "system-tray"),
        StackButton(stack, "drive-harddisk-symbolic", "disk-tray"),
    ], "dashboard-control-center-stack-button-box", false, 0)

    var window = PopupWindow({
        name: "dashboard-right",
        class_name: "dashboard-window",
        anchor: ['right', 'top'],
        margins: [0,10,10,0],
        child: Box([
            Box([
                QuickSettings(),
    ,           btts,
                stack,
            ], "dashboard-control-center-box", true, 20),
            MusicController()
        ], "", true, 10),
        transition: "slide_down",
    })
    return window
}