import { Card } from './Card';
import { motion, AnimatePresence } from 'framer-motion';
import { soundManager } from '../lib/sound';
import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { sendAction, myPeer } from '../lib/multiplayer';

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

  // Play draw sound when a card appears in drawnCard
  useEffect(() => {
    if (drawnCard) {
        soundManager.playDraw();
    }
  }, [drawnCard]);

  // Play flip sound when turn phase changes
  useEffect(() => {
    soundManager.playFlip();
  }, [turnPhase, currentTurnIndex]);

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
      soundManager.playDiscard();
  };

  return (
      <div className="flex flex-col items-center gap-6 my-8">
          <div className="glass p-8 rounded-[2.5rem] flex gap-8 md:gap-16 items-center justify-center relative min-w-[320px] border border-white/5 shadow-2xl">
              
              {/* Deck */}
              <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                      {deck.length > 0 ? (
                           <Card 
                             className={isMyTurn && turnPhase === 'DRAW' ? 'ring-2 ring-cyan-500 ring-offset-4 ring-offset-slate-950 animate-pulse' : ''}
                             disabled={!isMyTurn || turnPhase !== 'DRAW'}
                             onClick={handleDrawDeck}
                           />
                      ) : (
                          <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl border-2 border-slate-700/50 flex items-center justify-center bg-slate-900/50">
                              <span className="text-slate-500 text-[10px] font-black uppercase tracking-tighter">Vide</span>
                          </div>
                      )}
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-cyan-600 text-[10px] text-white px-2 py-0.5 rounded-full border border-cyan-400 font-black shadow-lg shadow-cyan-500/40">
                          {deck.length}
                      </div>
                      
                      {/* Stack effect */}
                      {deck.length > 2 && <div className="absolute -z-10 top-1 left-1 w-full h-full rounded-xl bg-slate-800 border border-white/5" />}
                  </div>
                  <span className="text-white/40 font-black text-[10px] uppercase tracking-[0.2em]">Pioche</span>
              </div>

              {/* Action Area (Drawn Card) */}
              <div className="w-24 h-32 flex items-center justify-center border-x border-white/5 px-8 relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />
                  <AnimatePresence mode="wait">
                      {drawnCard && (
                          <motion.div
                              key={drawnCard.id}
                              initial={{ opacity: 0, y: -40, rotate: -10, scale: 0.8 }}
                              animate={{ opacity: 1, y: 0, rotate: 0, scale: 1.15 }}
                              exit={{ opacity: 0, scale: 0.5, y: 40 }}
                              className="flex flex-col items-center gap-4 z-10"
                          >
                              <Card 
                                card={{...drawnCard, isFaceUp: true}}
                              />
                              {isMyTurn && turnPhase === 'PLACE_DRAWN' && (
                                  <motion.button 
                                      whileHover={{ scale: 1.05, backgroundColor: '#f43f5e' }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={handleDiscardDrawn}
                                      className="px-4 py-1 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg border border-rose-400/50 whitespace-nowrap"
                                  >
                                      Défausser
                                  </motion.button>
                              )}
                          </motion.div>
                      )}
                  </AnimatePresence>
              </div>

              {/* Discard Pile */}
              <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                       {topDiscard ? (
                           <Card 
                              card={topDiscard}
                              className={isMyTurn && turnPhase === 'DRAW' ? 'ring-2 ring-amber-500 ring-offset-4 ring-offset-slate-950 animate-pulse' : ''}
                              disabled={!isMyTurn || turnPhase !== 'DRAW'}
                              onClick={handleDrawDiscard}
                           />
                       ) : (
                           <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl border-2 border-dashed border-slate-700/50 flex items-center justify-center bg-slate-900/50">
                              <span className="text-slate-500 text-[10px] font-black uppercase tracking-tighter">Vide</span>
                          </div>
                       )}
                       {discardPile.length > 1 && (
                           <div className="absolute -z-10 top-1 left-1 w-full h-full rounded-xl bg-slate-800 border border-white/5" />
                       )}
                  </div>
                  <span className="text-white/40 font-black text-[10px] uppercase tracking-[0.2em]">Défausse</span>
              </div>

          </div>

          <div className="text-center w-full max-w-md h-6">
              <AnimatePresence>
                  {isMyTurn && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-cyan-400 text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2"
                      >
                          <div className="w-1 h-1 rounded-full bg-cyan-400 animate-ping" />
                          À vous de jouer
                      </motion.div>
                  )}
              </AnimatePresence>
          </div>
      </div>
  );
};
