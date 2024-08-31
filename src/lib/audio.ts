import Audio from "resource:///com/github/Aylur/ags/service/audio.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";

const _audio_icon = () => {
  const vol = Audio.speaker?.volume * 100;
  // @ts-ignore
  const icon = [
    [101, "overamplified"],
    [67, "high"],
    [34, "medium"],
    [1, "low"],
    [0, "muted"],
    // @ts-ignore
  ].find(([threshold]) => threshold <= vol)[1];

  if (icon === undefined) {
    return "audio-volume-muted-symbolic";
  }
  return `audio-volume-${icon}-symbolic`;
};

export const AudioIcon = () => Widget.Icon;

export const Volume = () =>
  Widget.Box({
    vertical: false,
    hexpand: true,
    spacing: 10,
    children: [
      Widget.Icon().hook(Audio, (self) => {
        self.icon_name = _audio_icon();
      }),
      Widget.Slider({
        class_name: "volume-mixer-slider",
        drawValue: false,
        hexpand: true,
        value: Audio.speaker.bind("volume"),
        on_change: ({ value }) => {
          Audio.speaker.volume = value;
        },
      }),
    ],
  });

export const AudioMixer = () =>
  Widget.Box({
    class_name: "quicksettings-container",
    children: [Volume()],
  });
