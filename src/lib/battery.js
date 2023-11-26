import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import Battery from 'resource:///com/github/Aylur/ags/service/battery.js';

export const BatteryIndicator = () => Widget.CircularProgress({
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