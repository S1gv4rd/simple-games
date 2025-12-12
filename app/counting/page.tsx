"use client";

import { useState, useCallback } from "react";
import BackButton from "@/components/BackButton";
import Celebration from "@/components/Celebration";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";

const TOTAL_ROUNDS = 10;
const animals = ["🐶", "🐱", "🐰", "🐻", "🦊", "🐸", "🐷", "🐮", "🐵", "🦁"];

type Difficulty = "easy" | "medium" | "hard";
const difficultyRanges: Record<Difficulty, { min: number; max: number }> = {
  easy: { min: 1, max: 3 },
  medium: { min: 1, max: 5 },
  hard: { min: 1, max: 10 },
};

function getRandomAnimal() {
  return animals[Math.floor(Math.random() * animals.length)];
}

function generateQuestion(difficulty: Difficulty) {
  const { min, max } = difficultyRanges[difficulty];
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const animal = getRandomAnimal();

  // Generate wrong answers
  const options = [count];
  while (options.length < 4) {
    const wrong = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!options.includes(wrong)) {
      options.push(wrong);
    }
  }

  // Shuffle options
  options.sort(() => Math.random() - 0.5);

  return { count, animal, options };
}

export default function CountingGame() {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [question, setQuestion] = useState(() => generateQuestion("medium"));
  const [showCelebration, setShowCelebration] = useState(false);
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [gameComplete, setGameComplete] = useState(false);

  const handleAnswer = useCallback((answer: number) => {
    if (answer === question.count) {
      playCorrectSound();
      setShowCelebration(true);
      setScore((s) => s + 1);
    } else {
      playWrongSound();
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }, [question.count]);

  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
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
      <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-purple/10 to-pink/10">
        <BackButton />
        <span className="text-8xl mb-6">🔢</span>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-purple">
          Counting Game
        </h1>
        <p className="text-xl md:text-2xl text-center mb-8 text-foreground/70">
          Choose difficulty:
        </p>
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <button
            onClick={() => startGame("easy")}
            className="game-button bg-green text-white text-2xl font-bold py-6 rounded-2xl shadow-lg"
          >
            🌟 Easy (1-3)
          </button>
          <button
            onClick={() => startGame("medium")}
            className="game-button bg-yellow text-foreground text-2xl font-bold py-6 rounded-2xl shadow-lg"
          >
            ⭐ Medium (1-5)
          </button>
          <button
            onClick={() => startGame("hard")}
            className="game-button bg-red text-white text-2xl font-bold py-6 rounded-2xl shadow-lg"
          >
            🔥 Hard (1-10)
          </button>
        </div>
      </main>
    );
  }

  // Game complete screen
  if (gameComplete) {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-purple/10 to-pink/10">
        <BackButton />
        <span className="text-8xl mb-6 celebrate">🎉</span>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-purple">
          Great Job!
        </h1>
        <p className="text-2xl md:text-3xl text-center mb-2 text-foreground">
          You got <span className="text-purple font-bold">{score}</span> out of <span className="font-bold">{TOTAL_ROUNDS}</span>!
        </p>
        <div className="text-5xl my-6">
          {score === TOTAL_ROUNDS ? "🌟🌟🌟" : score >= 7 ? "🌟🌟" : score >= 4 ? "🌟" : "💪"}
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
    <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-purple/10 to-pink/10">
      <BackButton />
      <Celebration show={showCelebration} onComplete={handleCelebrationComplete} />

      <div className="flex justify-between w-full max-w-2xl mb-4">
        <span className="bg-white/80 text-foreground px-4 py-2 rounded-full font-bold text-lg">
          Round {round}/{TOTAL_ROUNDS}
        </span>
        <span className="bg-yellow text-foreground px-4 py-2 rounded-full font-bold text-lg">
          ⭐ {score}
        </span>
      </div>

      <h1 className="text-3xl md:text-5xl font-bold text-center mb-8 text-purple">
        How many {question.animal}?
      </h1>

      {/* Animals display */}
      <div
        className={`bg-white rounded-3xl p-8 shadow-lg mb-8 min-h-[150px] flex items-center justify-center flex-wrap gap-4 max-w-md ${shake ? "wiggle" : ""}`}
      >
        {Array.from({ length: question.count }, (_, i) => (
          <span key={i} className="text-5xl md:text-7xl pop-in" style={{ animationDelay: `${i * 0.1}s` }}>
            {question.animal}
          </span>
        ))}
      </div>

      {/* Answer options */}
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
