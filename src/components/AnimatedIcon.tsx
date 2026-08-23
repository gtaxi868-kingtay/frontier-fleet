export function AnimatedIcon({ size = 96, className = "" }: { size?: number; className?: string }) {
  return (
    <div
      className={`s4-flame relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size * 1.35 }}
    >
      <div className="s4-flame__flicker" style={{ width: "100%", height: "100%" }}>
        <svg viewBox="0 0 200 300" width="100%" height="100%" style={{ overflow: "visible" }}>
          <defs>
            <radialGradient id="s4-base-glow" cx="50%" cy="88%" r="42%">
              <stop offset="0%" stopColor="hsl(6 100% 60%)" stopOpacity="0.9" />
              <stop offset="50%" stopColor="hsl(0 90% 38%)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="hsl(0 90% 30%)" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="s4-outer-body" x1="15%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%" stopColor="#1e1e21" />
              <stop offset="40%" stopColor="#050506" />
              <stop offset="72%" stopColor="#0a0303" />
              <stop offset="100%" stopColor="hsl(0 80% 20%)" />
            </linearGradient>
            <linearGradient id="s4-inner-core" x1="30%" y1="0%" x2="70%" y2="100%">
              <stop offset="0%" stopColor="hsl(35 100% 72%)" />
              <stop offset="35%" stopColor="hsl(10 100% 58%)" />
              <stop offset="100%" stopColor="hsl(0 92% 34%)" />
            </linearGradient>
            <linearGradient id="s4-sheen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="48%" stopColor="#ffffff" stopOpacity="0.3" />
              <stop offset="58%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <filter id="s4-soft-blur" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="12" />
            </filter>
          </defs>

          <ellipse
            className="s4-flame__glow"
            cx="100"
            cy="270"
            rx="66"
            ry="46"
            fill="url(#s4-base-glow)"
            filter="url(#s4-soft-blur)"
          />

          {/* outer flame body: pointed tip, flared shoulders, pinched waist, rounded base */}
          <path
            d="M100 14
               C 132 46, 150 78, 146 100
               C 142 126, 116 146, 113 172
               C 110 202, 135 224, 145 252
               C 150 274, 130 300, 100 305
               C 70 300, 50 274, 55 252
               C 65 224, 90 202, 87 172
               C 84 146, 58 126, 54 100
               C 50 78, 68 46, 100 14 Z"
            fill="url(#s4-outer-body)"
            stroke="hsl(0 65% 26%)"
            strokeOpacity="0.4"
            strokeWidth="1"
          />

          {/* molten inner core, glowing through the glass */}
          <path
            className="s4-flame__core"
            d="M100 128
               C 116 148, 124 166, 121 180
               C 118 195, 104 206, 102 222
               C 100 240, 114 254, 100 266
               C 86 254, 100 240, 98 222
               C 96 206, 82 195, 79 180
               C 76 166, 84 148, 100 128 Z"
            fill="url(#s4-inner-core)"
            opacity="0.92"
          />

          <path
            className="s4-flame__sheen"
            d="M100 14
               C 132 46, 150 78, 146 100
               C 142 126, 116 146, 113 172
               C 110 202, 135 224, 145 252
               C 150 274, 130 300, 100 305
               C 70 300, 50 274, 55 252
               C 65 224, 90 202, 87 172
               C 84 146, 58 126, 54 100
               C 50 78, 68 46, 100 14 Z"
            fill="url(#s4-sheen)"
          />
        </svg>
      </div>

      <style>{`
        .s4-flame__flicker {
          transform-origin: 50% 100%;
          animation: s4-flame-flicker 2.6s ease-in-out infinite;
        }
        .s4-flame__glow {
          transform-origin: 100px 270px;
          animation: s4-flame-embers 2.1s ease-in-out infinite;
        }
        .s4-flame__core {
          animation: s4-flame-core-pulse 1.8s ease-in-out infinite;
        }
        .s4-flame__sheen {
          animation: s4-flame-sheen 4.2s ease-in-out infinite;
        }

        @keyframes s4-flame-flicker {
          0%, 100% { transform: scaleY(1) skewX(0deg); }
          20% { transform: scaleY(1.02) skewX(-1.2deg); }
          45% { transform: scaleY(0.97) skewX(1deg); }
          70% { transform: scaleY(1.03) skewX(-0.6deg); }
          85% { transform: scaleY(0.99) skewX(0.8deg); }
        }
        @keyframes s4-flame-embers {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.06); }
        }
        @keyframes s4-flame-core-pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        @keyframes s4-flame-sheen {
          0% { opacity: 0; transform: translateX(-24px); }
          45% { opacity: 1; }
          70% { opacity: 0; transform: translateX(24px); }
          100% { opacity: 0; transform: translateX(24px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .s4-flame__flicker,
          .s4-flame__glow,
          .s4-flame__core,
          .s4-flame__sheen {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
