"use client";

import { useAtomValue } from "jotai";
import {
  Crown,
  Star,
  Microphone,
  MicrophoneSlash,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  ArrowsClockwise,
  UserMinus,
} from "@phosphor-icons/react";
import { participantsAtom, pendingUsersAtom } from "@/store/roomAtoms";
import type { SocketActions } from "@/hooks/useSocket";
import { useCurrentRole } from "@/hooks/useCurrentRole";
import { MoreMenu } from "@/components/ui/MoreMenu";
import type { RoomParticipant } from "@/lib/types";

interface PeoplePanelProps {
  actions: SocketActions;
}

function getRoleMenuItems(
  participant: RoomParticipant,
  assignRole: (targetUserId: string, role: string) => void,
  canTransferHost: boolean,
) {
  const items: { label: string; icon?: React.ReactNode; danger?: boolean; onClick: () => void }[] = [];

  if (participant.role === "member") {
    items.push({
      label: "Promote to Co-host",
      icon: <ShieldCheck size={16} />,
      onClick: () => assignRole(participant.id, "co_host"),
    });
  }

  if (participant.role === "co-host") {
    items.push({
      label: "Demote to Member",
      icon: <UserMinus size={16} />,
      onClick: () => assignRole(participant.id, "viewer"),
    });
  }

  if (canTransferHost) {
    items.push({
      label: "Transfer Host",
      icon: <ArrowsClockwise size={16} />,
      danger: true,
      onClick: () => assignRole(participant.id, "primary_host"),
    });
  }

  return items;
}

export function PeoplePanel({ actions }: PeoplePanelProps) {
  const { currentUserId, canManageRoles, canManageJoinRequests, canTransferHost } = useCurrentRole();
  const participants = useAtomValue(participantsAtom);
  const pendingUsers = useAtomValue(pendingUsersAtom);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {participants.map((p) => (
        <div
          key={p.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 0",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <div style={{ position: "relative", flexShrink: 0 }}>
            <img
              src={p.avatar_url}
              alt={p.username}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#222",
                border: p.is_speaking
                  ? "2px solid #22c55e"
                  : "2px solid transparent",
              }}
            />
            {!p.is_online && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.5)",
                }}
              />
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: p.is_online ? "#f5f5f5" : "#555",
                  fontFamily: "var(--font-inter), sans-serif",
                }}
              >
                {p.username}
              </span>
              {p.role === "host" && (
                <Crown size={14} weight="fill" style={{ color: "#eab308" }} />
              )}
              {p.role === "co-host" && (
                <Star size={14} weight="fill" style={{ color: "#ff4242" }} />
              )}
            </div>
            <span
              style={{
                fontSize: 11,
                color: "#555",
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              {!p.is_online ? "Offline" : p.is_speaking ? "Speaking" : p.role}
            </span>
          </div>

          <div style={{ flexShrink: 0, color: p.is_muted ? "#ff4242" : "#555" }}>
            {p.is_muted ? (
              <MicrophoneSlash size={16} />
            ) : (
              <Microphone size={16} />
            )}
          </div>

          {canManageRoles && p.id !== currentUserId && (canTransferHost || p.role !== "host") && (
            <MoreMenu items={getRoleMenuItems(p, actions.assignRole, canTransferHost)} />
          )}
        </div>
      ))}

      {pendingUsers.length > 0 && (
        <>
          <div
            style={{
              height: 1,
              background: "rgba(255,255,255,0.08)",
              margin: "12px 0 8px",
            }}
          />
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#888",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontFamily: "var(--font-inter), sans-serif",
              marginBottom: 4,
            }}
          >
            PENDING REQUESTS
          </p>
          {pendingUsers.map((pending) => (
            <div
              key={pending.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 12,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
              }}
            >
              <img
                src={pending.avatar_url}
                alt={pending.username}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "#222",
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#f5f5f5",
                    fontFamily: "var(--font-inter), sans-serif",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {pending.username}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: "#888",
                    fontFamily: "var(--font-inter), sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Clock size={10} />
                  Waiting to join
                </p>
              </div>

              {canManageJoinRequests && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => actions.approveJoin(pending.id)}
                    aria-label="Approve"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 32,
                      height: 32,
                      background: "rgba(34,197,94,0.12)",
                      border: "1px solid rgba(34,197,94,0.25)",
                      borderRadius: 8,
                      color: "#22c55e",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(34,197,94,0.25)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(34,197,94,0.12)";
                    }}
                  >
                    <CheckCircle size={18} weight="bold" />
                  </button>
                  <button
                    onClick={() => actions.declineJoin(pending.id)}
                    aria-label="Decline"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 32,
                      height: 32,
                      background: "rgba(255,66,66,0.12)",
                      border: "1px solid rgba(255,66,66,0.25)",
                      borderRadius: 8,
                      color: "#ff4242",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,66,66,0.25)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,66,66,0.12)";
                    }}
                  >
                    <XCircle size={18} weight="bold" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
