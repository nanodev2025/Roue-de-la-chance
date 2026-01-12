import { useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PartyPopper, RotateCcw } from 'lucide-react';
import { getContrastTextColor, darkenColor } from '../utils/colors';

/**
 * Modal d'affichage du gagnant avec effet de célébration
 * 
 * OPTIMISATIONS APPLIQUÉES :
 * - Constantes statiques sorties du composant
 * - Dynamic import pour canvas-confetti (chargé uniquement quand nécessaire)
 * - React.memo pour éviter les re-renders inutiles
 */

// Constantes statiques (évite les recréations à chaque render)
const CONFETTI_COLORS = ['#FF6B9D', '#FF9F43', '#FECA57', '#5CD85A', '#48DBFB', '#54A0FF'];
const CONFETTI_DURATION = 3000;

// Variants d'animation (statiques, pas besoin de les recréer)
const MODAL_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      type: 'spring', 
      damping: 15, 
      stiffness: 300,
      delay: 0.1
    }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

const OVERLAY_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const ICON_VARIANTS = {
  hidden: { scale: 0, rotate: -180 },
  visible: { 
    scale: 1, 
    rotate: 0,
    transition: { 
      type: 'spring',
      damping: 10,
      stiffness: 200,
      delay: 0.3
    }
  }
};

const TEXT_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { delay: 0.4, duration: 0.3 }
  }
};

/**
 * Lance l'effet de confettis de manière asynchrone
 * Le module canvas-confetti est chargé uniquement quand nécessaire (code splitting)
 */
async function launchConfetti() {
  try {
    // Dynamic import - le bundle confetti n'est chargé que si la modal s'ouvre
    const confettiModule = await import('canvas-confetti');
    const confetti = confettiModule.default;

    const animationEnd = Date.now() + CONFETTI_DURATION;

    // Grand burst initial
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { y: 0.6 },
      colors: CONFETTI_COLORS,
    });

    // Confettis continus des côtés
    const confettiInterval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(confettiInterval);
        return;
      }

      // Côté gauche
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: CONFETTI_COLORS,
      });
      
      // Côté droit
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: CONFETTI_COLORS,
      });
    }, 50);

    return () => clearInterval(confettiInterval);
  } catch (error) {
    console.debug('Confetti non disponible:', error);
    return () => {};
  }
}

function WinnerModal({ 
  isOpen, 
  winner, 
  onClose, 
  onSpinAgain 
}) {
  
  // Lancer les confettis à l'ouverture
  useEffect(() => {
    if (!isOpen || !winner) return;

    let cleanup = () => {};
    
    // Lancer les confettis de manière asynchrone
    launchConfetti().then(cleanupFn => {
      cleanup = cleanupFn;
    });

    return () => cleanup();
  }, [isOpen, winner]);

  // Mémoiser le handler pour éviter les re-renders des boutons
  const handleSpinAgain = useCallback(() => {
    onSpinAgain();
  }, [onSpinAgain]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!winner) return null;

  const textColor = getContrastTextColor(winner.color);
  const borderColor = darkenColor(winner.color, 20);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={OVERLAY_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
            onClick={handleClose}
          />

          {/* Conteneur flex pour centrer la modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              variants={MODAL_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-md pointer-events-auto"
            >
              <div className="relative bg-gradient-to-br from-bg-primary to-bg-secondary 
                            rounded-[2rem] border-4 border-white/20 shadow-hard-xl
                            overflow-hidden">
              
              {/* Bouton fermer */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 
                         hover:bg-white/20 transition-colors border-2 border-white/20 z-10"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Contenu */}
              <div className="p-6 md:p-8 text-center">
                
                {/* Icône animée */}
                <motion.div
                  variants={ICON_VARIANTS}
                  className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24
                           bg-game-yellow rounded-full border-4 border-yellow-500/50
                           shadow-hard-lg mb-4"
                >
                  <PartyPopper className="w-10 h-10 md:w-12 md:h-12 text-yellow-800" />
                </motion.div>

                {/* Titre */}
                <motion.h2
                  variants={TEXT_VARIANTS}
                  className="text-xl md:text-2xl font-bold text-white/80 mb-2"
                >
                  🎉 Le résultat est...
                </motion.h2>

                {/* Résultat gagnant */}
                <motion.div
                  variants={TEXT_VARIANTS}
                  className="my-6"
                >
                  <div 
                    className="inline-block px-6 py-4 md:px-8 md:py-5 rounded-2xl 
                             border-4 shadow-hard-lg"
                    style={{
                      backgroundColor: winner.color,
                      borderColor: borderColor,
                      color: textColor,
                    }}
                  >
                    <span className="text-2xl md:text-3xl font-bold font-game">
                      {winner.name}
                    </span>
                  </div>
                </motion.div>

                {/* Texte de félicitations */}
                <motion.p
                  variants={TEXT_VARIANTS}
                  className="text-white/60 mb-6"
                >
                  La roue a parlé ! 🎡
                </motion.p>

                {/* Boutons d'action */}
                <motion.div
                  variants={TEXT_VARIANTS}
                  className="flex flex-col sm:flex-row gap-3 justify-center"
                >
                  <button
                    onClick={handleSpinAgain}
                    className="btn-cartoon-primary flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Rejouer
                  </button>
                  <button
                    onClick={handleClose}
                    className="btn-cartoon bg-white/20 text-white hover:bg-white/30"
                  >
                    Fermer
                  </button>
                </motion.div>
              </div>

              {/* Décoration de fond */}
              <div className="absolute -bottom-10 -left-10 w-40 h-40 
                            bg-game-pink/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -top-10 -right-10 w-40 h-40 
                            bg-game-yellow/20 rounded-full blur-3xl pointer-events-none" />
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// React.memo pour éviter les re-renders si les props n'ont pas changé
export default memo(WinnerModal);
