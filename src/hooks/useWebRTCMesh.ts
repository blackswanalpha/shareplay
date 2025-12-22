import { useEffect, useRef, useState, useCallback } from 'react';
import SimplePeer, { Instance as SimplePeerInstance, SignalData } from 'simple-peer';

interface PeerWrapper {
    peerId: string;
    peer: SimplePeerInstance;
}

interface UseWebRTCMeshProps {
    socket: WebSocket | null;
    roomCode: string;
    currentUser: string;
    participants: string[];
    onPeerConnected?: (peerId: string) => void;
    localStream?: MediaStream | null;
}

export const useWebRTCMesh = ({ socket, roomCode, currentUser, participants, onPeerConnected, localStream }: UseWebRTCMeshProps) => {
    const [peers, setPeers] = useState<PeerWrapper[]>([]);
    const [remoteStreams, setRemoteStreams] = useState<{ peerId: string; stream: MediaStream }[]>([]);
    const peersRef = useRef<PeerWrapper[]>([]);
    const onDataCallbackRef = useRef<((data: any) => void) | null>(null);
    const activeStreamRef = useRef<MediaStream | null>(null);

    // Update ref when localStream changes
    useEffect(() => {
        // We handle stream changes in the specific effect below, 
        // but keeping a ref might be useful if we needed it elsewhere.
    }, [localStream]);

    // Helper to safely send signals
    const sendSignal = useCallback((target: string, signal: SignalData) => {
        if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: 'signal',
                target,
                signal
            }));
        }
    }, [socket]);

    // Create a new peer connection
    const createPeer = useCallback((userToSignal: string, initiator: boolean) => {
        const peer = new SimplePeer({
            initiator,
            trickle: false,
            stream: activeStreamRef.current || undefined, // Pass the current local stream if available
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478' },
                    // Added TURN server (example - replace with a reliable one for production)
                    {
                        urls: 'turn:openrelay.metered.ca:80',
                        username: 'openrelay@metered.ca',
                        credential: 'openrelay'
                    }
                ]
            }
        });

        peer.on('signal', (signal) => {
            sendSignal(userToSignal, signal);
        });

        peer.on('connect', () => {
            console.log(`WebRTC: Connected to ${userToSignal}`);
            if (onPeerConnected) {
                onPeerConnected(userToSignal);
            }
        });

        peer.on('data', (data) => {
            try {
                const parsed = JSON.parse(data.toString());
                if (onDataCallbackRef.current) {
                    onDataCallbackRef.current(parsed);
                }
            } catch (e) {
                console.error('WebRTC: Failed to parse incoming data', e);
            }
        });

        peer.on('stream', (stream) => {
            console.log(`WebRTC: Received stream from ${userToSignal}`);
            setRemoteStreams(prev => {
                // Remove existing stream for this peer if any, then add new one
                const filtered = prev.filter(p => p.peerId !== userToSignal);
                return [...filtered, { peerId: userToSignal, stream }];
            });
        });

        peer.on('error', (err) => {
            console.error('WebRTC: Peer error', err);
        });

        peer.on('close', () => {
            console.log(`WebRTC: Connection closed with ${userToSignal}`);
        });

        return peer;
    }, [sendSignal, onPeerConnected]);

    // Handle incoming signals and manage peer lifecycle
    useEffect(() => {
        peersRef.current = peers;
    }, [peers]);

    // Handle local stream changes (Add/Remove stream for existing peers) & Update Ref
    useEffect(() => {
        const peers = peersRef.current;
        const newStream = localStream;
        const oldStream = activeStreamRef.current;

        activeStreamRef.current = newStream || null;

        if (newStream === oldStream) return;

        peers.forEach(p => {
            const peer = p.peer;
            if (!peer.destroyed) {
                try {
                    if (oldStream) {
                        peer.removeStream(oldStream);
                    }
                    if (newStream) {
                        peer.addStream(newStream);
                    }
                } catch (e) {
                    console.warn(`WebRTC: Error updating stream for ${p.peerId}`, e);
                }
            }
        });
    }, [localStream]);

    // Mesh networking logic: connecting to new participants
    useEffect(() => {
        if (!socket) {
            if (peersRef.current.length > 0) {
                console.log("WebRTC: Socket lost, destroying all peers");
                peersRef.current.forEach(p => {
                    try {
                        p.peer.destroy();
                    } catch (e) {
                        console.error("Error destroying peer on socket loss:", e);
                    }
                });
                setPeers([]);
                setRemoteStreams([]);
            }
            return;
        }

        if (!currentUser) return;

        const currentPeers = peersRef.current;

        // 1. Identify peers that need to be removed (users who left)
        const peersToRemove = currentPeers.filter(p => !participants.includes(p.peerId));

        // 2. Identify users strictly needing a NEW connection initiated by US
        const usersToConnect = participants.filter(user => {
            if (user === currentUser) return false;
            // check if we already have a peer (connected or connecting)
            const hasPeer = currentPeers.some(p => p.peerId === user);
            // Lexical comparison to decide who initiates
            // user < currentUser is what the code had. 
            // If user="Alice" and currentUser="Bob". "Alice" < "Bob" is true.
            // So Bob (currentUser) will initiate to Alice.
            return !hasPeer && (user < currentUser);
        });

        // 3. Check if remote streams need cleanup
        // (We can't easily check state inside effect without causing deps issues, 
        // but let's just do it with setRemoteStreams functional update safely)

        // If nothing to remove and nothing to add, DO NOT call setPeers.
        if (peersToRemove.length === 0 && usersToConnect.length === 0) {
            // Still check remote streams cleanup, effectively separate concern but coupled by 'participants'
            setRemoteStreams(prev => {
                const filtered = prev.filter(rs => participants.includes(rs.peerId));
                if (filtered.length === prev.length) return prev; // Return same ref if no change
                return filtered;
            });
            return;
        }

        // Perform side effects: Destroy removed peers
        peersToRemove.forEach(p => {
            console.log(`WebRTC: Destroying peer ${p.peerId}`);
            try {
                p.peer.destroy();
            } catch (e) {
                console.error("Error destroying peer:", e);
            }
        });

        // Perform side effects: Create new peers
        const newPeers: PeerWrapper[] = [];
        usersToConnect.forEach(user => {
            console.log(`WebRTC: Initiating connection to ${user}`);
            const peer = createPeer(user, true);
            newPeers.push({ peerId: user, peer });
        });

        // Update peers state
        setPeers(prev => {
            // Remove destroyed
            const remaining = prev.filter(p => participants.includes(p.peerId));
            // Add new
            return [...remaining, ...newPeers];
        });

        // Cleanup remote streams too
        setRemoteStreams(prev => {
            const filtered = prev.filter(rs => participants.includes(rs.peerId));
            if (filtered.length === prev.length) return prev;
            return filtered;
        });

    }, [participants, currentUser, createPeer, socket]);

    // Cleanup everything on unmount
    useEffect(() => {
        return () => {
            console.log("WebRTC: Cleaning up all peers on unmount");
            peersRef.current.forEach(p => {
                try {
                    p.peer.destroy();
                } catch (e) {
                    console.error("WebRTC: Error during unmount cleanup", e);
                }
            });
        };
    }, []);



    // Handle incoming signals (Needs to be called from the socket message handler in parent)
    const handleSignal = useCallback((user: string, signal: SignalData) => {
        console.log(`WebRTC: Received signal from ${user}`);
        const existing = peersRef.current.find(p => p.peerId === user);

        if (existing) {
            existing.peer.signal(signal);
        } else {
            // Initiate = false (we are accepting)
            console.log(`WebRTC: Accepting connection from ${user}`);
            const peer = createPeer(user, false);
            peer.signal(signal);
            setPeers(prev => [...prev, { peerId: user, peer }]);
        }
    }, [createPeer]);

    const broadcastData = useCallback((data: any) => {
        const stringified = JSON.stringify(data);
        peersRef.current.forEach(p => {
            if (p.peer.connected) {
                p.peer.send(stringified);
            }
        });
    }, []);

    const onData = useCallback((cb: (data: any) => void) => {
        onDataCallbackRef.current = cb;
    }, []);

    return {
        peers,
        handleSignal,
        broadcastData,
        onData,
        remoteStreams
    };
};
