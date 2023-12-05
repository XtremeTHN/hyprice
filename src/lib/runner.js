import Widget from "resource:///com/github/Aylur/ags/widget.js";
import { PopupWindow, Box } from "./misc.js";
import { RunnerError } from "./variables.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";
import App from "resource:///com/github/Aylur/ags/app.js";

function splitCommandLine(str) {
    let args = [];
    let currentArg = '';

    for (let i = 0; i < str.length; i++) {
        let char = str[i];

        if (char === ' ') {
            if (currentArg !== '') {
                args.push(currentArg);
                currentArg = '';
            }
        } else if (char === '"') {
            let startIndex = ++i;
            while (i < str.length && str[i] !== '"') {
                i++;
            }
            if (i < str.length) {
                args.push(str.substring(startIndex, i));
            } else {
                // Handle error: unclosed quote
                console.error('Error: Unclosed quote');
            }
        } else {
            currentArg += char;
        }
    }

    if (currentArg !== '') {
        args.push(currentArg);
    }

    return args;
}

export const Runner = () => PopupWindow({
    name: "runner",
    class_name: "runner-window",
    child: Widget.Box({
        class_name: "runner",
        vertical: true,
        children: [
            Widget.Label({
                xalign: 0,
                label: "Write a command to run:",
                css: "font-size: small; font-weight: 600;"
            }),
            Widget.Entry({
                placeholder_text: "Type a command here",
                visibility: true,
                hexpand: true,
                on_accept: (self) => {
                    Utils.execAsync(splitCommandLine(self.text)).catch(error => {
                        RunnerError.setValue(error)
                    })
                    self.text = ""
                }
            })
        ]
    }),
    transition: 'slide_up',
    anchor: ['bottom'],
    margins: [0,0,10,0]
})