import { VideoPlaylistState, PlaylistItem } from "../components/room/VideoPlayer";

interface UserSession {
  id: number;
  user_id: number;
  room_id: number;
  first_joined_at: string;
  last_joined_at: string;
  last_left_at?: string;
  total_time_spent: number;
  session_count: number;
  is_currently_in_room: boolean;
  last_seen_chat_message_id?: number;
  preferred_volume: number;
  notification_preferences?: Record<string, any>;
  last_video_time?: number;
  last_music_time?: number;
  last_sync_timestamp?: string;
}

interface ChatMessage {
  id: number;
  room_id: number;
  user_id?: number;
  username: string;
  message: string;
  message_type: string;
  timestamp: string;
  is_deleted: boolean;
  edited_at?: string;
}

interface SyncState {
  id: number;
  room_id: number;
  sync_type: string;
  content_url?: string;
  content_id?: string;
  content_title?: string;
  is_playing: boolean;
  current_time: number;
  playback_rate: number;
  volume: number;
  last_updated: string;
  updated_by_user_id: number;
  sync_timestamp?: number;
  network_latency_ms: number;
  extended_state?: Record<string, any>;
}

interface RoomActivity {
  id: number;
  room_id: number;
  user_id?: number;
  activity_type: string;
  activity_data?: Record<string, any>;
  timestamp: string;
  session_id?: string;
  user_agent?: string;
  ip_address?: string;
}

interface SessionRestoreResponse {
  session?: UserSession;
  chat_messages: ChatMessage[];
  sync_states: SyncState[];
  recent_activity: RoomActivity[];
}

class SessionManager {
  private apiUrl: string;
  private token: string | null = null;

  constructor() {
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  }

  setAuthToken(token: string) {
    this.token = token;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    // Ensure we have a token before making authenticated requests
    if (!this.token && !endpoint.includes('/public/')) {
      console.warn('No authentication token available for request to:', endpoint);
    }

    const headers: Record<string, string> = {
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...(options.headers as Record<string, string>),
    };

    if (options.body) {
      headers['Content-Type'] = 'application/json';
    }

    console.log(`Making request to: ${this.apiUrl}${endpoint}`);
    console.log('Request headers:', { ...headers, Authorization: this.token ? 'Bearer [REDACTED]' : 'Not set' });

    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Parse error details if available
      let errorMessage = `API request failed: ${response.statusText}`;
      let errorDetails = null;
      
      try {
        const errorData = await response.json();
        errorDetails = errorData;
        if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } catch {
        // Keep default error message if parsing fails
      }

      console.error(`Request failed - Status: ${response.status}, URL: ${this.apiUrl}${endpoint}`);
      console.error('Error details:', errorDetails);

      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).details = errorDetails;
      throw error;
    }

    return response.json();
  }

  async joinRoom(roomId: number): Promise<SessionRestoreResponse> {
    try {
      const response = await this.makeRequest(`/sessions/join-room/${roomId}`, {
        method: 'POST',
      });

      console.log('Session restored:', response);
      return response;
    } catch (error) {
      console.error('Failed to join room session:', error);
      // Return empty response on error
      return {
        chat_messages: [],
        sync_states: [],
        recent_activity: []
      };
    }
  }

  async leaveRoom(roomId: number, videoTime?: number, musicTime?: number) {
    try {
      await this.makeRequest(`/sessions/leave-room/${roomId}`, {
        method: 'POST',
        body: JSON.stringify({
          video_time: videoTime,
          music_time: musicTime,
        }),
      });

      console.log('Session ended for room:', roomId);
    } catch (error) {
      console.error('Failed to end room session:', error);
    }
  }

  async getChatHistory(roomId: number, limit = 50, beforeMessageId?: number): Promise<ChatMessage[]> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(beforeMessageId && { before_message_id: beforeMessageId.toString() })
      });

      const response = await this.makeRequest(`/sessions/room/${roomId}/messages?${params}`);
      return response;
    } catch (error) {
      console.error('Failed to get chat history:', error);
      return [];
    }
  }

  async updateSessionPreferences(roomId: number, preferences: {
    last_seen_chat_message_id?: number;
    preferred_volume?: number;
    notification_preferences?: Record<string, any>;
    last_video_time?: number;
    last_music_time?: number;
  }): Promise<UserSession | null> {
    try {
      const response = await this.makeRequest(`/sessions/room/${roomId}/session`, {
        method: 'PATCH',
        body: JSON.stringify(preferences),
      });

      return response;
    } catch (error) {
      console.error('Failed to update session preferences:', error);
      return null;
    }
  }

  async getUserSessions(activeOnly = false): Promise<UserSession[]> {
    try {
      const params = new URLSearchParams({
        active_only: activeOnly.toString(),
      });

      const response = await this.makeRequest(`/sessions/user/sessions?${params}`);
      return response;
    } catch (error) {
      console.error('Failed to get user sessions:', error);
      return [];
    }
  }

  async getRoomParticipants(roomId: number, activeOnly = true): Promise<UserSession[]> {
    try {
      const params = new URLSearchParams({
        active_only: activeOnly.toString(),
      });

      const response = await this.makeRequest(`/sessions/room/${roomId}/participants?${params}`);
      return response;
    } catch (error) {
      console.error('Failed to get room participants:', error);
      return [];
    }
  }

  async clearChatHistory(roomId: number): Promise<{ message: string } | null> {
    try {
      // The router has a prefix of /sessions
      const response = await this.makeRequest(`/sessions/room/${roomId}/messages`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error('Failed to clear chat history:', error);
      return null;
    }
  }

  // Helper methods for restoration
  restoreVideoState(syncStates: SyncState[]) {
    const videoState = syncStates.find(state => state.sync_type === 'video');
    if (videoState) {
      const playlistState: VideoPlaylistState = videoState.extended_state
        ? (videoState.extended_state as VideoPlaylistState)
        : { playlist: [], current_index: 0, loop: false, shuffle: false };

      return {
        url: videoState.content_url || '',
        isPlaying: videoState.is_playing,
        currentTime: videoState.current_time,
        timestamp: Date.now(),
        playlistState: playlistState, // Include playlist state
      };
    }
    return null;
  }

  restoreMusicState(syncStates: SyncState[]) {
    const musicState = syncStates.find(state => state.sync_type === 'music');
    if (musicState) {
      return {
        track: musicState.extended_state?.track || null,
        isPlaying: musicState.is_playing,
        currentTime: musicState.current_time,
        volume: musicState.volume,
        timestamp: Date.now(),
      };
    }
    return null;
  }

  convertChatMessages(chatMessages: any[]) {
    return chatMessages.map(msg => ({
      id: msg.id?.toString() || Math.random().toString(),
      user: msg.username,
      text: msg.message,
      timestamp: new Date(msg.timestamp),
    }));
  }
}

export const sessionManager = new SessionManager();
export type { UserSession, ChatMessage, SyncState, RoomActivity, SessionRestoreResponse };