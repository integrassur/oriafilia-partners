import React from 'react';

/**
 * Premium Logo Component for Oriaffilia
 * @param {Object} props
 * @param {boolean} props.iconOnly - If true, only show the OA icon
 * @param {string} props.size - 'sm', 'md', 'lg', 'xl'
 * @param {string} props.className - Additional classes
 */
export default function Logo({ iconOnly = false, size = 'md', stacked = false, className = '' }) {
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
      flexDirection: stacked ? 'column' : 'row',
      alignItems: 'center', 
      justifyContent: stacked ? 'center' : 'flex-start',
      gap: currentSize.gap,
      userSelect: 'none'
    }}>
      {/* Image Icon (cropped to remove text) */}
      <div className="logo-icon" style={{
        width: currentSize.icon,
        height: currentSize.icon,
        backgroundImage: "url('/logo-oriafilia.png')",
        backgroundSize: "150%", // Zoom in to hide the text below
        backgroundPosition: "center 15%", // Focus on the shield icon at the top
        backgroundColor: "#ffffff", // Ensure contrast for the logo
        backgroundRepeat: "no-repeat",
        borderRadius: size === 'xl' ? '18px' : '10px',
        flexShrink: 0,
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }} />

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
