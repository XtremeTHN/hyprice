// @ts-nocheck
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { lookUpIcon, timeout } from 'resource:///com/github/Aylur/ags/utils.js';
import Notifications from 'resource:///com/github/Aylur/ags/service/notifications.js';
import { execAsync } from 'resource:///com/github/Aylur/ags/utils.js';
import Mpris from 'resource:///com/github/Aylur/ags/service/mpris.js';

export const NotificationIcon = ({ appEntry, appIcon, image }, size=78, isize=58, pack='start') => {
    if (image) {
        return Widget.Box({
            vpack: pack,
            hexpand: false,
            className: 'icon img',
            css: `
                background-image: url("${image}");
                background-size: contain;
                background-repeat: no-repeat;
                background-position: center;
                min-width: ${size}px;
                min-height: ${size}px;
            `,
        });
    }

    let icon = 'dialog-information-symbolic';
    if (lookUpIcon(appIcon))
        icon = appIcon;

    if (lookUpIcon(appEntry))
        icon = appEntry;

    return Widget.Box({
        vpack: pack,
        hexpand: false,
        className: 'icon',
        css: `
            min-width: ${size}px;
            min-height: ${size}px;
        `,
        children: [Widget.Icon({
            icon, size: isize,
            hpack: 'center', hexpand: true,
            vpack: 'center', vexpand: true,
        })],
    });
};

export const Notification = n => {
    let css = "padding: 10px;";
    if (n['app-name'] == "Spotify" && n.image !== null) {
        css = `background-image: url("${n.image}"); background-size: cover;`
    }
    let rev = Widget.Revealer({
        className: `notification ${n.urgency}`,
        revealChild: false,
        transitionDuration: 500,
        transition: 'slide_down',
        vexpand: false,
        child: Widget.Box({
            vertical: true,
            css,
            children: [
                Widget.Box({
                    children: [
                        NotificationIcon(n),
                        Widget.Box({
                            hexpand: true,
                            vertical: true,
                            children: [
                                Widget.Box({
                                    children: [
                                        Widget.Label({
                                            className: 'title',
                                            xalign: 0,
                                            justification: 'left',
                                            hexpand: true,
                                            maxWidthChars: 24,
                                            truncate: 'end',
                                            wrap: true,
                                            label: n.summary,
                                            useMarkup: true,
                                        }),
                                        Widget.Button({
                                            className: 'close-button',
                                            vpack: 'start',
                                            child: Widget.Icon('window-close-symbolic'),
                                            onClicked: n.close.bind(n),
                                        }),
                                    ],
                                }),
                                Widget.Label({
                                    className: 'description',
                                    hexpand: true,
                                    useMarkup: true,
                                    xalign: 0,
                                    justification: 'left',
                                    label: n.body,
                                    wrap: true,
                                }),
                            ],
                        }),
                    ],
                }),
                Widget.Box({
                    className: 'actions',
                    children: n.actions.map(({ id, label }) => Widget.Button({
                        className: 'action-button',
                        onClicked: () => n.invoke(id),
                        hexpand: true,
                        child: Widget.Label(label),
                    })),
                }),
            ],
        }),
    });
    timeout(200, () => rev.revealChild = true)
    return rev
}

const List = () => Widget.Box({
    vertical: true,
    vexpand: true,
    connections: [[Notifications, self => {
        self.children = Notifications.notifications
            .reverse()
            .map(Notification);

        self.visible = Notifications.notifications.length > 0;
    }]],
});

export const Placeholder = () => Widget.Box({
    className: 'placeholder',
    vertical: true,
    vexpand: true,
    vpack: 'center',
    children: [
        Widget.Icon('notifications-disabled-symbolic'),
        Widget.Label('Your inbox is empty'),
    ],
    binds: [
        ['visible', Notifications, 'notifications', n => n.length === 0],
    ],
});

export const NotificationList = () => Widget.Scrollable({
    hscroll: 'never',
    vscroll: 'automatic',
    child: Widget.Box({
        className: 'list',
        vertical: true,
        children: [
            List(),
            Placeholder(),
        ],
    }),
});



// export const DNDSwitch = () => Widget({
//     type: Gtk.Switch,
//     vpack: 'center',
//     connections: [['notify::active', ({ active }) => {
//         Notifications.dnd = active;
//     }]],
// });

export const PopupList = () => Widget.Box({
    className: 'list',
    css: 'min-width: 1px;', // so it shows up
    vertical: true,
    binds: [['children', Notifications, 'popups',
        popups => popups.map(Notification)]],
});


export const NotificationsPopupWindow = () => Widget.Window({
    name: 'popup-window',
    anchor: ['top'],
    child: PopupList(),
});

export const SendNotification = (title, message, actions, icon) => {
    let acts = actions.reverse().map(a => `-A ${a}`)
    execAsync(["notify-send", title, message, "-i", icon, ...actions]).catch(err => console.error(err))
}

export default NotificationsPopupWindow