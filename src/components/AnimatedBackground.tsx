import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  text: string;
  left: number;
  top: number;
  tx: number;
  ty: number;
  duration: number;
  delay: number;
  size: number;
  rotation: number;
}

export const AnimatedBackground: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const texts = ['0', 'ร', 'มส'];
    // Adjust count based on screen size roughly
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 15 : 25;
    
    const newParticles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        text: texts[Math.floor(Math.random() * texts.length)],
        left: Math.random() * 100,
        top: Math.random() * 100,
        // Move randomly between -150px and 150px
        tx: (Math.random() - 0.5) * 300, 
        ty: (Math.random() - 0.5) * 300,
        // Rotation
        rotation: (Math.random() - 0.5) * 360,
        duration: 15 + Math.random() * 25, // Slow movement 15s-40s
        delay: -(Math.random() * 20),
        size: 20 + Math.random() * (isMobile ? 40 : 80), // 20px-100px
      });
    }
    setParticles(newParticles);
  }, []);

  // SVG Pattern: Subtle 0 ร มส repeated
  const svgPattern = encodeURIComponent(`
    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <style>
        text { font-family: 'Sarabun', sans-serif; font-weight: bold; fill: #2563EB; fill-opacity: 0.04; }
      </style>
      <text x="20" y="50" font-size="40">0</text>
      <text x="120" y="80" font-size="40">ร</text>
      <text x="60" y="150" font-size="40">มส</text>
      <text x="160" y="160" font-size="30">0</text>
      <text x="40" y="100" font-size="20">ร</text>
      <text x="10" y="180" font-size="20">มส</text>
    </svg>
  `);

  const bgImage = `data:image/svg+xml;charset=utf-8,${svgPattern}`;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-blue-50/30">
      {/* Layer 1: Repeating Pattern */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url("${bgImage}")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
      />

      {/* Layer 2: Gradient Overlay (Subtle) */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-white/40 to-blue-100/60 pointer-events-none"></div>

      {/* CSS for custom properties animation */}
      <style>{`
        @keyframes float-anim {
          0% { transform: translate(0, 0) rotate(0deg); }
          100% { transform: translate(var(--tx), var(--ty)) rotate(var(--rot)); }
        }
      `}</style>
      
      {/* Layer 3: Floating Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute font-bold text-blue-400 select-none pointer-events-none"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            fontSize: `${p.size}px`,
            opacity: 0.15,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            '--rot': `${p.rotation}deg`,
            animation: `float-anim ${p.duration}s infinite alternate ease-in-out`,
            animationDelay: `${p.delay}s`,
            willChange: 'transform'
          } as React.CSSProperties}
        >
          {p.text}
        </div>
      ))}
      
      {/* Layer 4: Blur Overlay to blend everything */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] pointer-events-none"></div>
    </div>
  );
};
