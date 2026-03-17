import { atom } from "jotai";
import type {
  Room,
  RoomParticipant,
  ChatMessage,
  QueueTrack,
  PendingUser,
  SyncStatus,
  Broadcast,
} from "@/lib/types";

// --- Core state atoms ---

export const roomAtom = atom<Room | null>(null);

export const participantsAtom = atom<RoomParticipant[]>([]);

export const messagesAtom = atom<ChatMessage[]>([]);

export const queueAtom = atom<QueueTrack[]>([]);

export const currentTrackIdAtom = atom<string | undefined>(undefined);

export const pendingUsersAtom = atom<PendingUser[]>([]);

export interface PlayerState {
  isPlaying: boolean;
  currentTime: number;
  videoUrl: string;
  title: string;
  subtitle: string;
  thumbnailUrl: string;
  duration: number;
  sequenceId: number;
}

export const playerStateAtom = atom<PlayerState>({
  isPlaying: false,
  currentTime: 0,
  videoUrl: "",
  title: "",
  subtitle: "",
  thumbnailUrl: "",
  duration: 0,
  sequenceId: 0,
});

export interface AudioState {
  isMuted: boolean;
  isDeafened: boolean;
  isInAudio: boolean;
}

export const audioStateAtom = atom<AudioState>({
  isMuted: false,
  isDeafened: false,
  isInAudio: false,
});

export interface ScreenShareState {
  isSharing: boolean;
  sharerUserId: string | null;
  sessionId: string | null;
}

export const screenShareAtom = atom<ScreenShareState>({
  isSharing: false,
  sharerUserId: null,
  sessionId: null,
});

// --- UI state atoms ---

export const sidebarTabAtom = atom<string>("chat");

export const chatInputAtom = atom<string>("");

export const syncStatusAtom = atom<SyncStatus>("synced");

export const socketConnectedAtom = atom<boolean>(false);

// --- Derived atoms ---

export const onlineCountAtom = atom((get) => {
  return get(participantsAtom).filter((p) => p.is_online).length;
});

export const speakingParticipantsAtom = atom((get) => {
  return get(participantsAtom).filter((p) => p.is_speaking && p.is_online);
});

export const isScreenShareActiveAtom = atom((get) => get(screenShareAtom).isSharing);

// --- Room ended state ---

export type RoomEndedReason = "host_left" | "host_disconnected" | "room_ended" | "kicked" | "room_inactive" | null;
export const roomEndedAtom = atom<RoomEndedReason>(null);

// --- Broadcast atoms ---

export const roomAnnouncementAtom = atom<Broadcast | null>(null);
export const roomAlertsAtom = atom<Broadcast[]>([]);
export const serviceStatusAtom = atom<Broadcast | null>(null);
