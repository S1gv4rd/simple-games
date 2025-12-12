"use client";

import BackButton from "./BackButton";

interface GameCompleteProps {
  title: string;
  score: number;
  totalRounds: number;
  color: string;
  gradient: string;
  onPlayAgain: () => void;
}

export default function GameComplete({
  title,
  score,
  totalRounds,
  color,
  gradient,
  onPlayAgain,
}: GameCompleteProps) {
  const stars = score === totalRounds ? 3 : score >= totalRounds * 0.7 ? 2 : 1;

  return (
    <main className={`min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b ${gradient}`}>
      <BackButton />
      <div className="text-6xl mb-6 celebrate">🎉</div>
      <h1 className={`text-4xl md:text-5xl font-bold text-center mb-4 text-${color}`}>
        {title}
      </h1>
      <p className="text-2xl md:text-3xl text-center mb-2 text-foreground">
        You got <span className={`text-${color} font-bold`}>{score}</span> out of{" "}
        <span className="font-bold">{totalRounds}</span>!
      </p>
      <div className="flex gap-2 my-6">
        {Array.from({ length: stars }).map((_, i) => (
          <span key={i} className="text-4xl">⭐</span>
        ))}
      </div>
      <button
        onClick={onPlayAgain}
        className={`game-button bg-${color} text-white text-2xl font-bold py-6 px-12 rounded-2xl shadow-lg mt-4`}
      >
        Play Again
      </button>
    </main>
  );
}
