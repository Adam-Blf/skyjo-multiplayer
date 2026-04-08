import { useGameStore } from '../store/gameStore';
import { sendAction, myPeer } from '../lib/multiplayer';
import { Card } from './Card';
import { motion, AnimatePresence } from 'framer-motion';

export const GameTable = () => {
  const { 
      deck, 
      discardPile, 
      drawnCard,
      turnPhase,
      turnOrder,
      currentTurnIndex,
      status
  } = useGameStore();

  if (status !== 'PLAYING') return null;

  const currentTurnPlayerId = turnOrder[currentTurnIndex];
  const isMyTurn = myPeer?.id === currentTurnPlayerId;
  
  const topDiscard = discardPile[discardPile.length - 1];

  const handleDrawDeck = () => {
      if (!isMyTurn || turnPhase !== 'DRAW') return;
      sendAction({ type: 'DRAW_FROM_DECK' });
  };

  const handleDrawDiscard = () => {
      if (!isMyTurn || turnPhase !== 'DRAW') return;
      if (!topDiscard) return;
      sendAction({ type: 'DRAW_FROM_DISCARD' });
  };

  const handleDiscardDrawn = () => {
      if (!isMyTurn || turnPhase !== 'PLACE_DRAWN') return;
      sendAction({ type: 'DISCARD_DRAWN' });
  };

  return (
      <div className="flex flex-col items-center gap-6 my-8">
          <div className="glass p-6 rounded-3xl flex gap-8 md:gap-16 items-center justify-center relative min-w-[320px]">
              
              {/* Deck */}
              <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                      {deck.length > 0 ? (
                           <Card 
                             className={isMyTurn && turnPhase === 'DRAW' ? 'ring-2 ring-emerald-400 ring-offset-4 ring-offset-slate-900 animate-pulse' : ''}
                             disabled={!isMyTurn || turnPhase !== 'DRAW'}
                             onClick={handleDrawDeck}
                           />
                      ) : (
                          <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl border-2 border-slate-700/50 flex items-center justify-center">
                              <span className="text-slate-500 text-xs">Vide</span>
                          </div>
                      )}
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-2 py-1 rounded-full border border-slate-700 font-medium">
                          {deck.length}
                      </div>
                  </div>
                  <span className="text-white/60 font-medium text-sm">Pioche</span>
              </div>

              {/* Action Area (Drawn Card) */}
              <div className="w-24 h-32 flex items-center justify-center border-x border-white/5 px-8">
                  <AnimatePresence>
                      {drawnCard && (
                          <motion.div
                              initial={{ opacity: 0, y: -20, scale: 0.8 }}
                              animate={{ opacity: 1, y: 0, scale: 1.1 }}
                              exit={{ opacity: 0, scale: 0.5 }}
                              className="flex flex-col items-center gap-2"
                          >
                              <Card 
                                card={{...drawnCard, isFaceUp: true}}
                              />
                              {isMyTurn && turnPhase === 'PLACE_DRAWN' && (
                                  <motion.button 
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={handleDiscardDrawn}
                                      className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-lg shadow-lg"
                                  >
                                      Défausser
                                  </motion.button>
                              )}
                          </motion.div>
                      )}
                  </AnimatePresence>
              </div>

              {/* Discard Pile */}
              <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                       {topDiscard ? (
                           <Card 
                              card={topDiscard}
                              className={isMyTurn && turnPhase === 'DRAW' ? 'ring-2 ring-amber-400 ring-offset-4 ring-offset-slate-900 animate-pulse' : ''}
                              disabled={!isMyTurn || turnPhase !== 'DRAW'}
                              onClick={handleDrawDiscard}
                           />
                       ) : (
                           <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl border-2 border-dashed border-slate-700/50 flex items-center justify-center">
                              <span className="text-slate-500 text-xs">Défausse</span>
                          </div>
                       )}
                       {discardPile.length > 1 && (
                           <div className="absolute -z-10 top-0.5 left-0.5 w-full h-full rounded-xl bg-slate-600 border border-slate-500" />
                       )}
                  </div>
                  <span className="text-white/60 font-medium text-sm">Défausse</span>
              </div>

          </div>

          <div className="text-center w-full max-w-md h-8 text-cyan-300 font-medium animate-pulse">
               {isMyTurn ? "C'est à votre tour !" : ""}
          </div>
      </div>
  );
};
