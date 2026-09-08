import React from 'react';

interface AmmlLogoProps {
  variant?: 'full' | 'icon' | 'horizontal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  textColor?: 'light' | 'dark' | 'none';
  className?: string;
  animate?: boolean;
}

export const AmmlLogo: React.FC<AmmlLogoProps> = ({
  variant = 'full',
  size = 'md',
  textColor = 'light',
  className = '',
  animate = false,
}) => {
  // Dimensions map
  const scale = {
    sm: { width: 'w-16', height: 'h-12', textClass: 'text-[10px]' },
    md: { width: 'w-36', height: 'h-24', textClass: 'text-[12px]' },
    lg: { width: 'w-56', height: 'h-36', textClass: 'text-[15px]' },
    xl: { width: 'w-72', height: 'h-48', textClass: 'text-[18px]' },
  };

  const chosenScale = scale[size];

  // Colors based on brand guidelines in the image:
  // AMML Blue: #0064B4
  // AMML Orange: #DC6400
  // AMML Green: #288C28
  const brandBlue = '#0064B4';
  const brandOrange = '#DC6400';
  const brandGreen = '#288C28';

  const isDarkBg = textColor === 'light';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* SVG Graphic Portion */}
      <svg
        className={`${chosenScale.width} ${chosenScale.height} overflow-visible`}
        viewBox="0 0 280 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle gradients to add a rich premium touch while respecting corporate colors */}
          <linearGradient id="logoBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#007EDD" />
            <stop offset="100%" stopColor="#004C8C" />
          </linearGradient>
          <linearGradient id="logoOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F2770C" />
            <stop offset="100%" stopColor="#B34C00" />
          </linearGradient>
          <linearGradient id="logoGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#32B032" />
            <stop offset="100%" stopColor="#1C651C" />
          </linearGradient>
          {/* Glow filter for animating/shining on load */}
          <filter id="gentleGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="gap" />
            <feComposite in="SourceGraphic" in2="gap" operator="over" />
          </filter>
        </defs>

        <g className={animate ? 'animate-pulse' : ''}>
          {/* Leftmost Green Triangle Accent at Bottom Corner */}
          <polygon
            points="0,120 0,180 55,180"
            fill="url(#logoGreenGrad)"
            stroke={brandGreen}
            strokeWidth="0.5"
          />

          {/* Blue Stylized Left Chevron block (The outer and inner parallel bands) */}
          {/* Main outer diagonal down-right band */}
          <path
            d="M 0,0 L 170,180 L 150,180 L 0,22 Z"
            fill="url(#logoBlueGrad)"
            filter={animate ? 'url(#gentleGlow)' : undefined}
          />
          {/* Parallel diagonal down-right inner band (hollow cut-out separation space is beautifully managed by rendering an explicit track) */}
          <path
            d="M 18,0 L 188,180 L 208,180 L 38,0 Z"
            fill="url(#logoBlueGrad)"
          />

          {/* Orange Right Wing structure (Diagonal up-right + vertical down-leg) */}
          <path
            d="M 95,95 L 195,0 L 195,180 L 175,180 L 175,25 L 95,115 Z"
            fill="url(#logoOrangeGrad)"
            filter={animate ? 'url(#gentleGlow)' : undefined}
          />
        </g>

        {/* Brand Slogan beneath the icon */}
        <g>
          <text
            x="0"
            y="196"
            fill={isDarkBg ? '#8FAECF' : brandBlue}
            className="font-sans font-extrabold text-[8px]"
            letterSpacing="1.2"
          >
            WE DELIVER VALUE!
          </text>
          {/* Slogan double accent lines */}
          <line x1="0" y1="200" x2="101" y2="200" stroke={brandGreen} strokeWidth="1.5" />
        </g>

        {/* Optional Corporate Text on Right of logo inside the SVG */}
        {variant === 'full' && (
          <g transform="translate(205, 30)">
            <text
              x="0"
              y="20"
              fill={isDarkBg ? '#FFFFFF' : '#0B1D33'}
              className="font-sans font-extrabold text-[15px] tracking-tight"
            >
              Abuja
            </text>
            <text
              x="0"
              y="38"
              fill={isDarkBg ? '#FFFFFF' : '#0B1D33'}
              className="font-sans font-extrabold text-[15px] tracking-tight"
            >
              Markets
            </text>
            <text
              x="0"
              y="56"
              fill={isDarkBg ? '#8FAECF' : brandBlue}
              className="font-sans font-extrabold text-[14px] tracking-tight"
            >
              Management
            </text>
            <text
              x="0"
              y="74"
              fill={isDarkBg ? '#8FAECF' : brandBlue}
              className="font-sans font-bold text-[14px] tracking-tight"
            >
              Limited
            </text>
          </g>
        )}
      </svg>

      {/* HTML Layout Alternative: Variant Horizontal text on the right of SVG (better for layouts with text scaling) */}
      {variant === 'horizontal' && (
        <div className="flex flex-col select-none justify-center">
          <span
            className={`font-sans font-extrabold tracking-tight leading-none ${
              isDarkBg ? 'text-white' : 'text-slate-900'
            } ${chosenScale.textClass}`}
          >
            Abuja Markets
          </span>
          <span
            className={`font-sans font-medium tracking-tight mt-0.5 leading-none ${
              isDarkBg ? 'text-amml-blue' : 'text-amml-blue-dk'
            } text-[10px] sm:text-[11px]`}
          >
            Management Limited
          </span>
        </div>
      )}
    </div>
  );
};
