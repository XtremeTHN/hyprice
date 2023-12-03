import App from 'resource:///com/github/Aylur/ags/app.js'
import Hyprland from 'resource:///com/github/Aylur/ags/service/hyprland.js'
import { Bar } from './src/bar.js'
import { IncreaseAudio, DecreaseAudio } from './src/lib/audio.js'
import {NotificationsPopupWindow} from './src/lib/notifications.js'
import { RightDashBoard, LeftDashBoard } from './src/lib/control_center.js'
import { AutomaticDispatch } from './src/lib/hyprland.js'
import { Daytime } from './src/lib/variables.js'
import Mpris from 'resource:///com/github/Aylur/ags/service/mpris.js';


globalThis['IncreaseAudio'] = IncreaseAudio
globalThis['DecreaseAudio'] = DecreaseAudio

globalThis['Mprisags'] = Mpris

AutomaticDispatch()

export default {
    style: App.configDir + '/src/style.css',
    notificationPopupTimeout: 8000,
    windows: [
        Bar(),
        NotificationsPopupWindow(),
        LeftDashBoard(),
        RightDashBoard()
    ],
    closeWindowDelay: {
        'dashboard-left': 1000,
        'dashboard-right': 1000,
    },
}