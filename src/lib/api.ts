const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Room {
    id: number;
    code: string;
    name: string;
    has_video: boolean;
    has_music: boolean;
    has_games: boolean;
    is_public: boolean;
    host_id: number;
    created_at: string;
}

export interface CreateRoomData {
    name: string;
    has_video: boolean;
    has_music: boolean;
    has_games: boolean;
    is_public: boolean;
}

// Helper to get access token (simulated for demo, in real app integrate with NextAuth session)
// For now, we will rely on keyless creation or assume the backend allows it for simplicity,
// BUT our backend requires auth for creation.
// We will implement a temporary login to get a token for the "Demo User" transparently.

let accessToken: string | null = null;

async function getAccessToken() {
    if (accessToken) return accessToken;
    try {
        const res = await fetch(`${API_URL}/auth/token`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                username: "user1@shareplay.com", // Hardcoded for demo integration
                password: "user123",
            }),
        });
        if (!res.ok) throw new Error("Failed to authenticate");
        const data = await res.json();
        accessToken = data.access_token;
        return accessToken;
    } catch (error) {
        console.error("Auth error", error);
        return null;
    }
}

export const api = {
    async createRoom(data: CreateRoomData): Promise<Room> {
        const token = await getAccessToken();
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

    async getRoom(code: string): Promise<Room> {
        const res = await fetch(`${API_URL}/rooms/${code}`);
        if (!res.ok) {
            throw new Error("Room not found");
        }
        return res.json();
    }
};
