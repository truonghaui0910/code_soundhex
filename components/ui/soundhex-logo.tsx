
"use client";

interface SoundHexLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  animated?: boolean;
}

export function SoundHexLogo({ 
  size = 32, 
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
              <stop offset="0%" stopColor="#FF6B6B" />
              <stop offset="50%" stopColor="#FF8E53" />
              <stop offset="100%" stopColor="#FF6B9D" />
            </linearGradient>
            <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
          </defs>

          {/* Outer Hexagon */}
          <path
            d="M50 5 L80 25 L80 65 L50 85 L20 65 L20 25 Z"
            fill="url(#hexGradient)"
            stroke="white"
            strokeWidth="2"
            className={animated ? 'animate-spin-slow' : ''}
            style={animated ? { animationDuration: '8s' } : {}}
          />

          {/* Inner Hexagon */}
          <path
            d="M50 15 L70 30 L70 60 L50 75 L30 60 L30 30 Z"
            fill="url(#innerGradient)"
            opacity="0.8"
          />

          {/* Sound Wave Bars */}
          <g fill="url(#waveGradient)">
            <rect x="35" y="35" width="3" height="30" rx="1.5" opacity="0.9">
              {animated && (
                <animate
                  attributeName="height"
                  values="30;15;30;20;30"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              )}
            </rect>
            <rect x="42" y="25" width="3" height="50" rx="1.5" opacity="0.9">
              {animated && (
                <animate
                  attributeName="height"
                  values="50;25;50;35;50"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              )}
            </rect>
            <rect x="49" y="20" width="3" height="60" rx="1.5" opacity="0.9">
              {animated && (
                <animate
                  attributeName="height"
                  values="60;30;60;45;60"
                  dur="1.8s"
                  repeatCount="indefinite"
                />
              )}
            </rect>
            <rect x="56" y="30" width="3" height="40" rx="1.5" opacity="0.9">
              {animated && (
                <animate
                  attributeName="height"
                  values="40;20;40;30;40"
                  dur="1.3s"
                  repeatCount="indefinite"
                />
              )}
            </rect>
            <rect x="63" y="38" width="3" height="24" rx="1.5" opacity="0.9">
              {animated && (
                <animate
                  attributeName="height"
                  values="24;12;24;18;24"
                  dur="1.6s"
                  repeatCount="indefinite"
                />
              )}
            </rect>
          </g>

          {/* Central Hexagon Accent */}
          <path
            d="M50 25 L60 35 L60 55 L50 65 L40 55 L40 35 Z"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            opacity="0.6"
          />

          {/* Sparkle Effects */}
          <circle cx="25" cy="20" r="1.5" fill="white" opacity="0.8">
            {animated && (
              <animate
                attributeName="opacity"
                values="0.8;0.2;0.8"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          <circle cx="75" cy="75" r="1" fill="white" opacity="0.6">
            {animated && (
              <animate
                attributeName="opacity"
                values="0.6;0.1;0.6"
                dur="2.5s"
                repeatCount="indefinite"
              />
            )}
          </circle>
          <circle cx="15" cy="70" r="1.2" fill="#FF6B9D" opacity="0.7">
            {animated && (
              <animate
                attributeName="opacity"
                values="0.7;0.2;0.7"
                dur="1.8s"
                repeatCount="indefinite"
              />
            )}
          </circle>
        </svg>
      </div>
      
      {showText && (
        <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
          SoundHex
        </span>
      )}
    </div>
  );
}
