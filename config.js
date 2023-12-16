import App from 'resource:///com/github/Aylur/ags/app.js'
import Hyprland from 'resource:///com/github/Aylur/ags/service/hyprland.js'
import { Bar } from './src/bar.js'
import { IncreaseAudio, DecreaseAudio } from './src/lib/audio.js'
import {NotificationsPopupWindow} from './src/lib/notifications.js'
import { RightDashBoard, LeftDashBoard } from './src/lib/control_center.js'
import { AutomaticDispatch } from './src/lib/hyprland.js'
import { Runner } from './src/lib/runner.js'
import { AutomaticMounter } from './src/lib/disk.js'
import { execAsync } from 'resource:///com/github/Aylur/ags/utils.js'

globalThis['IncreaseAudio'] = IncreaseAudio
globalThis['DecreaseAudio'] = DecreaseAudio
globalThis['Hyprland'] = Hyprland

AutomaticDispatch()
AutomaticMounter()

// Hyprland.monitors.map(monitor => {
//     console.log(monitor.id)
// })

export default {
    style: App.configDir + '/src/style.css',
    notificationPopupTimeout: 8000,
    windows: [
        NotificationsPopupWindow(),
        LeftDashBoard(),
        RightDashBoard(),
        Runner(),
    ],
    closeWindowDelay: {
        'dashboard-left': 1000,
        'dashboard-right': 1000,
        'runner': 1000,
    },
}

execAsync(['hyprctl', 'monitors', '-j'])
    .then((out) => {
        let monitors = JSON.parse(out)
        monitors.map(monitor => {
            App.addWindow(Bar(monitor.id))
        })
    })
    .catch(err => console.error(err))