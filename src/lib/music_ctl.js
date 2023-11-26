// @ts-nocheck
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import Mpris from "resource:///com/github/Aylur/ags/service/mpris.js";
import App from "resource:///com/github/Aylur/ags/app.js";

class MusicInfo {
    constructor(maxLenght=42) {
        this.busname = ""
        this.maxLenght = maxLenght
    }

    widget(className) {
        return Widget.Box({
            class_name: className,
            spacing: 5,
            children: [
                Widget.Box({
                    children: [
                        Widget.Label({class_name:"topbar-music-name"}),
                    ],
                    visible: false,
                    connections: [
                        [Mpris, self => {
                            const player = Mpris.getPlayer(this.busname)
                            // @ts-ignore
                            self.visible = player
                            // @ts-ignore
                            if (!player)
                                return
                            // @ts-ignore
                            let name = []
                            if (player.trackArtists) {
                                name.push(player.trackArtists)
                            }
                            if (player.trackTitle) {
                                name.push(player.trackTitle)
                            }
                            self.children[0].label = name.join(" - ")
                        }]
                    ]
                }),
                Widget.CircularProgress({
                    class_name: "topbar-music-progress",
                    // child: Widget.Icon({icon: "media-playback-start-symbolic", size: 8}),
                    // child: Widget.),
                    properties: [
                        ['update', self => {
                            const player = Mpris.getPlayer(this.busname)
                            if (!player) {
                                return
                            }
                            if (player.length === -1) {
                                self.visible = false
                            } else {
                                self.visible = true
                            }
                            self.value = player.position / player.length
                            // print(self.value, player.position, player.length, player.position === player.length)
                        }]
                    ],
                    rounded: true,
                    connections: [
                        [Mpris.getPlayer(this.busname), s => s._update(s)],
                        [Mpris.getPlayer(this.busname), s => s._update(s), 'position'],
                        [1000, s => s._update(s)]
                    ]
                })
            ]
        })
    }

    controller() {
        return Widget.Box({
            children: [
                Widget.Box({
                    vertical: true,
                    children: [
                        Widget.Label({class_name: "topbar-musictl-title"}),
                        Widget.Label({class_name: "topbar-musictl-artist"})
                    ],
                    connections: [
                        [Mpris, self => {
                            const player = Mpris.getPlayer(this.busname)
                            if (!player) {
                                self.children[0].label = "Play some music"
                                return
                            }
        
                            const { trackArtists, trackTitle } = player
                            // @ts-ignore
                            let name = trackTitle.substring(0, this.maxLength)
                            if (name != "") {
                                self.children[0].label = `${name}`
                                self.children[1].label = trackArtists.join(", ")
                            } else {
                                self.children[0].label = "No music"
                            }
                        }, 'changed']
                    ]
                })
            ],
        })
    }
}

export const MusicCtl = (content) => Widget.Window({
    name: "musicctl",
    visible: false,
    anchor: ["top"],
    child: content,
})


// @ts-ignore
export const Music = () => {
    let music_obj = new MusicInfo()
    let box = Widget.EventBox({
        visible: false,
        child: music_obj.widget("topbar-music-status-box"),
        properties: [
            ['change_visible', (self,bus) => {
                self.visible = Mpris.players.length > 0
                music_obj.busname = bus
            }]
        ],
        connections: [
            [Mpris, (self, bus) => self._change_visible(self,bus), "player-added"],
            [Mpris, (self, bus) => self._change_visible(self,bus), "player-closed"]
        ]
    })

    box.on_primary_click = () => {
        App.toggleWindow("musicctl")
    }

    box.on_hover = () => {
        // box.child: Widget.Box
        // box.child.children: 
        box.child.toggleClassName("hover", true)
        box.child.children[0].children[1].toggleClassName("hover", true)
    }
    box.on_hover_lost = () => {
        box.child.toggleClassName("hover", false)
        box.child.children[0].children[1].toggleClassName("hover", false)
    }
    return box

}