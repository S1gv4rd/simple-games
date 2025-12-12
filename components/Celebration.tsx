"use client";

import { useEffect, useState } from "react";

interface CelebrationProps {
  show: boolean;
  onComplete?: () => void;
}

const particleColors = ["#ef476f", "#fee440", "#00f5d4", "#00bbf9", "#9b5de5", "#ff6b9d", "#ff9e00"];
const particleShapes = ["circle", "star", "square"];

export default function Celebration({ show, onComplete }: CelebrationProps) {
  const [particles, setParticles] = useState<
    { id: number; color: string; shape: string; x: number; y: number; delay: number; size: number }[]
  >([]);

  useEffect(() => {
    if (show) {
      const newParticles = Array.from({ length: 16 }, (_, i) => ({
        id: i,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        shape: particleShapes[Math.floor(Math.random() * particleShapes.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 0.3,
        size: 16 + Math.random() * 24,
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute star-burst"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            animationDelay: `${p.delay}s`,
          }}
        >
          <svg viewBox="0 0 100 100" style={{ width: p.size, height: p.size }}>
            {p.shape === "circle" && <circle cx="50" cy="50" r="45" fill={p.color} />}
            {p.shape === "star" && <polygon points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40" fill={p.color} />}
            {p.shape === "square" && <rect x="10" y="10" width="80" height="80" rx="8" fill={p.color} />}
          </svg>
        </div>
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-6xl md:text-8xl font-bold text-green celebrate">
          Yes!
        </div>
      </div>
    </div>
  );
}
