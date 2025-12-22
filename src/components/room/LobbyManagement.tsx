"use client";

import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, Clock, User, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { api, LobbyUser } from '@/lib/api';
import styles from './LobbyManagement.module.css';

interface LobbyManagementProps {
    roomCode: string;
    userEmail: string;
    onAdmit?: (email: string) => void;
    onDeny?: (email: string) => void;
}

export default function LobbyManagement({ roomCode, userEmail, onAdmit, onDeny }: LobbyManagementProps) {
    const [users, setUsers] = useState<LobbyUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    const fetchLobby = async () => {
        try {
            const lobbyUsers = await api.getLobbyUsers(roomCode, userEmail);
            setUsers(lobbyUsers);
        } catch (error) {
            console.error("Failed to fetch lobby users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLobby();

        // Set up polling as fallback or listen for lobby_update if parent passes events
        const interval = setInterval(fetchLobby, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [roomCode, userEmail]);

    const handleAction = async (targetEmail: string, action: 'admit' | 'deny') => {
        setProcessing(targetEmail);
        try {
            await api.lobbyAction(roomCode, userEmail, targetEmail, action);
            // Optimistic update
            setUsers(prev => prev.filter(u => u.email !== targetEmail));
            if (action === 'admit') onAdmit?.(targetEmail);
            else onDeny?.(targetEmail);
        } catch (error) {
            console.error(`Failed to ${action} user:`, error);
        } finally {
            setProcessing(null);
        }
    };

    if (loading && users.length === 0) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <span>Loading requests...</span>
            </div>
        );
    }

    return (
        <div className={styles.managementContainer}>
            <div className={styles.header}>
                <h3 className={styles.title}>Lobby Requests</h3>
                <span className={styles.badge}>{users.length}</span>
            </div>

            {users.length === 0 ? (
                <div className={styles.emptyState}>
                    <User className={styles.emptyIcon} size={40} />
                    <p>No pending requests at the moment.</p>
                </div>
            ) : (
                <div className={styles.userList}>
                    {users.map((user) => (
                        <div key={user.email} className={styles.userCard}>
                            <div className={styles.userInfo}>
                                <div className={styles.avatar}>
                                    {user.image_url ? (
                                        <img src={user.image_url} alt={user.full_name || user.email} />
                                    ) : (
                                        <User size={20} />
                                    )}
                                </div>
                                <div className={styles.userDetails}>
                                    <span className={styles.userName}>{user.email}</span>
                                    <div className={styles.waitingInfo}>
                                        <Clock size={12} />
                                        <span>{new Date(user.waiting_since).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.actionButtons}>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className={styles.denyButton}
                                    onClick={() => handleAction(user.email, 'deny')}
                                    disabled={processing === user.email}
                                >
                                    <UserX size={18} />
                                </Button>
                                <Button
                                    size="sm"
                                    className={styles.admitButton}
                                    onClick={() => handleAction(user.email, 'admit')}
                                    disabled={processing === user.email}
                                >
                                    <UserCheck size={18} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
