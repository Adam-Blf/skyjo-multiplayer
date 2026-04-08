import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
}

interface ParticleFieldProps {
  burstCount?: number;
  color?: string;
}

export const ParticleField = ({ burstCount = 20, color = "#06b6d4" }: ParticleFieldProps) => {
  const particles: Particle[] = Array.from({ length: burstCount }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 300,
    y: (Math.random() - 0.5) * 300
  }));

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            animate={{ 
                opacity: 0, 
                scale: 0, 
                x: p.x, 
                y: p.y,
                rotate: Math.random() * 360
            }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute w-2 h-2 rounded-sm"
            style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
