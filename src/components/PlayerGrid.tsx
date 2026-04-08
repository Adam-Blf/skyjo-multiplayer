import type { Card as CardType } from '../types/game';
import { Card } from './Card';
import { cn } from '../lib/utils';

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
  return (
    <div className={cn(
        "flex flex-col items-center gap-4 p-4 rounded-2xl glass transition-all",
        isActiveTurn ? "ring-2 ring-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]" : "border border-white/5",
        isMe ? "bg-slate-800/80" : "scale-90 opacity-80"
    )}>
        <div className="flex justify-between w-full px-2 text-white/90 font-semibold items-center">
            <span className={cn("text-lg", isActiveTurn && "text-cyan-400")}>
                {playerName} {isMe && "(Moi)"}
            </span>
            <div className="flex flex-col items-end">
                 <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                    {scoreCurrentRound}
                 </span>
                 <span className="text-xs text-white/50">Score total: {score}</span>
            </div>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {grid.map((card, idx) => (
                <Card 
                  key={card?.id || `empty-${idx}`} 
                  card={card} 
                  disabled={disabled || (!card && card !== null) || (card?.isFaceUp && !onCardClick /* mostly logic handles this but visual cue */)}
                  onClick={() => onCardClick && onCardClick(idx)}
                />
            ))}
        </div>
    </div>
  );
};
