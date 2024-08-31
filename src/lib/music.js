// @ts-nocheck
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import Mpris, { MprisPlayer } from "resource:///com/github/Aylur/ags/service/mpris.js";
import App from "resource:///com/github/Aylur/ags/app.js";
import Cava from "./cava.js";

import { Box } from "./misc.js";

class MusicHandler2 {
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
                }).hook(Mpris, self => {
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
                }),
            ]
        })
    }

    controller() {
        const player = Mpris.getPlayer(this.busname)

        return Widget.Box({
            class_name: "dashboard-music-controller",
            vertical: true,
        }).hook(player, self => {
            self.css = `
                background-image: url("${player.cover_path}");
                background-size: cover;
            `
        })
    }
}

const MusicHandler = new MusicHandler2()

// @ts-ignore
export const Music = () => {
    let _change_visible = (self, bus) => {
        self.visible = Mpris.players.length > 0
        MusicHandler.busname = bus
    }
    let box = Widget.EventBox({
        visible: false,
        child: MusicHandler.widget("topbar-music-status-box"),
        on_hover: (self, _) => {
            self.child.toggleClassName("hover", true)
            self.child.children[1].toggleClassName("hover", true)    
        },
        on_hover_lost: (self, _) => {
            self.child.toggleClassName("hover", false)
            self.child.children[1].toggleClassName("hover", false)
        },
    })
        .hook(Mpris, _change_visible, "player-added")
        .hook(Mpris, _change_visible, "player-closed")

    return box

}

export const MusicController = () => {
    return Widget.Box({
        class_name: "dashboard-music-controller",
        visible: Mpris.bind("players").as(p => p.length > 0),
        spacing: 10,
        children: [
            Widget.Overlay({
                child: Box([], "dashboard-music-background", true, 0, {}).hook(Mpris, self => {
                    if (Mpris.players) {
                        const { cover_path } = Mpris.players[Mpris.players.length > 0 ? Mpris.players.length -1 : 0]
                        self.css = `
                            background-image: url("${cover_path}");
                            background-size: cover;
                        `
                    }
                }),
                overlays: [
                    Box([
                        Widget.Label({
                            xalign: 0,
                            class_name: "dashboard-music-info-title",
                            wrap: true,
                            truncate: 'end',
                        }).hook(Mpris, self => {
                            const player = Mpris.players[Mpris.players.length > 0 ? Mpris.players.length -1 : 0]
                            self.label = player.track_title
                        }),
                        Widget.Label({
                            xalign: 0,
                            class_name: "dashboard-music-info-artists"
                        }).hook(Mpris, self => {
                            const { track_artists } = Mpris.players[Mpris.players.length > 0 ? Mpris.players.length -1 : 0]
                            if (track_artists == undefined) {
                                self.label = "Unknown artist"
                            } else {
                                self.label = track_artists.join(" - ")
                            }
                        })
                    ], "dashboard-music-info", true, 0, {
                        expand: true
                    }),
                    Box([
                        Widget.ProgressBar({
                            hexpand: true,
                        }).poll(1000, self => {
                            const player = Mpris.players[Mpris.players.length > 0 ? Mpris.players.length -1 : 0]
                            if (player == undefined) {
                                return
                            } else {
                                self.value = player.position / player.length
                            }
                        })
                    ], "dashboard-music-info-bottom", false, 0, {
                        hexpand: true
                    })
                ]
            }),
            Box([
                Widget.Button({
                    class_name: "dashboard-music-info-button",
                    child: Widget.Icon("media-skip-backward-symbolic"),
                    on_clicked: () => {
                        const player = Mpris.players[Mpris.players.length > 0 ? Mpris.players.length -1 : 0]
                        if (!player) {
                            return
                        }
                        if (player.can_go_prev) {
                            player.previous()
                        }
                    }
                }),
                Widget.Button({
                    class_name: "dashboard-music-info-button",
                    child: Widget.Icon()
                    .hook(Mpris, self => {
                        const { play_back_status } = Mpris.players[Mpris.players.length > 0 ? Mpris.players.length -1 : 0]
                        if (play_back_status == "Playing") {
                            self.icon = "media-playback-pause-symbolic"
                        } else {
                            self.icon = "media-playback-start-symbolic"
                        }
                    }),
                    on_clicked: () => {
                        const player = Mpris.players[Mpris.players.length > 0 ? Mpris.players.length -1 : 0]
                        if (!player) {
                            return
                        }
                        player.playPause()
                    }
                }),
                Widget.Button({
                    class_name: "dashboard-music-info-button",
                    child: Widget.Icon("media-skip-forward-symbolic"),
                    on_clicked: () => {
                        const player = Mpris.players[Mpris.players.length > 0 ? Mpris.players.length -1 : 0]
                        if (!player) {
                            return
                        }
                        if (player.can_go_next) {
                            player.next()
                        }
                    }
                }),
            ], "", true, 10, {
                vexpand: true,
                vpack: 'center'
            })
        ],
    })
}
