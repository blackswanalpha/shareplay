"use client";

import dynamic from "next/dynamic";

const RoomLobby = dynamic(
  () => import("./RoomLobby").then((m) => m.RoomLobby),
  { ssr: false }
);

interface RoomLobbyWrapperProps {
  roomId: string;
}

export function RoomLobbyWrapper({ roomId }: RoomLobbyWrapperProps) {
  return <RoomLobby roomId={roomId} />;
}
