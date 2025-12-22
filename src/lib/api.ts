const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Room {
    id: number;
    code: string;
    name: string;
    has_video: boolean;
    has_music: boolean;
    has_games: boolean;
    is_public: boolean;
    lobby_enabled: boolean;
    host_id: number;
    host_email?: string;
    co_hosts?: string[];
    is_host?: boolean;
    current_user_status?: "admitted" | "waiting" | "denied";
    created_at: string;
    current_video_url?: string;
}

export interface LobbyUser {
    user_id: number;
    email: string;
    full_name?: string;
    image_url?: string;
    waiting_since: string;
}

export interface RoomSettingsUpdate {
    name?: string;
    is_public?: boolean;
    lobby_enabled?: boolean;
}

export interface RoomLobbyActivityResponse {
    user_id: number;
    user_email: string;
    user_name?: string;
    location: "lobby" | "room";
    is_active: boolean;
    last_seen_at: string;
}

export interface CreateRoomData {
    name: string;
    has_video: boolean;
    has_music: boolean;
    has_games: boolean;
    is_public: boolean;
    lobby_enabled: boolean;
}

// Helper to get access token using the user's session email
async function getAccessToken(userEmail: string, fullName?: string | null) {
    try {
        // Try to authenticate with the session user's email first
        let res = await fetch(`${API_URL}/auth/token`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                username: userEmail,
                password: "user123", // In a real app, this would be handled differently
            }),
        });

        // If auth fails (likely user doesn't exist), try to register them
        if (res.status === 401) {
            console.log(`Auth failed for ${userEmail}, attempting registration...`);
            const registerRes = await fetch(`${API_URL}/users/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: userEmail,
                    password: "user123",
                    full_name: fullName || userEmail.split('@')[0]
                })
            });

            if (registerRes.ok) {
                console.log(`Registered user ${userEmail}, retrying auth...`);
                // Retry auth after successful registration
                res = await fetch(`${API_URL}/auth/token`, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({
                        username: userEmail,
                        password: "user123",
                    }),
                });
            } else {
                console.warn(`Registration failed for ${userEmail}`);
            }
        }



        if (!res.ok) {
            const errorText = await res.text().catch(() => 'Unknown error');
            console.error(`Auth failed for ${userEmail}: ${res.status} ${errorText}`);
            throw new Error(`Authentication failed for ${userEmail}: ${res.status}`);
        }
        const data = await res.json();
        return data.access_token;
    } catch (error) {
        console.error("Auth error", error);
        throw error;
    }
}

export const api = {
    async trackRoomJoin(roomId: string, data: { user_email: string; requesting_user: string }): Promise<void> {
        // Implementation stub or actual call
        console.log(`Tracking join for room ${roomId}:`, data);
        // If there's an endpoint, fetch it. For now, resolved void.
        return Promise.resolve();
    },

    async createRoom(data: CreateRoomData, userEmail: string, fullName?: string | null): Promise<Room> {
        const token = await getAccessToken(userEmail, fullName);
        const res = await fetch(`${API_URL}/rooms/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            throw new Error("Failed to create room");
        }
        return res.json();
    },

    async getRoom(code: string, userEmail?: string): Promise<Room> {
        let headers: Record<string, string> = {};
        if (userEmail) {
            try {
                const token = await getAccessToken(userEmail);
                headers["Authorization"] = `Bearer ${token}`;
            } catch (e) {
                console.warn("Failed to get token for getRoom, continuing as guest", e);
            }
        }

        const res = await fetch(`${API_URL}/rooms/${code}`, {
            headers
        });
        if (!res.ok) {
            const errorText = await res.text().catch(() => 'Unknown error');
            console.error(`Room ${code} not found. Status: ${res.status}, Response: ${errorText}`);
            throw new Error(`Room ${code} not found (${res.status})`);
        }
        return res.json();
    },

    async getHostedRooms(userEmail: string): Promise<Room[]> {
        const token = await getAccessToken(userEmail);
        const res = await fetch(`${API_URL}/users/me/rooms`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error("Failed to fetch hosted rooms");
        }
        return res.json();
    },

    async getUserProfile(): Promise<User> {
        // We need the token here. In a real app we'd get it from session or storage.
        // For this demo, we'll rely on the fact that we can get a token for the current user 
        // if we have their email. Ideally, the session has the accessToken.
        // Since getAccessToken requires email, we'll assume the caller passes it 
        // OR we use the fallback in this demo environment.
        // Actually, let's fetch 'me' using the token.

        // Retrieve token from localStorage if we were storing it, 
        // but here we are using NextAuth session. 
        // We'll trust the component to pass the token or we handle it here if we had access to session.
        // LIMITATION: This helper doesn't have access to the NextAuth session directly.
        // We will accept a token or email to get token. 
        // Let's modify this to accept a token.
        throw new Error("Use getUserProfileWithToken instead");
    },

    async getUserProfileWithToken(token: string): Promise<User> {
        const res = await fetch(`${API_URL}/users/me`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
    },

    async updateUserProfile(token: string, data: Partial<User>): Promise<User> {
        const res = await fetch(`${API_URL}/users/me`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Failed to update profile");
        return res.json();
    },

    // Helper to exchange email for token (for demo purposes when we don't have the token in session explicitly)
    async getTokenForEmail(email: string, fullName?: string | null): Promise<string> {
        return getAccessToken(email, fullName);
    },

    async deleteRoom(roomId: string, userEmail: string): Promise<{ message: string }> {
        const token = await getAccessToken(userEmail);
        const res = await fetch(`${API_URL}/rooms/${roomId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error("Failed to delete room");
        }
        return res.json();
    },

    async updateRoomSettings(code: string, settings: RoomSettingsUpdate, userEmail: string): Promise<Room> {
        const token = await getAccessToken(userEmail);
        const res = await fetch(`${API_URL}/rooms/${code}/settings`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(settings),
        });

        if (!res.ok) {
            throw new Error("Failed to update room settings");
        }
        return res.json();
    },

    async getLobbyUsers(code: string, userEmail: string): Promise<LobbyUser[]> {
        const token = await getAccessToken(userEmail);
        const res = await fetch(`${API_URL}/rooms/${code}/lobby`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error("Failed to fetch lobby users");
        }
        return res.json();
    },

    async lobbyAction(code: string, userEmail: string, targetEmail: string, action: 'admit' | 'deny'): Promise<{ message: string }> {
        const token = await getAccessToken(userEmail);
        const res = await fetch(`${API_URL}/rooms/${code}/lobby/action`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ user_email: targetEmail, action }),
        });

        if (!res.ok) {
            throw new Error(`Failed to ${action} user`);
        }
        return res.json();
    },

    async getRoomActivities(code: string, userEmail: string): Promise<RoomLobbyActivityResponse[]> {
        const token = await api.getTokenForEmail(userEmail);
        const res = await fetch(`${API_URL}/rooms/${code}/activities`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error("Failed to fetch room activities");
        }
        return res.json();
    }
};

export interface User {
    id: number;
    email: string;
    full_name?: string;
    is_active: boolean;
    is_superuser: boolean;
}
