import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import Battery from 'resource:///com/github/Aylur/ags/service/battery.js';
import { SendNotification } from './notifications.js';

const BatteryIndicator = () => Widget.CircularProgress({
    class_name: 'topbar-widgets-right-control-battery',
    child: Widget.Icon({
        size: 8,
        binds: [
            ["icon", Battery, "icon-name"]
        ]
    }),
    binds: [
        // @ts-ignore
        ['value', Battery, 'percent', p => p > 0 ? p / 100 : 0],
        // @ts-ignore
        ['tooltip_text', Battery, 'percent', p => `${(p > 0 ? p / 100 : 0) *100}%`],
        ['class_name', Battery, 'charging', c => c ? 'topbar-widgets-right-control-battery-charging' : 'topbar-widgets-right-control-battery'],
    ],
});

// var already_notified = false

// Battery.connect("notify", (ok) => {
//     if (ok.percent !== -1) {
//         if (ok.percent < 25) {
//             if (!already_notified)  {
//                 SendNotification("Battery Low", "Battery is in low percentage, connect the charger when possible", [], "battery-caution-symbolic")
//                 already_notified = true
//             } else {
//                 if (ok.)
//             }
//         } else if (ok.percent < 5) {
//             if 
//             SendNotification("Battery Very Low", "Baterry is in very low level!, connect the charger now", [], "battery-empty-symbolic")
//         }
//     }
// })

export default BatteryIndicator

