import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { AudioSettings } from "@/lib/types";

export const audioSettingsAtom = atomWithStorage<AudioSettings>(
  "shareplay:audioSettings",
  {
    input_device: "",
    output_device: "",
    echo_cancel: true,
    noise_suppress: true,
    auto_gain: true,
  }
);

export const audioConstraintsAtom = atom<MediaTrackConstraints>((get) => {
  const settings = get(audioSettingsAtom);
  const constraints: MediaTrackConstraints = {
    echoCancellation: settings.echo_cancel,
    noiseSuppression: settings.noise_suppress,
    autoGainControl: settings.auto_gain,
  };
  if (settings.input_device) {
    constraints.deviceId = { exact: settings.input_device };
  }
  return constraints;
});
