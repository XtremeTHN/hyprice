import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { lookUpIcon, timeout } from 'resource:///com/github/Aylur/ags/utils.js';
import Notifications from 'resource:///com/github/Aylur/ags/service/notifications.js';

const NotificationIcon = ({ appEntry, appIcon, image }) => {
    if (image) {
        return Widget.Box({
            vpack: 'start',
            hexpand: false,
            className: 'icon img',
            css: `
                background-image: url("${image}");
                background-size: contain;
                background-repeat: no-repeat;
                background-position: center;
                min-width: 78px;
                min-height: 78px;
            `,
        });
    }

    let icon = 'dialog-information-symbolic';
    if (lookUpIcon(appIcon))
        icon = appIcon;

    if (lookUpIcon(appEntry))
        icon = appEntry;

    return Widget.Box({
        vpack: 'start',
        hexpand: false,
        className: 'icon',
        css: `
            min-width: 78px;
            min-height: 78px;
        `,
        children: [Widget.Icon({
            icon, size: 58,
            hpack: 'center', hexpand: true,
            vpack: 'center', vexpand: true,
        })],
    });
};

export const Notification = n => Widget.EventBox({
    className: `notification ${n.urgency}`,
    onPrimaryClick: () => n.dismiss(),
    properties: [['hovered', false]],
    onHover: self => {
        if (self._hovered)
            return;

        // if there are action buttons and they are hovered
        // EventBox onHoverLost will fire off immediately,
        // so to prevent this we delay it
        timeout(300, () => self._hovered = true);
    },
    onHoverLost: self => {
        if (!self._hovered)
            return;

        self._hovered = false;
        n.dismiss();
    },
    vexpand: false,
    child: Widget.Box({
        vertical: true,
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

const Placeholder = () => Widget.Box({
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

export const ClearButton = () => Widget.Button({
    onClicked: () => Notifications.clear(),
    binds: [
        ['sensitive', Notifications, 'notifications', n => n.length > 0],
    ],
    child: Widget.Box({
        children: [
            Widget.Label('Clear'),
            Widget.Icon({
                binds: [
                    ['icon', Notifications, 'notifications', n =>
                        `user-trash-${n.length > 0 ? 'full-' : ''}symbolic`],
                ],
            }),
        ],
    }),
});

export const DNDSwitch = () => Widget({
    type: Gtk.Switch,
    vpack: 'center',
    connections: [['notify::active', ({ active }) => {
        Notifications.dnd = active;
    }]],
});

export const PopupList = () => Widget.Box({
    className: 'list',
    css: 'min-width: 1px;', // so it shows up
    vertical: true,
    connections: [
        [Notifications, self => {
            let notis = Notifications.popups
            let mapped = notis.map(Notification)
            print(mapped)
            self.children = mapped
            print(self.children)
        }]
    ]
});

export const NotificationsPopupWindow = () => Widget.Window({
    name: "notifications-popup-window",
    className: "notifications-popup-window",
    child: PopupList(),
    anchor: ['top'],
})