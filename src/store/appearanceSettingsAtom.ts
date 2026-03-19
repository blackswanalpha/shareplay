import { atomWithStorage } from "jotai/utils";
import type { AppearanceSettings } from "@/lib/types";

export const appearanceSettingsAtom = atomWithStorage<AppearanceSettings>(
  "shareplay:appearanceSettings",
  {
    theme_mode: "dark",
    accent_color: "red",
    font_size: "medium",
    reduced_motion: false,
    compact_mode: false,
  }
);
