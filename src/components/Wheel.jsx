import { forwardRef, useImperativeHandle, useRef, useCallback, useMemo, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { getContrastTextColor, darkenColor } from '../utils/colors';

/**
 * Composant Roue de la Chance
 * 
 * LOGIQUE DE ROTATION :
 * 1. On génère un index gagnant ALÉATOIRE avant l'animation
 * 2. On calcule l'angle exact pour s'arrêter sur ce segment
 * 3. On ajoute plusieurs tours complets pour l'effet visuel
 * 4. L'animation utilise un easing custom pour une décélération réaliste
 * 
 * OPTIMISATIONS APPLIQUÉES :
 * - useMemo pour les segments SVG (évite les recalculs coûteux)
 * - Constantes sorties du composant
 * - Cleanup de l'animation si démontage
 * 
 * @param {Object[]} categories - Liste des catégories/segments
 * @param {boolean} isSpinning - État de rotation
 * @param {function} onSpinStart - Callback au démarrage
 * @param {function} onSpinEnd - Callback à la fin avec le gagnant
 */

// Constantes statiques (sorties du composant pour éviter les recréations)
const CENTER_X = 200;
const CENTER_Y = 200;
const RADIUS = 195;
const DECORATIVE_DOTS_COUNT = 12;
const DECORATIVE_DOTS_RADIUS = 185;

// Pré-calcul des positions des points décoratifs (ne change jamais)
const DECORATIVE_DOTS = Array.from({ length: DECORATIVE_DOTS_COUNT }, (_, i) => {
  const angle = (i * 30 - 90) * (Math.PI / 180);
  return {
    cx: CENTER_X + DECORATIVE_DOTS_RADIUS * Math.cos(angle),
    cy: CENTER_Y + DECORATIVE_DOTS_RADIUS * Math.sin(angle),
  };
});

const Wheel = forwardRef(function Wheel({ 
  categories, 
  isSpinning, 
  onSpinStart, 
  onSpinEnd 
}, ref) {
  const controls = useAnimation();
  const currentRotation = useRef(0);
  const isAnimating = useRef(false);

  // Angle par segment (360° / nombre de segments)
  const segmentAngle = useMemo(() => 360 / categories.length, [categories.length]);

  /**
   * Cleanup de l'animation si le composant est démonté pendant la rotation
   * Évite les fuites mémoire et les erreurs "setState on unmounted component"
   */
  useEffect(() => {
    return () => {
      if (isAnimating.current) {
        controls.stop();
      }
    };
  }, [controls]);

  /**
   * Lance l'animation de rotation
   * La roue s'arrête sur un segment aléatoire
   */
  const spin = useCallback(async () => {
    if (isSpinning || categories.length < 2 || isAnimating.current) return;

    isAnimating.current = true;
    onSpinStart();

    /**
     * CALCUL DU RÉSULTAT ALÉATOIRE
     * ============================
     * 1. On choisit un index gagnant aléatoire
     * 2. Le pointeur est en HAUT (0°/360°)
     * 3. On calcule l'angle nécessaire pour aligner le segment gagnant avec le pointeur
     */
    const winnerIndex = Math.floor(Math.random() * categories.length);
    
    /**
     * CALCUL DE L'ANGLE D'ARRÊT
     * =========================
     * - Chaque segment couvre un arc de (360 / n) degrés
     * - Le centre du segment i est à : i * segmentAngle + (segmentAngle / 2)
     * - Pour que le pointeur (en haut) pointe sur ce segment,
     *   on doit tourner de façon à ce que le centre du segment soit à 0° (en haut)
     * - L'angle de rotation = 360 - (centre du segment)
     *   Cela aligne le centre du segment gagnant avec le haut de la roue
     */
    const segmentCenter = winnerIndex * segmentAngle + (segmentAngle / 2);
    const targetAngle = 360 - segmentCenter;

    /**
     * ANIMATION FLUIDE
     * ================
     * - On ajoute plusieurs tours complets (5-8 tours) pour l'effet visuel
     * - La durée est proportionnelle au nombre de tours
     * - L'easing "easeOut" crée une décélération naturelle
     */
    const extraSpins = 5 + Math.floor(Math.random() * 3); // 5-7 tours supplémentaires
    const totalRotation = currentRotation.current + (360 * extraSpins) + targetAngle;

    // Ajuster pour que la rotation soit toujours positive et croissante
    const finalRotation = totalRotation + (360 - (currentRotation.current % 360));

    // Durée basée sur le nombre de tours (environ 0.8s par tour)
    const duration = 4 + (extraSpins * 0.5);

    try {
      // Lancer l'animation avec Framer Motion
      await controls.start({
        rotate: finalRotation,
        transition: {
          duration: duration,
          ease: [0.2, 0.8, 0.3, 1], // Custom cubic-bezier pour décélération réaliste
        },
      });

      // Sauvegarder la rotation actuelle pour la prochaine animation
      currentRotation.current = finalRotation;

      // Annoncer le gagnant
      onSpinEnd(categories[winnerIndex]);
    } catch (error) {
      // Animation interrompue (composant démonté) - ne rien faire
      console.debug('Animation interrompue');
    } finally {
      isAnimating.current = false;
    }
  }, [categories, isSpinning, onSpinStart, onSpinEnd, controls, segmentAngle]);

  // Exposer la méthode spin au composant parent via ref
  useImperativeHandle(ref, () => ({
    spin
  }), [spin]);

  /**
   * Mémoisation des segments SVG
   * Recalculé uniquement quand les catégories changent
   * Optimisation majeure car les calculs trigonométriques sont coûteux
   */
  const segments = useMemo(() => {
    return categories.map((category, index) => {
      // Angles de début et fin du segment (en radians)
      const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
      const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);

      // Points de l'arc
      const x1 = CENTER_X + RADIUS * Math.cos(startAngle);
      const y1 = CENTER_Y + RADIUS * Math.sin(startAngle);
      const x2 = CENTER_X + RADIUS * Math.cos(endAngle);
      const y2 = CENTER_Y + RADIUS * Math.sin(endAngle);

      // Large arc flag (1 si l'angle > 180°)
      const largeArc = segmentAngle > 180 ? 1 : 0;

      // Path SVG pour le segment
      const pathData = `
        M ${CENTER_X} ${CENTER_Y}
        L ${x1} ${y1}
        A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x2} ${y2}
        Z
      `;

      // Position du texte (au milieu du segment, à 65% du rayon)
      const textAngle = (startAngle + endAngle) / 2;
      const textRadius = RADIUS * 0.65;
      const textX = CENTER_X + textRadius * Math.cos(textAngle);
      const textY = CENTER_Y + textRadius * Math.sin(textAngle);
      const textRotation = (textAngle * 180 / Math.PI) + 90;

      // Couleur du texte basée sur le contraste
      const textColor = getContrastTextColor(category.color);
      const borderColor = darkenColor(category.color, 15);

      // Tronquer le texte si trop long
      const displayName = category.name.length > 12 
        ? category.name.slice(0, 10) + '...' 
        : category.name;

      // Taille de police adaptative selon le nombre de segments
      const fontSize = categories.length > 12 ? 10 : categories.length > 8 ? 12 : 14;

      return (
        <g key={category.id}>
          {/* Segment coloré */}
          <path
            d={pathData}
            fill={category.color}
            stroke={borderColor}
            strokeWidth="3"
            style={{
              filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.2))',
            }}
          />
          
          {/* Texte du segment */}
          <text
            x={textX}
            y={textY}
            fill={textColor}
            fontSize={fontSize}
            fontWeight="bold"
            fontFamily="'Nunito', sans-serif"
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(${textRotation}, ${textX}, ${textY})`}
            style={{
              textShadow: textColor === '#FFFFFF' 
                ? '1px 1px 0px rgba(0,0,0,0.3)' 
                : 'none',
              pointerEvents: 'none',
            }}
          >
            {displayName}
          </text>
        </g>
      );
    });
  }, [categories, segmentAngle]);

  // Calcul de la taille responsive de la roue (+30% plus grande)
  const wheelSize = 'min(500px, min(90vw, 60vh))';

  return (
    <div className="relative flex items-center justify-center">
      {/* Ombre portée de la roue */}
      <div 
        className="absolute rounded-full bg-black/30"
        style={{
          width: wheelSize,
          height: wheelSize,
          transform: 'translate(8px, 8px)',
        }}
      />

      {/* Conteneur de la roue animée */}
      <motion.div
        animate={controls}
        className="relative wheel-shine"
        style={{
          width: wheelSize,
          height: wheelSize,
        }}
      >
        {/* SVG de la roue */}
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full"
          style={{
            filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.2))',
          }}
        >
          {/* Cercle de fond */}
          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r="198"
            fill="#2D1B69"
            stroke="#1a0f40"
            strokeWidth="4"
          />
          
          {/* Segments (mémorisés) */}
          {segments}
          
          {/* Cercle central décoratif */}
          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r="30"
            fill="#FECA57"
            stroke="#D4A83E"
            strokeWidth="4"
          />
          
          {/* Effet de brillance au centre */}
          <circle
            cx="195"
            cy="195"
            r="15"
            fill="rgba(255,255,255,0.3)"
          />
          
          {/* Points décoratifs autour (pré-calculés) */}
          {DECORATIVE_DOTS.map((dot, i) => (
            <circle
              key={i}
              cx={dot.cx}
              cy={dot.cy}
              r="6"
              fill="#FECA57"
              stroke="#D4A83E"
              strokeWidth="2"
            />
          ))}
        </svg>
      </motion.div>

      {/* Pointeur / Flèche (en haut, fixe) */}
      <div 
        className="absolute z-10"
        style={{
          top: '-5px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <div className="pointer-triangle" />
      </div>

      {/* Bordure extérieure décorative */}
      <div
        className="absolute rounded-full border-8 border-white/20 pointer-events-none"
        style={{
          width: `calc(${wheelSize} + 20px)`,
          height: `calc(${wheelSize} + 20px)`,
        }}
      />
    </div>
  );
});

export default Wheel;
