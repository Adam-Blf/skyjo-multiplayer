import { Lobby } from './components/Lobby';
import { GameTable } from './components/GameTable';
import { PlayerGrid } from './components/PlayerGrid';
import { ScoreBoard } from './components/ScoreBoard';
import { useGameStore } from './store/gameStore';
import { myPeer, sendAction } from './lib/multiplayer';

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
      {/* subtle texture background */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none -z-10" style={{ backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

      {!isPlaying && <Lobby />}

      {isPlaying && (
          <div className="pb-16 pt-6 px-2 md:px-8 max-w-7xl mx-auto flex flex-col items-center min-h-screen justify-between">
              
              <div className="w-full flex-col flex gap-6">
                  {/* Header */}
                  <div className="w-full flex justify-between items-start">
                      <div className="flex flex-col bg-slate-900/80 px-4 py-2 border border-white/5 rounded-xl">
                          <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400 tracking-tight leading-none mb-1">SKYJO</h1>
                          <span className="text-[10px] text-white/40 font-mono leading-none tracking-widest">ID: {myPeer?.id?.replace('SKYJO-', '')}</span>
                      </div>
                      <div className="glass px-4 py-2 rounded-xl text-sm font-medium text-emerald-300 shadow-lg text-right max-w-[200px] md:max-w-xs">
                          {lastActionMessage}
                      </div>
                  </div>

                  {/* Opponents Grids */}
                  <div className="w-full flex justify-center gap-2 md:gap-8 flex-wrap">
                      {Object.values(players).map(p => {
                          if (p.id === myPeer?.id) return null;
                          const isActive = turnOrder[currentTurnIndex] === p.id && status === 'PLAYING';
                          return (
                              <div key={p.id} className="scale-75 sm:scale-90 origin-top">
                                  <PlayerGrid 
                                      grid={p.grid}
                                      playerName={p.name}
                                      score={p.score}
                                      scoreCurrentRound={p.scoreCurrentRound}
                                      isActiveTurn={isActive}
                                  />
                              </div>
                          )
                      })}
                  </div>
              </div>

              {/* Game Table (Center) */}
              <div className="w-full my-auto flex items-center justify-center scale-90 sm:scale-100">
                  <GameTable />
              </div>

              {/* My Grid (Bottom) */}
              {myPeer?.id && players[myPeer.id] && (
                  <div className="w-full flex justify-center pb-4 mt-8">
                      <PlayerGrid 
                          grid={players[myPeer.id].grid}
                          playerName={players[myPeer.id].name}
                          score={players[myPeer.id].score}
                          scoreCurrentRound={players[myPeer.id].scoreCurrentRound}
                          isActiveTurn={turnOrder[currentTurnIndex] === myPeer.id && status === 'PLAYING'}
                          onCardClick={handleCardClick}
                          isMe
                      />
                  </div>
              )}
          </div>
      )}

      <ScoreBoard />
    </div>
  );
}

export default App;
