import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Settings, Save, RefreshCw, Trash2 } from "lucide-react";
import styles from "./RoomSettingsDialog.module.css";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { sessionManager } from "@/lib/sessionManager";

interface RoomSettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    roomName: string;
    features: {
        chat?: boolean;
        video: boolean;
        music: boolean;
        games: boolean;
    };
    isHost: boolean;
    onChatCleared?: () => void;
}

export default function RoomSettingsDialog({
    open,
    onOpenChange,
    roomName,
    features,
    isHost,
    onChatCleared
}: RoomSettingsDialogProps) {
    const [localFeatures, setLocalFeatures] = useState(features);
    const [loading, setLoading] = useState(false);
    const params = useParams();

    // Ensure roomId is parsed safely
    const roomId = typeof params.roomId === 'string' ? parseInt(params.roomId, 10) : 0;

    const handleSave = async () => {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
        onOpenChange(false);
    };

    const handleClearChat = async () => {
        if (!isHost || !roomId) return;

        const confirmed = window.confirm(
            "Are you sure you want to permanently delete all chat history for this room? This action cannot be undone."
        );

        if (confirmed) {
            setLoading(true);
            try {
                const result = await sessionManager.clearChatHistory(roomId);
                if (result) {
                    alert("Chat history cleared successfully.");
                    if (onChatCleared) {
                        onChatCleared();
                    }
                    onOpenChange(false);
                } else {
                    throw new Error("Failed to clear chat history.");
                }
            } catch (error) {
                console.error(error);
                alert((error as Error).message || "An unexpected error occurred.");
            } finally {
                setLoading(false);
            }
        }
    };

    const toggleFeature = (key: keyof typeof features) => {
        if (!isHost) return;
        setLocalFeatures(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <div className={styles.headerIcon}>
                        <Settings size={28} />
                    </div>
                    <DialogTitle>Room Settings</DialogTitle>
                    <DialogDescription>
                        Configure features and permissions for {roomName}
                    </DialogDescription>
                </DialogHeader>

                <div className={styles.content}>
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Enabled Features</h3>
                        <div className={styles.featuresGrid}>
                            <div
                                className={`${styles.featureItem} ${localFeatures.video ? styles.active : ''} ${!isHost ? styles.disabled : ''}`}
                                onClick={() => toggleFeature('video')}
                            >
                                <span>Video Player</span>
                                <div className={styles.toggle} />
                            </div>
                            <div
                                className={`${styles.featureItem} ${localFeatures.music ? styles.active : ''} ${!isHost ? styles.disabled : ''}`}
                                onClick={() => toggleFeature('music')}
                            >
                                <span>Music Player</span>
                                <div className={styles.toggle} />
                            </div>
                            <div
                                className={`${styles.featureItem} ${localFeatures.games ? styles.active : ''} ${!isHost ? styles.disabled : ''}`}
                                onClick={() => toggleFeature('games')}
                            >
                                <span>Games</span>
                                <div className={styles.toggle} />
                            </div>
                        </div>
                        {!isHost && (
                            <p className={styles.note}>Only the host can modify room settings.</p>
                        )}
                    </div>

                    {/* Danger Zone */}
                    <div className={styles.section}>
                        <h3 className={`${styles.sectionTitle} text-red-500`}>Danger Zone</h3>
                        {isHost ? (
                            <div className="flex flex-col gap-2 items-start">
                                <Button
                                    variant="outline"
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                    onClick={handleClearChat}
                                    disabled={loading}
                                >
                                    {loading ? <RefreshCw className="animate-spin" size={18} /> : <Trash2 size={18} />}
                                    Clear Chat History
                                </Button>
                                <p className={styles.note}>This will permanently delete all messages for everyone.</p>
                            </div>
                        ) : (
                            <p className={styles.note}>Only the host can perform these actions.</p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    {isHost && (
                        <Button
                            variant="default"
                            onClick={handleSave}
                            disabled={loading}
                        >
                            {loading ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                            Save Changes
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
