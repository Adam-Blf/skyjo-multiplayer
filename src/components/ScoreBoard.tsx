import { useGameStore } from '../store/gameStore';
import { sendAction, myPeer } from '../lib/multiplayer';
import { Trophy, ArrowRight, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export const ScoreBoard = () => {
    const { status, players, roundNumber, firstFinisher } = useGameStore();

    if (status !== 'ROUND_OVER' && status !== 'GAME_OVER') return null;

    const isHost = myPeer?.id && players[myPeer.id]?.isHost;
    
    // Convert to array and sort by total score
    const sortedPlayers = Object.values(players).sort((a, b) => a.score - b.score);
    const winner = sortedPlayers[0];

    const handleNext = () => {
        if (isHost) {
            sendAction({ type: 'NEXT_ROUND' });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                className="glass w-full max-w-2xl rounded-3xl p-8 shadow-2xl border border-white/10"
            >
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 mb-2">
                        {status === 'GAME_OVER' ? 'Fin de la Partie !' : `Fin de la Manche ${roundNumber}`}
                    </h2>
                    {status === 'GAME_OVER' && (
                         <div className="flex items-center justify-center gap-3 text-amber-400 text-xl font-bold mt-4 animate-bounce">
                             <Trophy className="w-8 h-8" />
                             {winner.name} Remporte la Victoire !
                         </div>
                    )}
                </div>

                <div className="bg-slate-900/50 rounded-2xl overflow-hidden border border-white/5 mb-8">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 text-cyan-300/80 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold">Joueur</th>
                                <th className="p-4 font-semibold text-center mt-0">Manche {roundNumber}</th>
                                <th className="p-4 font-semibold text-right">Score Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {sortedPlayers.map((p, idx) => (
                                <tr key={p.id} className={p.id === myPeer?.id ? "bg-cyan-500/10" : ""}>
                                    <td className="p-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white shadow-inner border border-white/10">
                                            {idx + 1}
                                        </div>
                                        <span className="font-medium text-white text-lg">
                                            {p.name}
                                            {p.id === firstFinisher && <span className="ml-2 text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded">A fini 1er</span>}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="text-white/80 font-medium">+{p.scoreCurrentRound}</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                                            {p.score}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {isHost ? (
                    <button 
                        onClick={handleNext}
                        className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 group"
                    >
                        {status === 'GAME_OVER' ? (
                            <>
                                <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                                Rejouer
                            </>
                        ) : (
                            <>
                                Manche Suivante
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                ) : (
                    <div className="text-center text-white/50 py-4 glass rounded-xl animate-pulse">
                        En attente de l'hôte pour continuer...
                    </div>
                )}
            </motion.div>
        </div>
    );
};
