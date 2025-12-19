"use client";

import { useState, useCallback } from "react";
import BackButton from "@/components/BackButton";
import Celebration from "@/components/Celebration";
import ScoreDisplay from "@/components/ScoreDisplay";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";
import { shuffleArray, randomItem, randomInRange, TOTAL_ROUNDS, GAME_GRADIENTS } from "@/lib/gameUtils";

const GRADIENT = GAME_GRADIENTS.counting;

const ANIMALS = ["🐶", "🐱", "🐰", "🐻", "🦊", "🐸", "🐵", "🐷", "🐮", "🦁", "🐯", "🐨"];

type Difficulty = "easy" | "medium" | "hard";

const difficultyRanges: Record<Difficulty, { min: number; max: number }> = {
  easy: { min: 1, max: 3 },
  medium: { min: 1, max: 5 },
  hard: { min: 1, max: 10 },
};

interface Question {
  count: number;
  emoji: string;
  options: number[];
}

function generateQuestion(difficulty: Difficulty): Question {
  const { min, max } = difficultyRanges[difficulty];
  const count = randomInRange(min, max);
  const emoji = randomItem(ANIMALS);

  // Generate options with expanded range to avoid infinite loop
  const options = [count];
  const expandedMin = Math.max(1, min - 2);
  const expandedMax = max + 2;

  let attempts = 0;
  while (options.length < 4 && attempts < 100) {
    const wrong = randomInRange(expandedMin, expandedMax);
    if (!options.includes(wrong)) {
      options.push(wrong);
    }
    attempts++;
  }

  return { count, emoji, options: shuffleArray(options) };
}

export default function CountingGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [question, setQuestion] = useState<Question>(() => generateQuestion("medium"));
  const [showCelebration, setShowCelebration] = useState(false);
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [gameComplete, setGameComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAnswer = useCallback((answer: number) => {
    if (isProcessing) return;
    if (answer === question.count) {
      setIsProcessing(true);
      playCorrectSound();
      setShowCelebration(true);
      setScore((s) => s + 1);
    } else {
      playWrongSound();
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }, [question.count, isProcessing]);

  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
    setIsProcessing(false);
    if (round >= TOTAL_ROUNDS) {
      setGameComplete(true);
    } else {
      setRound((r) => r + 1);
      setQuestion(generateQuestion(difficulty || "medium"));
    }
  }, [round, difficulty]);

  const startGame = (diff: Difficulty) => {
    setDifficulty(diff);
    setQuestion(generateQuestion(diff));
    setScore(0);
    setRound(1);
    setGameComplete(false);
  };

  const playAgain = () => {
    setDifficulty(null);
    setGameComplete(false);
  };

  // Difficulty selection screen
  if (!difficulty) {
    return (
      <main className={`min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b ${GRADIENT}`}>
        <BackButton />
        <div className="text-7xl mb-6 pop-in">🔢</div>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-purple pop-in" style={{ animationDelay: "0.1s" }}>
          Counting Game
        </h1>
        <p className="text-xl md:text-2xl text-center mb-8 text-foreground/70 pop-in" style={{ animationDelay: "0.2s" }}>
          Choose difficulty:
        </p>
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <button
            onClick={() => startGame("easy")}
            className="game-button bg-green text-white text-2xl font-bold py-6 rounded-2xl shadow-lg pop-in"
            style={{ animationDelay: "0.3s" }}
          >
            Easy (1-3)
          </button>
          <button
            onClick={() => startGame("medium")}
            className="game-button bg-yellow text-foreground text-2xl font-bold py-6 rounded-2xl shadow-lg pop-in"
            style={{ animationDelay: "0.35s" }}
          >
            Medium (1-5)
          </button>
          <button
            onClick={() => startGame("hard")}
            className="game-button bg-red text-white text-2xl font-bold py-6 rounded-2xl shadow-lg pop-in"
            style={{ animationDelay: "0.4s" }}
          >
            Hard (1-10)
          </button>
        </div>
      </main>
    );
  }

  // Game complete screen
  if (gameComplete) {
    const stars = score === TOTAL_ROUNDS ? 3 : score >= 7 ? 2 : 1;
    return (
      <main className={`min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b ${GRADIENT}`}>
        <BackButton />
        <div className="text-6xl mb-6 celebrate">🎉</div>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-purple">
          Great Job!
        </h1>
        <p className="text-2xl md:text-3xl text-center mb-2 text-foreground">
          You got <span className="text-purple font-bold">{score}</span> out of <span className="font-bold">{TOTAL_ROUNDS}</span>!
        </p>
        <div className="flex gap-2 my-6">
          {Array.from({ length: stars }).map((_, i) => (
            <span key={i} className="text-4xl">⭐</span>
          ))}
        </div>
        <button
          onClick={playAgain}
          className="game-button bg-purple text-white text-2xl font-bold py-6 px-12 rounded-2xl shadow-lg mt-4"
        >
          Play Again
        </button>
      </main>
    );
  }

  return (
    <main className={`min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b ${GRADIENT}`}>
      <BackButton />
      <Celebration show={showCelebration} onComplete={handleCelebrationComplete} />

      <ScoreDisplay round={round} totalRounds={TOTAL_ROUNDS} score={score} />

      <h1 className="text-3xl md:text-5xl font-bold text-center mb-8 text-purple">
        How many animals?
      </h1>

      <div
        className={`bg-white rounded-3xl p-8 shadow-lg mb-8 min-h-[150px] flex items-center justify-center flex-wrap gap-4 max-w-md ${shake ? "wiggle" : ""}`}
      >
        {Array.from({ length: question.count }, (_, i) => (
          <span key={i} className="text-5xl md:text-7xl pop-in" style={{ animationDelay: `${i * 0.1}s` }}>
            {question.emoji}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
        {question.options.map((num) => (
          <button
            key={num}
            onClick={() => handleAnswer(num)}
            className="game-button bg-blue text-white text-5xl md:text-7xl font-bold py-8 md:py-10 rounded-3xl shadow-lg hover:bg-blue/90 active:scale-95 transition-all"
          >
            {num}
          </button>
        ))}
      </div>
    </main>
  );
}
