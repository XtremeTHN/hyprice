import { Widget } from "resource:///com/github/Aylur/ags/widget.js";
import Center from "./notification_center.js"
import { Box } from "./misc.js"
import { Uptime, Daytime, User } from "./variables.js";
import { NetworkSection } from "./network.js";
import { BluetoothButton } from "./bluetooth.js"
import { AudioSection, AppVolumeMixer } from "./audio.js";
import { PopupWindow } from "./misc.js";

import Tray from "./tray.js";
import App from "resource:///com/github/Aylur/ags/app.js";
import { timeout } from "resource:///com/github/Aylur/ags/utils.js";

export var config = {
    preferredPlayer: 0,
    preferredSpeaker: 0
}

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
    class_name: "dashboard-control-center",
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
        AudioSection(),
        AppVolumeMixer(),
        Tray(),
    ]
})



// export const LeftDashBoard = () => Widget.Window({
//     name: "dashboard-left",
//     class_name: "dashboard-window",
//     anchor: ['bottom', 'left', 'top'],
//     margins: [0,10,10,0],
//     child: Widget.Revealer({
//         className: `dashboard-window-revealer`,
//         revealChild: false,
//         transitionDuration: 500,
//         transition: 'slide_left',
//         vexpand: false,
//         child: Box([
//             Center()
//         ]),
//         connections: [
//             [App, (self, _, visible) => {
//                 print(visible)
//                 self.revealChild = visible
//             }]
//         ]
//     })
// })

export const LeftDashBoard = () => PopupWindow({
    name: "dashboard-left",
    child: Center(),
    margins: [0,10,5,5],
    anchor: ['left', 'top', 'bottom'],
    transition: "slide_right"
})

export const RightDashBoard = () => PopupWindow({
    name: "dashboard-right",
    class_name: "dashboard-window",
    anchor: ['right', 'top'],
    margins: [0,10,10,0],
    child: Box([
        QuickSettings(),
    ], "dashboard-control-center-box", true, 20),
    transition: "slide_down",
})