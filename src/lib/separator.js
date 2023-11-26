import { Widget } from "resource:///com/github/Aylur/ags/widget.js";

export const Separator = (vertical) => {
    return Widget.Box({vexpand: vertical, hexpand: vertical ? false : true})
}