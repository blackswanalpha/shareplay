import { RoomPageWrapper } from "@/components/room/RoomPageWrapper";

export default async function RoomRoute({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  return <RoomPageWrapper roomId={roomId} />;
}
