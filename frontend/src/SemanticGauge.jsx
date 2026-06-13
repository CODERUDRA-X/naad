import React from 'react';

export default function SemanticGauge({ bytesReceived }) {
  const currentKB = bytesReceived / 1024;
  const MAX_KB = 50; 
  const percentage = Math.min((currentKB / MAX_KB) * 100, 100);

  // Meter ka size thoda bada kiya taaki breathing room mile
  const radius = 80;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Needle logic (180 deg = 0 KB, 360 deg = 50 KB)
  const needleAngle = 180 + (percentage / 100) * 180;
  const ticks = [0, 10, 20, 30, 40, 50];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '15px 0 25px 0' }}>
      {/* Container height badhayi taaki text ke liye jagah ban sake */}
      <div style={{ position: 'relative', width: '260px', height: '140px' }}>
        
        <svg viewBox="0 0 200 120" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#22c55e" floodOpacity="0.5"/>
            </filter>
          </defs>

          {/* Metric Boundaries (Ticks & Labels) - Bahar ki taraf shift kiya */}
          {ticks.map((val) => {
            const angleRad = (180 + (val / MAX_KB) * 180) * (Math.PI / 180);
            
            // Outer tick marks coordinates
            const tickX1 = 100 + 86 * Math.cos(angleRad);
            const tickY1 = 100 + 86 * Math.sin(angleRad);
            const tickX2 = 100 + 92 * Math.cos(angleRad);
            const tickY2 = 100 + 92 * Math.sin(angleRad);
            
            // Text coordinates (aur bahar)
            const textX = 100 + 106 * Math.cos(angleRad);
            const textY = 100 + 106 * Math.sin(angleRad);

            return (
              <g key={val}>
                <line x1={tickX1} y1={tickY1} x2={tickX2} y2={tickY2} stroke="#475569" strokeWidth="2" strokeLinecap="round" />
                <text x={textX} y={textY + 4} fill="#64748b" fontSize="10" fontWeight="bold" textAnchor="middle">
                  {val}
                </text>
              </g>
            );
          })}

          {/* Solid Background Track */}
          <path
            d="M 20,100 A 80,80 0 0,1 180,100"
            fill="none"
            stroke="#1e293b" 
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Glowing Active Track */}
          <path
            d="M 20,100 A 80,80 0 0,1 180,100"
            fill="none"
            stroke="url(#glow)" 
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
            filter="url(#shadow)"
          />

          {/* Sharp Mechanical Needle */}
          <g style={{ transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)', transformOrigin: '100px 100px', transform: `rotate(${needleAngle}deg)` }}>
            {/* The line of the needle */}
            <line x1="100" y1="100" x2="165" y2="100" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
            {/* Arrow Tip */}
            <polygon points="162,97 172,100 162,103" fill="#22c55e" />
            {/* Center Mechanical Pivot */}
            <circle cx="100" cy="100" r="6" fill="#0f172a" stroke="#22c55e" strokeWidth="2.5" />
          </g>

        </svg>
        
        {/* Text completely below the meter, no backgrounds */}
        <div style={{ position: 'absolute', bottom: '-22px', left: '0', width: '100%', textAlign: 'center' }}>
          <span style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: '#22c55e', 
            textShadow: '0 0 15px rgba(34,197,94,0.4)',
            letterSpacing: '0.5px'
          }}>
            {currentKB.toFixed(2)} <span style={{ fontSize: '1.2rem', color: '#94a3b8', textShadow: 'none', fontWeight: '600' }}>KB</span>
          </span>
        </div>
        
      </div>
    </div>
  );
}