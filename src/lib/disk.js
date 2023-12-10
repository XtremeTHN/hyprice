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
        Box([
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
        ],"", false, 10, {
            hexpand: true
        }),
        Widget.Button({
            hpack: 'end',
            connections: [
                [disk, self => {
                    print(disk.is_mounted)
                    if (!disk.is_mounted) {
                        self.child = Widget.Label("Mount")
                        self.on_clicked = () => {
                            disk.mount((self, res, data) => {
                                if (self.mount_finish(res)) {
                                    execAsync(['notify-send', `${disk.name} mounted`, "Device has been mounted"])
                                } else {
                                    execAsync(['notify-send', `${disk.name} failed to mount`, "Unknown error while mounting device"])
                                }
                            })
                        }
                    } else {
                        self.child = Widget.Box({
                            spacing: 5,
                            children: [
                                Widget.Icon("media-eject-symbolic"),
                                Widget.Label("Umount")
                            ]
                        })
                        self.on_clicked = () => {
                            disk.umount((self, res, data) => {
                                if (self.eject_with_operation_finish(res)) {
                                    execAsync(['notify-send', `${disk.name} ejected`, "Device has been ejected"])
                                } else {
                                    execAsync(['notify-send', `${disk.name} failed to eject`, 'Unknown error while ejecting device'])
                                }
                            })
                        }
                    }
                }]
            ]
        })
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
            if (out !== "" && Number(out) == 0) {
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