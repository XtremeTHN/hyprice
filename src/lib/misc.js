import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';

export const truncateWindowName = (str, len) => {
    if (str.length > len)
        return str.substring(0, len) + '...';
    else
        return str
}

export const truncateTitle = (str) => {
    let lastDash = -1;
    let found = -1; // 0: em dash, 1: en dash, 2: minus, 3: vertical bar, 4: middle dot
    for (let i = str.length - 1; i >= 0; i--) {
        if (str[i] === '—') {
            found = 0;
            lastDash = i;
        }
        else if (str[i] === '–' && found < 1) {
            found = 1;
            lastDash = i;
        }
        else if (str[i] === '-' && found < 2) {
            found = 2;
            lastDash = i;
        }
        else if (str[i] === '|' && found < 3) {
            found = 3;
            lastDash = i;
        }
        else if (str[i] === '·' && found < 4) {
            found = 4;
            lastDash = i;
        }
    }
    if (lastDash === -1) return str;
    return str.substring(0, lastDash);
}

export const dispatch = w => {
    Utils.execAsync(`hyprctl dispatch workspace ${w}`)
}

export const Box = (elements, className="", vertical=false, spacing=10) => Widget.Box({
    spacing: spacing,
    vertical: vertical,
    class_name: className,
    children: elements,
})