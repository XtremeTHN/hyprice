// @ts-nocheck
import Hyprland from "resource:///com/github/Aylur/ags/service/hyprland.js";

export const Dispatch = w => {
    Hyprland.sendMessage(`dispatch workspace ${w}`)
}

export const AutomaticDispatch = () => Hyprland.connect("urgent-window", (self, window) => {
    let win = self.clients.reverse().filter(client => client.address == window)
    console.log(win[0].workspace)
    Hyprland.sendMessage(`dispatch workspace ${win[0].workspace.id}`)
})