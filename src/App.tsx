import { Lobby } from './components/Lobby';
import { GameTable } from './components/GameTable';
import { PlayerGrid } from './components/PlayerGrid';
import { ScoreBoard } from './components/ScoreBoard';
import { Tutorial } from './components/Tutorial';
import { useGameStore } from './store/gameStore';
import { myPeer, sendAction } from './lib/multiplayer';
import { ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const { status, players, turnOrder, currentTurnIndex, turnPhase, lastActionMessage } = useGameStore();

  const isPlaying = status === 'PLAYING' || status === 'ROUND_OVER' || status === 'GAME_OVER';

  const handleCardClick = (idx: number) => {
      const myId = myPeer?.id;
      if (!myId) return;
      const isMyTurn = turnOrder[currentTurnIndex] === myId && status === 'PLAYING';
      if (!isMyTurn) return;

      if (turnPhase === 'PLACE_DRAWN') {
          sendAction({ type: 'SWAP_WITH_GRID', slotIndex: idx });
      } else if (turnPhase === 'FLIP') {
          sendAction({ type: 'FLIP_CARD', slotIndex: idx });
      }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-cyan-500/30 w-full overflow-x-hidden relative">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-slate-950 -z-10" />
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none -z-10" style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

      <Tutorial />

      <header className="fixed top-0 inset-x-0 h-16 bg-slate-900/40 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-6">
          <div className="flex flex-col">
              <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 tracking-tighter leading-none">SKYJO</h1>
              <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] text-white/40 font-bold tracking-[0.2em] uppercase">Connecté : {myPeer?.id?.replace('SKYJO-', '') || '...'}</span>
              </div>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={lastActionMessage}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              className="text-right"
            >
                <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-none mb-1">Status</div>
                <div className="text-sm font-black text-white leading-none">{lastActionMessage}</div>
            </motion.div>
          </AnimatePresence>
      </header>

      <main className="pt-24 pb-12 px-2 md:px-8 max-w-7xl mx-auto min-h-screen flex flex-col justify-between">
        {!isPlaying ? (
            <Lobby />
        ) : (
            <>
                {/* Opponents Section */}
                <div className="w-full flex justify-center gap-4 md:gap-8 flex-wrap">
                    {Object.values(players).map(p => {
                        if (p.id === myPeer?.id) return null;
                        const isActive = turnOrder[currentTurnIndex] === p.id && status === 'PLAYING';
                        return (
                            <div key={p.id} className="scale-75 sm:scale-95 origin-top transition-transform">
                                <PlayerGrid 
                                    grid={p.grid}
                                    playerName={p.name}
                                    score={p.score}
                                    scoreCurrentRound={p.scoreCurrentRound}
                                    isActiveTurn={isActive}
                                    isMe={false}
                                />
                            </div>
                        )
                    })}
                </div>

                {/* Table Section */}
                <div className="my-12 flex flex-col items-center justify-center gap-6">
                    <GameTable />
                </div>

                {/* Player Section */}
                {myPeer?.id && players[myPeer.id] && (
                    <div className="w-full flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2 text-cyan-500/50">
                            <ChevronUp size={20} className="animate-bounce" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Votre Espace de Jeu</span>
                        </div>
                        <PlayerGrid 
                            grid={players[myPeer.id].grid}
                            playerName={players[myPeer.id].name}
                            score={players[myPeer.id].score}
                            scoreCurrentRound={players[myPeer.id].scoreCurrentRound}
                            isActiveTurn={turnOrder[currentTurnIndex] === myPeer.id && status === 'PLAYING'}
                            onCardClick={handleCardClick}
                            isMe={true}
                        />
                    </div>
                )}
            </>
        )}
      </main>

      <ScoreBoard />
    </div>
  );
}

export default App;
