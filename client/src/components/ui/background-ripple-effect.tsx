"use client";

import React, { useEffect, useRef, useState } from "react";

interface RippleBox {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  animationDuration: number;
}

export function BackgroundRippleEffect() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<RippleBox[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  const colors = [
    "bg-doge-400",
    "bg-doge-500", 
    "bg-doge-600",
    "bg-yellow-400",
    "bg-orange-400",
    "bg-red-400",
    "bg-pink-400",
    "bg-purple-400",
    "bg-blue-400",
    "bg-green-400"
  ];

  const createRipple = (x: number, y: number) => {
    const newRipple: RippleBox = {
      id: Date.now() + Math.random(),
      x,
      y,
      size: Math.random() * 200 + 100, // Random size between 100-300px
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.6 + 0.2, // Random opacity between 0.2-0.8
      animationDuration: Math.random() * 3 + 2, // Random duration between 2-5 seconds
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, newRipple.animationDuration * 1000);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Create ripple on mouse move (throttled)
    if (Math.random() < 0.1) { // 10% chance to create ripple on mouse move
      createRipple(x, y);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    createRipple(x, y);
  };

  // Auto-generate ripples when hovered
  useEffect(() => {
    if (!isHovered) return;

    const interval = setInterval(() => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      
      createRipple(x, y);
    }, 1000); // Create ripple every second when hovered

    return () => clearInterval(interval);
  }, [isHovered]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden cursor-pointer"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className={`absolute rounded-full ${ripple.color} pointer-events-none`}
          style={{
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
            opacity: ripple.opacity,
            animation: `ripple ${ripple.animationDuration}s ease-out forwards`,
            transform: 'scale(0)',
          }}
        />
      ))}
      
      <style>{`
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

