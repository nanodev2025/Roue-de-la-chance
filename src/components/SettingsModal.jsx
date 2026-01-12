import { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { getRandomColor, getContrastTextColor } from '../utils/colors';

/**
 * Modal de configuration des catégories
 * Permet d'ajouter, modifier et supprimer des segments de la roue
 * 
 * OPTIMISATIONS APPLIQUÉES :
 * - Suppression import inutilisé (GripVertical)
 * - useCallback pour tous les handlers
 * - Variants d'animation sortis du composant
 * - React.memo pour éviter les re-renders inutiles
 */

// Variants d'animation (statiques)
const MODAL_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { type: 'spring', damping: 25, stiffness: 300 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

const OVERLAY_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const CATEGORY_ITEM_VARIANTS = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20, scale: 0.8 }
};

// Constantes
const MAX_CATEGORIES = 20;
const MIN_CATEGORIES = 2;
const MAX_CATEGORY_NAME_LENGTH = 30;
const MAX_TITLE_LENGTH = 50;

function SettingsModal({ 
  isOpen, 
  onClose, 
  categories, 
  setCategories,
  title,
  setTitle
}) {
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  /**
   * Ajouter une nouvelle catégorie
   */
  const handleAddCategory = useCallback(() => {
    if (!newCategory.trim()) return;
    
    // Limite de catégories pour la lisibilité
    if (categories.length >= MAX_CATEGORIES) {
      alert(`Maximum ${MAX_CATEGORIES} catégories autorisées !`);
      return;
    }

    const usedColors = categories.map(c => c.color);
    const newColor = getRandomColor(usedColors);

    setCategories(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newCategory.trim(),
        color: newColor,
      }
    ]);
    setNewCategory('');
  }, [newCategory, categories, setCategories]);

  /**
   * Supprimer une catégorie
   */
  const handleDeleteCategory = useCallback((id) => {
    if (categories.length <= MIN_CATEGORIES) {
      alert(`Minimum ${MIN_CATEGORIES} catégories requises !`);
      return;
    }
    setCategories(prev => prev.filter(c => c.id !== id));
  }, [categories.length, setCategories]);

  /**
   * Commencer l'édition d'une catégorie
   */
  const startEditing = useCallback((category) => {
    setEditingId(category.id);
    setEditingValue(category.name);
  }, []);

  /**
   * Sauvegarder l'édition
   */
  const saveEdit = useCallback(() => {
    if (!editingValue.trim()) return;
    
    setCategories(prev => prev.map(c => 
      c.id === editingId 
        ? { ...c, name: editingValue.trim() }
        : c
    ));
    setEditingId(null);
    setEditingValue('');
  }, [editingId, editingValue, setCategories]);

  /**
   * Annuler l'édition
   */
  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditingValue('');
  }, []);

  /**
   * Gérer la touche Entrée pour ajouter/sauvegarder
   */
  const handleKeyPress = useCallback((e, action) => {
    if (e.key === 'Enter') {
      action();
    } else if (e.key === 'Escape' && editingId) {
      cancelEdit();
    }
  }, [editingId, cancelEdit]);

  /**
   * Régénérer une couleur aléatoire pour une catégorie
   */
  const regenerateColor = useCallback((id) => {
    const usedColors = categories.filter(c => c.id !== id).map(c => c.color);
    const newColor = getRandomColor(usedColors);
    
    setCategories(prev => prev.map(c =>
      c.id === id ? { ...c, color: newColor } : c
    ));
  }, [categories, setCategories]);

  /**
   * Handler pour le changement de titre
   */
  const handleTitleChange = useCallback((e) => {
    setTitle(e.target.value);
  }, [setTitle]);

  /**
   * Handler pour le changement de nouvelle catégorie
   */
  const handleNewCategoryChange = useCallback((e) => {
    setNewCategory(e.target.value);
  }, []);

  /**
   * Handler pour le changement de valeur en édition
   */
  const handleEditingValueChange = useCallback((e) => {
    setEditingValue(e.target.value);
  }, []);

  // Calculer si on peut ajouter une nouvelle catégorie
  const canAddCategory = newCategory.trim() && categories.length < MAX_CATEGORIES;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay sombre */}
          <motion.div
            variants={OVERLAY_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Conteneur flex pour centrer la modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              variants={MODAL_VARIANTS}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-xl max-h-[90vh]
                         bg-gradient-to-br from-bg-primary to-bg-secondary 
                         rounded-3xl border-4 border-white/20 shadow-hard-xl 
                         flex flex-col overflow-hidden pointer-events-auto"
            >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b-4 border-white/10">
              <h2 className="text-xl md:text-2xl font-bold font-game text-white flex items-center gap-2">
                ⚙️ Configuration
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 
                         transition-colors border-2 border-white/20"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-5">
              
              {/* Section Titre */}
              <div className="space-y-1.5 md:space-y-3">
                <label className="text-xs md:text-sm font-bold text-white/80 uppercase tracking-wide">
                  📝 Titre de la roue
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="Ex: Qu'est-ce qu'on mange ?"
                  className="input-cartoon text-sm md:text-base py-2 md:py-3"
                  maxLength={MAX_TITLE_LENGTH}
                />
              </div>

              {/* Section Ajouter */}
              <div className="space-y-1.5 md:space-y-3">
                <label className="text-xs md:text-sm font-bold text-white/80 uppercase tracking-wide">
                  ➕ Ajouter une catégorie
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={handleNewCategoryChange}
                    onKeyPress={(e) => handleKeyPress(e, handleAddCategory)}
                    placeholder="Nom de la catégorie..."
                    className="input-cartoon flex-1 text-sm md:text-base py-2 md:py-3"
                    maxLength={MAX_CATEGORY_NAME_LENGTH}
                  />
                  <button
                    onClick={handleAddCategory}
                    disabled={!canAddCategory}
                    className="btn-cartoon bg-game-green text-white hover:bg-green-400
                             disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center gap-1 md:gap-2 py-2 md:py-3 px-3 md:px-6"
                  >
                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">Ajouter</span>
                  </button>
                </div>
              </div>

              {/* Liste des catégories */}
              <div className="space-y-2 md:space-y-3 flex-1">
                <label className="text-xs md:text-sm font-bold text-white/80 uppercase tracking-wide flex items-center justify-between">
                  <span>🎨 Catégories ({categories.length})</span>
                  <span className="text-[10px] md:text-xs font-normal opacity-60">Min {MIN_CATEGORIES} • Max {MAX_CATEGORIES}</span>
                </label>
                
                <div className="space-y-1.5 md:space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                  <AnimatePresence mode="popLayout">
                    {categories.map((category, index) => (
                      <motion.div
                        key={category.id}
                        layout
                        initial={CATEGORY_ITEM_VARIANTS.initial}
                        animate={CATEGORY_ITEM_VARIANTS.animate}
                        exit={CATEGORY_ITEM_VARIANTS.exit}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-2 p-2 rounded-xl bg-white/5 
                                 border-2 border-white/10 group"
                      >
                        {/* Indicateur de couleur (cliquable pour régénérer) */}
                        <button
                          onClick={() => regenerateColor(category.id)}
                          className="w-10 h-10 rounded-xl border-3 flex-shrink-0
                                   hover:scale-110 transition-transform cursor-pointer"
                          style={{ 
                            backgroundColor: category.color,
                            borderColor: 'rgba(0,0,0,0.2)',
                            color: getContrastTextColor(category.color),
                          }}
                          title="Cliquer pour changer la couleur"
                        >
                          <span className="text-xs font-bold">{index + 1}</span>
                        </button>

                        {/* Nom (éditable ou non) */}
                        {editingId === category.id ? (
                          <input
                            type="text"
                            value={editingValue}
                            onChange={handleEditingValueChange}
                            onKeyDown={(e) => handleKeyPress(e, saveEdit)}
                            className="flex-1 px-3 py-2 rounded-lg bg-white text-gray-800 
                                     font-semibold border-2 border-game-yellow focus:outline-none"
                            autoFocus
                            maxLength={MAX_CATEGORY_NAME_LENGTH}
                          />
                        ) : (
                          <span className="flex-1 text-white font-semibold truncate">
                            {category.name}
                          </span>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          {editingId === category.id ? (
                            <>
                              <button
                                onClick={saveEdit}
                                className="p-2 rounded-lg bg-game-green/20 hover:bg-game-green/40
                                         text-game-green transition-colors"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-2 rounded-lg bg-game-red/20 hover:bg-game-red/40
                                         text-game-red transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditing(category)}
                                className="p-2 rounded-lg bg-white/10 hover:bg-white/20
                                         text-white/70 hover:text-white transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category.id)}
                                className="p-2 rounded-lg bg-game-red/20 hover:bg-game-red/40
                                         text-game-red transition-colors"
                                disabled={categories.length <= MIN_CATEGORIES}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 md:p-6 border-t-4 border-white/10">
              <button
                onClick={onClose}
                className="w-full btn-cartoon-primary text-lg"
              >
                ✓ Terminé
              </button>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// React.memo pour éviter les re-renders si les props n'ont pas changé
export default memo(SettingsModal);
