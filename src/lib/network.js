import Network from "resource:///com/github/Aylur/ags/service/network.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import { Box } from "./misc.js";
import { timeout } from "resource:///com/github/Aylur/ags/utils.js";

const NetworkIcon = () => Widget.Icon({
    size: 16,
    connections: [
        [Network, self => {
            self.icon = Network.primary === "wifi" ? Network.wifi.icon_name : Network.wired.icon_name
        }, "notify"]
    ]
})

const SSIDRevealer = () => Widget.Revealer({
    reveal_child: false,
    transition_duration: 2000,
    transition: "slide_right",
    child: Widget.Label({
        binds: [
            ["label", Network.wifi, "ssid"]
        ]
    }),
})

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