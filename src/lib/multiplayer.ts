import Peer from 'peerjs';
import type { DataConnection } from 'peerjs';
import type { ActionPayload, GameState } from '../types/game';
import { useGameStore } from '../store/gameStore';
import { processAction } from './gameEngine';

export let myPeer: Peer | null = null;
export let myConnection: DataConnection | null = null; 
export const hostConnections: Map<string, DataConnection> = new Map();

// Helper to generate a short readable ID for joining rooms
const generateShortId = () => Math.random().toString(36).substring(2, 6).toUpperCase();

// Filter the state for security (masking face-down cards)
const maskState = (state: GameState): GameState => {
    const maskedPlayers = Object.fromEntries(
        Object.entries(state.players).map(([id, p]) => [
            id,
            {
                ...p,
                grid: p.grid.map(c => {
                    if (!c) return null;
                    return c.isFaceUp ? c : { ...c, value: 0 }; // Mask face-down cards
                })
            }
        ])
    );

    return {
        ...state,
        deck: state.deck.map(c => ({ ...c, value: 0 })), // Mask all deck values
        players: maskedPlayers
    };
};

// Host calls this function to apply an action to the global state and broadcast it
const applyAndBroadcastAction = (action: ActionPayload, senderId: string) => {
    const currentState = useGameStore.getState();
    const newState = processAction(currentState, action, senderId);
    
    // Update local store (Host is also a player)
    useGameStore.getState().setState(newState);

    // Filter state for clients
    const filteredState = maskState(newState);

    // Broadcast to all clients
    hostConnections.forEach((conn) => {
        if (conn.open) {
            conn.send(filteredState);
        }
    });
};

const PEER_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ]
};

// Interval for heartbeats to keep the connection alive (every 10s)
let heartbeatInterval: any = null;
const startHeartbeat = () => {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    heartbeatInterval = setInterval(() => {
        if (myPeer && !myPeer.destroyed) {
            // PeerJS doesn't have a formal ping/pong but we can send a 
            // no-op message or just rely on PeerJS built-in keep-alive
            // Sending something ensures the TCP/UDP state stays in NAT tables
            hostConnections.forEach((conn) => {
              if (conn.open) conn.send({ type: 'HEARTBEAT' });
            });
            if (myConnection && myConnection.open) {
              myConnection.send({ type: 'HEARTBEAT' });
            }
        }
    }, 15000);
};

export const initHost = (playerName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const hostId = `SKYJO-${generateShortId()}`;
    myPeer = new Peer(hostId, { config: PEER_CONFIG });
    
    myPeer.on('open', (id) => {
      console.log('Host initialized with ID:', id);
      startHeartbeat();
      
      // I am the host, so I also join the game
      useGameStore.getState().setState({ lastActionMessage: 'Créer le salon...' });
      
      // Simulate JOIN action for host
      applyAndBroadcastAction({ type: 'JOIN', hostId: id, player: { id, name: playerName } }, id);
      
      resolve(id);
    });

    myPeer.on('error', (err) => {
      console.error('PeerJS Error [HOST]:', err);
      if (err.type === 'peer-unavailable') {
         useGameStore.getState().setState({ lastActionMessage: 'Hôte introuvable.' });
      }
      reject(err);
    });
    
    myPeer.on('connection', (conn) => {
      hostConnections.set(conn.peer, conn);
      console.log('New client connection from:', conn.peer);
      
      // When a new client connects, send them the current state immediately so they aren't out of sync
      conn.on('open', () => {
          console.log('Connection to client open:', conn.peer);
          conn.send(useGameStore.getState());
      });

      conn.on('data', (data) => {
        const payload = data as any;
        if (payload.type === 'HEARTBEAT') return;
        
        applyAndBroadcastAction(payload as ActionPayload, conn.peer);
      });
      
      conn.on('close', () => {
        console.log('Connection to client closed:', conn.peer);
        hostConnections.delete(conn.peer);
      });
      
      conn.on('error', (err) => {
        console.error('Connection error with client:', err);
      });
    });
  });
};

export const initClient = (hostId: string, playerName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    myPeer = new Peer({ config: PEER_CONFIG });
    
    myPeer.on('open', (id) => {
      console.log('Client initialized with ID:', id);
      startHeartbeat();
      
      myConnection = myPeer!.connect(hostId, { reliable: true });
      
      myConnection.on('open', () => {
        console.log('Connection to host open!');
        resolve(id);
        // Send JOIN action
        sendAction({ type: 'JOIN', hostId, player: { id, name: playerName } });
      });
      
      myConnection.on('data', (data) => {
        const payload = data as any;
        if (payload.type === 'HEARTBEAT') return;
        
        // Client receives the entire game state from host
        const newState = payload as GameState;
        useGameStore.getState().setState(newState);
      });
      
      myConnection.on('error', (err) => {
         console.error('Connection error with host:', err);
         useGameStore.getState().setState({ lastActionMessage: 'Connexion perdue avec l\'hôte.' });
      });

      myConnection.on('close', () => {
        console.log('Connection to host closed');
        useGameStore.getState().setState({ lastActionMessage: 'Salon fermé par l\'hôte.' });
      });
    });
    
    myPeer.on('error', (err) => {
      console.error('PeerJS Client Error:', err);
      reject(err);
    });
  });
};

export const sendAction = (action: ActionPayload) => {
  if (myConnection && myConnection.open) {
    // Client sends to host
    myConnection.send(action);
  } else if (myPeer && myPeer.id) {
    // Host processes their own action
    applyAndBroadcastAction(action, myPeer.id);
  }
};
