"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Play, Music, Gamepad2, Copy, Check, Globe, Lock } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "./CreateRoomDialog.module.css";

interface CreateRoomDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}


export default function CreateRoomDialog({ open, onOpenChange }: CreateRoomDialogProps) {
    const router = useRouter();
    const { user } = useUser();
    const [roomName, setRoomName] = useState("");
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>(["video"]);
    const [isPublic, setIsPublic] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [createdRoom, setCreatedRoom] = useState<{ code: string; name: string } | null>(null);
    const [copied, setCopied] = useState(false);

    const generateRoomCode = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let code = "";
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    const handleCreate = async () => {
        if (!roomName.trim()) return;
        if (selectedFeatures.length === 0) {
            alert("Please select at least one feature.");
            return;
        }
        if (!user?.primaryEmailAddress?.emailAddress) {
            alert("Please log in to create a room.");
            return;
        }

        setIsCreating(true);

        try {
            const { api } = await import("@/lib/api");
            const newRoom = await api.createRoom({
                name: roomName,
                has_video: selectedFeatures.includes("video"),
                has_music: selectedFeatures.includes("music"),
                has_games: selectedFeatures.includes("games"),
                is_public: isPublic,
            }, user.primaryEmailAddress.emailAddress, user.fullName);

            setCreatedRoom({ code: newRoom.code, name: newRoom.name });

            // Local storage fallback (keeping it simple for now, though structure changed)
            sessionStorage.setItem(`room_${newRoom.code}`, JSON.stringify({
                name: newRoom.name,
                features: {
                    video: newRoom.has_video,
                    music: newRoom.has_music,
                    games: newRoom.has_games
                },
                isPublic: newRoom.is_public,
                createdAt: newRoom.created_at,
                hostId: newRoom.host_id.toString(),
            }));

        } catch (error) {
            console.error("Failed to create room", error);
            alert("Failed to create room. Please try again.");
        } finally {
            setIsCreating(false);
        }
    };

    const handleCopy = async () => {
        if (!createdRoom) return;

        await navigator.clipboard.writeText(createdRoom.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = () => {
        onOpenChange(false);
        // Reset state after animation
        setTimeout(() => {
            setRoomName("");
            setSelectedFeatures(["video"]);
            setIsPublic(true);
            setCreatedRoom(null);
            setCopied(false);
        }, 200);
    };

    const toggleFeature = (id: string) => {
        setSelectedFeatures(prev =>
            prev.includes(id)
                ? prev.filter(f => f !== id)
                : [...prev, id]
        );
    };

    const featuresList = [
        { id: "video", icon: Play, label: "Watch", color: "#ec4899" },
        { id: "music", icon: Music, label: "Listen", color: "#22c55e" },
        { id: "games", icon: Gamepad2, label: "Play", color: "#8b5cf6" },
    ] as const;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            {!createdRoom ? (
                <>
                    <DialogHeader>
                        <DialogTitle>Create a Room</DialogTitle>
                        <DialogDescription>
                            Set up your room and invite friends to join the fun.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogContent>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Room Name</label>
                            <Input
                                placeholder="Movie Night, Study Session..."
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                                maxLength={50}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Room Features (Select multiple)</label>
                            <div className={styles.typeGrid}>
                                {featuresList.map(({ id, icon: Icon, label, color }) => {
                                    const isSelected = selectedFeatures.includes(id);
                                    return (
                                        <button
                                            key={id}
                                            className={`${styles.typeButton} ${isSelected ? styles.selected : ""}`}
                                            onClick={() => toggleFeature(id)}
                                            style={{ "--type-color": color } as React.CSSProperties}
                                        >
                                            <Icon size={24} />
                                            <span>{label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Room Privacy</label>
                            <div className={styles.privacyOptions}>
                                <label
                                    className={`${styles.privacyOption} ${isPublic ? styles.selected : ""}`}
                                    onClick={() => setIsPublic(true)}
                                >
                                    <input
                                        type="radio"
                                        name="privacy"
                                        checked={isPublic}
                                        onChange={() => setIsPublic(true)}
                                        className={styles.radioInput}
                                    />
                                    <div className={styles.radioButton}>
                                        <Globe size={18} />
                                    </div>
                                    <div className={styles.privacyText}>
                                        <span className={styles.privacyTitle}>Public Room</span>
                                        <span className={styles.privacyDesc}>Anyone with the link can join</span>
                                    </div>
                                </label>

                                <label
                                    className={`${styles.privacyOption} ${!isPublic ? styles.selected : ""}`}
                                    onClick={() => setIsPublic(false)}
                                >
                                    <input
                                        type="radio"
                                        name="privacy"
                                        checked={!isPublic}
                                        onChange={() => setIsPublic(false)}
                                        className={styles.radioInput}
                                    />
                                    <div className={styles.radioButton}>
                                        <Lock size={18} />
                                    </div>
                                    <div className={styles.privacyText}>
                                        <span className={styles.privacyTitle}>Private Room</span>
                                        <span className={styles.privacyDesc}>Only invited friends can join</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </DialogContent>

                    <DialogFooter>
                        <Button variant="ghost" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={!roomName.trim() || isCreating}
                        >
                            {isCreating ? "Creating..." : "Create Room"}
                        </Button>
                    </DialogFooter>
                </>
            ) : (
                <>
                    <DialogHeader>
                        <DialogTitle>🎉 Room Created!</DialogTitle>
                        <DialogDescription>
                            Share this code with your friends to let them join.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogContent>
                        <div className={styles.successCard}>
                            <div className={styles.roomInfo}>
                                <span className={styles.roomLabel}>Room Name</span>
                                <span className={styles.roomValue}>{createdRoom.name}</span>
                            </div>

                            <div className={styles.codeContainer}>
                                <span className={styles.codeLabel}>Room Code</span>
                                <div className={styles.codeBox}>
                                    <span className={styles.code}>{createdRoom.code}</span>
                                    <button className={styles.copyButton} onClick={handleCopy}>
                                        {copied ? <Check size={18} /> : <Copy size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </DialogContent>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleClose}>
                            Close
                        </Button>
                        <Button onClick={() => router.push(`/room/${createdRoom.code}`)}>
                            Enter Room
                        </Button>
                    </DialogFooter>
                </>
            )}
        </Dialog>
    );
}
