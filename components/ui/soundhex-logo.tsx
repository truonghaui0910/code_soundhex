
"use client";

interface SoundHexLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  animated?: boolean;
}

export function SoundHexLogo({ 
  size = 80, 
  showText = true, 
  className = "",
  animated = false 
}: SoundHexLogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <div className={`relative ${animated ? 'animate-pulse' : ''}`}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#dc2675" />
              <stop offset="50%" stopColor="#c026d3" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <linearGradient id="soundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#fdf2f8" />
            </linearGradient>
            <radialGradient id="glowEffect">
              <stop offset="0%" stopColor="#dc2675" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0"/>
            </radialGradient>
          </defs>

          {/* Outer Glow Effect */}
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="url(#glowEffect)"
            opacity="0.4"
            className={animated ? 'animate-ping' : ''}
            style={animated ? { animationDuration: '2s' } : {}}
          />

          {/* Main Hexagon - Full size */}
          <polygon
            points="50,5 85,25 85,75 50,95 15,75 15,25"
            fill="url(#hexGradient)"
            stroke="white"
            strokeWidth="2"
            className={animated ? 'animate-pulse' : ''}
            style={animated ? { animationDuration: '3s' } : {}}
          />

          {/* Inner Hexagon Border */}
          <polygon
            points="50,12 78,28 78,72 50,88 22,72 22,28"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
          />

          {/* Sound Wave Visualization */}
          <g fill="url(#soundGradient)" opacity="0.9">
            {/* Central wave */}
            <rect x="47" y="30" width="6" height="40" rx="3">
              {animated && (
                <animate
                  attributeName="height"
                  values="40;20;40;30;40"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              )}
            </rect>
            
            {/* Side waves */}
            <rect x="38" y="35" width="4" height="30" rx="2" opacity="0.8">
              {animated && (
                <animate
                  attributeName="height"
                  values="30;15;30;20;30"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              )}
            </rect>
            
            <rect x="58" y="35" width="4" height="30" rx="2" opacity="0.8">
              {animated && (
                <animate
                  attributeName="height"
                  values="30;15;30;20;30"
                  dur="1.3s"
                  repeatCount="indefinite"
                />
              )}
            </rect>

            <rect x="30" y="42" width="3" height="16" rx="1.5" opacity="0.6">
              {animated && (
                <animate
                  attributeName="height"
                  values="16;8;16;12;16"
                  dur="1.8s"
                  repeatCount="indefinite"
                />
              )}
            </rect>

            <rect x="67" y="42" width="3" height="16" rx="1.5" opacity="0.6">
              {animated && (
                <animate
                  attributeName="height"
                  values="16;8;16;12;16"
                  dur="1.6s"
                  repeatCount="indefinite"
                />
              )}
            </rect>
          </g>

          {/* Accent Dots */}
          <circle cx="30" cy="30" r="2" fill="white" opacity="0.7">
            {animated && (
              <animate
                attributeName="opacity"
                values="0.7;0.2;0.7"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          <circle cx="70" cy="30" r="2" fill="white" opacity="0.5">
            {animated && (
              <animate
                attributeName="opacity"
                values="0.5;0.1;0.5"
                dur="2.5s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          <circle cx="30" cy="70" r="1.5" fill="#dc2675" opacity="0.6">
            {animated && (
              <animate
                attributeName="opacity"
                values="0.6;0.1;0.6"
                dur="1.8s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          <circle cx="70" cy="70" r="1.5" fill="#7c3aed" opacity="0.4">
            {animated && (
              <animate
                attributeName="opacity"
                values="0.4;0.1;0.4"
                dur="2.2s"
                repeatCount="indefinite"
              />
            )}
          </circle>
        </svg>
      </div>
      
      {showText && (
        <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-800 bg-clip-text text-transparent">
          SoundHex
        </span>
      )}
    </div>
  );
}
