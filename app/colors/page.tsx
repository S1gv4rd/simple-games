"use client";

import { useCallback } from "react";
import StartScreen from "@/components/StartScreen";
import GameComplete from "@/components/GameComplete";
import GameLayout from "@/components/GameLayout";
import ScoreDisplay from "@/components/ScoreDisplay";
import { useGameState } from "@/hooks/useGameState";
import { shuffleArray, GAME_COLORS, TOTAL_ROUNDS, GAME_GRADIENTS } from "@/lib/gameUtils";

const GRADIENT = GAME_GRADIENTS.colors;

type GameMode = "colors" | "shapes";

const colors = [
  { name: "Red", hex: GAME_COLORS.red },
  { name: "Orange", hex: GAME_COLORS.orange },
  { name: "Yellow", hex: GAME_COLORS.yellow },
  { name: "Green", hex: GAME_COLORS.green },
  { name: "Blue", hex: GAME_COLORS.blue },
  { name: "Purple", hex: GAME_COLORS.purple },
  { name: "Pink", hex: GAME_COLORS.pink },
];

const shapes = [
  { name: "Circle", svg: "M50,50 m-40,0 a40,40 0 1,0 80,0 a40,40 0 1,0 -80,0" },
  { name: "Square", svg: "M15,15 h70 v70 h-70 z" },
  { name: "Triangle", svg: "M50,10 L90,90 L10,90 Z" },
  { name: "Star", svg: "M50,5 L61,40 L98,40 L68,62 L79,97 L50,75 L21,97 L32,62 L2,40 L39,40 Z" },
  { name: "Heart", svg: "M50,88 C20,60 5,40 15,25 C25,10 45,15 50,30 C55,15 75,10 85,25 C95,40 80,60 50,88 Z" },
];

interface ColorOption {
  name: string;
  hex: string;
}

interface ShapeOption {
  name: string;
  svg: string;
}

interface Question {
  target: ColorOption | ShapeOption;
  options: (ColorOption | ShapeOption)[];
  mode: GameMode;
  color?: ColorOption;
}

function generateColorQuestion(): Question {
  const targetColor = colors[Math.floor(Math.random() * colors.length)];
  const options = [targetColor];

  while (options.length < 4) {
    const other = colors[Math.floor(Math.random() * colors.length)];
    if (!options.find((o) => o.name === other.name)) {
      options.push(other);
    }
  }

  return { target: targetColor, options: shuffleArray(options), mode: "colors" };
}

function generateShapeQuestion(): Question {
  const targetShape = shapes[Math.floor(Math.random() * shapes.length)];
  const options = [targetShape];

  while (options.length < 4) {
    const other = shapes[Math.floor(Math.random() * shapes.length)];
    if (!options.find((o) => o.name === other.name)) {
      options.push(other);
    }
  }

  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  return { target: targetShape, options: shuffleArray(options), mode: "shapes", color: randomColor };
}

function generateQuestion(): Question {
  return Math.random() > 0.5 ? generateColorQuestion() : generateShapeQuestion();
}

export default function ColorsGame() {
  const game = useGameState<Question>({ totalRounds: TOTAL_ROUNDS, generateQuestion });

  const handleAnswer = useCallback((answer: string) => {
    if (answer === game.question.target.name) {
      game.handleCorrect();
    } else {
      game.handleWrong();
    }
  }, [game]);

  if (!game.started) {
    return (
      <StartScreen
        title="Colors & Shapes"
        description="Identify colors and shapes!"
        icon={
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-[#ef476f]" />
            <div className="w-8 h-8 rounded-full bg-[#fee440]" />
            <div className="w-8 h-8 rounded-full bg-[#00bbf9]" />
          </div>
        }
        color="pink"
        gradient={GRADIENT}
        onStart={game.startGame}
      />
    );
  }

  if (game.gameComplete) {
    return (
      <GameComplete
        title="Wonderful!"
        score={game.score}
        totalRounds={TOTAL_ROUNDS}
        color="pink"
        gradient={GRADIENT}
        onPlayAgain={game.resetGame}
      />
    );
  }

  const isColorMode = game.question.mode === "colors";

  return (
    <GameLayout
      gradient={GRADIENT}
      showCelebration={game.showCelebration}
      onCelebrationComplete={game.handleCelebrationComplete}
    >
      <ScoreDisplay round={game.round} totalRounds={TOTAL_ROUNDS} score={game.score} />

      <h1 className="text-3xl md:text-5xl font-bold text-center mb-8 text-pink">
        {isColorMode ? "What color is this?" : "What shape is this?"}
      </h1>

      <div className={`bg-white rounded-3xl p-8 shadow-lg mb-8 flex items-center justify-center ${game.shake ? "wiggle" : ""}`}>
        {isColorMode ? (
          <div
            className="w-32 h-32 md:w-48 md:h-48 rounded-full pop-in shadow-lg"
            style={{ backgroundColor: (game.question.target as ColorOption).hex }}
          />
        ) : (
          <svg viewBox="0 0 100 100" className="w-32 h-32 md:w-48 md:h-48 pop-in">
            <path
              d={(game.question.target as ShapeOption).svg}
              fill={(game.question.color as ColorOption).hex}
            />
          </svg>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6 w-full max-w-xl">
        {game.question.options.map((option) => (
          <button
            key={option.name}
            onClick={() => handleAnswer(option.name)}
            className="game-button bg-white text-foreground text-2xl md:text-3xl font-bold py-6 md:py-8 px-6 rounded-3xl shadow-lg hover:shadow-xl active:scale-95 transition-all border-4 border-pink/30 hover:border-pink"
          >
            {isColorMode ? (
              <div className="flex items-center gap-4 justify-center">
                <div
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full"
                  style={{ backgroundColor: (option as ColorOption).hex }}
                />
                <span>{option.name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-4 justify-center">
                <svg viewBox="0 0 100 100" className="w-12 h-12 md:w-14 md:h-14">
                  <path d={(option as ShapeOption).svg} fill="#333" />
                </svg>
                <span>{option.name}</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </GameLayout>
  );
}
