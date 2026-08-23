export function AnimatedIcon({ size = 96, className = "" }: { size?: number; className?: string }) {
  return (
    <div
      className={`s4-icon relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size * 1.4 }}
    >
      <svg
        viewBox="0 0 200 320"
        width="100%"
        height="100%"
        style={{ overflow: "visible" }}
      >
        <defs>
          <radialGradient id="s4-glow" cx="50%" cy="82%" r="45%">
            <stop offset="0%" stopColor="hsl(0 100% 62%)" stopOpacity="0.95" />
            <stop offset="45%" stopColor="hsl(0 90% 40%)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="hsl(0 90% 30%)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="s4-body" x1="20%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#1c1c1f" />
            <stop offset="45%" stopColor="#050506" />
            <stop offset="75%" stopColor="#0d0303" />
            <stop offset="100%" stopColor="hsl(0 85% 22%)" />
          </linearGradient>
          <linearGradient id="s4-sheen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <filter id="s4-blur" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>

        <ellipse
          className="s4-pulse"
          cx="100"
          cy="255"
          rx="70"
          ry="55"
          fill="url(#s4-glow)"
          filter="url(#s4-blur)"
        />

        <path
          d="M118 8
             C 88 42, 54 96, 50 156
             C 47 206, 66 258, 100 300
             C 134 258, 156 202, 152 146
             C 149 100, 156 54, 118 8 Z"
          fill="url(#s4-body)"
          stroke="hsl(0 70% 30%)"
          strokeOpacity="0.4"
          strokeWidth="1"
        />

        <path
          d="M104 40
             C 84 70, 66 110, 64 150
             C 63 182, 74 214, 96 240"
          fill="none"
          stroke="hsl(0 90% 55%)"
          strokeOpacity="0.35"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        <path
          className="s4-sheen"
          d="M118 8
             C 88 42, 54 96, 50 156
             C 47 206, 66 258, 100 300
             C 134 258, 156 202, 152 146
             C 149 100, 156 54, 118 8 Z"
          fill="url(#s4-sheen)"
        />

        <ellipse cx="100" cy="288" rx="9" ry="7" fill="hsl(35 100% 78%)" opacity="0.9">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2.4s" repeatCount="indefinite" />
        </ellipse>
      </svg>

      <style>{`
        .s4-icon .s4-pulse {
          transform-origin: 100px 255px;
          animation: s4-flicker 3.2s ease-in-out infinite;
        }
        .s4-icon .s4-sheen {
          animation: s4-shimmer 4.5s ease-in-out infinite;
        }
        @keyframes s4-flicker {
          0%, 100% { opacity: 0.75; transform: scale(1); }
          35% { opacity: 1; transform: scale(1.08); }
          60% { opacity: 0.85; transform: scale(0.97); }
        }
        @keyframes s4-shimmer {
          0% { opacity: 0; transform: translateX(-30px); }
          45% { opacity: 1; }
          70% { opacity: 0; transform: translateX(30px); }
          100% { opacity: 0; transform: translateX(30px); }
        }
      `}</style>
    </div>
  );
}
