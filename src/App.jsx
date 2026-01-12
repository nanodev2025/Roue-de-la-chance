import { useState, useRef, useCallback, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import Wheel from './components/Wheel';
import { useLocalStorage, DEFAULT_CATEGORIES, DEFAULT_TITLE } from './hooks/useLocalStorage';

/**
 * Application Roue de la Chance
 * 
 * OPTIMISATIONS APPLIQUÉES :
 * - Lazy loading des modales (SettingsModal, WinnerModal)
 * - Code splitting automatique via React.lazy
 * - Suspense pour fallback pendant le chargement
 * 
 * Architecture :
 * - App : Orchestration principale, état global
 * - Wheel : Rendu et animation de la roue
 * - SettingsModal : CRUD des catégories (lazy loaded)
 * - WinnerModal : Affichage du résultat (lazy loaded)
 */

// Lazy loading des modales pour réduire le bundle initial
// Ces composants ne sont chargés que quand ils sont nécessaires
const SettingsModal = lazy(() => import('./components/SettingsModal'));
const WinnerModal = lazy(() => import('./components/WinnerModal'));

export default function App() {
  // États persistés dans localStorage
  const [categories, setCategories] = useLocalStorage('wheel-categories', DEFAULT_CATEGORIES);
  const [title, setTitle] = useLocalStorage('wheel-title', DEFAULT_TITLE);

  // États locaux
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showWinner, setShowWinner] = useState(false);

  // Référence vers le composant Wheel pour accéder à sa méthode spin()
  const wheelRef = useRef(null);

  /**
   * Lance la rotation de la roue
   */
  const handleSpin = useCallback(() => {
    if (isSpinning || categories.length < 2) return;
    
    // Appeler la méthode spin exposée par le composant Wheel via ref
    if (wheelRef.current) {
      wheelRef.current.spin();
    }
  }, [isSpinning, categories.length]);

  /**
   * Callback appelé au démarrage de la rotation
   */
  const handleSpinStart = useCallback(() => {
    setIsSpinning(true);
    setShowWinner(false);
  }, []);

  /**
   * Callback appelé à la fin de la rotation avec le gagnant
   */
  const handleSpinEnd = useCallback((winnerCategory) => {
    setIsSpinning(false);
    setWinner(winnerCategory);
    setShowWinner(true);
  }, []);

  /**
   * Rejouer (ferme la modal et relance)
   */
  const handleSpinAgain = useCallback(() => {
    setShowWinner(false);
    // Petit délai pour que la modal se ferme avant de relancer
    setTimeout(() => {
      handleSpin();
    }, 300);
  }, [handleSpin]);

  /**
   * Ouvre la modal des paramètres
   */
  const openSettings = useCallback(() => {
    setShowSettings(true);
  }, []);

  /**
   * Ferme la modal des paramètres
   */
  const closeSettings = useCallback(() => {
    setShowSettings(false);
  }, []);

  /**
   * Ferme la modal du gagnant
   */
  const closeWinner = useCallback(() => {
    setShowWinner(false);
  }, []);

  /**
   * Message d'erreur si pas assez de catégories
   */
  const canSpin = categories.length >= 2;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-6">
        {/* Logo / Branding */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <span className="text-3xl md:text-4xl">🎡</span>
          <span className="text-sm md:text-base font-bold text-white/70 hidden sm:block">
            Roue de la Chance
          </span>
        </motion.div>

        {/* Bouton Settings */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={openSettings}
          className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 
                   border-4 border-white/20 transition-all
                   hover:scale-105 active:scale-95 shadow-hard"
          title="Configuration"
        >
          <Settings className="w-6 h-6 text-white" />
        </motion.button>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 flex flex-col items-center justify-center px-2 py-0">
        {/* Titre */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center 
                   text-white mb-4 md:mb-6 font-game floating
                   drop-shadow-lg px-4"
          style={{
            textShadow: '3px 3px 0px rgba(0,0,0,0.3)',
          }}
        >
          {title}
        </motion.h1>

        {/* Container de la roue - cliquable pour tourner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', damping: 20 }}
          className="relative cursor-pointer"
          onClick={handleSpin}
        >
          <Wheel
            ref={wheelRef}
            categories={categories}
            isSpinning={isSpinning}
            onSpinStart={handleSpinStart}
            onSpinEnd={handleSpinEnd}
          />
        </motion.div>

        {/* Message si pas assez de catégories */}
        {!canSpin && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-4"
          >
            <p className="text-white/60 mb-4">
              ⚠️ Ajoutez au moins 2 catégories pour jouer
            </p>
            <button
              onClick={openSettings}
              className="btn-cartoon bg-game-purple text-white hover:bg-purple-400"
            >
              <Settings className="w-5 h-5 inline mr-2" />
              Configurer la roue
            </button>
          </motion.div>
        )}

        {/* Indication pour cliquer sur la roue (opacity 0 au lieu de display none pour éviter le décalage) */}
        {canSpin && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: isSpinning ? 0 : 1 }}
            transition={{ delay: isSpinning ? 0 : 0.5 }}
            className="mt-4 text-white/50 text-sm"
          >
            👆 Cliquez sur la roue pour la faire tourner !
          </motion.p>
        )}

      </main>

      {/* Footer discret - positionné en bas */}
      <footer className="absolute bottom-1 left-0 right-0 text-center text-white/25 text-[10px]">
        Made by{' '}
        <a 
          href="https://maisondev-tan.vercel.app/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-white/40 hover:text-white/70 underline transition-colors"
        >
          Maison.dev2025
        </a>
        {' '}with 😍
      </footer>

      {/* Modales - Lazy loaded avec Suspense */}
      {/* Le fallback est vide car les modales ont leur propre animation d'entrée */}
      <Suspense fallback={null}>
        {showSettings && (
          <SettingsModal
            isOpen={showSettings}
            onClose={closeSettings}
            categories={categories}
            setCategories={setCategories}
            title={title}
            setTitle={setTitle}
          />
        )}
      </Suspense>

      <Suspense fallback={null}>
        {showWinner && (
          <WinnerModal
            isOpen={showWinner}
            winner={winner}
            onClose={closeWinner}
            onSpinAgain={handleSpinAgain}
          />
        )}
      </Suspense>
    </div>
  );
}
