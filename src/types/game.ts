export interface Card {
  id: string; // e.g., "card-42"
  value: number; // -2 to 12
  isFaceUp: boolean;
}

export interface Player {
  id: string; // PeerJS ID
  name: string;
  grid: (Card | null)[]; // 12 slots: 0-3 (row 1), 4-7 (row 2), 8-11 (row 3). null means column removed.
  score: number; // Previous rounds
  scoreCurrentRound: number; // Live score
  isHost: boolean;
  hasFinished: boolean; // True if they flipped all their cards this round
}

export type GameStatus = 'LOBBY' | 'PLAYING' | 'ROUND_OVER' | 'GAME_OVER';
export type TurnPhase = 'DRAW' | 'PLACE_DRAWN' | 'FLIP';

export interface GameState {
  status: GameStatus;
  players: Record<string, Player>; // Map of player IDs
  turnOrder: string[]; // Order of play
  currentTurnIndex: number; // Index in turnOrder
  roundNumber: number;

  deck: Card[];
  discardPile: Card[];
  drawnCard: Card | null; // Card drawn from deck (waiting to be placed/discarded)
  
  firstFinisher: string | null; // ID of player who finished first this round
  turnPhase: TurnPhase;

  lastActionMessage: string;
}

// Payload for actions sent from clients to host
export type ActionPayload = 
  | { type: 'JOIN'; hostId: string; player: { id: string; name: string } }
  | { type: 'START_GAME' }
  | { type: 'DRAW_FROM_DECK' }
  | { type: 'DRAW_FROM_DISCARD' }
  | { type: 'SWAP_WITH_GRID'; slotIndex: number }
  | { type: 'DISCARD_DRAWN' }
  | { type: 'FLIP_CARD'; slotIndex: number }
  | { type: 'NEXT_ROUND' };
