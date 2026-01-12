import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook personnalisé pour la persistance des données dans localStorage
 * 
 * OPTIMISATIONS APPLIQUÉES :
 * - Comparaison avant écriture pour éviter les écritures redondantes
 * - useCallback pour le setter (stabilité référentielle)
 * - useRef pour tracker la valeur précédente
 * - Gestion robuste des erreurs
 * 
 * @param {string} key - Clé de stockage dans localStorage
 * @param {*} initialValue - Valeur initiale si aucune donnée n'existe
 * @returns {[*, function]} - [valeur, fonction de mise à jour]
 */
export function useLocalStorage(key, initialValue) {
  // Référence pour stocker la dernière valeur JSON écrite
  // Permet d'éviter les écritures redondantes
  const lastWrittenJson = useRef(null);

  // État qui stocke la valeur
  // On passe une fonction à useState pour que la logique de récupération
  // ne s'exécute qu'une seule fois à l'initialisation
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Récupérer depuis localStorage
      const item = window.localStorage.getItem(key);
      
      if (item) {
        // Stocker la valeur initiale pour comparaison future
        lastWrittenJson.current = item;
        return JSON.parse(item);
      }
      
      // Si pas de valeur stockée, sérialiser et stocker la valeur initiale
      const initialJson = JSON.stringify(initialValue);
      lastWrittenJson.current = initialJson;
      return initialValue;
    } catch (error) {
      // En cas d'erreur (JSON invalide, etc.), retourner la valeur initiale
      console.warn(`Erreur lors de la lecture de localStorage["${key}"]:`, error);
      return initialValue;
    }
  });

  // Mettre à jour localStorage quand la valeur change
  // Optimisé pour éviter les écritures inutiles
  useEffect(() => {
    try {
      // Sérialiser la valeur actuelle
      const currentJson = JSON.stringify(storedValue);
      
      // Ne rien faire si la valeur n'a pas changé (comparaison JSON)
      if (currentJson === lastWrittenJson.current) {
        return;
      }
      
      // Stocker la nouvelle valeur
      window.localStorage.setItem(key, currentJson);
      lastWrittenJson.current = currentJson;
    } catch (error) {
      // Gérer les erreurs de quota dépassé ou autres
      console.warn(`Erreur lors de l'écriture dans localStorage["${key}"]:`, error);
    }
  }, [key, storedValue]);

  // Setter stable avec useCallback pour éviter les re-renders inutiles
  const setValue = useCallback((value) => {
    setStoredValue(prevValue => {
      // Support pour les fonctions (comme useState classique)
      const valueToStore = value instanceof Function ? value(prevValue) : value;
      return valueToStore;
    });
  }, []);

  // Retourner un tuple similaire à useState
  return [storedValue, setValue];
}

/**
 * Catégories par défaut pour une nouvelle roue
 */
export const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Pizza 🍕', color: '#FF6B9D' },
  { id: '2', name: 'Sushi 🍣', color: '#FF9F43' },
  { id: '3', name: 'Burger 🍔', color: '#FECA57' },
  { id: '4', name: 'Tacos 🌮', color: '#5CD85A' },
  { id: '5', name: 'Pâtes 🍝', color: '#48DBFB' },
  { id: '6', name: 'Salade 🥗', color: '#54A0FF' },
];

export const DEFAULT_TITLE = "Qu'est-ce qu'on mange ? 🍽️";
