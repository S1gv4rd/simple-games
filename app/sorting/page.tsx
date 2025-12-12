"use client";

import { useCallback } from "react";
import StartScreen from "@/components/StartScreen";
import GameComplete from "@/components/GameComplete";
import GameLayout from "@/components/GameLayout";
import ScoreDisplay from "@/components/ScoreDisplay";
import { useGameState } from "@/hooks/useGameState";
import { shuffleArray } from "@/lib/gameUtils";

const TOTAL_ROUNDS = 10;
const GRADIENT = "from-green/10 to-blue/10";

const sortableItems = [
  { name: "Elephant", emoji: "🐘", size: 10 },
  { name: "Mouse", emoji: "🐭", size: 1 },
  { name: "Dog", emoji: "🐕", size: 5 },
  { name: "Cat", emoji: "🐈", size: 4 },
  { name: "Bear", emoji: "🐻", size: 9 },
  { name: "Bunny", emoji: "🐰", size: 3 },
  { name: "Lion", emoji: "🦁", size: 8 },
  { name: "Frog", emoji: "🐸", size: 2 },
  { name: "Butterfly", emoji: "🦋", size: 1 },
  { name: "Turtle", emoji: "🐢", size: 3 },
  { name: "Whale", emoji: "🐋", size: 10 },
  { name: "Bird", emoji: "🐦", size: 2 },
  { name: "Fish", emoji: "🐟", size: 2 },
  { name: "Ant", emoji: "🐜", size: 1 },
];

interface SortableItem {
  name: string;
  emoji: string;
  size: number;
}

interface Question {
  items: SortableItem[];
  correctAnswer: "first" | "second";
  question: string;
}

function generateQuestion(): Question {
  const shuffled = shuffleArray(sortableItems);
  const item1 = shuffled[0];
  const item2 = shuffled.find(item => item.size !== item1.size) || shuffled[1];

  const askBigger = Math.random() > 0.5;
  const firstIsBigger = item1.size > item2.size;

  return {
    items: [item1, item2],
    correctAnswer: (askBigger && firstIsBigger) || (!askBigger && !firstIsBigger) ? "first" : "second",
    question: askBigger ? "Which is BIGGER?" : "Which is SMALLER?",
  };
}

export default function SortingGame() {
  const game = useGameState<Question>({ totalRounds: TOTAL_ROUNDS, generateQuestion });

  const handleAnswer = useCallback((answer: "first" | "second") => {
    if (answer === game.question.correctAnswer) {
      game.handleCorrect();
    } else {
      game.handleWrong();
    }
  }, [game]);

  if (!game.started) {
    return (
      <StartScreen
        title="Sorting Game"
        description="Which is bigger or smaller?"
        icon={<span className="text-5xl">🐘🐭</span>}
        color="green"
        gradient={GRADIENT}
        onStart={game.startGame}
      />
    );
  }

  if (game.gameComplete) {
    return (
      <GameComplete
        title="Super!"
        score={game.score}
        totalRounds={TOTAL_ROUNDS}
        color="green"
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

      <h1 className={`text-3xl md:text-5xl font-bold text-center mb-8 text-green ${game.shake ? "wiggle" : ""}`}>
        {game.question.question}
      </h1>

      <div className="flex gap-6 md:gap-12">
        {game.question.items.map((item, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index === 0 ? "first" : "second")}
            className="game-button bg-white flex flex-col items-center justify-center p-8 md:p-12 rounded-3xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <span className="text-6xl md:text-8xl mb-4">{item.emoji}</span>
            <span className="text-xl md:text-2xl font-bold text-foreground">{item.name}</span>
          </button>
        ))}
      </div>
    </GameLayout>
  );
}
