import type { GameState, ActionPayload } from '../types/game';
import { generateDeck, checkAndRemoveColumns, calculateGridScore, isGridFullyRevealed } from './gameLogic';

export const processAction = (state: GameState, action: ActionPayload, senderId: string): GameState => {
  let newState = { ...state, players: { ...state.players } };

  switch (action.type) {
    case 'JOIN': {
      if (state.status !== 'LOBBY') return state;
      const isHost = Object.keys(newState.players).length === 0;
      newState.players[action.player.id] = {
        id: action.player.id,
        name: action.player.name,
        grid: Array(12).fill(null),
        score: 0,
        scoreCurrentRound: 0,
        isHost,
        hasFinished: false,
      };
      newState.lastActionMessage = `${action.player.name} a rejoint la partie.`;
      break;
    }

    case 'START_GAME': {
      if (state.status !== 'LOBBY' && state.status !== 'GAME_OVER') return state;
      
      newState.status = 'PLAYING';
      newState.roundNumber = 1;
      // Reset scores
      Object.keys(newState.players).forEach(pId => {
         newState.players[pId].score = 0;
      });
      newState = initRound(newState);
      break;
    }

    case 'DRAW_FROM_DECK': {
      if (state.status !== 'PLAYING' || state.turnPhase !== 'DRAW') return state;
      if (newState.turnOrder[newState.currentTurnIndex] !== senderId) return state;

      const card = newState.deck.pop();
      if (!card) {
        // Deck empty, shuffle discard pile!
        if (newState.discardPile.length > 0) {
           const topDiscard = newState.discardPile.pop()!;
           newState.deck = [...newState.discardPile].map(c => ({...c, isFaceUp: false})).sort(() => Math.random() - 0.5);
           newState.discardPile = [topDiscard];
           const newCard = newState.deck.pop();
           if(newCard) newState.drawnCard = newCard;
        }
      } else {
         newState.drawnCard = card;
      }
      
      newState.turnPhase = 'PLACE_DRAWN';
      newState.lastActionMessage = `${newState.players[senderId].name} a pioché une carte.`;
      break;
    }

    case 'DRAW_FROM_DISCARD': {
        if (state.status !== 'PLAYING' || state.turnPhase !== 'DRAW') return state;
        if (newState.turnOrder[newState.currentTurnIndex] !== senderId) return state;
        
        if (newState.discardPile.length === 0) return state;
        
        const card = newState.discardPile.pop()!;
        newState.drawnCard = card;
        
        newState.turnPhase = 'PLACE_DRAWN';
        newState.lastActionMessage = `${newState.players[senderId].name} a pris la défausse.`;
        // Must be placed (cannot be discarded). We enforce this by having only SWAP_WITH_GRID action available in UI when taking from discard.
        break;
    }

    case 'DISCARD_DRAWN': {
        if (state.status !== 'PLAYING' || state.turnPhase !== 'PLACE_DRAWN') return state;
        if (newState.turnOrder[newState.currentTurnIndex] !== senderId) return state;
        if (!newState.drawnCard) return state;

        newState.discardPile.push({ ...newState.drawnCard, isFaceUp: true });
        newState.drawnCard = null;
        newState.turnPhase = 'FLIP';
        newState.lastActionMessage = `${newState.players[senderId].name} a défaussé sa pioche.`;
        break;
    }

    case 'SWAP_WITH_GRID': {
        if (state.status !== 'PLAYING' || state.turnPhase !== 'PLACE_DRAWN') return state;
        if (newState.turnOrder[newState.currentTurnIndex] !== senderId) return state;
        if (!newState.drawnCard) return state;

        const player = { ...newState.players[senderId], grid: [...newState.players[senderId].grid] };
        const replacedCard = player.grid[action.slotIndex];
        
        // Put the drawn card in grid face up
        player.grid[action.slotIndex] = { ...newState.drawnCard, isFaceUp: true };
        
        // Put the replaced card in discard
        if (replacedCard) {
            newState.discardPile.push({ ...replacedCard, isFaceUp: true });
        }
        
        newState.drawnCard = null;
        newState.players[senderId] = player;
        newState.lastActionMessage = `${player.name} a échangé une carte.`;
        
        newState = endTurn(newState, senderId);
        break;
    }

    case 'FLIP_CARD': {
        if (state.status !== 'PLAYING' || state.turnPhase !== 'FLIP') return state;
        if (newState.turnOrder[newState.currentTurnIndex] !== senderId) return state;

        const player = { ...newState.players[senderId], grid: [...newState.players[senderId].grid] };
        const card = player.grid[action.slotIndex];
        
        if (card && !card.isFaceUp) {
            player.grid[action.slotIndex] = { ...card, isFaceUp: true };
            newState.players[senderId] = player;
            newState.lastActionMessage = `${player.name} a retourné une carte.`;
            newState = endTurn(newState, senderId);
        }
        break;
    }

    case 'NEXT_ROUND': {
        if (state.status !== 'ROUND_OVER') return state;
        
        // Check game over
        let isGameOver = false;
        Object.values(newState.players).forEach(p => {
           if(p.score >= 100) isGameOver = true; 
        });

        if (isGameOver) {
            newState.status = 'GAME_OVER';
        } else {
            newState.roundNumber += 1;
            newState.status = 'PLAYING';
            newState = initRound(newState);
        }
        break;
    }
  }

  return newState;
};


