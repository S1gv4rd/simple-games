"use client";

import { useCallback } from "react";
import StartScreen from "@/components/StartScreen";
import GameComplete from "@/components/GameComplete";
import GameLayout from "@/components/GameLayout";
import ScoreDisplay from "@/components/ScoreDisplay";
import { useGameState } from "@/hooks/useGameState";
import { shuffleArray, randomItem } from "@/lib/gameUtils";

const TOTAL_ROUNDS = 10;
const GRADIENT = "from-purple/10 to-blue/10";

// Pattern sets using emoji pairs
const patternSets: [string, string][] = [
  ["🔴", "🔵"],
  ["⭐", "🌙"],
  ["🌸", "🌺"],
  ["🍎", "🍊"],
  ["🐶", "🐱"],
  ["🦋", "🐝"],
  ["🌈", "☀️"],
  ["💜", "💚"],
  ["🎈", "🎀"],
  ["🍓", "🍇"],
];

interface Question {
  pattern: string[];
  correctAnswer: string;
  options: string[];
}

function generateQuestion(): Question {
  const [a, b] = randomItem(patternSets);

  const patternTypes = [
    { pattern: [a, b, a, b], next: a },
    { pattern: [a, a, b, a, a], next: b },
    { pattern: [a, b, b, a, b], next: b },
    { pattern: [a, a, b, b, a, a], next: b },
    { pattern: [a, b, a, b, a], next: b },
    { pattern: [b, a, b, a, b], next: a },
  ];

  const selected = randomItem(patternTypes);

  const options: string[] = [selected.next];
  const isNextA = selected.next === a;
  options.push(isNextA ? b : a);

  // Add a third option from another set
  const otherSet = patternSets.find(s => s[0] !== a && s[1] !== a);
  if (otherSet) {
    options.push(randomItem(otherSet));
  }

  return {
    pattern: selected.pattern,
    correctAnswer: selected.next,
    options: shuffleArray(options),
  };
}

export default function PatternsGame() {
  const game = useGameState<Question>({ totalRounds: TOTAL_ROUNDS, generateQuestion });

  const handleAnswer = useCallback((answer: string) => {
    if (answer === game.question.correctAnswer) {
      game.handleCorrect();
    } else {
      game.handleWrong();
    }
  }, [game]);

  if (!game.started) {
    return (
      <StartScreen
        title="Patterns Game"
        description="Complete the pattern!"
        icon={<span className="text-5xl">🔴🔵🔴</span>}
        color="purple"
        gradient={GRADIENT}
        onStart={game.startGame}
      />
    );
  }

  if (game.gameComplete) {
    return (
      <GameComplete
        title="Brilliant!"
        score={game.score}
        totalRounds={TOTAL_ROUNDS}
        color="purple"
        gradient={GRADIENT}
        onPlayAgain={game.resetGame}
      />
    );
  }

  return (
    <GameLayout
      gradient={GRADIENT}
      showCelebration={game.showCelebration}
      onCelebrationComplete={game.handleCelebrationComplete}
    >
      <ScoreDisplay round={game.round} totalRounds={TOTAL_ROUNDS} score={game.score} />

      <h1 className="text-2xl md:text-4xl font-bold text-center mb-6 text-purple">
        What comes next?
      </h1>

      <div className={`bg-white rounded-3xl p-6 shadow-lg mb-8 flex items-center gap-2 md:gap-4 ${game.shake ? "wiggle" : ""}`}>
        {game.question.pattern.map((emoji, index) => (
          <span key={index} className="text-4xl md:text-5xl pop-in" style={{ animationDelay: `${index * 0.1}s` }}>
            {emoji}
          </span>
        ))}
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl border-4 border-dashed border-gray-300 flex items-center justify-center">
          <span className="text-2xl text-gray-300 font-bold">?</span>
        </div>
      </div>

      <div className="flex gap-4 md:gap-6">
        {game.question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(option)}
            className="game-button bg-white p-4 md:p-6 rounded-3xl shadow-lg hover:shadow-xl hover:scale-105 transition-all border-4 border-purple/30 hover:border-purple"
          >
            <span className="text-4xl md:text-5xl">{option}</span>
          </button>
        ))}
      </div>
    </GameLayout>
  );
}
