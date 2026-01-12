/**
 * Palette de couleurs vives et ludiques pour la roue
 * Style "Casual Game" / "Cut the Rope"
 */
export const WHEEL_COLORS = [
  '#FF6B9D', // Rose vif
  '#FF9F43', // Orange
  '#FECA57', // Jaune doré
  '#5CD85A', // Vert pomme
  '#48DBFB', // Cyan
  '#54A0FF', // Bleu ciel
  '#A29BFE', // Violet lavande
  '#FF6B6B', // Rouge corail
  '#FD79A8', // Rose bonbon
  '#FDCB6E', // Jaune moutarde
  '#00B894', // Vert menthe
  '#74B9FF', // Bleu clair
  '#E17055', // Orange terracotta
  '#00CEC9', // Turquoise
  '#6C5CE7', // Violet profond
  '#E84393', // Magenta
];

/**
 * Couleurs de bordure correspondantes (plus foncées)
 */
export const WHEEL_BORDER_COLORS = [
  '#D44D7A', // Rose foncé
  '#D67D2F', // Orange foncé
  '#D4A83E', // Jaune foncé
  '#3FB53D', // Vert foncé
  '#2BB8D8', // Cyan foncé
  '#357DD4', // Bleu foncé
  '#7B75D6', // Violet foncé
  '#D44D4D', // Rouge foncé
  '#D45A85', // Rose foncé
  '#D4A94B', // Jaune foncé
  '#008E6B', // Vert foncé
  '#4F94D4', // Bleu foncé
  '#B85A42', // Orange foncé
  '#00A8A4', // Turquoise foncé
  '#5344C4', // Violet foncé
  '#BB2D75', // Magenta foncé
];

/**
 * Génère une couleur aléatoire parmi la palette
 * en évitant les couleurs déjà utilisées si possible
 * @param {string[]} usedColors - Couleurs déjà utilisées
 * @returns {string} - Couleur hexadécimale
 */
export function getRandomColor(usedColors = []) {
  // Filtrer les couleurs non utilisées
  const availableColors = WHEEL_COLORS.filter(
    color => !usedColors.includes(color)
  );
  
  // Si toutes les couleurs sont utilisées, on reprend depuis le début
  const colorPool = availableColors.length > 0 ? availableColors : WHEEL_COLORS;
  
  // Retourne une couleur aléatoire
  return colorPool[Math.floor(Math.random() * colorPool.length)];
}

/**
 * Génère un dégradé pour un segment de la roue
 * @param {string} baseColor - Couleur de base
 * @returns {string} - Dégradé CSS
 */
export function getSegmentGradient(baseColor) {
  // Éclaircir la couleur pour le dégradé
  const lighterColor = lightenColor(baseColor, 15);
  return `linear-gradient(135deg, ${lighterColor} 0%, ${baseColor} 100%)`;
}

/**
 * Éclaircit une couleur hex
 * @param {string} color - Couleur hex
 * @param {number} percent - Pourcentage d'éclaircissement
 * @returns {string} - Couleur éclaircie
 */
export function lightenColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

/**
 * Assombrit une couleur hex
 * @param {string} color - Couleur hex
 * @param {number} percent - Pourcentage d'assombrissement
 * @returns {string} - Couleur assombrie
 */
export function darkenColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
  const B = Math.max(0, (num & 0x0000FF) - amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

/**
 * Détermine si le texte doit être clair ou foncé
 * en fonction de la couleur de fond
 * @param {string} bgColor - Couleur de fond hex
 * @returns {string} - 'white' ou 'black'
 */
export function getContrastTextColor(bgColor) {
  const color = bgColor.replace('#', '');
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  
  // Formule de luminosité perçue
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#2D1B69' : '#FFFFFF';
}
