import Clipboard from './services/clipboard.js';
import Widget from 'resource:///com/github/Aylur/ags/widget.js';
import { Box } from './misc.js';

const ClipboardContent = () => Widget.Box({
    children: [
        Box([
            Widget.Label({
                binds: [
                    ["label", Clipboard, "content"]
                ]
            })
        ])
    ],
})

const ClipboardWindow = () => Widget.Window({
    connections: [
        [Clipboard, self => {
            if (Clipboard.clipboardContent) {
                self.visible = !self.visible
            }
        }]
    ]
})

export default ClipboardWindow