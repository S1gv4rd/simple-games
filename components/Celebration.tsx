"use client";

import { useEffect, useState } from "react";

interface CelebrationProps {
  show: boolean;
  onComplete?: () => void;
}

const emojis = ["⭐", "🌟", "✨", "🎉", "🎊", "💫", "🌈", "❤️"];

export default function Celebration({ show, onComplete }: CelebrationProps) {
  const [particles, setParticles] = useState<
    { id: number; emoji: string; x: number; y: number; delay: number }[]
  >([]);

  useEffect(() => {
    if (show) {
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 0.3,
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
        <span
          key={p.id}
          className="absolute text-4xl md:text-6xl star-burst"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.emoji}
        </span>
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-6xl md:text-8xl celebrate">🎉</span>
      </div>
    </div>
  );
}
