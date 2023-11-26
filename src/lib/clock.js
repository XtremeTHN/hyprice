import Widget from "resource:///com/github/Aylur/ags/widget.js";
import GLib from "gi://GLib";

export const Clock = () => Widget.Label({
    class_name: "topbar-widgets-left-clock",
    connections: [
        [1000, self => {
            let date = GLib.DateTime.new_now_local()
            self.label = date.format("%H:%M")
        }]
    ]
})