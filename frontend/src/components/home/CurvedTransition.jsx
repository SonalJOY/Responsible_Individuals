import React from 'react';

/**
 * CurvedTransition: Organic SVG arc separating sections, inspired by the HopeRise reference video.
 * @param {string} type - 'convex' (dome curving upward) or 'concave' (dome scooping downward)
 * @param {string} fill - fill color (e.g. #FDFBF7, #FFFFFF, #08291F)
 * @param {boolean} flip - whether to flip vertically (for section bottom)
 * @param {string} className - optional extra class names
 */
export default function CurvedTransition({ 
  type = 'convex', 
  fill = '#FDFBF7', 
  flip = false,
  className = '' 
}) {
  return (
    <div 
      className={`curved-transition-wrapper ${className}`}
      style={{
        transform: flip ? 'rotate(180deg)' : 'none',
        lineHeight: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      {type === 'convex' ? (
        <svg 
          viewBox="0 0 1440 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          <path 
            d="M0,120 C480,0 960,0 1440,120 L1440,120 L0,120 Z" 
            fill={fill} 
          />
        </svg>
      ) : (
        <svg 
          viewBox="0 0 1440 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          <path 
            d="M0,0 C480,120 960,120 1440,0 L1440,120 L0,120 L0,0 Z" 
            fill={fill} 
          />
        </svg>
      )}
    </div>
  );
}
