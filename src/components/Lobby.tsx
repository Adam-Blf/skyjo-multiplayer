import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { initHost, initClient, sendAction, myPeer } from '../lib/multiplayer';
import { motion } from 'framer-motion';
import { Users, Copy, Check, Play, UserPlus } from 'lucide-react';

export const Lobby = () => {
  const { players, status } = useGameStore();
  const [playerName, setPlayerName] = useState('');
  const [joinId, setJoinId] = useState('');
  const [step, setStep] = useState<'INITIAL' | 'HOSTING' | 'JOINING' | 'IN_LOBBY'>('INITIAL');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
     if (myPeer && myPeer.id && status === 'LOBBY') {
         setStep('IN_LOBBY');
     }
  }, [players, status]);

  const handleHost = async () => {
      if (!playerName) {
          setError('Veuillez entrer un pseudo.');
          return;
      }
      setStep('HOSTING');
      try {
          await initHost(playerName);
          setStep('IN_LOBBY');
      } catch (err) {
          console.error(err);
          setError('Erreur lors de la création du salon.');
          setStep('INITIAL');
      }
  };

  const handleJoin = async () => {
      if (!playerName || !joinId) {
          setError('Pseudo et Code requis.');
          return;
      }
      setStep('JOINING');
      try {
          // Normalize the join code
          const normalizedJoinId = joinId.trim().toUpperCase();
          const targetId = normalizedJoinId.startsWith('SKYJO-') ? normalizedJoinId : `SKYJO-${normalizedJoinId}`;
          await initClient(targetId, playerName);
          setStep('IN_LOBBY');
      } catch (err) {
          console.error(err);
          setError('Impossible de rejoindre ce salon. Vérifiez le code.');
          setStep('INITIAL');
      }
  };

  const copyId = () => {
      const code = myPeer?.id?.replace('SKYJO-', '') || '';
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const startGame = () => {
      sendAction({ type: 'START_GAME' });
  };

  if (status !== 'LOBBY') return null;

  const isHost = myPeer?.id && players[myPeer.id]?.isHost;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        
       {/* LOGO AREA */}
       <motion.div 
           initial={{ y: -50, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="mb-12 flex flex-col items-center"
       >
           <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-slate-800 flex items-center justify-center p-3 shadow-2xl shadow-cyan-500/20 border border-slate-700 mb-6">
               <img src="/icon-192.png" alt="Skyjo Logo" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
           </div>
           <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
               SKYJO
           </h1>
           <p className="tracking-[0.3em] text-cyan-500/80 font-semibold mt-2 uppercase text-sm">Multiplayer</p>
       </motion.div>

       {step === 'INITIAL' && (
           <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="glass p-8 rounded-3xl w-full max-w-md shadow-2xl flex flex-col gap-6"
           >
                <div className="flex flex-col gap-2">
                    <label className="text-white/60 font-medium text-sm ml-1">Ton Pseudo</label>
                    <input 
                       type="text" 
                       value={playerName}
                       onChange={(e) => setPlayerName(e.target.value)}
                       placeholder="Ex: John Doe"
                       className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium text-lg"
                       maxLength={12}
                    />
                </div>
                
                {error && <div className="text-rose-400 text-sm font-medium text-center bg-rose-500/10 py-2 rounded-lg">{error}</div>}

                <div className="h-px bg-white/10 w-full my-2"></div>

                <div className="grid grid-cols-1 gap-4">
                     <button 
                         onClick={handleHost}
                         className="w-full bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 group"
                     >
                         <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
                         Créer un Salon
                     </button>
                     
                     <div className="flex gap-2 w-full mt-2">
                         <input 
                            type="text" 
                            value={joinId}
                            onChange={(e) => setJoinId(e.target.value.toUpperCase())}
                            placeholder="Code du salon"
                            className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-widest text-center"
                         />
                         <button 
                             onClick={handleJoin}
                             className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-6 rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center"
                         >
                             <UserPlus className="w-5 h-5" />
                         </button>
                     </div>
                </div>
           </motion.div>
       )}

       {step === 'IN_LOBBY' && (
           <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="glass p-8 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col gap-6"
           >
               <div className="flex flex-col items-center gap-2 mb-4">
                   <span className="text-cyan-400 font-semibold tracking-wide text-sm uppercase">Salon d'attente</span>
                   {isHost && (
                       <div 
                           onClick={copyId}
                           className="flex items-center gap-3 bg-slate-900/80 px-6 py-3 rounded-2xl border border-slate-700 cursor-pointer hover:border-cyan-500 transition-colors group"
                       >
                           <span className="font-mono text-3xl tracking-[0.2em] font-bold text-white group-hover:text-cyan-300">
                               {myPeer?.id?.replace('SKYJO-', '')}
                           </span>
                           {copied ? <Check className="text-emerald-400 w-6 h-6" /> : <Copy className="text-white/50 w-6 h-6 group-hover:text-cyan-400" />}
                       </div>
                   )}
                   {isHost && <p className="text-white/40 text-sm mt-2">Partage ce code avec tes amis</p>}
               </div>

               <div className="bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden">
                   <div className="bg-white/5 px-4 py-3 border-b border-white/5 flex gap-2 items-center">
                       <Users className="w-4 h-4 text-white/50" />
                       <h3 className="font-medium text-white/80">Joueurs Connectés ({Object.keys(players).length})</h3>
                   </div>
                   <div className="p-2 flex flex-col gap-2">
                       {Object.values(players).map(p => (
                           <div key={p.id} className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl">
                               <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center font-bold text-white shadow-inner">
                                       {p.name.charAt(0).toUpperCase()}
                                   </div>
                                   <span className="font-medium text-white">{p.name} {p.id === myPeer?.id && "(Toi)"}</span>
                               </div>
                               {p.isHost ? (
                                   <span className="text-xs font-bold bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-md">HÔTE</span>
                               ) : (
                                   <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                               )}
                           </div>
                       ))}
                   </div>
               </div>

               {isHost ? (
                   <button 
                       onClick={startGame}
                       disabled={Object.keys(players).length < 2}
                       className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 group mt-2"
                   >
                       <Play className="w-5 h-5 fill-current" />
                       Lancer la Partie
                   </button>
               ) : (
                   <div className="w-full py-4 text-center text-white/50 font-medium flex items-center justify-center gap-3 mt-2 glass rounded-xl">
                       <div className="w-4 h-4 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin"></div>
                       En attente de l'hôte...
                   </div>
               )}
           </motion.div>
       )}
    </div>
  );
};
