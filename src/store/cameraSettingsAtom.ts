import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const cameraSettingsAtom = atomWithStorage<{ video_device: string }>(
  "shareplay:cameraSettings",
  { video_device: "" }
);

export const cameraConstraintsAtom = atom<MediaTrackConstraints>((get) => {
  const settings = get(cameraSettingsAtom);
  const constraints: MediaTrackConstraints = {
    width: { ideal: 640 },
    height: { ideal: 480 },
  };
  if (settings.video_device) {
    constraints.deviceId = { exact: settings.video_device };
  }
  return constraints;
});
