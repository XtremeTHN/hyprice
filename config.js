import App from 'resource:///com/github/Aylur/ags/app.js'
import Hyprland from 'resource:///com/github/Aylur/ags/service/hyprland.js'
import { Bar } from './src/bar.js'
import { IncreaseAudio, DecreaseAudio } from './src/lib/audio.js'
import {NotificationsPopupWindow} from './src/lib/notifications.js'
import { RightDashBoard, LeftDashBoard } from './src/lib/control_center.js'
import { AutomaticDispatch } from './src/lib/hyprland.js'
import { Runner } from './src/lib/runner.js'
import DiskManager from './src/lib/disk.js'
import { AutomaticMounter } from './src/lib/disk.js'

globalThis['IncreaseAudio'] = IncreaseAudio
globalThis['DecreaseAudio'] = DecreaseAudio

AutomaticDispatch()
AutomaticMounter()

export default {
    style: App.configDir + '/src/style.css',
    notificationPopupTimeout: 8000,
    windows: [
        Bar(),
        NotificationsPopupWindow(),
        LeftDashBoard(),
        RightDashBoard(),
        Runner(),
        DiskManager()
    ],
    closeWindowDelay: {
        'dashboard-left': 1000,
        'dashboard-right': 1000,
        'runner': 1000,
        'disk-manager':1000,
    },
}