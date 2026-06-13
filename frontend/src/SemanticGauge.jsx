import React from 'react';

export default function SemanticGauge({ bytesReceived }) {
  // Convert bytes to KB
  const currentKB = bytesReceived / 1024;
  
  // 50 KB ki limit set ki hai visual arc ke liye. 
  // Ye dikhayega ki tumhari bandwidth kitni kam use ho rahi hai.
  const MAX_KB = 50; 
  const percentage = Math.min((currentKB / MAX_KB) * 100, 100);

  // SVG Math for the Semi-circle
  const radius = 60;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '15px 0' }}>
      <div style={{ position: 'relative', width: '140px', height: '80px' }}>
        
        {/* SVG Semi-Circle */}
        <svg viewBox="0 0 140 80" style={{ width: '100%', height: '100%' }}>
          {/* Background Track (Dark Slate) */}
          <path
            d="M 10,70 A 60,60 0 0,1 130,70"
            fill="none"
            stroke="#1e293b" 
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Active Data Progress (Neon Green) */}
          <path
            d="M 10,70 A 60,60 0 0,1 130,70"
            fill="none"
            stroke="#22c55e" 
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
          />
        </svg>
        
        {/* Dynamic Text inside the arc */}
        <div style={{ position: 'absolute', bottom: '0', left: '0', width: '100%', textAlign: 'center' }}>
          <span className="metric-value success" style={{ fontSize: '1.6rem', border: 'none', background: 'transparent' }}>
            {currentKB.toFixed(2)} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>KB</span>
          </span>
        </div>
        
      </div>
    </div>
  );
}