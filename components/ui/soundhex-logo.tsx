
"use client";

interface SoundHexLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  animated?: boolean;
}

export function SoundHexLogo({ 
  size = 40, 
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
            <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#667eea" />
              <stop offset="50%" stopColor="#764ba2" />
              <stop offset="100%" stopColor="#f093fb" />
            </linearGradient>
            <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4facfe" />
              <stop offset="100%" stopColor="#00f2fe" />
            </linearGradient>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff9a9e" />
              <stop offset="50%" stopColor="#fecfef" />
              <stop offset="100%" stopColor="#fecfef" />
            </linearGradient>
            <radialGradient id="glowGradient">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
            </radialGradient>
          </defs>

          {/* Outer Glow Effect */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="url(#glowGradient)"
            opacity="0.3"
            className={animated ? 'animate-ping' : ''}
            style={animated ? { animationDuration: '3s' } : {}}
          />

          {/* Main Circle */}
          <circle
            cx="50"
            cy="50"
            r="35"
            fill="url(#mainGradient)"
            stroke="white"
            strokeWidth="2"
            className={animated ? 'animate-spin' : ''}
            style={animated ? { animationDuration: '6s' } : {}}
          />

          {/* Inner Ring */}
          <circle
            cx="50"
            cy="50"
            r="28"
            fill="none"
            stroke="url(#ringGradient)"
            strokeWidth="2"
            opacity="0.7"
            className={animated ? 'animate-spin' : ''}
            style={animated ? { animationDuration: '4s', animationDirection: 'reverse' } : {}}
          />

          {/* Center Circle */}
          <circle
            cx="50"
            cy="50"
            r="18"
            fill="url(#centerGradient)"
            className={animated ? 'animate-pulse' : ''}
          />

          {/* Sound Wave Visualization */}
          <g fill="white" opacity="0.9">
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

            <rect x="36" y="45" width="2" height="10" rx="1" opacity="0.6">
              {animated && (
                <animate
                  attributeName="height"
                  values="10;5;10;7;10"
                  dur="1.8s"
                  repeatCount="indefinite"
                />
              )}
            </rect>

            <rect x="62" y="45" width="2" height="10" rx="1" opacity="0.6">
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

          {/* Sparkle Effects */}
          <circle cx="25" cy="25" r="2" fill="white" opacity="0.8">
            {animated && (
              <animate
                attributeName="opacity"
                values="0.8;0.2;0.8"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          <circle cx="75" cy="75" r="1.5" fill="#f093fb" opacity="0.7">
            {animated && (
              <animate
                attributeName="opacity"
                values="0.7;0.1;0.7"
                dur="2.5s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          <circle cx="20" cy="75" r="1" fill="#00f2fe" opacity="0.6">
            {animated && (
              <animate
                attributeName="opacity"
                values="0.6;0.1;0.6"
                dur="1.8s"
                repeatCount="indefinite"
              />
            )}
          </circle>
        </svg>
      </div>
      
      {showText && (
        <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          SoundHex
        </span>
      )}
    </div>
  );
}
