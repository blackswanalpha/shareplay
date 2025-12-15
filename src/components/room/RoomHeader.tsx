"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { ArrowLeft, Crown, MonitorPlay, LogOut, Settings, User, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import styles from "./RoomHeader.module.css";
import { RoomConfig } from "@/app/room/[roomId]/page";

interface RoomHeaderProps {
    onExitClick: () => void;
    onEndRoomClick?: () => void;
    roomConfig: RoomConfig | null;
    roomId: string;
    isHost: boolean;
    isConnected: boolean;
    onlineCount: number;
    onCopyRoomCode: () => void;
    wasCopied: boolean;
    showUserMenu: boolean;
    onToggleUserMenu: () => void;
}

export default function RoomHeader({
    onExitClick,
    onEndRoomClick,
    roomConfig,
    roomId,
    isHost,
    isConnected,
    onlineCount,
    onCopyRoomCode,
    wasCopied,
    showUserMenu,
    onToggleUserMenu
}: RoomHeaderProps) {
    const { user } = useUser();
    const { signOut } = useClerk();

    const handleLogout = () => {
        signOut({ redirectUrl: "/" });
    };

    return (
        <header className={styles.header}>
            <div className={styles.headerLeft}>
                <div className={styles.logoIcon} onClick={onExitClick}>
                    <MonitorPlay size={24} />
                </div>
                <div className={styles.roomInfo}>
                    <div className={styles.roomTitleRow}>
                        <h1 className={styles.roomName}>{roomConfig?.name || `Room ${roomId}`}</h1>
                        <span className={styles.liveBadge}>Live</span>
                    </div>
                    {isHost && <span className={styles.hostName}>Hosted by You</span>}
                    {!isHost && roomConfig?.hostEmail && <span className={styles.hostName}>Hosted by {roomConfig.hostEmail.split('@')[0]}</span>}
                </div>
            </div>

            <div className={styles.headerRight}>
                {/* Visual Controls (Desktop only) */}
                <div className={styles.controlsArea}>
                    <button className={styles.controlBtn} title="Settings" onClick={() => { }}>
                        <Settings size={20} />
                    </button>
                    <button className={styles.controlBtn} onClick={onCopyRoomCode} title={wasCopied ? "Copied" : "Copy Room Code"}>
                        {wasCopied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                    </button>
                </div>

                <div className={styles.userArea}>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>{user?.fullName || "Guest"}</span>
                        {!isHost && <span className={styles.userStatus}>Viewer</span>}
                    </div>

                    <div className={styles.userMenu}>
                        <div className={`${styles.avatarContainer} ${isHost ? styles.hostAvatar : ''}`} onClick={onToggleUserMenu}>
                            <div className={styles.avatarGlow}></div>
                            <div className={styles.avatarImage}>
                                {user?.imageUrl ? (
                                    <img src={user.imageUrl} alt={user.fullName || "User"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    (user?.fullName?.[0] || user?.primaryEmailAddress?.emailAddress?.[0] || "U").toUpperCase()
                                )}
                            </div>
                        </div>

                        {showUserMenu && (
                            <div className={styles.dropdownMenu}>
                                <button className={styles.menuItem}>
                                    <User size={16} /> Profile
                                </button>
                                <button className={styles.menuItem}>
                                    <Settings size={16} /> Settings
                                </button>
                                {isHost && (
                                    <button className={`${styles.menuItem} ${styles.danger}`} onClick={onEndRoomClick}>
                                        <MonitorPlay size={16} /> End Room
                                    </button>
                                )}
                                <button className={`${styles.menuItem} ${styles.danger}`} onClick={handleLogout}>
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>

                    <button className={styles.leaveBtn} onClick={onExitClick}>
                        <LogOut size={18} />
                        <span>Leave</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
