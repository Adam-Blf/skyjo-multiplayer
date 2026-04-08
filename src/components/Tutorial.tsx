import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronRight, X } from 'lucide-react';

const STEPS = [
  {
    title: "Bienvenue sur Skyjo !",
    content: "Le but est d'avoir le moins de points possible à la fin de la partie (100 points).",
    target: "center"
  },
  {
    title: "Votre Grille",
    content: "Vous avez 12 cartes cachées. Au début, vous en retournez 2 pour commencer.",
    target: "bottom"
  },
  {
    title: "Piocher des cartes",
    content: "À votre tour, vous pouvez piocher dans le deck bleu ou prendre la carte visible de la défausse.",
    target: "center"
  },
  {
    title: "Remplacer ou Défausser",
    content: "Si vous piochez, vous pouvez remplacer une de vos cartes ou la défausser pour en retourner une cachée.",
    target: "bottom"
  },
  {
    title: "Colonnes Magiques",
    content: "Alignez 3 cartes identiques dans une colonne pour la supprimer complètement ! Elle comptera 0 point.",
    target: "bottom"
  }
];

export const Tutorial = () => {
  const [show, setShow] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeen = localStorage.getItem('skyjo-tutorial-seen');
    if (!hasSeen) {
      setShow(true);
    }
  }, []);

  const closeTutorial = () => {
    setShow(false);
    localStorage.setItem('skyjo-tutorial-seen', 'true');
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      closeTutorial();
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4">
        {/* Backdrop for focus */}
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] pointer-events-auto"
            onClick={closeTutorial}
        />

        <motion.div 
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-cyan-500/30 pointer-events-auto relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
            
            <button 
                onClick={closeTutorial}
                className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
                <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                    <HelpCircle size={24} />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                    {STEPS[currentStep].title}
                </h3>
            </div>

            <p className="text-white/70 leading-relaxed mb-8">
                {STEPS[currentStep].content}
            </p>

            <div className="flex items-center justify-between">
                <div className="flex gap-1">
                    {STEPS.map((_, i) => (
                        <div 
                            key={i} 
                            className={`h-1 rounded-full transition-all ${i === currentStep ? 'w-4 bg-cyan-500' : 'w-1 bg-white/20'}`} 
                        />
                    ))}
                </div>
                <button 
                    onClick={nextStep}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-2 rounded-xl flex items-center gap-2 transform active:scale-95 transition-all shadow-lg shadow-cyan-500/20"
                >
                    {currentStep === STEPS.length - 1 ? "C'est parti !" : "Suivant"}
                    <ChevronRight size={18} />
                </button>
            </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
