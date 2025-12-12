"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "./JoinRoomDialog.module.css";

interface JoinRoomDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialCode?: string;
}

export default function JoinRoomDialog({ open, onOpenChange, initialCode = "" }: JoinRoomDialogProps) {
    const router = useRouter();
    const [roomCode, setRoomCode] = useState(initialCode);
    const [displayName, setDisplayName] = useState("");
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (initialCode) {
            setRoomCode(initialCode);
        }
    }, [initialCode]);

    const handleJoin = async () => {
        if (!roomCode.trim()) {
            setError("Please enter a room code");
            return;
        }

        if (roomCode.length !== 6) {
            setError("Room code must be 6 characters");
            return;
        }

        setIsJoining(true);
        setError("");

        // Simulate room lookup (replace with actual API call)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Simulate room not found for demo
        if (roomCode === "NOTFND") {
            setError("Room not found. Check the code and try again.");
            setIsJoining(false);
            return;
        }

        // Navigate to room
        router.push(`/room/${roomCode}`);
        setIsJoining(false);
        onOpenChange(false);
    };

    const handleClose = () => {
        onOpenChange(false);
        setTimeout(() => {
            setRoomCode("");
            setDisplayName("");
            setError("");
        }, 200);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogHeader>
                <DialogTitle>Join a Room</DialogTitle>
                <DialogDescription>
                    Enter the room code shared by your friend to join the session.
                </DialogDescription>
            </DialogHeader>

            <DialogContent>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Room Code</label>
                    <Input
                        placeholder="ABC123"
                        value={roomCode}
                        onChange={(e) => {
                            setRoomCode(e.target.value.toUpperCase());
                            setError("");
                        }}
                        maxLength={6}
                        className={styles.codeInput}
                        error={error}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Display Name (optional)</label>
                    <Input
                        placeholder="How should others see you?"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        maxLength={30}
                    />
                </div>

                <div className={styles.previewCard}>
                    <div className={styles.previewIcon}>
                        <Users size={20} />
                    </div>
                    <div className={styles.previewText}>
                        <span className={styles.previewLabel}>Joining as</span>
                        <span className={styles.previewName}>{displayName || "Guest"}</span>
                    </div>
                </div>
            </DialogContent>

            <DialogFooter>
                <Button variant="ghost" onClick={handleClose}>
                    Cancel
                </Button>
                <Button
                    onClick={handleJoin}
                    disabled={!roomCode.trim() || isJoining}
                >
                    {isJoining ? "Joining..." : "Join Room"}
                </Button>
            </DialogFooter>
        </Dialog>
    );
}
