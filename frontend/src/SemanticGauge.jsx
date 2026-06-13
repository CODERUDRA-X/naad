import React from 'react';

export default function SemanticGauge({ bytesReceived }) {
  const currentKB = bytesReceived / 1024;
  const MAX_KB = 50; 
  const percentage = Math.min((currentKB / MAX_KB) * 100, 100);

  const radius = 70;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0 10px 0' }}>
      <div style={{ position: 'relative', width: '220px', height: '110px' }}>
        
        <svg viewBox="0 0 200 110" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#22c55e" floodOpacity="0.6"/>
            </filter>
          </defs>

          {/* Background Track */}
          <path
            d="M 30,90 A 70,70 0 0,1 170,90"
            fill="none"
            stroke="#1e293b" 
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Active Data Track */}
          <path
            d="M 30,90 A 70,70 0 0,1 170,90"
            fill="none"
            stroke="url(#glow)" 
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
            filter="url(#shadow)"
          />

          {/* Built-in SVG Text labels for perfect alignment */}
          <text x="15" y="105" fill="#64748b" fontSize="13" fontWeight="bold" textAnchor="middle">0</text>
          <text x="185" y="105" fill="#64748b" fontSize="13" fontWeight="bold" textAnchor="middle">50</text>
        </svg>
        
        {/* Dynamic Glowing Text centered inside the arc */}
        <div style={{ position: 'absolute', bottom: '0', left: '0', width: '100%', textAlign: 'center' }}>
          <span style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#22c55e', textShadow: '0 0 15px rgba(34,197,94,0.5)' }}>
            {currentKB.toFixed(2)} <span style={{ fontSize: '1rem', color: '#94a3b8', textShadow: 'none' }}>KB</span>
          </span>
        </div>
        
      </div>
    </div>
  );
}