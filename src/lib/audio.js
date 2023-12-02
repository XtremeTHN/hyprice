import Audio, { Stream } from "resource:///com/github/Aylur/ags/service/audio.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import { Box } from "./misc.js";
import { config, Section } from "./control_center.js";

const _audio_icon = () => {
    const vol = Audio.speaker?.volume * 100;
    const icon = [
        [101, 'overamplified'],
        [67,  'high'],
        [34,  'medium'],
        [1,   'low'],
        [0,   'muted'],
    // @ts-ignore
    ].find(([threshold]) => threshold <= vol)[1];
    if (icon === undefined) {
        return "audio-volume-muted-symbolic"
    }
    return `audio-volume-${icon}-symbolic`;

}

const _microphone_icon = () => {
    const vol = Audio.microphone.volume * 100
    const icon = [
        [101, 'high'],
        [67,  'high'],
        [34,  'medium'],
        [1,   'low'],
        [0,   'muted'],
    // @ts-ignore
    ].find(([threshold]) => threshold <= vol)[1];
    if (icon === undefined) {
        return "microphone-sensitivity-muted-symbolic"
    }
    return `microphone-sensitivity-${icon}-symbolic`;
}

const MicrophoneIcon = (size=8) => Widget.Icon({
    size: size,
    connections: [
        [Audio, self => {
            const vol = Audio.microphone?.volume * 100
            self.icon = _microphone_icon()

            self.tooltip_text = `Volume ${Math.floor(vol)}%`;
        }, 'microphone-changed']
    ]
})

const AudioIcon = (size=8) => Widget.Icon({
    size: size,
    connections: [[Audio, self => {
        if (!Audio.speaker)
            return;

        const vol = Audio.speaker?.volume * 100;

        // @ts-ignore
        self.icon = _audio_icon()
        
        self.tooltip_text = `Volume ${Math.floor(vol)}%`;
    }, 'speaker-changed']],
})

export const AudioIndicator = () => Widget.CircularProgress({
    class_name: "topbar-widgets-right-control-audio",
    child: AudioIcon(),
    connections: [
        [Audio, self => {
            self.value = Audio.speaker?.volume
        }]
    ]
})

export const IncreaseAudio = () => {
    if (Audio.speaker?.volume >= 0.9) {
        Audio.speaker.volume = 1
    } else {
        Audio.speaker.volume += 0.10
    }
}
export const DecreaseAudio = () => {
    Audio.speaker.volume -= 0.10
}

const AudioController = () => Widget.Box({
    children: [
        Widget.Box({
            css: "padding-left: 2px",
            children: [
                AudioIcon(16),
                Widget.Slider({
                    hexpand: true,
                    drawValue: false,
                    on_change: ({ value }) => {
                        Audio.speakers[config.preferredSpeaker].volume = value
                    },
                    connections: [
                        [Audio, self => {
                            self.value = Audio.speakers[config.preferredSpeaker].volume
                        }],
                        
                    ]
                }),
                Widget.Label({
                    connections: [
                        [Audio, self => {
                            self.label = `${Math.round(Audio.speakers[config.preferredSpeaker].volume * 100).toString()}%`
                        }]
                    ]
                })
            ]
        })
    ]
})

export const MicrophoneController = () => Widget.Box({
    children: [
        Widget.Box({
            css: "padding-left: 2px",
            children: [
                MicrophoneIcon(16),
                Widget.Slider({
                    hexpand: true,
                    drawValue: false,
                    on_change: ({ value }) => {
                        Audio.microphone.volume = value
                    },
                    connections: [
                        [Audio, self => {
                            self.value = Audio.microphone?.volume
                        }],
                        
                    ]
                }),
                Widget.Label({
                    connections: [
                        [Audio, self => {
                            self.label = `${Math.round(Audio.microphone?.volume * 100).toString()}%`
                        }]
                    ]
                })
            ]
        })
    ]
})

export const AudioSection = () => Widget.Box({
    vertical: true,
    children: [
        Section("Audio"),
        AudioController(),
        MicrophoneController()
    ]
})

const AppMixer = (/** @type {Stream} */ stream) => Widget.Box({
    children: [
        Widget.Icon({
            vexpand: true,
            size: 40,
            binds: [
                ["icon", stream, "icon-name"]
            ]
        }),
        Box([
            Box([
                Widget.Label({
                    xalign: 0,
                    hexpand: true,
                    class_name: "dashboard-app-mixer-title",
                    binds: [
                        ['label', stream, 'description']
                    ]
                }),
                Widget.Label({
                    class_name: "dashboard-app-mixer-percentage",
                    connections: [
                        [stream, self => {
                            self.label = `${Math.floor(stream.volume * 100)}%`
                        }]
                    ]
                }),
            ], "dashboard-app-mixer-info"),
            Widget.Slider({
                hexpand: true,
                drawValue: false,
                on_change: ({ value }) => {
                    stream.volume = value
                },
                connections: [
                    [stream, self => {
                        self.value = stream.volume
                    }],
                ]
            }),
        ], "", true, 0)
    ]
})

export const AppVolumeMixer = () => Widget.Box({
    children: [
        Section("Application Mixer"),
        Box([], "",true)
    ],
    spacing: 10,
    vertical: true,
    connections: [
        [Audio, self => {
            self.children[1].children = Audio.apps?.map(AppMixer)
        }]
    ]
})