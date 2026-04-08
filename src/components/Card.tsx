import { useState } from 'react';
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
  const [randomRotation] = useState(() => (Math.random() - 0.5) * 4); // +/- 2 degrees

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
      whileHover={!disabled && onClick ? { scale: 1.05, y: -5, rotate: randomRotation + 2 } : { rotate: randomRotation }}
      whileTap={!disabled && onClick ? { scale: 0.95 } : {}}
      initial={{ rotate: randomRotation }}
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
        <div className="absolute inset-0 w-full h-full border-[1.5px] border-slate-600 bg-gradient-to-br from-slate-700 via-skyjo-card-back to-slate-900 rounded-xl backface-hidden flex items-center justify-center shadow-xl p-1.5 overflow-hidden">
             {/* Decorative neon inner border */}
             <div className="w-full h-full border-2 border-cyan-500/30 rounded-lg flex items-center justify-center relative overflow-hidden transition-colors">
                 {/* Internal scanning line effect */}
                 <div className="absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent -top-10 animate-scan" />
                 <span className="text-cyan-400/40 font-black italic text-4xl select-none">S</span>
             </div>
        </div>

        {/* Front of Card */}
        <div 
            className={cn(
                "absolute inset-0 w-full h-full rounded-xl backface-hidden shadow-2xl flex items-center justify-center border-[1.5px] border-white/20 overflow-hidden",
                getCardColor(value)
            )}
            style={{ 
                backfaceVisibility: 'hidden', 
                transform: 'rotateY(180deg)' 
            }}
        >
          {/* Subtle noise/texture overlay for premium look */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }}></div>

          <span className="text-white font-black text-4xl sm:text-5xl drop-shadow-[0_4px_4px_rgba(0,0,0,0.4)] select-none">
            {value}
          </span>
          {/* Mini numbers in corners */}
          <span className="absolute top-1.5 left-2.5 text-white/90 font-bold text-xs sm:text-sm drop-shadow-sm">{value}</span>
          <span className="absolute bottom-1.5 right-2.5 text-white/90 font-bold text-xs sm:text-sm rotate-180 drop-shadow-sm">{value}</span>
          
          {/* Highlight sheen */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        </div>
      </motion.div>
    </motion.div>
  );
};
