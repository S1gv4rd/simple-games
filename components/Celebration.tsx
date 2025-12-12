"use client";

import { useEffect, useState } from "react";

interface CelebrationProps {
  show: boolean;
  onComplete?: () => void;
}

const confettiEmojis = ["🎉", "⭐", "🌟", "✨", "💫", "🎊", "🎈", "🎀", "💖", "🌈"];

export default function Celebration({ show, onComplete }: CelebrationProps) {
  const [particles, setParticles] = useState<
    { id: number; emoji: string; x: number; y: number; delay: number; size: number }[]
  >([]);

  useEffect(() => {
    if (show) {
      const newParticles = Array.from({ length: 16 }, (_, i) => ({
        id: i,
        emoji: confettiEmojis[Math.floor(Math.random() * confettiEmojis.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 0.3,
        size: 24 + Math.random() * 24,
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
            fontSize: p.size,
          }}
        >
          {p.emoji}
        </div>
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-6xl md:text-8xl celebrate">
          🎉
        </div>
      </div>
    </div>
  );
}
