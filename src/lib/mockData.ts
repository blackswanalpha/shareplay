import type {
  User,
  Room,
  Friend,
  Session,
  Invite,
  DashboardStats,
  FriendRequest,
  Notification,
  NotificationPreferences,
  AudioSettings,
  RoomParticipant,
  ChatMessage,
  QueueTrack,
  NowPlaying,
  RoomState,
} from "./types";

export function avatar(seed: string) {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${seed}`;
}

export const mockUser: User = {
  id: "u1",
  username: "Alex",
  email: "alex@shareplay.app",
  avatar_url: avatar("Alex"),
  is_online: true,
  is_admin: false,
  is_email_verified: true,
  created_at: "2025-06-15T10:00:00Z",
};

export const mockRooms: Room[] = [
  {
    id: "r1",
    name: "Movie Night",
    code: "XKCD42",
    type: "watch",
    is_live: true,
    participants: [
      { id: "u2", username: "Jordan", avatar_url: avatar("Jordan"), is_online: true },
      { id: "u3", username: "Sam", avatar_url: avatar("Sam"), is_online: true },
      { id: "u4", username: "Riley", avatar_url: avatar("Riley"), is_online: true },
      { id: "u5", username: "Casey", avatar_url: avatar("Casey"), is_online: false },
    ],
    max_participants: 10,
    created_at: "2026-03-17T19:00:00Z",
    owner_id: "u1",
  },
  {
    id: "r2",
    name: "Lo-fi Beats",
    code: "BEAT77",
    type: "music",
    is_live: true,
    participants: [
      { id: "u6", username: "Morgan", avatar_url: avatar("Morgan"), is_online: true },
      { id: "u7", username: "Taylor", avatar_url: avatar("Taylor"), is_online: true },
    ],
    max_participants: 8,
    created_at: "2026-03-17T18:30:00Z",
    owner_id: "u6",
  },
  {
    id: "r3",
    name: "Anime Club",
    code: "ANM123",
    type: "watch",
    is_live: false,
    participants: [
      { id: "u8", username: "Quinn", avatar_url: avatar("Quinn"), is_online: false },
    ],
    max_participants: 6,
    created_at: "2026-03-16T21:00:00Z",
    owner_id: "u1",
  },
  {
    id: "r4",
    name: "Jazz Session",
    code: "JAZZ99",
    type: "music",
    is_live: false,
    participants: [
      { id: "u9", username: "Dakota", avatar_url: avatar("Dakota"), is_online: false },
      { id: "u10", username: "Avery", avatar_url: avatar("Avery"), is_online: false },
    ],
    max_participants: 5,
    created_at: "2026-03-15T20:00:00Z",
    owner_id: "u9",
  },
];

export const mockFriends: Friend[] = [
  { id: "u2", username: "Jordan", avatar_url: avatar("Jordan"), status: "online", activity: "Watching Movie Night" },
  { id: "u6", username: "Morgan", avatar_url: avatar("Morgan"), status: "online", activity: "Listening to Lo-fi Beats" },
  { id: "u3", username: "Sam", avatar_url: avatar("Sam"), status: "online", activity: "In a room" },
  { id: "u7", username: "Taylor", avatar_url: avatar("Taylor"), status: "away", activity: "Idle" },
  { id: "u11", username: "Emery", avatar_url: avatar("Emery"), status: "online" },
  { id: "u12", username: "Skyler", avatar_url: avatar("Skyler"), status: "away" },
  { id: "u8", username: "Quinn", avatar_url: avatar("Quinn"), status: "offline" },
  { id: "u13", username: "Reese", avatar_url: avatar("Reese"), status: "offline" },
];

export const mockSessions: Session[] = [
  { id: "s1", room_name: "Movie Night", type: "watch", duration_minutes: 127, ended_at: "2026-03-17T00:07:00Z" },
  { id: "s2", room_name: "Lo-fi Beats", type: "music", duration_minutes: 45, ended_at: "2026-03-16T22:00:00Z" },
  { id: "s3", room_name: "Anime Club", type: "watch", duration_minutes: 90, ended_at: "2026-03-16T17:30:00Z" },
  { id: "s4", room_name: "Jazz Session", type: "music", duration_minutes: 62, ended_at: "2026-03-15T21:02:00Z" },
  { id: "s5", room_name: "Documentary Hour", type: "watch", duration_minutes: 55, ended_at: "2026-03-14T23:55:00Z" },
];

export const mockInvites: Invite[] = [
  {
    id: "i1",
    room_name: "Thriller Marathon",
    room_code: "THRL88",
    inviter: { username: "Jordan", avatar_url: avatar("Jordan") },
    created_at: "2026-03-17T18:45:00Z",
  },
  {
    id: "i2",
    room_name: "Indie Playlist",
    room_code: "IND456",
    inviter: { username: "Morgan", avatar_url: avatar("Morgan") },
    created_at: "2026-03-17T17:20:00Z",
  },
  {
    id: "i3",
    room_name: "Retro Game Streams",
    room_code: "RETRO1",
    inviter: { username: "Emery", avatar_url: avatar("Emery") },
    created_at: "2026-03-17T15:10:00Z",
  },
];

export const mockStats: DashboardStats = {
  total_rooms: 142,
  total_hours: 87,
  total_friends: 34,
  weekly_sessions: 12,
};

export const mockUnreadCount = 5;

export const mockFriendRequests: FriendRequest[] = [
  {
    id: "fr1",
    from_user: { id: "u20", username: "Hayden", avatar_url: avatar("Hayden") },
    created_at: "2026-03-17T14:30:00Z",
    status: "pending",
  },
  {
    id: "fr2",
    from_user: { id: "u21", username: "Blair", avatar_url: avatar("Blair") },
    created_at: "2026-03-17T10:15:00Z",
    status: "pending",
  },
  {
    id: "fr3",
    from_user: { id: "u22", username: "Rowan", avatar_url: avatar("Rowan") },
    created_at: "2026-03-16T22:00:00Z",
    status: "pending",
  },
];

export const mockNotifications: Notification[] = [
  {
    id: "n1",
    type: "invite",
    is_read: false,
    title: "Room Invite",
    body: "Jordan invited you to Movie Night",
    action_url: "/room/XKCD42",
    actor: { username: "Jordan", avatar_url: avatar("Jordan") },
    created_at: "2026-03-17T18:00:00Z",
  },
  {
    id: "n2",
    type: "mention",
    is_read: false,
    title: "You were mentioned",
    body: 'Sam mentioned you in Lo-fi Beats: "@Alex check this track"',
    action_url: "/room/BEAT77",
    actor: { username: "Sam", avatar_url: avatar("Sam") },
    created_at: "2026-03-17T16:30:00Z",
  },
  {
    id: "n3",
    type: "friend",
    is_read: false,
    title: "Friend Request",
    body: "Hayden wants to be your friend",
    actor: { username: "Hayden", avatar_url: avatar("Hayden") },
    created_at: "2026-03-17T14:30:00Z",
  },
  {
    id: "n4",
    type: "role",
    is_read: false,
    title: "Role Changed",
    body: "You were promoted to moderator in Anime Club",
    created_at: "2026-03-17T12:00:00Z",
  },
  {
    id: "n5",
    type: "system",
    is_read: false,
    title: "System Update",
    body: "SharePlay v2.1 is now available with new audio features",
    created_at: "2026-03-17T09:00:00Z",
  },
  {
    id: "n6",
    type: "invite",
    is_read: true,
    title: "Room Invite",
    body: "Morgan invited you to Indie Playlist",
    action_url: "/room/IND456",
    actor: { username: "Morgan", avatar_url: avatar("Morgan") },
    created_at: "2026-03-16T20:00:00Z",
  },
  {
    id: "n7",
    type: "friend",
    is_read: true,
    title: "Friend Accepted",
    body: "Emery accepted your friend request",
    actor: { username: "Emery", avatar_url: avatar("Emery") },
    created_at: "2026-03-16T15:00:00Z",
  },
  {
    id: "n8",
    type: "mention",
    is_read: true,
    title: "You were mentioned",
    body: 'Taylor mentioned you in Jazz Session: "@Alex join us!"',
    action_url: "/room/JAZZ99",
    actor: { username: "Taylor", avatar_url: avatar("Taylor") },
    created_at: "2026-03-15T19:00:00Z",
  },
];

export const mockNotificationPreferences: NotificationPreferences = {
  room_invites: true,
  user_mentions: true,
  role_changes: true,
  system_alerts: false,
  room_ended: true,
};

export const mockAudioSettings: AudioSettings = {
  input_device: "Default Microphone",
  output_device: "Default Speakers",
  echo_cancel: true,
  noise_suppress: true,
  auto_gain: true,
};

export const mockRoomParticipants: RoomParticipant[] = [
  {
    id: "u1",
    username: "Alex",
    avatar_url: avatar("Alex"),
    is_online: true,
    role: "host",
    is_muted: false,
    is_speaking: false,
    is_deafened: false,
    is_screen_sharing: false,
    is_camera_sharing: false,
  },
  {
    id: "u2",
    username: "Jordan",
    avatar_url: avatar("Jordan"),
    is_online: true,
    role: "co-host",
    is_muted: false,
    is_speaking: true,
    is_deafened: false,
    is_screen_sharing: false,
    is_camera_sharing: false,
  },
  {
    id: "u3",
    username: "Sam",
    avatar_url: avatar("Sam"),
    is_online: true,
    role: "member",
    is_muted: true,
    is_speaking: false,
    is_deafened: false,
    is_screen_sharing: false,
    is_camera_sharing: false,
  },
  {
    id: "u4",
    username: "Riley",
    avatar_url: avatar("Riley"),
    is_online: true,
    role: "member",
    is_muted: false,
    is_speaking: false,
    is_deafened: true,
    is_screen_sharing: false,
    is_camera_sharing: false,
  },
  {
    id: "u5",
    username: "Casey",
    avatar_url: avatar("Casey"),
    is_online: false,
    role: "member",
    is_muted: true,
    is_speaking: false,
    is_deafened: false,
    is_screen_sharing: false,
    is_camera_sharing: false,
  },
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: "m1",
    sender: { id: "system", username: "System", avatar_url: "" },
    text: "Jordan joined the room",
    is_system: true,
    created_at: "2026-03-17T19:00:00Z",
  },
  {
    id: "m2",
    sender: { id: "u2", username: "Jordan", avatar_url: avatar("Jordan") },
    text: "Hey everyone! Ready for movie night?",
    created_at: "2026-03-17T19:01:00Z",
  },
  {
    id: "m3",
    sender: { id: "u1", username: "Alex", avatar_url: avatar("Alex") },
    text: "Let's gooo! Starting in 2 mins",
    created_at: "2026-03-17T19:01:30Z",
  },
  {
    id: "m4",
    sender: { id: "u3", username: "Sam", avatar_url: avatar("Sam") },
    text: "This is gonna be epic",
    created_at: "2026-03-17T19:02:00Z",
  },
  {
    id: "m5",
    sender: { id: "u4", username: "Riley", avatar_url: avatar("Riley") },
    text: "I brought snacks!",
    created_at: "2026-03-17T19:02:30Z",
  },
  {
    id: "m6",
    sender: { id: "u2", username: "Jordan", avatar_url: avatar("Jordan") },
    text: "Has anyone seen this before? No spoilers!",
    created_at: "2026-03-17T19:03:00Z",
  },
  {
    id: "m7",
    sender: { id: "u1", username: "Alex", avatar_url: avatar("Alex") },
    text: "First time for me too. Let's go!",
    created_at: "2026-03-17T19:03:30Z",
  },
  {
    id: "m8",
    sender: { id: "u3", username: "Sam", avatar_url: avatar("Sam") },
    text: "The cinematography is incredible so far",
    created_at: "2026-03-17T19:40:00Z",
  },
];

export const mockQueue: QueueTrack[] = [
  {
    id: "q1",
    title: "Midnight Lo-fi",
    artist: "ChillBeats",
    album_art_url: avatar("lofi1"),
    duration_seconds: 234,
    added_by: "Alex",
  },
  {
    id: "q2",
    title: "Rainy Day Vibes",
    artist: "AmbientWave",
    album_art_url: avatar("lofi2"),
    duration_seconds: 198,
    added_by: "Jordan",
  },
  {
    id: "q3",
    title: "Sunset Drive",
    artist: "RetroSynth",
    album_art_url: avatar("lofi3"),
    duration_seconds: 271,
    added_by: "Sam",
  },
  {
    id: "q4",
    title: "Coffee Shop Jazz",
    artist: "MellowKeys",
    album_art_url: avatar("lofi4"),
    duration_seconds: 312,
    added_by: "Riley",
  },
  {
    id: "q5",
    title: "Ocean Breeze",
    artist: "NatureSounds",
    album_art_url: avatar("lofi5"),
    duration_seconds: 186,
    added_by: "Alex",
  },
];

export const mockNowPlayingWatch: NowPlaying = {
  type: "video",
  title: "Inception",
  subtitle: "Christopher Nolan",
  thumbnail_url: avatar("inception"),
  duration_seconds: 8880,
  elapsed_seconds: 2340,
  is_playing: true,
};

export const mockNowPlayingMusic: NowPlaying = {
  type: "music",
  title: "Midnight Lo-fi",
  subtitle: "ChillBeats",
  album_art_url: avatar("lofi1"),
  duration_seconds: 234,
  elapsed_seconds: 87,
  is_playing: true,
};

export const mockRoomState: RoomState = {
  room: mockRooms[0],
  participants: mockRoomParticipants,
  messages: mockChatMessages,
  queue: mockQueue,
  now_playing: mockNowPlayingWatch,
  sync_status: "synced",
};

export const mockRoomStateMusic: RoomState = {
  room: mockRooms[1],
  participants: [
    {
      id: "u1",
      username: "Alex",
      avatar_url: avatar("Alex"),
      is_online: true,
      role: "member",
      is_muted: false,
      is_speaking: false,
      is_deafened: false,
      is_screen_sharing: false,
      is_camera_sharing: false,
    },
    {
      id: "u6",
      username: "Morgan",
      avatar_url: avatar("Morgan"),
      is_online: true,
      role: "host",
      is_muted: false,
      is_speaking: true,
      is_deafened: false,
      is_screen_sharing: false,
      is_camera_sharing: false,
    },
    {
      id: "u7",
      username: "Taylor",
      avatar_url: avatar("Taylor"),
      is_online: true,
      role: "member",
      is_muted: true,
      is_speaking: false,
      is_deafened: false,
      is_screen_sharing: false,
      is_camera_sharing: false,
    },
  ],
  messages: [
    {
      id: "mm1",
      sender: { id: "system", username: "System", avatar_url: "" },
      text: "Alex joined the room",
      is_system: true,
      created_at: "2026-03-17T18:30:00Z",
    },
    {
      id: "mm2",
      sender: { id: "u6", username: "Morgan", avatar_url: avatar("Morgan") },
      text: "Welcome! Check out this playlist",
      created_at: "2026-03-17T18:31:00Z",
    },
    {
      id: "mm3",
      sender: { id: "u7", username: "Taylor", avatar_url: avatar("Taylor") },
      text: "These beats are fire",
      created_at: "2026-03-17T18:32:00Z",
    },
  ],
  queue: mockQueue,
  now_playing: mockNowPlayingMusic,
  sync_status: "synced",
};

export function getRoomStateById(id: string): RoomState | null {
  if (id === "r1") return mockRoomState;
  if (id === "r2") return mockRoomStateMusic;
  const room = mockRooms.find((r) => r.id === id);
  if (room) {
    return {
      room,
      participants: [
        {
          id: "u1",
          username: "Alex",
          avatar_url: avatar("Alex"),
          is_online: true,
          role: "host",
          is_muted: false,
          is_speaking: false,
          is_deafened: false,
          is_screen_sharing: false,
          is_camera_sharing: false,
        },
      ],
      messages: [],
      queue: [],
      now_playing: null,
      sync_status: "synced",
    };
  }
  return null;
}
