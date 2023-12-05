// @ts-ignore
import Bluetooth from 'resource:///com/github/Aylur/ags/service/bluetooth.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { Box } from './misc.js';

import { Section } from './control_center.js';

const BluetoothIndicator = () => Widget.Icon({
    size: 14,
    binds: [
        ['icon', Bluetooth, 'enabled', bool => bool ? "bluetooth-active-symbolic":"bluetooth-disabled-symbolic"]
    ]
})

export const BluetoothButton = () => Widget.Button({
    class_name: "dashboard-quicksettings-button",
    child: Widget.Box({
        spacing: 10,
        children: [
            BluetoothIndicator(),
            Box([
                Widget.Label({
                    label: "Bluetooth",
                    xalign: 0,
                    css: "font-size: large; font-weight: 800;"
                }),
                Widget.Label({
                    xalign: 0,
                    hexpand: true,
                    css: "font-size: smaller;",
                    connections: [
                        [Bluetooth, self => {
                            if (!Bluetooth.connectedDevices[0]) {
                                self.label="No device connected"
                                return
                            }
                            self.label = Bluetooth.connectedDevices[0].name
                        }, "notify::connected-devices"]
                    ]
                })
            ], "", true, 0),
            Widget.CircularProgress({
                connections: [
                    [Bluetooth, self => {
                        if (!Bluetooth.connectedDevices[0]) {
                            self.value=0
                            return
                        }
                        self.value = Bluetooth.connectedDevices[0]['battery-level']
                    }]
                ]
            })
        ]
    }),
    connections: [
        [Bluetooth, self => {
            self.toggleClassName("active", Bluetooth.connectedDevices !== undefined)
        }]
    ]
    
})
// const Device = (d) => Widget.Box({
//     class_name: "dashboard-quicksettings-bluetooth-device",
//     children: [
//         Widget.Icon({
//             binds: [
//                 ["icon", d, "icon-name"]
//             ]
//         }),
//         Widget.Label({
//             binds: [
//                 ["label", d, "name"]
//             ]
//         }),
//         Widget.CircularProgress({
//             binds: [
//                 ["value", d, "battery-level", b => b > 0 ? b / 100 : 0]
//             ]
//         })
//     ]
// })

// const ConnectedDeviceList = () => Widget.Box({
//     vertical: true,
//     connections: [
//         [Bluetooth, self => {
//             self.children = Bluetooth.connectedDevices
//                 .map(Device)
//         }, "notify::connected-devices"]
//     ]
// })

// const DeviceList = () => Widget.Box({
//     connections: [
//         [Bluetooth, self => {
//             self.children = Bluetooth.devices
//                 .map(Device)
//         }, "notify::devices"]
//     ]
// })

// export const BluetoothSection = () => Widget.Box({
//     children: [
//         Section("Bluetooth"),
//         Box([
//             ConnectedDeviceList(),
//             DeviceList(),
//         ], "", true, 15)
//     ],
//     connections: [
//         [Bluetooth, self => {
//             self.visible = Bluetooth.connectedDevices.length > 0
//         }, "notify::connected-devices"]
//     ]
// })

export default BluetoothIndicator