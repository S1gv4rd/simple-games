"use client";

import { useCallback } from "react";
import StartScreen from "@/components/StartScreen";
import GameComplete from "@/components/GameComplete";
import GameLayout from "@/components/GameLayout";
import ScoreDisplay from "@/components/ScoreDisplay";
import { useGameState } from "@/hooks/useGameState";
import { shuffleArray, GAME_COLORS } from "@/lib/gameUtils";

const TOTAL_ROUNDS = 10;
const GRADIENT = "from-red/10 to-pink/10";

const numberWords = [
  { num: 1, word: "One", dotCount: 1 },
  { num: 2, word: "Two", dotCount: 2 },
  { num: 3, word: "Three", dotCount: 3 },
  { num: 4, word: "Four", dotCount: 4 },
  { num: 5, word: "Five", dotCount: 5 },
  { num: 6, word: "Six", dotCount: 6 },
  { num: 7, word: "Seven", dotCount: 7 },
  { num: 8, word: "Eight", dotCount: 8 },
  { num: 9, word: "Nine", dotCount: 9 },
  { num: 10, word: "Ten", dotCount: 10 },
];

type QuestionType = "word-to-number" | "number-to-word" | "dots-to-number";

interface Question {
  type: QuestionType;
  display: string | number;
  dotCount?: number;
  correctAnswer: number | string;
  options: (number | string)[];
}

function generateQuestion(): Question {
  const types: QuestionType[] = ["word-to-number", "number-to-word", "dots-to-number"];
  const type = types[Math.floor(Math.random() * types.length)];
  const target = numberWords[Math.floor(Math.random() * numberWords.length)];

  const generateOptions = (correct: number | string, isNumber: boolean) => {
    const options: (number | string)[] = [correct];
    while (options.length < 4) {
      const random = numberWords[Math.floor(Math.random() * numberWords.length)];
      const value = isNumber ? random.num : random.word;
      if (!options.includes(value)) {
        options.push(value);
      }
    }
    return shuffleArray(options);
  };

  switch (type) {
    case "word-to-number":
      return {
        type,
        display: target.word,
        correctAnswer: target.num,
        options: generateOptions(target.num, true),
      };
    case "number-to-word":
      return {
        type,
        display: String(target.num),
        correctAnswer: target.word,
        options: generateOptions(target.word, false),
      };
    case "dots-to-number":
      return {
        type,
        display: "dots",
        dotCount: target.dotCount,
        correctAnswer: target.num,
        options: generateOptions(target.num, true),
      };
  }
}

export default function NumbersGame() {
  const game = useGameState<Question>({ totalRounds: TOTAL_ROUNDS, generateQuestion });

  const handleAnswer = useCallback((answer: number | string) => {
    if (answer === game.question.correctAnswer) {
      game.handleCorrect();
    } else {
      game.handleWrong();
    }
  }, [game]);

  const getQuestionText = () => {
    switch (game.question.type) {
      case "word-to-number":
        return "What number is this?";
      case "number-to-word":
        return "What is this number called?";
      case "dots-to-number":
        return "How many dots?";
    }
  };

  if (!game.started) {
    return (
      <StartScreen
        title="Numbers Game"
        description="Learn numbers 1 to 10!"
        icon={<div className="text-7xl font-bold text-red">1 2 3</div>}
        color="red"
        gradient={GRADIENT}
        onStart={game.startGame}
      />
    );
  }

  if (game.gameComplete) {
    return (
      <GameComplete
        title="Excellent!"
        score={game.score}
        totalRounds={TOTAL_ROUNDS}
        color="red"
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

      <h1 className="text-2xl md:text-4xl font-bold text-center mb-6 text-red">
        {getQuestionText()}
      </h1>

      <div className={`bg-white rounded-3xl p-8 shadow-lg mb-8 min-w-[200px] text-center ${game.shake ? "wiggle" : ""}`}>
        {game.question.type === "dots-to-number" && game.question.dotCount ? (
          <div className="flex flex-wrap justify-center gap-2 max-w-[200px]">
            {Array.from({ length: game.question.dotCount }).map((_, i) => (
              <div key={i} className="w-6 h-6 md:w-8 md:h-8 bg-red rounded-full pop-in" style={{ animationDelay: `${i * 0.05}s` }} />
            ))}
          </div>
        ) : (
          <span className="font-bold text-red text-6xl md:text-8xl">
            {game.question.display}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-6 w-full max-w-lg">
        {game.question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(option)}
            className="game-button bg-white text-foreground text-3xl md:text-4xl font-bold py-6 md:py-8 rounded-3xl shadow-lg hover:shadow-xl hover:scale-105 transition-all border-4 border-red/30 hover:border-red"
          >
            {option}
          </button>
        ))}
      </div>
    </GameLayout>
  );
}
