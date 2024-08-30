import * as Utils from 'resource:///com/github/Aylur/ags/utils.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import AgsWindow from 'resource:///com/github/Aylur/ags/widgets/window.js';
import App from 'resource:///com/github/Aylur/ags/app.js';
import GObject from 'gi://GObject';

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

export const Box = (elements=[], className="", vertical=false, spacing=10, {...rest}={}) => Widget.Box({
    spacing, 
    vertical,
    class_name: className,
    children: elements,
    ...rest
})

export const Separator = (vertical) => {
    return Widget.Box({vexpand: vertical, hexpand: vertical ? false : true})
}

class AnimatedWindow extends AgsWindow {
    static { GObject.registerClass(this); }

    /** @param {import('types/widgets/window').WindowProps & {
     *      name: string
     *      child: import('types/widgets/box').default
     *      transition?: import('types/widgets/revealer').RevealerProps['transition']
     *  }} o
     */
    constructor({ name, child, transition = 'none', visible = false, ...rest }) {
        super({
            ...rest,
            name,
            keymode: "on-demand",
            class_names: ['popup-window', name],
        });

        child.toggleClassName('window-content');
        this.revealer = Widget.Revealer({
            transition,
            child,
            transitionDuration: 1000,
        }).hook(App, (_, wname, visible) => {
            if (wname === name) this.revealer.reveal_child = visible;
        });

        this.child = Widget.Box({
            css: 'padding: 1px;',
            child: this.revealer,
        });

        this.show_all();
        this.visible = visible;
    }

    set transition(dir) { this.revealer.transition = dir; }
    get transition() { return this.revealer.transition; }
}



/** @param {import('types/widgets/window').WindowProps & {
 *      name: string
 *      child: import('types/widgets/box').default
 *      transition?: import('types/widgets/revealer').RevealerProps['transition']
 *  }} config
 */
export const PopupWindow = (config) => {
    return new AnimatedWindow(config)
}

export const RotateWidget = (widget, angle) => {
    let w = widget
    w.set_angle(angle)
    return w
}
