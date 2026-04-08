import { motion } from 'framer-motion';
import type { Card as CardType } from '../types/game';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  card?: CardType | null; // null if empty slot (column removed)
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const cn = (...inputs: (string | undefined | null | false)[]) => twMerge(clsx(inputs));

export const Card = ({ card, onClick, className, disabled }: CardProps) => {
  if (card === null) {
      return (
          <div className={cn("w-16 h-24 sm:w-20 sm:h-28 rounded-xl border-2 border-dashed border-skyjo-card-back/30 opacity-50", className)} />
      );
  }

  // If undefined, it represents a generic facedown card (e.g. deck)
  const isFaceUp = card?.isFaceUp ?? false;
  const value = card?.value;

  const getCardColor = (val?: number) => {
      if (val === undefined) return "bg-skyjo-card";
      if (val < 0) return "bg-indigo-600";
      if (val === 0) return "bg-cyan-500";
      if (val >= 1 && val <= 4) return "bg-emerald-500";
      if (val >= 5 && val <= 8) return "bg-amber-400";
      if (val >= 9 && val <= 12) return "bg-rose-500";
      return "bg-slate-700";
  };

  return (
    <motion.div
      onClick={() => !disabled && onClick && onClick()}
      whileHover={!disabled && onClick ? { scale: 1.05, y: -5 } : {}}
      whileTap={!disabled && onClick ? { scale: 0.95 } : {}}
      className={cn(
        "relative w-16 h-24 sm:w-20 sm:h-28 rounded-xl cursor-pointer perspective-1000 select-none",
        disabled && "cursor-not-allowed opacity-80",
        className
      )}
      style={{ perspective: 1000 }}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        initial={false}
        animate={{ rotateY: isFaceUp ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Back of Card */}
        <div className="absolute inset-0 w-full h-full border-2 border-slate-700 bg-skyjo-card-back rounded-xl backface-hidden flex items-center justify-center card-shadow p-1">
             {/* Neon inner border effect */}
             <div className="w-full h-full border-2 border-cyan-500/50 rounded-lg flex items-center justify-center">
                 <span className="text-cyan-500/50 font-bold italic text-2xl">S</span>
             </div>
        </div>

        {/* Front of Card */}
        <div 
            className={cn(
                "absolute inset-0 w-full h-full rounded-xl backface-hidden shadow-lg flex items-center justify-center border-2 border-white/10",
                getCardColor(value)
            )}
            style={{ 
                backfaceVisibility: 'hidden', 
                transform: 'rotateY(180deg)' 
            }}
        >
          <span className="text-white font-black text-3xl sm:text-4xl drop-shadow-md">
            {value}
          </span>
          {/* Mini numbers in corners */}
          <span className="absolute top-1 left-2 text-white/80 font-bold text-xs sm:text-sm">{value}</span>
          <span className="absolute bottom-1 right-2 text-white/80 font-bold text-xs sm:text-sm rotate-180">{value}</span>
        </div>
      </motion.div>
    </motion.div>
  );
};
