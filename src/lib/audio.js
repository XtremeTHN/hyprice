import Audio from "resource:///com/github/Aylur/ags/service/audio.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import { Box } from "./misc.js";

const AudioIcon = () => Widget.Icon({
    size: 8,
    connections: [[Audio, self => {
        if (!Audio.speaker)
            return;

        const vol = Audio.speaker?.volume * 100;
        // @ts-ignore

        const icon = [
            [101, 'overamplified'],
            [67,  'high'],
            [34,  'medium'],
            [1,   'low'],
            [0,   'muted'],
        // @ts-ignore
        ].find(([threshold]) => threshold <= vol)[1];

        self.icon = `audio-volume-${icon}-symbolic`;
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
