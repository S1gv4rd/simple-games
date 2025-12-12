"use client";

interface ScoreDisplayProps {
  round: number;
  totalRounds: number;
  score: number;
}

export default function ScoreDisplay({ round, totalRounds, score }: ScoreDisplayProps) {
  return (
    <div className="flex justify-between w-full max-w-2xl mb-4">
      <span className="bg-white/80 text-foreground px-4 py-2 rounded-full font-bold text-lg">
        Round {round}/{totalRounds}
      </span>
      <span className="bg-yellow text-foreground px-4 py-2 rounded-full font-bold text-lg">
        {score} pts
      </span>
    </div>
  );
}
