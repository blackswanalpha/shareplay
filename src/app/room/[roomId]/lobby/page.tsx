import { RoomLobbyWrapper } from "@/components/room/RoomLobbyWrapper";

export default async function LobbyRoute({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  return <RoomLobbyWrapper roomId={roomId} />;
}
