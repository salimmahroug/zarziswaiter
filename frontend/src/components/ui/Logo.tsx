import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'white' | 'gradient';
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  className = '', 
  showText = true,
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'white':
        return 'text-white';
      case 'gradient':
        return 'text-transparent bg-gradient-to-r from-zarzis-primary via-zarzis-primary-light to-zarzis-secondary bg-clip-text';
      default:
        return 'text-zarzis-primary dark:text-white';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} flex-shrink-0`}>
        <svg 
          viewBox="0 0 120 120" 
          className={`w-full h-full ${getVariantClasses()}`}
          fill="none"
        >
          {/* Waiter figure */}
          <g stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            {/* Head */}
            <circle cx="60" cy="25" r="12"/>
            
            {/* Body */}
            <path d="M60 37v35"/>
            
            {/* Bow tie */}
            <path d="M55 42l5-2 5 2-5 3-5-3z"/>
            
            {/* Arms */}
            <path d="M48 50l12-8"/>
            <path d="M72 50l-12-8"/>
            
            {/* Legs */}
            <path d="M60 72l-8 20"/>
            <path d="M60 72l8 20"/>
            
            {/* Tray with glass */}
            <ellipse cx="42" cy="48" rx="8" ry="3"/>
            <rect x="38" y="45" width="8" height="12" rx="1"/>
            
            {/* Food/plate */}
            <ellipse cx="46" cy="48" rx="4" ry="2"/>
          </g>
        </svg>
      </div>
      
      {showText && (
        <div className={`font-bold ${textSizeClasses[size]} ${getVariantClasses()}`}>
          ZARZIS WAITER
        </div>
      )}
    </div>
  );
};

export default Logo;
