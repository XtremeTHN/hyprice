import App from 'resource:///com/github/Aylur/ags/app.js'
import Hyprland from 'resource:///com/github/Aylur/ags/service/hyprland.js'
import { Bar } from './src/bar.js'
import { IncreaseAudio, DecreaseAudio } from './src/lib/audio.js'
import {NotificationsPopupWindow} from './src/lib/notifications.js'
import { RightDashBoard, LeftDashBoard } from './src/lib/control_center.js'
import { AutomaticDispatch } from './src/lib/hyprland.js'
import { Runner } from './src/lib/runner.js'
import { AutomaticMounter } from './src/lib/disk.js'
import Disks from "./src/lib/services/disks.js"

const notifications = Service.import('notifications')

notifications.popupTimeout = 3000

globalThis['IncreaseAudio'] = IncreaseAudio
globalThis['DecreaseAudio'] = DecreaseAudio
globalThis['Disks'] = Disks

AutomaticDispatch()
AutomaticMounter()

App.config({
    style: App.configDir + '/src/style.css',
    windows: [
        Bar(),
        NotificationsPopupWindow(),
        LeftDashBoard(),
        RightDashBoard(),
        Runner(),
    ],
    closeWindowDelay: {
        'dashboard-left': 1000,
        'dashboard-right': 1000,
        'runner': 1000,
        'disk-manager':1000,
    },
})
