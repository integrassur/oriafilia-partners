import React from 'react';

/**
 * Premium Logo Component for Oriaffilia
 * @param {Object} props
 * @param {boolean} props.iconOnly - If true, only show the OA icon
 * @param {string} props.size - 'sm', 'md', 'lg', 'xl'
 * @param {string} props.className - Additional classes
 */
export default function Logo({ iconOnly = false, size = 'md', className = '' }) {
  const sizes = {
    sm: { icon: '32px', font: '14px', gap: '8px' },
    md: { icon: '42px', font: '18px', gap: '10px' },
    lg: { icon: '56px', font: '24px', gap: '14px' },
    xl: { icon: '80px', font: '32px', gap: '20px' },
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <div className={`oriaffilia-logo ${className}`} style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: currentSize.gap,
      userSelect: 'none'
    }}>
      {/* OA Icon */}
      <div className="logo-icon" style={{
        width: currentSize.icon,
        height: currentSize.icon,
        background: 'linear-gradient(135deg, #C4A344 0%, #9A7B2C 100%)',
        borderRadius: size === 'xl' ? '18px' : '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 15px rgba(196, 163, 68, 0.4)',
        flexShrink: 0,
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <span style={{
          color: 'white',
          fontSize: `calc(${currentSize.icon} * 0.45)`,
          fontWeight: '900',
          letterSpacing: '-1.5px',
          fontFamily: 'var(--font-heading)',
          textShadow: '0 1px 2px rgba(0,0,0,0.2)'
        }}>OA</span>
      </div>

      {/* Text Part */}
      {!iconOnly && (
        <div className="logo-text" style={{
          display: 'flex',
          flexDirection: 'column',
          lineHeight: 1
        }}>
          <span style={{
            fontSize: currentSize.font,
            fontWeight: '800',
            letterSpacing: '0.1em',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-heading)',
            textTransform: 'uppercase'
          }}>
            ORIAFFILIA
          </span>
        </div>
      )}
    </div>
  );
}