const initRound = (state: GameState): GameState => {
    let newState = { ...state };
    newState.deck = generateDeck();
    newState.discardPile = [];
    newState.firstFinisher = null;
    newState.turnPhase = 'DRAW';

    // Deal 12 cards to each player
    Object.keys(newState.players).forEach(pId => {
        const pGrid = [];
        for (let i = 0; i < 12; i++) {
           pGrid.push(newState.deck.pop()!);
        }
        newState.players[pId] = {
            ...newState.players[pId],
            grid: pGrid,
            hasFinished: false,
            scoreCurrentRound: 0
        };
    });

    // Start discard pile
    newState.discardPile.push({ ...newState.deck.pop()!, isFaceUp: true });

    // Turn order
    newState.turnOrder = Object.keys(newState.players);
    newState.currentTurnIndex = 0; // In a real game, it's highest 2 visible cards sum. We can randomize or just keep order for simplicity.
    newState.turnOrder.sort(() => Math.random() - 0.5);

    newState.lastActionMessage = `Distribution des cartes pour la manche ${newState.roundNumber}.`;
    return newState;
}

const endTurn = (state: GameState, playerId: string): GameState => {
    let newState = { ...state };
    
    // Check for columns
    let player = newState.players[playerId];
    const { newGrid, discardedCards } = checkAndRemoveColumns(player.grid);
    player.grid = newGrid;
    
    if (discardedCards.length > 0) {
        // Discarded column cards go to discard pile (this is actually a house rule sometimes, standard rule just removes them from game, but adding them to discard is fine or standard. Let's just remove them to avoid infinite decks, wait, standard rules say place on discard pile)
        discardedCards.forEach(c => newState.discardPile.push({...c, isFaceUp: true}));
    }

    newState.players[playerId] = player;

    // Check if player has revealed all cards
    if (!newState.firstFinisher && isGridFullyRevealed(player.grid)) {
        newState.firstFinisher = playerId;
        newState.players[playerId].hasFinished = true;
        newState.lastActionMessage = `${player.name} a retourné toutes ses cartes ! Dernier tour pour les autres.`;
    }

    // Next player turn logic
    newState.currentTurnIndex = (newState.currentTurnIndex + 1) % newState.turnOrder.length;
    const nextPlayerId = newState.turnOrder[newState.currentTurnIndex];

    // Check round over
    if (newState.firstFinisher === nextPlayerId) {
        // Everyone had one last turn! Round is over!
        newState.status = 'ROUND_OVER';
        
        // Calculate scores
        let lowestScore = 9999;
        
        Object.values(newState.players).forEach(p => {
           let score = calculateGridScore(p.grid, true);
           p.scoreCurrentRound = score;
           if (score < lowestScore) {
               lowestScore = score;
           }
        });

        // Double points rule for the one who finished first if they don't have strictly lowest score
        const finisherScore = newState.players[newState.firstFinisher].scoreCurrentRound;
        
        let finisherHasLowest = true;
        Object.values(newState.players).forEach(p => {
           if (p.id !== newState.firstFinisher && p.scoreCurrentRound <= finisherScore) {
               finisherHasLowest = false;
           }
        });

        if (!finisherHasLowest) {
            newState.players[newState.firstFinisher].scoreCurrentRound *= 2;
        }

        // Apply scores to total
        Object.values(newState.players).forEach(p => {
            p.score += p.scoreCurrentRound;
            // Reveal all cards
            p.grid = p.grid.map(c => c ? {...c, isFaceUp: true} : null);
        });

        newState.lastActionMessage = `La manche est terminée !`;

    } else {
        newState.turnPhase = 'DRAW';
    }

    return newState;
}
