import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  collapsed?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  collapsed = false,
  className = '',
}) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7', text: 'text-xs', sub: 'text-[9px]' },
    md: { box: 'w-10 h-10', text: 'text-sm', sub: 'text-[10px]' },
    lg: { box: 'w-12 h-12', text: 'text-base', sub: 'text-xs' },
    xl: { box: 'w-16 h-16', text: 'text-xl', sub: 'text-sm' },
  }[size];

  return (
    <div className={`flex items-center space-x-3 select-none ${className}`}>
      {/* Precision Structural LPG Cylinder & Natural Flame Emblem */}
      <div 
        className={`${sizeMap.box} rounded-xl bg-gradient-to-b from-brand-900 via-brand-850 to-brand-950 p-2 flex items-center justify-center shrink-0 shadow-md border border-brand-700/60 relative group`}
        title="LPG Tracker Nepal — National Supply Chain Authority"
      >
        <svg 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Cylinder Collar Arch */}
          <path 
            d="M9 13.5C9 10 11.5 8 16 8C20.5 8 23 10 23 13.5" 
            stroke="#94A3B8" 
            strokeWidth="1.8" 
            strokeLinecap="round" 
            opacity="0.8"
          />
          {/* Cylinder Valve Nozzle */}
          <rect x="14.2" y="5.5" width="3.6" height="3" rx="1" fill="#CBD5E1" />

          {/* Natural Fire Flame - Outer Petal (Deep Ember & Warm Orange) */}
          <path 
            d="M16 26.5C12.5 26.5 10 23.8 10 20.2C10 16.5 13.5 13.2 16 10C18.5 13.2 22 16.5 22 20.2C22 23.8 19.5 26.5 16 26.5Z" 
            fill="url(#naturalFlameOuter)" 
          />

          {/* Natural Fire Flame - Inner Core (Warm Amber / Radiant Fire) */}
          <path 
            d="M16 25C14 25 12.5 23.2 12.5 21C12.5 18.5 14.5 16.2 16 14C17.5 16.2 19.5 18.5 19.5 21C19.5 23.2 18 25 16 25Z" 
            fill="url(#naturalFlameInner)" 
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="naturalFlameOuter" x1="16" y1="10" x2="16" y2="26.5" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F97316" />
              <stop offset="0.55" stopColor="#EA580C" />
              <stop offset="1" stopColor="#C2410C" />
            </linearGradient>
            <linearGradient id="naturalFlameInner" x1="16" y1="14" x2="16" y2="25" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDE68A" />
              <stop offset="0.45" stopColor="#F59E0B" />
              <stop offset="1" stopColor="#EA580C" />
            </linearGradient>
          </defs>
        </svg>

        {/* Subtly refined subtle orange dot indicator */}
        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-flame-500 border border-brand-950" />
      </div>

      {/* Typography */}
      {showText && !collapsed && (
        <div className="truncate">
          <div className="flex items-center space-x-1.5">
            <span className={`font-extrabold tracking-tight text-slate-900 dark:text-white ${sizeMap.text} font-sans`}>
              LPG TRACKER
            </span>
            <span className="px-1.5 py-0.2 rounded font-mono text-[9px] font-bold bg-flame-500/15 text-flame-700 dark:text-flame-400 border border-flame-500/30">
              NP
            </span>
          </div>
          <p className={`text-slate-500 dark:text-slate-400 font-medium tracking-wide truncate ${sizeMap.sub}`}>
            Nepal Oil Corporation • राष्ट्रिय प्रणाली
          </p>
        </div>
      )}
    </div>
  );
};

