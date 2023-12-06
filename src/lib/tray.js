import SystemTray from "resource:///com/github/Aylur/ags/service/systemtray.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import { Section } from "./control_center.js";

import { Box } from "./misc.js";

const TrayItem = item => Widget.Button({
    class_name: "dashboard-system-tray-application",
    child: Widget.Icon({
        binds: [
            ['icon', item, 'icon']
        ]
    }),
    binds: [
        ['tooltip-markup', item, 'tooltip-markup']
    ],
    on_primary_click: (_, event) => item.activate(event),
    on_secondary_click: (_, event) => item.openMenu(event)
})

const Tray = () => Widget.Box({
    vexpand: false,
    vertical: true,
    spacing: 10,
    children: [
        Section("System Tray"),
        Box()
    ],
    connections: [
        [SystemTray, self => {
            self.children[1].children = SystemTray.items.map(TrayItem)
        }, "notify::items"]
    ],
    // binds: [
    //     ['visible', SystemTray, 'items', i => i.length > 0]
    // ]
})

export default Tray;