// @ts-nocheck
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import Mpris, { MprisPlayer } from "resource:///com/github/Aylur/ags/service/mpris.js";
import App from "resource:///com/github/Aylur/ags/app.js";
import Cava from "./cava.js";

import { Box } from "./misc.js";
import Gdk from "gi://Gdk";

class MusicHandler2 {
    constructor(maxLenght=42) {
        this.busname = ""
        this.maxLenght = maxLenght
    }

    widget() {
        let info = Widget.Box({
            class_name: "topbar-music-status-box",
            spacing: 5,
            children: [
                Widget.Box({
                    children: [
                        Widget.Label({
                            class_name:"topbar-music-name",
                            hpack: 'center',
                            vpack: 'center'
                        })
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
                        }]
                    ],
                    rounded: true,
                    connections: [
                        [1000, s => s._update(s)]
                    ]
                })
            ]
        })

        let cava = Box([
            Cava({
                bars: 20,
                barHeight: 10,
                smooth: false,
            })
        ], "topbar-music-cava")

        let ovr = Widget.Overlay({
            child: cava,
            visible: false,
            class_name: "topbar-music-overlay",
            overlays: [
                info
            ],
            properties: [
                ['change_visible', (self,bus) => {
                    self.visible = Mpris.players.length > 0
                    MusicHandler.busname = bus
                }],
            ],
            connections: [
                [Mpris, (self, bus) => self._change_visible(self,bus), "player-added"],
                [Mpris, (self, bus) => self._change_visible(self,bus), "player-closed"]
            ]
        })
        
        info.connect('size-allocate', (self, allocation) => {
            print("allocated")
            let width = allocation.width;
            let height = allocation.height

            ovr.set_size_request(width, height)
        })

        cava.set_margin_bottom(3)
        cava.set_margin_left(8)
        cava.set_margin_right(8)
        cava.set_margin_top(3)

        return ovr
    }
}

const MusicHandler = new MusicHandler2()

// @ts-ignore
export const Music = () => MusicHandler.widget()

export const MusicController = () => {
    return Widget.Box({
        class_name: "dashboard-music-controller",
        spacing: 10,
        children: [
            Widget.Overlay({
                child: Box([], "dashboard-music-background", true, 0, {
                    connections: [
                        [Mpris, self => {
                            if (Mpris.players) {
                                const { cover_path } = Mpris.players[Mpris.players.length > 0 ? Mpris.players.length -1 : 0]
                                self.css = `background-image: url("${cover_path}"); background-size: cover;`
                            }
                        }]
                    ],
                }),
                overlays: [
                    Box([
                        Widget.Label({
                            xalign: 0,
                            class_name: "dashboard-music-info-title",
                            wrap: true,
                            truncate: 'end',
                            connections: [
                                [Mpris, self => {
                                    const player = Mpris.players[Mpris.players.length > 0 ? Mpris.players.length -1 : 0]
                                    self.label = player.track_title
                                }]
                            ]
                        }),
                        Widget.Label({
                            xalign: 0,
                            class_name: "dashboard-music-info-artists",
                            connections: [
                                [Mpris, self => {
                                    const { track_artists } = Mpris.players[Mpris.players.length > 0 ? Mpris.players.length -1 : 0]
                                    if (track_artists == undefined) {
                                        self.label = "Unknown artist"
                                    } else {
                                        self.label = track_artists.join(" - ")
                                    }
                                }]
                            ]
                        })
                    ], "dashboard-music-info", true, 0, {
                        hexpand: true, vexpand: true
                    }),
                    Box([
                        Widget.ProgressBar({
                            hexpand: true,
                            connections: [
                                [1000, self => {
                                    const player = Mpris.players[Mpris.players.length > 0 ? Mpris.players.length -1 : 0]
                                    if (player == undefined) {
                                        return
                                    } else {
                                        self.value = player.position / player.length
                                    }
                                }]
                            ],
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
                    child: Widget.Icon({
                        connections: [
                            [Mpris, self => {
                                const { play_back_status } = Mpris.players[Mpris.players.length > 0 ? Mpris.players.length -1 : 0]
                                if (play_back_status == "Playing") {
                                    self.icon = "media-playback-pause-symbolic"
                                } else {
                                    self.icon = "media-playback-start-symbolic"
                                }
                            }]
                        ]
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
        binds: [
            ["visible", Mpris, "players", players => players.length > 0]
        ]
    })
}