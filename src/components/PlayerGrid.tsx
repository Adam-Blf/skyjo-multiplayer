import { Card } from './Card';
import { ParticleField } from './ParticleField';
import { soundManager } from '../lib/sound';
import { cn } from '../lib/utils';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Card as CardType } from '../types/game';

interface PlayerGridProps {
  grid: (CardType | null)[];
  playerName: string;
  score: number;
  scoreCurrentRound: number;
  isActiveTurn?: boolean;
  onCardClick?: (index: number) => void;
  disabled?: boolean;
  isMe?: boolean;
}

export const PlayerGrid = ({ 
    grid, 
    playerName, 
    score, 
    scoreCurrentRound,
    isActiveTurn, 
    onCardClick, 
    disabled,
    isMe
}: PlayerGridProps) => {
  const [removedIndices, setRemovedIndices] = useState<number[]>([]);

  // Monitor grid for removed cards to trigger particles
  useEffect(() => {
    const newRemovedIndices: number[] = [];
    grid.forEach((card, idx) => {
      if (card === null) newRemovedIndices.push(idx);
    });
    
    if (newRemovedIndices.length > removedIndices.length) {
      soundManager.playRemove();
    }
    setRemovedIndices(newRemovedIndices);
  }, [grid, removedIndices]);

  return (
    <div className={cn(
        "flex flex-col items-center gap-4 p-4 rounded-3xl glass transition-all relative overflow-hidden",
        isActiveTurn ? "ring-2 ring-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.2)]" : "border border-white/5",
        isMe ? "bg-slate-800/40" : "scale-90 opacity-80"
    )}>
        {/* Turn indicator glow */}
        {isActiveTurn && (
            <div className="absolute inset-0 bg-cyan-500/5 animate-pulse pointer-events-none" />
        )}

        <div className="flex justify-between w-full px-2 text-white items-center z-10">
            <div className="flex flex-col">
                <span className={cn(
                    "text-xl font-black italic tracking-tighter transition-colors",
                    isActiveTurn ? "text-cyan-400" : "text-white/80"
                )}>
                    {playerName.toUpperCase()}
                </span>
                {isMe && <span className="text-[10px] text-cyan-500/60 font-bold tracking-widest uppercase">Propriétaire</span>}
            </div>
            <div className="flex flex-col items-end">
                 <span className="text-2xl font-black text-white tabular-nums drop-shadow-sm">
                    {scoreCurrentRound}
                 </span>
                 <span className="text-[10px] text-white/40 uppercase tracking-wider font-bold">Total: {score}</span>
            </div>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-3 relative z-10">
            <AnimatePresence>
                {grid.map((card, idx) => (
                    <div key={idx} className="relative">
                        <Card 
                          card={card} 
                          disabled={disabled || (!card && card !== null)}
                          onClick={() => onCardClick && onCardClick(idx)}
                        />
                        {card === null && <ParticleField burstCount={12} />}
                    </div>
                ))}
            </AnimatePresence>
        </div>
    </div>
  );
};
