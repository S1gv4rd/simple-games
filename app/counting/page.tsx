"use client";

import { useState, useCallback } from "react";
import BackButton from "@/components/BackButton";
import Celebration from "@/components/Celebration";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";

const TOTAL_ROUNDS = 10;
// Colored shapes for counting instead of emojis
const countingShapes = [
  { shape: "circle", color: "#ef476f" },
  { shape: "square", color: "#00bbf9" },
  { shape: "triangle", color: "#fee440" },
  { shape: "diamond", color: "#9b5de5" },
  { shape: "star", color: "#00f5d4" },
  { shape: "heart", color: "#ff6b9d" },
];

function getRandomShape() {
  return countingShapes[Math.floor(Math.random() * countingShapes.length)];
}

type Difficulty = "easy" | "medium" | "hard";
const difficultyRanges: Record<Difficulty, { min: number; max: number }> = {
  easy: { min: 1, max: 3 },
  medium: { min: 1, max: 5 },
  hard: { min: 1, max: 10 },
};

function generateQuestion(difficulty: Difficulty) {
  const { min, max } = difficultyRanges[difficulty];
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shapeItem = getRandomShape();

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

  return { count, shape: shapeItem, options };
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
        <div className="text-7xl font-bold mb-6 text-purple pop-in">123</div>
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
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-purple/10 to-pink/10">
        <BackButton />
        <div className="text-6xl font-bold mb-6 celebrate text-green">Great!</div>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-purple">
          Great Job!
        </h1>
        <p className="text-2xl md:text-3xl text-center mb-2 text-foreground">
          You got <span className="text-purple font-bold">{score}</span> out of <span className="font-bold">{TOTAL_ROUNDS}</span>!
        </p>
        <div className="flex gap-2 my-6">
          {Array.from({ length: score === TOTAL_ROUNDS ? 3 : score >= 7 ? 2 : 1 }).map((_, i) => (
            <div key={i} className="w-8 h-8 bg-yellow rounded-full shadow-md" />
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
    <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-purple/10 to-pink/10">
      <BackButton />
      <Celebration show={showCelebration} onComplete={handleCelebrationComplete} />

      <div className="flex justify-between w-full max-w-2xl mb-4">
        <span className="bg-white/80 text-foreground px-4 py-2 rounded-full font-bold text-lg">
          Round {round}/{TOTAL_ROUNDS}
        </span>
        <span className="bg-yellow text-foreground px-4 py-2 rounded-full font-bold text-lg">
          {score} pts
        </span>
      </div>

      <h1 className="text-3xl md:text-5xl font-bold text-center mb-8 text-purple">
        How many shapes?
      </h1>

      {/* Shapes display */}
      <div
        className={`bg-white rounded-3xl p-8 shadow-lg mb-8 min-h-[150px] flex items-center justify-center flex-wrap gap-4 max-w-md ${shake ? "wiggle" : ""}`}
      >
        {Array.from({ length: question.count }, (_, i) => (
          <svg
            key={i}
            viewBox="0 0 100 100"
            className="w-14 h-14 md:w-20 md:h-20 pop-in"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {question.shape.shape === "circle" && (
              <circle cx="50" cy="50" r="45" fill={question.shape.color} />
            )}
            {question.shape.shape === "square" && (
              <rect x="5" y="5" width="90" height="90" rx="8" fill={question.shape.color} />
            )}
            {question.shape.shape === "triangle" && (
              <polygon points="50,5 95,95 5,95" fill={question.shape.color} />
            )}
            {question.shape.shape === "diamond" && (
              <polygon points="50,5 95,50 50,95 5,50" fill={question.shape.color} />
            )}
            {question.shape.shape === "star" && (
              <polygon points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40" fill={question.shape.color} />
            )}
            {question.shape.shape === "heart" && (
              <path d="M50,88 C20,60 5,40 15,25 C25,10 45,15 50,30 C55,15 75,10 85,25 C95,40 80,60 50,88 Z" fill={question.shape.color} />
            )}
          </svg>
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
