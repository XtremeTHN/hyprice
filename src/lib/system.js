import Widget from "resource:///com/github/Aylur/ags/widget.js";
import { CpuPercentage, RamPercentage } from "./variables.js"
import Variable from "resource:///com/github/Aylur/ags/variable.js";

const UsageWidget = (/** @type {Variable} */ service, /** @type {String} */ label, /** @type {String[]} */ class_name=["",""]) => Widget.Box({
    vertical: true,
    children: [
        Widget.Label({
            class_name: class_name[0],
            xalign: 0,
            binds: [
                // @ts-ignore
                ["label", service, "value", percentage => `${label}: ${Math.round(percentage * 100)}%`]
            ]
        }),
        Widget.ProgressBar({
            class_name: class_name[1],
            binds: [
                ['value', service, "value"]
            ]
        })
    ]
})

export const CpuUsage = () => UsageWidget(CpuPercentage, "Cpu usage", ["dashboard-notification-center-system-usage-label", "dashboard-notification-center-cpu-usage"])
export const RamUsage = () => UsageWidget(RamPercentage, "RAM usage", ["dashboard-notification-center-system-usage-label", "dashboard-notification-center-ram-usage"])