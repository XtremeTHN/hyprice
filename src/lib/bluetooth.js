// @ts-ignore
import Bluetooth from 'resource:///com/github/Aylur/ags/service/bluetooth.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';

export const BluetoothIndicator = () => Widget.Icon({
    size: 14,
    binds: [
        ['icon', Bluetooth, 'enabled', bool => bool ? "bluetooth-active-symbolic":"bluetooth-disabled-symbolic"]
    ]
})