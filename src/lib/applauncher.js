import Applications, {Application} from "resource:///com/github/Aylur/ags/service/applications.js";
import Cava from "./cava.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";

import Variable from "resource:///com/github/Aylur/ags/variable.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";

import { Box } from "./misc.js";
import App from "resource:///com/github/Aylur/ags/app.js";

class ApplicationLauncher {
    #shownApps=Variable(Applications.list,{})

    constructor() {

    }

    
    /**
     * @param {string} icon
     */
    _app_icon(icon) {
        if (Utils.lookUpIcon(icon)) {
            return icon
        }
        return ""
    }

    /**
     * @param {Application} application
     */
    _app(application) {
        return Widget.Button({
            class_name: "application-launcher-item",
            on_clicked: () => {
                application.launch()
                App.closeWindow("application-launcher")
            },
            child: Box([
                Box([
                    Widget.Icon({
                        size: 42,
                        icon: application.icon_name || ""
                    }),
                ], "", false, 0, {
                    css: `
                        background-size: contain;
                        background-repeat: no-repeat;
                        background-position: center;
                        min-width: 42px;
                        min-height: 42px;
                    `
                }),
                Widget.Label({
                    binds: [
                        ['label', application, 'name']
                    ]
                })
            ])
        })
    }

    widgets() {
        const _search_bar = Widget.Entry({
            placeholder_text: "Search for applications!",
            on_accept: ({ text }) => {
                if (text !== "" && text) {
                    this.#shownApps.value = Applications.query(text)
                }

            }
        })

        App.connect('window-toggled', (_, wname, wvisible) => {
            if (wname == "application-launcher") {
                if (!wvisible) {
                    this.#shownApps.value = Applications.list
                }
            }
        })

        const _applications = Widget.Scrollable({
            child: Widget.Box({
                vertical: true,
                spacing: 5,
                connections: [
                    [this.#shownApps, self => {
                        self.children = this.#shownApps.value.map(this._app)
                    }]
                ]
            }),
            hscroll: 'never',
            vscroll: 'automatic',
            vexpand: true,
        })

        return Widget.Box({
            class_name: "application-launcher-box",
            vertical: true,
            spacing: 10,
            children: [
                _search_bar,
                _applications
            ]
        })
    }
}


export default () => Widget.Window({
    name: "application-launcher",
    class_name: "application-launcher",
    popup: true,
    focusable: true,
    visible: false,
    child: new ApplicationLauncher().widgets()
}) 