import { create } from 'zustand';
import type { GameState } from '../types/game';

interface GameStore extends GameState {
  // Actions
  setState: (newState: Partial<GameState>) => void;
  resetGame: () => void;
}

const initialState: GameState = {
  status: 'LOBBY',
  players: {},
  turnOrder: [],
  currentTurnIndex: 0,
  roundNumber: 1,
  deck: [],
  discardPile: [],
  drawnCard: null,
  firstFinisher: null,
  turnPhase: 'DRAW',
  lastActionMessage: 'En attente des joueurs...',
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,
  setState: (newState) => set((state) => ({ ...state, ...newState })),
  resetGame: () => set(initialState),
}));
