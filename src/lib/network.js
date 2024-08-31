import Network from "resource:///com/github/Aylur/ags/service/network.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import { Box } from "./misc.js";
import { timeout } from "resource:///com/github/Aylur/ags/utils.js";
import { Section } from "./control_center.js";
import { SSID } from "./variables.js";

const NetworkIcon = () => Widget.Icon({
    size: 16,
}).hook(Network, self => {
    self.icon = Network.primary === "wifi" ? Network.wifi.icon_name : Network.wired.icon_name
}, "notify")

const SSIDRevealer = () => {
    const network_obj = Network.primary === "wifi" ? Network.wifi : Network.wired;
    const network_prop = Network.primary === "wifi" ? "ssid" : "state"
    return Widget.Revealer({
        reveal_child: false,
        transition_duration: 2000,
        transition: "slide_right",
        child: Widget.Label({
            label: network_obj.bind(network_prop)
        }),
    })
}

export const NetworkIndicator = () => {
    let icon = NetworkIcon()
    let ssid = SSIDRevealer()
    return Widget.EventBox({
        child: Box([icon, ssid]),
        on_primary_click: () => {
            ssid.reveal_child = !ssid.reveal_child
            timeout(5000, () => {
                if (ssid.reveal_child) {
                    ssid.reveal_child = false
                }
        })
        },
    })
}

const NetworkButton = () => Widget.Box({
    class_name: "dashboard-quicksettings-network",
    vertical: true,
    hexpand: false,
    children: [
        Widget.Button({
            class_name: "dashboard-quicksettings-button dashboard-quicksettings-network-button",
            child: Widget.Box({
                class_name: "dashboard-quicksettings-network-icon",
                spacing: 10,
                children: [
                    NetworkIcon(),
                    Box([
                        Widget.Label({
                            label: "Internet",
                            xalign: 0,
                            css: "font-size: large; font-weight: 800;"
                        }),
                        Widget.Label({
                            css: "font-size: smaller;",
                            xalign: 0,
                            label: SSID.bind('value')
                        })
                    ], "", true, 0)

                ]
            }),
        }).hook(Network, self => {
            if (Network.primary == "wifi") {
                self.toggleClassName("toggled", true)
            } else if (Network.primary == "wired") {
                self.toggleClassName("toggled", Network.wired.state !== "disabled" || "failed" || "disconnected")
            }
        }, "notify"),
    ]
})


export const NetworkSection = () => Widget.Box({
    vertical: true,
    spacing: 10,
    children: [
        NetworkButton()
    ]
})
