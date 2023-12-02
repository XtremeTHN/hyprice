import { Widget } from "resource:///com/github/Aylur/ags/widget.js";
import Hyprland from 'resource:///com/github/Aylur/ags/service/hyprland.js';
import { truncateWindowName, truncateTitle, Box, Separator } from "./lib/misc.js";
import { Music } from "./lib/music.js";
// @ts-ignore
import BatteryIndicator from "./lib/battery.js";
import { Clock } from "./lib/variables.js";
import { AudioIndicator } from "./lib/audio.js";
import { NetworkIndicator } from "./lib/network.js";
import BluetoothIndicator from "./lib/bluetooth.js";

import { Dispatch } from './lib/hyprland.js';

const WindowTitle = () => Widget.Box({
    class_name: "topbar-windowtitle",
    vertical: true,
    children: [
        Widget.Label({
            xalign: 0,
            class_name: "topbar-windowtitle-class",
            connections: [[Hyprland, label => { // Hyprland.active.client
                // @ts-ignore
                label.label = Hyprland.active.client._class.length === 0 ? 'Desktop' : Hyprland.active.client._class
            }]],
        }),
        Widget.Label({
            xalign: 0,
            class_name: "topbar-windowtitle-title",
            connections: [
                [Hyprland, self => {
                    // @ts-ignore
                    self.label = truncateWindowName(Hyprland.active.client._title.length === 0 ? `Workspace ${Hyprland.active.workspace.id}` : truncateTitle(Hyprland.active.client._title), 26)

                }]
            ]
        }),
    ]
})


const Workspaces = () => Widget.Box({
    class_name: "topbar-workspaces",
    children: Array.from({ length: 10 }, (_, i) => i + 1).map(i=> Widget.Button({
        class_name: "topbar-workspaces-button",
        // @ts-ignore
        setup: btn => btn.id = i,
        child: Widget.Box({class_name:"topbar-workspaces-button-circle"}),
        // @ts-ignore
        onClicked: () => Dispatch(i),
    })),
    connections: [
        [Hyprland, self => self.children.forEach(btn => {
            const workspaces = Hyprland.workspaces;
            const current_ws = Hyprland.active.workspace.id;
            // @ts-ignore
            btn.visible = workspaces.some(ws => ws.id === btn.id);
            // @ts-ignore
            btn.child.toggleClassName('active', current_ws === btn.id);
        })]
    ]
})

const LeftWidgets = () => Widget.Box({
    spacing: 15,
    class_name: "topbar-widgets-left",
    children: [
        WindowTitle(),
        Workspaces()
    ]
})

const CenterWidgets = () => Widget.Box({
    hexpand: true,
    children: [
        Music()
    ]
})

const RightWidgets = () => Widget.Box({
    class_name: "topbar-widgets-right-control-icons",
    spacing: 10,
    children: [
        Separator(false),
        Clock(),
        Box([
            BatteryIndicator(),
            AudioIndicator(),
            BluetoothIndicator(),
            NetworkIndicator(),
        ])
    ]
})

const BarContent = () => Widget.CenterBox({
    class_name: "topbar-box",
    homogeneous: true,
    vertical: false,
    hexpand: true,
    // @ts-ignore
    halign: 'fill',
    start_widget: LeftWidgets(),
    center_widget: CenterWidgets(),
    end_widget: RightWidgets()
})

export const Bar = () => {
    return Widget.Window({
        name: "topbar",
        class_name: "topbar-window",
        layer: 'top',
        // @ts-ignore
        margins: [5,5,5,5],
        anchor: ['top', 'left','right'],
        // @ts-ignore
        exclusivity: "exclusive",
        child: BarContent(),
    })
}