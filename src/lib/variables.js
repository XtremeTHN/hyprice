import Variable from "resource:///com/github/Aylur/ags/variable.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import GLib from "gi://GLib";
import { exec } from "resource:///com/github/Aylur/ags/utils.js";

export const Uptime = Variable(0, {
    poll: [1000, 'uptime -p']
})

export const Time = Variable("00:00", {
    poll: [1000, () => GLib.DateTime.new_now_local().format("%H:%M")]
})

export const Daytime = Variable("weather-few-clouds-symbolic", {
    poll: [1000, () => {
        let _time = Time.getValue().split(":")
        let time = new Date()
        time.setHours(_time[0], _time[1], 0)
        
        const moorningStart = 6
        const dayStart = 12
        const nightStart = 20

        if (time.getHours() >= moorningStart && time.getHours() < dayStart) {
            return "weather-few-clouds-symbolic"
        } else if (time.getHours() >= dayStart && time.getHours() < nightStart) {
            return "weather-clear-symbolic"
        } else {
            return "weather-clear-night-symbolic"
        }
    }]
})

export const Clock = () => Widget.Label({
    class_name: "topbar-widgets-left-clock",
    connections: [
        [1000, self => {
            self.label = Time.getValue()
        }]
    ]
})

export const User = exec("whoami")

export const CpuPercentage = Variable(0.00, {
    poll: [
        1000, 
        ['fish', '/home/axel/.local/bin/check_cpu']
    ]
})

export const RamPercentage = Variable(0.00, {
    poll: [
        1000, 
        ['fish', '/home/axel/.local/bin/check_ram']
    ]
})