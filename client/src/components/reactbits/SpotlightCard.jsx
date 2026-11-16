import React, { useRef, useState } from 'react';

export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(242, 169, 0, 0.12)',
  borderColor = 'rgba(242, 169, 0, 0.45)',
  dark = true,
  onClick,
}) {
  const divRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        dark
          ? 'bg-[#211F1B] border-[#3A362F] text-white'
          : 'bg-[#FFFFFF] border-[#E5E0D6] text-[#171715]'
      } ${className}`}
    >
      {/* Dynamic Cursor Spotlight Layer */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(450px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 70%)`,
        }}
      />
      {/* Border Highlight Ring */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300 border"
        style={{
          opacity,
          borderColor: borderColor,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
