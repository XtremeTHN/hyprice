import Disks, {Disk} from "./services/disks.js"
import Widget from "resource:///com/github/Aylur/ags/widget.js"
import { PopupWindow } from "./misc.js"
import { execAsync } from "resource:///com/github/Aylur/ags/utils.js"
import App from "resource:///com/github/Aylur/ags/app.js"

const _Disk = (/** @type {Disk} **/ disk) => Widget.Box({
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
        })
    ]
})

const _DiskTrayItem = (/** @type {Disk} **/ disk) => Widget.Box({
    children: [
        Widget.Icon({
            binds: [
                ["icon", disk, "icon-name"]
            ]
        }),
    ]
})

export const DiskTray = () => Widget.EventBox({
    child: Widget.Box({
        connections: [
            [Disks, self => {
                self.children = Disks.disks.map(_DiskTrayItem)
            }]
        ]
    }),
    on_primary_click: () => {
        App.toggleWindow("disk-manager")
    }
})

const DiskManager = () => PopupWindow({
    name: "disk-manager",
    child: Widget.Box({
        class_name: "disk-manager",
        connections: [
            [Disks, self => {
                self.children = Disks.disks.map(_Disk)
            }]
        ]
    }),
    transition: 'crossfade',
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