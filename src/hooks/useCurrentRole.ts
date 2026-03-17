import { useAtomValue } from "jotai";
import { participantsAtom } from "@/store/roomAtoms";
import { useAuth } from "@/providers/AuthProvider";

export function useCurrentRole() {
  const { user } = useAuth();
  const participants = useAtomValue(participantsAtom);
  const role = participants.find((p) => p.id === user?.id)?.role;
  const isHostOrCoHost = role === "host" || role === "co-host";

  return {
    role,
    currentUserId: user?.id ?? null,
    canSubmitMedia: isHostOrCoHost,
    canManageJoinRequests: isHostOrCoHost,
    canManageRoles: isHostOrCoHost,
    canTransferHost: role === "host",
  };
}
