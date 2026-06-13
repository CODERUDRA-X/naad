import React from 'react';

export default function SemanticGauge({ bytesReceived }) {
  const currentKB = bytesReceived / 1024;
  const MAX_KB = 50; 
  const percentage = Math.min((currentKB / MAX_KB) * 100, 100);

  const radius = 80;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const needleAngle = 180 + (percentage / 100) * 180;
  const ticks = [0, 10, 20, 30, 40, 50];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '10px 0 20px 0' }}>
      <div style={{ position: 'relative', width: '240px', height: '130px' }}>
        
        <svg viewBox="0 0 200 120" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {ticks.map((val) => {
            const angleRad = (180 + (val / MAX_KB) * 180) * (Math.PI / 180);
            const tickX1 = 100 + 86 * Math.cos(angleRad);
            const tickY1 = 100 + 86 * Math.sin(angleRad);
            const tickX2 = 100 + 92 * Math.cos(angleRad);
            const tickY2 = 100 + 92 * Math.sin(angleRad);
            const textX = 100 + 106 * Math.cos(angleRad);
            const textY = 100 + 106 * Math.sin(angleRad);

            return (
              <g key={val}>
                <line x1={tickX1} y1={tickY1} x2={tickX2} y2={tickY2} stroke="#C58A2B" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                {/* 👈 Font size 10 se 13 aur bold kar diya */}
                <text x={textX} y={textY + 5} fill="#6B4423" fontSize="13" fontFamily="'Inter', sans-serif" fontWeight="700" textAnchor="middle">
                  {val}
                </text>
              </g>
            );
          })}

          <path d="M 20,100 A 80,80 0 0,1 180,100" fill="none" stroke="#EAE0D5" strokeWidth="10" strokeLinecap="round" />
          <path d="M 20,100 A 80,80 0 0,1 180,100" fill="none" stroke="#C58A2B" strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />

          <g style={{ transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)', transformOrigin: '100px 100px', transform: `rotate(${needleAngle}deg)` }}>
            <line x1="100" y1="100" x2="165" y2="100" stroke="#6B4423" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="162,97 172,100 162,103" fill="#6B4423" />
            <circle cx="100" cy="100" r="6" fill="#FCFAF5" stroke="#6B4423" strokeWidth="2.5" />
          </g>
        </svg>
        
        <div style={{ position: 'absolute', bottom: '-20px', left: '0', width: '100%', textAlign: 'center' }}>
          <span style={{ fontSize: '2.2rem', fontFamily: "'Cinzel', serif", fontWeight: '700', color: '#6B4423' }}>
            {currentKB.toFixed(2)} <span style={{ fontSize: '1rem', color: '#C58A2B', fontWeight: '600', fontFamily: 'Inter, sans-serif' }}>KB</span>
          </span>
        </div>
      </div>
    </div>
  );
}