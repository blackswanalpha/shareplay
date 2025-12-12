"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Settings, Save, RefreshCw } from "lucide-react";
import styles from "./RoomSettingsDialog.module.css";
import React, { useState } from "react";

interface RoomSettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    roomName: string;
    features: {
        video: boolean;
        music: boolean;
        games: boolean;
    };
    isHost: boolean;
}

export default function RoomSettingsDialog({
    open,
    onOpenChange,
    roomName,
    features,
    isHost
}: RoomSettingsDialogProps) {
    const [localFeatures, setLocalFeatures] = useState(features);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
        onOpenChange(false);
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
