# 🎡 Roue de la Chance

Une application web interactive et ludique de roue de la fortune avec un style **2D Cartoon / Casual Game** inspiré de jeux comme "Cut the Rope".

## ✨ Fonctionnalités

- 🎯 **Rotation fluide** avec décélération réaliste
- 🎨 **Couleurs vives** générées automatiquement
- ⚙️ **CRUD complet** des catégories (ajouter, modifier, supprimer)
- 💾 **Persistance localStorage** - retrouvez votre roue après F5
- 🎉 **Effets de victoire** avec confettis
- 📱 **100% Responsive** - fonctionne sur mobile et desktop
- 🎮 **Game Feel** - animations et feedback soignés
- ⚡ **Optimisé** - Code splitting, lazy loading, memoization

## 🛠️ Stack Technique

- **React 18** (avec Vite)
- **Tailwind CSS** (styling utilitaire)
- **Framer Motion** (animations fluides)
- **Lucide React** (icônes)
- **Canvas Confetti** (effet de célébration)

## 🚀 Installation

```bash
# Cloner ou se placer dans le dossier
cd "Roue de la fortune"

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

## 🌐 Déploiement

### Vercel (Recommandé)
1. Connectez votre repo GitHub à [vercel.com](https://vercel.com)
2. Vercel détecte automatiquement Vite
3. Cliquez sur "Deploy" - c'est tout !

### GitHub Pages
1. Modifiez `vite.config.js` : ajoutez `base: '/nom-de-votre-repo/'`
2. Installez gh-pages : `npm install --save-dev gh-pages`
3. Déployez : `npm run build && npx gh-pages -d dist`

## 📁 Structure du projet

```
src/
├── components/
│   ├── Wheel.jsx          # Composant principal de la roue (SVG + animation)
│   ├── SettingsModal.jsx  # Modal de configuration CRUD (lazy loaded)
│   └── WinnerModal.jsx    # Modal de résultat avec confettis (lazy loaded)
├── hooks/
│   └── useLocalStorage.js # Hook de persistance optimisé
├── utils/
│   └── colors.js          # Palette de couleurs et utilitaires
├── App.jsx                # Composant racine
├── main.jsx               # Point d'entrée
└── index.css              # Styles Tailwind + animations CSS
```

## 🎨 Design System

Le design suit un style **"Casual Game"** avec :
- Bordures épaisses (chunky borders)
- Ombres "dures" sans flou (drop shadows)
- Coins très arrondis
- Palette de couleurs vives
- Typographies ludiques (Fredoka One, Nunito)

## 📝 Logique de Rotation

1. **Avant l'animation** : On génère un index gagnant aléatoire
2. **Calcul de l'angle** : On calcule l'angle exact pour aligner le segment avec le pointeur
3. **Animation** : On ajoute 5-7 tours complets + l'angle final
4. **Easing** : Courbe de Bézier custom `[0.2, 0.8, 0.3, 1]` pour une décélération réaliste

## ⚡ Optimisations

- **Code Splitting** : Modales chargées à la demande avec `React.lazy`
- **Memoization** : Segments SVG mémorisés avec `useMemo`
- **Dynamic Import** : `canvas-confetti` chargé uniquement si nécessaire
- **localStorage optimisé** : Comparaison avant écriture pour éviter les opérations inutiles
- **React.memo** : Évite les re-renders inutiles des modales

## 🎮 Utilisation

1. Cliquez sur **⚙️** pour configurer votre roue
2. Modifiez le titre et les catégories
3. **Cliquez directement sur la roue** pour la faire tourner
4. Admirez le résultat avec confettis 🎉

## 📄 Licence

MIT - Libre d'utilisation et de modification.

---

Made with 😍 by [Maison.dev2025](https://maisondev-tan.vercel.app/)
