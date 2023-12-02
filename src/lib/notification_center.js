// @ts-nocheck
import Widget from "resource:///com/github/Aylur/ags/widget.js"
import { Box, Separator } from "./misc.js";
import Notifications, { Notification as Noti } from "resource:///com/github/Aylur/ags/service/notifications.js"
import { NotificationIcon, Placeholder } from "./notifications.js"

const Header = () => Widget.Box({
    class_name: "notification-center-head",
    vertical: false,
    children: [
        Widget.Box({
            hexpand: true,
            vertical: true,
            children: [
                Widget.Label({
                    class_name: "notification-center-head-title",
                    label: "Hi!",
                    xalign: 0,
                }),
                Widget.Label({
                    class_name: "notification-center-head-body",
                    xalign: 0,
                    binds: [
                        ["label", Notifications, "notifications", notis => `You have ${notis.length} notifications`]
                    ]
                })
            ]
        }),
        Widget.Switch({
            vpack: 'center',
            hexpand: false,
            vexpand: false,
            connections: [
                ['notify::active', ({ active }) => {
                    Notifications.dnd = active
                }]
            ]
        })
    ]
})

const fmt_body = (string, length) => {
    var res = [];
    for (var i = 0; i < string.length; i += length) {
        res.push(string.substr(i, length).trim());
    }
    return res.join('\n');
}

const Notification = (/** @type {Noti} */ n) => {

    const rev = Widget.Revealer({
        revealChild: false,
        transitionDuration: 1000,
        transition: 'slide_down',
        child: Widget.Box({
            vertical: true,
            children: [
                Widget.Label({
                    label: fmt_body(n.body, n.summary.length + 20),
                    xalign: 0,
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
            ]
        })
    })
    const btt = Widget.Button({
        child: Widget.Icon({
            icon: "go-down-symbolic",
            size: 8
        })
    })
    btt.on_primary_click = () => {
        rev.revealChild = !rev.revealChild
        if (btt.child.icon === "go-down-symbolic") {
            btt.child.icon = "go-up-symbolic"
        } else {
            btt.child.icon = "go-down-symbolic"
        }
    }
    return Widget.Box({
        class_name: "notification-center-noti",
        vertical: true,
        vexpand: false,
        hexpand: false,
        children: [
            Box([
                NotificationIcon(n,16,22, 'center'),
                Widget.Label({
                    class_name: "notification-center-noti-title",
                    xalign: 0,
                    label: n.summary,
                    hexpand: true
                }),
                btt
            ], "", false, 10),
            rev
        ]
    })
}

const List = () => Widget.Box({
    vertical: true,
    vexpand: true,
    spacing: 10,
    connections: [
        [Notifications, self => {
            self.children = Notifications.notifications.reverse()
                .map(Notification)
            
            self.visible = Notifications.notifications.length > 0;

        }]
    ]
})

const Body = () => Widget.Scrollable({
    hscroll: "never",
    vscroll: "automatic",
    child: Box([
        List(),
        Placeholder()
    ], "list", true, 0)
})

const Bottom = () => Widget.Button({
    onClicked: () => Notifications.clear(),
    binds: [
        ['sensitive', Notifications, 'notifications', n => n.length > 0],
    ],
    child: Widget.CenterBox({
        spacing: 10,
        center_widget: Box([
            Widget.Icon({
                binds: [
                    ['icon', Notifications, 'notifications', n =>
                        `user-trash-${n.length > 0 ? 'full-' : ''}symbolic`],
                ],
            }),
            Widget.Label('Clear'),
        ]),
    }),
});

const Center = () => Widget.Box({
    class_name: "notification-center-box",
    vertical: true,
    spacing: 10,
    children: [
        Header(),
        Body(),
        Bottom()
    ]
})

export default Center;