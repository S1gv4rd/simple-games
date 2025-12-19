"use client";

import { useCallback } from "react";
import StartScreen from "@/components/StartScreen";
import GameComplete from "@/components/GameComplete";
import GameLayout from "@/components/GameLayout";
import ScoreDisplay from "@/components/ScoreDisplay";
import { useGameState } from "@/hooks/useGameState";
import { shuffleArray, TOTAL_ROUNDS, GAME_GRADIENTS } from "@/lib/gameUtils";

const GRADIENT = GAME_GRADIENTS.alphabet;

const letterData: Record<string, { word: string; color: string }> = {
  A: { word: "Apple", color: "#ef476f" },
  B: { word: "Ball", color: "#00bbf9" },
  C: { word: "Cat", color: "#ff9e00" },
  D: { word: "Dog", color: "#9b5de5" },
  E: { word: "Elephant", color: "#00f5d4" },
  F: { word: "Fish", color: "#00bbf9" },
  G: { word: "Grapes", color: "#9b5de5" },
  H: { word: "Hat", color: "#ef476f" },
  I: { word: "Ice cream", color: "#ff6b9d" },
  J: { word: "Juice", color: "#ff9e00" },
  K: { word: "Kite", color: "#00f5d4" },
  L: { word: "Lion", color: "#fee440" },
  M: { word: "Moon", color: "#9b5de5" },
  N: { word: "Nest", color: "#ff9e00" },
  O: { word: "Orange", color: "#ff9e00" },
  P: { word: "Pig", color: "#ff6b9d" },
  Q: { word: "Queen", color: "#9b5de5" },
  R: { word: "Rainbow", color: "#ef476f" },
  S: { word: "Sun", color: "#fee440" },
  T: { word: "Tree", color: "#00f5d4" },
  U: { word: "Umbrella", color: "#00bbf9" },
  V: { word: "Violin", color: "#ff9e00" },
  W: { word: "Whale", color: "#00bbf9" },
  X: { word: "Xylophone", color: "#ef476f" },
  Y: { word: "Yo-yo", color: "#fee440" },
  Z: { word: "Zebra", color: "#00f5d4" },
};

const letters = Object.keys(letterData);

interface Question {
  targetLetter: string;
  options: string[];
}

function generateQuestion(): Question {
  const targetLetter = letters[Math.floor(Math.random() * letters.length)];

  const options = [targetLetter];
  while (options.length < 4) {
    const wrong = letters[Math.floor(Math.random() * letters.length)];
    if (!options.includes(wrong)) {
      options.push(wrong);
    }
  }

  return { targetLetter, options: shuffleArray(options) };
}

export default function AlphabetGame() {
  const game = useGameState<Question>({ totalRounds: TOTAL_ROUNDS, generateQuestion });

  const { word, color } = letterData[game.question.targetLetter];

  const handleAnswer = useCallback((answer: string) => {
    if (answer === game.question.targetLetter) {
      game.handleCorrect();
    } else {
      game.handleWrong();
    }
  }, [game]);

  if (!game.started) {
    return (
      <StartScreen
        title="Alphabet Game"
        description="Match letters to words!"
        icon={<div className="text-7xl font-bold text-blue">ABC</div>}
        color="blue"
        gradient={GRADIENT}
        onStart={game.startGame}
      />
    );
  }

  if (game.gameComplete) {
    return (
      <GameComplete
        title="Amazing!"
        score={game.score}
        totalRounds={TOTAL_ROUNDS}
        color="blue"
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

      <h1 className="text-2xl md:text-4xl font-bold text-center mb-4 text-blue">
        What letter does <span className="text-purple">{word}</span> start with?
      </h1>

      <div className={`bg-white rounded-3xl p-8 shadow-lg mb-8 flex flex-col items-center ${game.shake ? "wiggle" : ""}`}>
        <div
          className="text-8xl md:text-9xl mb-4 pop-in font-bold"
          style={{ color }}
        >
          {game.question.targetLetter}
        </div>
        <span className="text-3xl md:text-4xl font-bold text-foreground">
          <span className="text-purple text-4xl md:text-5xl">{game.question.targetLetter}</span>
          {word.slice(1).toLowerCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
        {game.question.options.map((letter) => (
          <button
            key={letter}
            onClick={() => handleAnswer(letter)}
            className="game-button bg-purple text-white text-5xl md:text-7xl font-bold py-8 md:py-10 rounded-3xl shadow-lg hover:bg-purple/90 active:scale-95 transition-all"
          >
            {letter}
          </button>
        ))}
      </div>
    </GameLayout>
  );
}
