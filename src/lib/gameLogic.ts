import type { Card } from '../types/game';

// Skyjo Deck Distribution
// -2: 5, -1: 10, 0: 15, 1..12: 10 each -> total 150
export const generateDeck = (): Card[] => {
  const cards: Card[] = [];
  let idCounter = 0;

  const addCards = (value: number, count: number) => {
    for (let i = 0; i < count; i++) {
      cards.push({ id: `card-${idCounter++}`, value, isFaceUp: false });
    }
  };

  addCards(-2, 5);
  addCards(-1, 10);
  addCards(0, 15);
  for (let v = 1; v <= 12; v++) {
    addCards(v, 10);
  }

  // Shuffle using Fisher-Yates
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
};

// Check if a player's grid has a full column of 3 identical face-up cards
// Returns the updated grid, the cards to discard, and the points removed
export const checkAndRemoveColumns = (grid: (Card | null)[]): { newGrid: (Card | null)[], discardedCards: Card[] } => {
  const newGrid = [...grid];
  const discardedCards: Card[] = [];

  for (let col = 0; col < 4; col++) {
    const idx1 = col;
    const idx2 = col + 4;
    const idx3 = col + 8;

    const c1 = newGrid[idx1];
    const c2 = newGrid[idx2];
    const c3 = newGrid[idx3];

    if (
      c1 && c1.isFaceUp &&
      c2 && c2.isFaceUp &&
      c3 && c3.isFaceUp &&
      c1.value === c2.value &&
      c2.value === c3.value
    ) {
      newGrid[idx1] = null;
      newGrid[idx2] = null;
      newGrid[idx3] = null;
      discardedCards.push(c1, c2, c3);
    }
  }

  return { newGrid, discardedCards };
};

// Calculates the current point total of a player's grid
// If forceRevealAll is true, it counts all cards regardless of faceUp state
export const calculateGridScore = (grid: (Card | null)[], forceRevealAll: boolean = false): number => {
  return grid.reduce((acc, card) => {
    if (!card) return acc as number;
    if (card.isFaceUp || forceRevealAll) {
      return (acc as number) + card.value;
    }
    return acc as number;
  }, 0) as number;
};

// Checks if all remaining cards of a player are face up
export const isGridFullyRevealed = (grid: (Card | null)[]): boolean => {
  for (let i = 0; i < grid.length; i++) {
    const card = grid[i];
    // If there is a card and it's NOT face up, then the grid isn't fully revealed
    if (card && !card.isFaceUp) {
      return false;
    }
  }
  return true; 
};
