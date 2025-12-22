"use client";

import React, { useState, useEffect } from 'react';
import { api, RoomLobbyActivityResponse } from '@/lib/api';
import { User, MapPin, Activity, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import styles from './ActivityTable.module.css';

interface ActivityTableProps {
    roomCode: string;
    userEmail: string;
}

export default function ActivityTable({ roomCode, userEmail }: ActivityTableProps) {
    const [activities, setActivities] = useState<RoomLobbyActivityResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const data = await api.getRoomActivities(roomCode, userEmail);
            setActivities(data);
            setLastRefreshed(new Date());
        } catch (error) {
            console.error("Failed to fetch room activities:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
        const interval = setInterval(fetchActivities, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [roomCode, userEmail]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleArea}>
                    <Activity size={20} className="text-purple-400" />
                    <h3 className={styles.title}>System Presence</h3>
                </div>
                <div className={styles.utils}>
                    <span className={styles.lastUpdated}>
                        Refreshed: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchActivities}
                        disabled={loading}
                        className={styles.refreshBtn}
                    >
                        <RefreshCw size={14} className={loading ? styles.spinning : ''} />
                    </Button>
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th>Last Seen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activities.length === 0 ? (
                            <tr>
                                <td colSpan={4} className={styles.empty}>No activity found</td>
                            </tr>
                        ) : (
                            activities.map((activity) => (
                                <tr key={activity.user_id}>
                                    <td>
                                        <div className={styles.userNameArea}>
                                            <div className={styles.avatar}>
                                                <User size={14} />
                                            </div>
                                            <div className={styles.userText}>
                                                <span className={styles.userName}>{activity.user_email}</span>
                                                <span className={styles.userEmail}>{activity.user_name}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`${styles.locationTag} ${activity.location === 'room' ? styles.inRoom : styles.inLobby}`}>
                                            <MapPin size={12} />
                                            {activity.location}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`${styles.statusDot} ${activity.is_active ? styles.online : styles.offline}`}></span>
                                        {activity.is_active ? 'Active' : 'Disconnected'}
                                    </td>
                                    <td className={styles.timestamp}>
                                        {new Date(activity.last_seen_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
