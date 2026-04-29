import React from 'react';

/**
 * Premium Logo Component for Oriaffilia
 * Uses the actual brand logo image (gold A icon)
 * 
 * @param {Object} props
 * @param {boolean} props.iconOnly - If true, only show the icon (no text)
 * @param {string} props.size - 'sm', 'md', 'lg', 'xl', 'xxl'
 * @param {boolean} props.stacked - If true, icon and text are stacked vertically
 * @param {string} props.variant - 'dark' (default, gold on dark), 'white' (gold on white), 'gold' (white on gold)
 * @param {string} props.className - Additional CSS classes
 */
export default function Logo({ iconOnly = false, size = 'md', stacked = false, variant = 'dark', className = '' }) {
  const sizes = {
    sm:  { icon: '32px', font: '14px', gap: '8px' },
    md:  { icon: '42px', font: '18px', gap: '10px' },
    lg:  { icon: '56px', font: '24px', gap: '14px' },
    xl:  { icon: '80px', font: '32px', gap: '20px' },
    xxl: { icon: '120px', font: '40px', gap: '24px' },
  };

  const variantSrc = {
    dark: '/images/logo-dark.jpg',
    white: '/images/logo-white.jpg',
    gold: '/images/logo-gold.jpg',
  };

  const currentSize = sizes[size] || sizes.md;
  const imgSrc = variantSrc[variant] || variantSrc.dark;

  return (
    <div className={`oriaffilia-logo ${className}`} style={{ 
      display: 'flex', 
      flexDirection: stacked ? 'column' : 'row',
      alignItems: 'center', 
      justifyContent: stacked ? 'center' : 'flex-start',
      gap: currentSize.gap,
      userSelect: 'none'
    }}>
      {/* Brand Logo Image */}
      <img
        src={imgSrc}
        alt="Oriaffilia"
        className="logo-icon"
        style={{
          width: currentSize.icon,
          height: currentSize.icon,
          borderRadius: size === 'xxl' ? '20px' : size === 'xl' ? '16px' : '10px',
          objectFit: 'cover',
          flexShrink: 0,
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
        }}
      />

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
