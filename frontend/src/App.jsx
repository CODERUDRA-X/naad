import React from 'react';

export default function SemanticGauge({ bytesReceived }) {
  const currentKB = bytesReceived / 1024;
  const MAX_KB = 50; 
  const percentage = Math.min((currentKB / MAX_KB) * 100, 100);

  const radius = 70;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Needle angle logic: 180 deg is Left (0 KB), 360 deg is Right (50 KB)
  const needleAngle = 180 + (percentage / 100) * 180;

  // Universal usage metric boundaries
  const ticks = [0, 10, 20, 30, 40, 50];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0 15px 0' }}>
      <div style={{ position: 'relative', width: '240px', height: '140px' }}>
        
        {/* overflow: 'visible' zaroori hai taaki tick marks SVG ke bahar na katen */}
        <svg viewBox="0 0 200 130" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#22c55e" floodOpacity="0.6"/>
            </filter>
          </defs>

          {/* Metric Boundaries (Ticks & Labels) */}
          {ticks.map((val) => {
            // Angle math in radians to plot dots around the semi-circle
            const angleRad = (180 + (val / MAX_KB) * 180) * (Math.PI / 180);
            
            // Outer tick marks (line from radius 70 to 76)
            const tickX1 = 100 + 70 * Math.cos(angleRad);
            const tickY1 = 110 + 70 * Math.sin(angleRad);
            const tickX2 = 100 + 76 * Math.cos(angleRad);
            const tickY2 = 110 + 76 * Math.sin(angleRad);
            
            // Text labels positioned slightly outside the ticks
            const textX = 100 + 88 * Math.cos(angleRad);
            const textY = 110 + 88 * Math.sin(angleRad);

            return (
              <g key={val}>
                <line x1={tickX1} y1={tickY1} x2={tickX2} y2={tickY2} stroke="#475569" strokeWidth="2" strokeLinecap="round" />
                <text x={textX} y={textY + 4} fill="#64748b" fontSize="11" fontWeight="bold" textAnchor="middle">
                  {val}
                </text>
              </g>
            );
          })}

          {/* Background Track */}
          <path
            d="M 30,110 A 70,70 0 0,1 170,110"
            fill="none"
            stroke="#1e293b" 
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Active Data Track */}
          <path
            d="M 30,110 A 70,70 0 0,1 170,110"
            fill="none"
            stroke="url(#glow)" 
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
            filter="url(#shadow)"
          />

          {/* Low Opacity Animated Needle (Sui) */}
          <g style={{ transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)', transformOrigin: '100px 110px', transform: `rotate(${needleAngle}deg)` }}>
            {/* The Needle Body */}
            <line x1="100" y1="110" x2="162" y2="110" stroke="rgba(34, 197, 94, 0.3)" strokeWidth="4" strokeLinecap="round" />
            {/* The Pointer Tip */}
            <polygon points="158,107 168,110 158,113" fill="rgba(34, 197, 94, 0.4)" />
            {/* Center Pivot Point */}
            <circle cx="100" cy="110" r="7" fill="#0f172a" stroke="#22c55e" strokeWidth="2" />
          </g>

        </svg>
        
        {/* Dynamic Glowing Text Overlay (Needle is behind this) */}
        <div style={{ position: 'absolute', bottom: '-5px', left: '0', width: '100%', textAlign: 'center' }}>
          <span style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: '#22c55e', 
            textShadow: '0 0 15px rgba(34,197,94,0.5)',
            backgroundColor: 'rgba(15, 23, 42, 0.7)', // Adds a slight dark blur so sui doesn't disrupt text
            padding: '0 12px',
            borderRadius: '10px'
          }}>
            {currentKB.toFixed(2)} <span style={{ fontSize: '1.2rem', color: '#94a3b8', textShadow: 'none' }}>KB</span>
          </span>
        </div>
        
      </div>
    </div>
  );
}