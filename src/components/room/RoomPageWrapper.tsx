"use client";

import dynamic from "next/dynamic";

const RoomPage = dynamic(
  () => import("./RoomPage").then((m) => m.RoomPage),
  { ssr: false }
);

interface RoomPageWrapperProps {
  roomId: string;
}

export function RoomPageWrapper({ roomId }: RoomPageWrapperProps) {
  return <RoomPage roomId={roomId} />;
}
