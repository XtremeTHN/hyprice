import Disks, {Disk} from "./services/disks.js"
import Widget from "resource:///com/github/Aylur/ags/widget.js"
import { PopupWindow } from "./misc.js"
import { execAsync } from "resource:///com/github/Aylur/ags/utils.js"
import App from "resource:///com/github/Aylur/ags/app.js"

import { Box } from "./misc.js"

const _Disk = (/** @type {Disk} **/ disk) => Widget.Box({
    spacing: 10,
    class_name: "disk-manager-item",
    children: [
        Widget.Icon({
            binds: [
                ["icon", disk, "icon-name"]
            ]
        }),
        Widget.Label({
            binds: [
                ["label", disk, "name"]
            ]
        }),
        Box([
            Widget.Label({
                connections: [
                    
                ]
            })
        ])
    ]
})

const _DiskTrayItem = (/** @type {Disk} **/ disk) => Widget.Box({
    children: [
        Widget.Icon({
            binds: [
                ["icon", disk, "icon-name"]
            ]
        })
    ]
})

export const DiskTray = () => Widget.Box({
    class_name: "dashboard-disk-tray",
    spacing: 5,
    connections: [
        [Disks, self => {
            self.children = Disks.disks.map(_DiskTrayItem)
        }]
    ]
})

// const DiskManager = () => Widget.Box({
//     class_name: "disk-manager",
//     vertical: true,
//     spacing: 5,
//     connections: [
//         [Disks, self => {
//             self.children = Disks.disks.map(_Disk)
//         }]
//     ]
// })

const DiskManager = () => Widget.Scrollable({
    hscroll: 'never',
    vscroll: 'automatic',
    child: Widget.Box({
        class_name: "disk-manager",
        spacing: 5,
        vertical: true,
        children:[],
        connections: [
            [Disks, self => {
                self.children =Disks.disks.map(_Disk)
            }]
        ]
    }),
})

export const AutomaticMounter = () => Disks.connect("disk-added", (_, disk) => {
    execAsync(['notify-send',`${disk.name} connected`, "Should mount this device?", "-A", "Yes", "-A", "No"])
        .then(out => {
            if (Number(out) == 0) {
                disk.mount((self, res, _) => {
                    if (self.mount_finish(res)) {
                        execAsync(['notify-send', `${disk.name} mounted`, "Device has been mounted"])
                    } else {
                        execAsync(['notify-send', `${disk.name} failed to mount`, "Unknown error while mounting device"])
                    }
                })
            }
        })
        .catch(err=>console.error(err))
})

export default DiskManager