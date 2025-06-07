
"use client";

interface SoundHexLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  animated?: boolean;
}

export function SoundHexLogo({ 
  size = 50, 
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
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="50%" stopColor="#0099cc" />
              <stop offset="100%" stopColor="#0066ff" />
            </linearGradient>
            <linearGradient id="soundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e0f7ff" />
            </linearGradient>
            <radialGradient id="glowEffect">
              <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#00d4ff" stopOpacity="0"/>
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

          {/* Main Hexagon */}
          <polygon
            points="50,15 75,30 75,60 50,75 25,60 25,30"
            fill="url(#hexGradient)"
            stroke="white"
            strokeWidth="2"
            className={animated ? 'animate-pulse' : ''}
            style={animated ? { animationDuration: '3s' } : {}}
          />

          {/* Inner Hexagon Border */}
          <polygon
            points="50,20 70,32 70,58 50,70 30,58 30,32"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
          />

          {/* Sound Wave Visualization */}
          <g fill="url(#soundGradient)" opacity="0.9">
            {/* Central wave */}
            <rect x="48" y="35" width="4" height="30" rx="2">
              {animated && (
                <animate
                  attributeName="height"
                  values="30;15;30;20;30"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              )}
            </rect>
            
            {/* Side waves */}
            <rect x="42" y="40" width="3" height="20" rx="1.5" opacity="0.8">
              {animated && (
                <animate
                  attributeName="height"
                  values="20;10;20;15;20"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              )}
            </rect>
            
            <rect x="55" y="40" width="3" height="20" rx="1.5" opacity="0.8">
              {animated && (
                <animate
                  attributeName="height"
                  values="20;10;20;15;20"
                  dur="1.3s"
                  repeatCount="indefinite"
                />
              )}
            </rect>

            <rect x="37" y="45" width="2" height="10" rx="1" opacity="0.6">
              {animated && (
                <animate
                  attributeName="height"
                  values="10;5;10;7;10"
                  dur="1.8s"
                  repeatCount="indefinite"
                />
              )}
            </rect>

            <rect x="61" y="45" width="2" height="10" rx="1" opacity="0.6">
              {animated && (
                <animate
                  attributeName="height"
                  values="10;5;10;7;10"
                  dur="1.6s"
                  repeatCount="indefinite"
                />
              )}
            </rect>
          </g>

          {/* Accent Dots */}
          <circle cx="35" cy="35" r="1.5" fill="white" opacity="0.7">
            {animated && (
              <animate
                attributeName="opacity"
                values="0.7;0.2;0.7"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          <circle cx="65" cy="35" r="1.5" fill="white" opacity="0.5">
            {animated && (
              <animate
                attributeName="opacity"
                values="0.5;0.1;0.5"
                dur="2.5s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          <circle cx="35" cy="65" r="1" fill="#00d4ff" opacity="0.6">
            {animated && (
              <animate
                attributeName="opacity"
                values="0.6;0.1;0.6"
                dur="1.8s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          <circle cx="65" cy="65" r="1" fill="#0066ff" opacity="0.4">
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
