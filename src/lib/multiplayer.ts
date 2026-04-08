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

// Host calls this function to apply an action to the global state and broadcast it
const applyAndBroadcastAction = (action: ActionPayload, senderId: string) => {
    const currentState = useGameStore.getState();
    const newState = processAction(currentState, action, senderId);
    
    // Update local store (Host is also a player)
    useGameStore.getState().setState(newState);

    // Broadcast to all clients
    hostConnections.forEach((conn) => {
        if (conn.open) {
            conn.send(newState);
        }
    });
};

export const initHost = (playerName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const hostId = `SKYJO-${generateShortId()}`;
    myPeer = new Peer(hostId);
    
    myPeer.on('open', (id) => {
      console.log('Host initialized with ID:', id);
      
      // I am the host, so I also join the game
      useGameStore.getState().setState({ lastActionMessage: 'Création du salon...' });
      
      // Simulate JOIN action for host
      applyAndBroadcastAction({ type: 'JOIN', hostId: id, player: { id, name: playerName } }, id);
      
      resolve(id);
    });

    myPeer.on('error', (err) => {
      console.error('PeerJS Error [HOST]:', err);
      reject(err);
    });
    
    myPeer.on('connection', (conn) => {
      hostConnections.set(conn.peer, conn);
      
      // When a new client connects, send them the current state immediately so they aren't out of sync
      conn.on('open', () => {
          conn.send(useGameStore.getState());
      });

      conn.on('data', (data) => {
        const action = data as ActionPayload;
        applyAndBroadcastAction(action, conn.peer);
      });
      
      conn.on('close', () => {
        hostConnections.delete(conn.peer);
        // We could handle disconnects here (e.g., removing them from players)
      });
    });
  });
};

export const initClient = (hostId: string, playerName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    myPeer = new Peer();
    
    myPeer.on('open', (id) => {
      console.log('Client initialized with ID:', id);
      
      myConnection = myPeer!.connect(hostId, { reliable: true });
      
      myConnection.on('open', () => {
        resolve(id);
        // Send JOIN action
        sendAction({ type: 'JOIN', hostId, player: { id, name: playerName } });
      });
      
      myConnection.on('data', (data) => {
        // Client receives the entire game state from host
        const newState = data as GameState;
        useGameStore.getState().setState(newState);
      });
      
      myConnection.on('error', (err) => {
         console.error('Connection error:', err);
      });
    });
    
    myPeer.on('error', (err) => {
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
