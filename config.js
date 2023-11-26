import App from 'resource:///com/github/Aylur/ags/app.js'
import { Bar } from './src/bar.js'
import { IncreaseAudio, DecreaseAudio } from './src/lib/audio.js'
import {NotificationsPopupWindow} from './src/lib/notifications.js'
import { execAsync, interval } from 'resource:///com/github/Aylur/ags/utils.js'
import Network  from 'resource:///com/github/Aylur/ags/service/network.js'

globalThis['IncreaseAudio'] = IncreaseAudio
globalThis['DecreaseAudio'] = DecreaseAudio

globalThis['Network'] = Network

export default {
    style: App.configDir + '/src/style.css',
    notificationPopupTimeout: 4000,
    windows: [
        Bar(),
        NotificationsPopupWindow()
    ]
}