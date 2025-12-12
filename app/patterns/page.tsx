"use client";

import { useCallback } from "react";
import ShapeRenderer, { ShapeItem } from "@/components/ShapeRenderer";
import StartScreen from "@/components/StartScreen";
import GameComplete from "@/components/GameComplete";
import GameLayout from "@/components/GameLayout";
import ScoreDisplay from "@/components/ScoreDisplay";
import { useGameState } from "@/hooks/useGameState";
import { GAME_COLORS, shuffleArray } from "@/lib/gameUtils";

const TOTAL_ROUNDS = 10;
const GRADIENT = "from-purple/10 to-blue/10";

// Pattern sets using colored shapes
const patternSets: [ShapeItem, ShapeItem][] = [
  [{ shape: "circle", color: GAME_COLORS.red }, { shape: "circle", color: GAME_COLORS.blue }],
  [{ shape: "square", color: GAME_COLORS.yellow }, { shape: "square", color: GAME_COLORS.green }],
  [{ shape: "star", color: GAME_COLORS.purple }, { shape: "star", color: GAME_COLORS.orange }],
  [{ shape: "triangle", color: GAME_COLORS.red }, { shape: "triangle", color: GAME_COLORS.orange }],
  [{ shape: "heart", color: GAME_COLORS.pink }, { shape: "heart", color: GAME_COLORS.purple }],
  [{ shape: "diamond", color: GAME_COLORS.blue }, { shape: "diamond", color: GAME_COLORS.yellow }],
  [{ shape: "circle", color: GAME_COLORS.orange }, { shape: "square", color: GAME_COLORS.green }],
  [{ shape: "star", color: GAME_COLORS.red }, { shape: "heart", color: GAME_COLORS.blue }],
  [{ shape: "triangle", color: GAME_COLORS.purple }, { shape: "diamond", color: GAME_COLORS.yellow }],
  [{ shape: "square", color: GAME_COLORS.pink }, { shape: "circle", color: GAME_COLORS.green }],
];

function shapeEquals(a: ShapeItem, b: ShapeItem): boolean {
  return a.shape === b.shape && a.color === b.color;
}

interface Question {
  pattern: ShapeItem[];
  correctAnswer: ShapeItem;
  options: ShapeItem[];
}

function generateQuestion(): Question {
  const [a, b] = patternSets[Math.floor(Math.random() * patternSets.length)];

  const patternTypes = [
    { pattern: [a, b, a, b], next: a },
    { pattern: [a, a, b, a, a], next: b },
    { pattern: [a, b, b, a, b], next: b },
    { pattern: [a, a, b, b, a, a], next: b },
    { pattern: [a, b, a, b, a], next: b },
    { pattern: [b, a, b, a, b], next: a },
  ];

  const selected = patternTypes[Math.floor(Math.random() * patternTypes.length)];

  const options: ShapeItem[] = [selected.next];
  const isNextA = shapeEquals(selected.next, a);
  options.push(isNextA ? b : a);

  // Add a third option from another set
  const otherSet = patternSets.find(s => !shapeEquals(s[0], a) && !shapeEquals(s[1], a));
  if (otherSet) {
    options.push(otherSet[Math.floor(Math.random() * 2)]);
  }

  return {
    pattern: selected.pattern,
    correctAnswer: selected.next,
    options: shuffleArray(options),
  };
}

export default function PatternsGame() {
  const game = useGameState<Question>({ totalRounds: TOTAL_ROUNDS, generateQuestion });

  const handleAnswer = useCallback((answer: ShapeItem) => {
    if (shapeEquals(answer, game.question.correctAnswer)) {
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
        icon={
          <div className="flex gap-2">
            <ShapeRenderer shape="circle" color={GAME_COLORS.purple} className="w-10 h-10" />
            <ShapeRenderer shape="circle" color={GAME_COLORS.blue} className="w-10 h-10" />
            <ShapeRenderer shape="circle" color={GAME_COLORS.purple} className="w-10 h-10" />
          </div>
        }
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
        {game.question.pattern.map((item, index) => (
          <div key={index} className="pop-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <ShapeRenderer shape={item.shape} color={item.color} className="w-12 h-12 md:w-16 md:h-16" />
          </div>
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
            <ShapeRenderer shape={option.shape} color={option.color} className="w-14 h-14 md:w-16 md:h-16" />
          </button>
        ))}
      </div>
    </GameLayout>
  );
}
