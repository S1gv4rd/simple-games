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
  { name: "Elephant", size: 10, color: "#9b5de5" },
  { name: "Mouse", size: 1, color: "#ff6b9d" },
  { name: "Dog", size: 5, color: "#ff9e00" },
  { name: "Cat", size: 4, color: "#fee440" },
  { name: "Bear", size: 9, color: "#00f5d4" },
  { name: "Bunny", size: 3, color: "#ef476f" },
  { name: "Lion", size: 8, color: "#fee440" },
  { name: "Frog", size: 2, color: "#00f5d4" },
  { name: "Butterfly", size: 1, color: "#ff6b9d" },
  { name: "Turtle", size: 3, color: "#00bbf9" },
  { name: "House", size: 10, color: "#ef476f" },
  { name: "Castle", size: 10, color: "#9b5de5" },
  { name: "Ball", size: 4, color: "#00bbf9" },
  { name: "Tennis ball", size: 2, color: "#fee440" },
  { name: "Apple", size: 2, color: "#ef476f" },
  { name: "Grape", size: 1, color: "#9b5de5" },
];

interface SortableItem {
  name: string;
  size: number;
  color: string;
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
        icon={
          <div className="flex items-end gap-2">
            <div className="w-8 h-8 bg-green rounded-lg" />
            <div className="w-12 h-16 bg-green rounded-lg" />
          </div>
        }
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
            <div
              className="mb-4 rounded-2xl flex items-center justify-center"
              style={{
                width: `${60 + item.size * 8}px`,
                height: `${60 + item.size * 8}px`,
                backgroundColor: item.color,
              }}
            >
              <span className="text-white font-bold text-2xl md:text-3xl">
                {item.name.charAt(0)}
              </span>
            </div>
            <span className="text-xl md:text-2xl font-bold text-foreground">{item.name}</span>
          </button>
        ))}
      </div>
    </GameLayout>
  );
}
