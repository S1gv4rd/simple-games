"use client";

import { useState, useCallback } from "react";
import BackButton from "@/components/BackButton";
import Celebration from "@/components/Celebration";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";

const TOTAL_ROUNDS = 10;

type GameMode = "colors" | "shapes";

const colors = [
  { name: "Red", hex: "#ef476f", emoji: "❤️" },
  { name: "Orange", hex: "#ff9e00", emoji: "🧡" },
  { name: "Yellow", hex: "#fee440", emoji: "💛" },
  { name: "Green", hex: "#00f5d4", emoji: "💚" },
  { name: "Blue", hex: "#00bbf9", emoji: "💙" },
  { name: "Purple", hex: "#9b5de5", emoji: "💜" },
  { name: "Pink", hex: "#ff6b9d", emoji: "🩷" },
];

const shapes = [
  { name: "Circle", emoji: "⚫", svg: "M50,50 m-40,0 a40,40 0 1,0 80,0 a40,40 0 1,0 -80,0" },
  { name: "Square", emoji: "⬛", svg: "M15,15 h70 v70 h-70 z" },
  { name: "Triangle", emoji: "🔺", svg: "M50,10 L90,90 L10,90 Z" },
  { name: "Star", emoji: "⭐", svg: "M50,5 L61,40 L98,40 L68,62 L79,97 L50,75 L21,97 L32,62 L2,40 L39,40 Z" },
  { name: "Heart", emoji: "❤️", svg: "M50,88 C20,60 5,40 15,25 C25,10 45,15 50,30 C55,15 75,10 85,25 C95,40 80,60 50,88 Z" },
];

function generateColorQuestion() {
  const targetColor = colors[Math.floor(Math.random() * colors.length)];
  const options = [targetColor];

  while (options.length < 4) {
    const other = colors[Math.floor(Math.random() * colors.length)];
    if (!options.find((o) => o.name === other.name)) {
      options.push(other);
    }
  }

  options.sort(() => Math.random() - 0.5);
  return { target: targetColor, options, mode: "colors" as GameMode };
}

function generateShapeQuestion() {
  const targetShape = shapes[Math.floor(Math.random() * shapes.length)];
  const options = [targetShape];

  while (options.length < 4) {
    const other = shapes[Math.floor(Math.random() * shapes.length)];
    if (!options.find((o) => o.name === other.name)) {
      options.push(other);
    }
  }

  options.sort(() => Math.random() - 0.5);
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  return { target: targetShape, options, mode: "shapes" as GameMode, color: randomColor };
}

function generateQuestion() {
  return Math.random() > 0.5 ? generateColorQuestion() : generateShapeQuestion();
}

export default function ColorsGame() {
  const [started, setStarted] = useState(false);
  const [question, setQuestion] = useState(generateQuestion);
  const [showCelebration, setShowCelebration] = useState(false);
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [gameComplete, setGameComplete] = useState(false);

  const handleAnswer = useCallback((answer: string) => {
    if (answer === question.target.name) {
      playCorrectSound();
      setShowCelebration(true);
      setScore((s) => s + 1);
    } else {
      playWrongSound();
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }, [question.target.name]);

  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
    if (round >= TOTAL_ROUNDS) {
      setGameComplete(true);
    } else {
      setRound((r) => r + 1);
      setQuestion(generateQuestion());
    }
  }, [round]);

  const startGame = () => {
    setStarted(true);
    setQuestion(generateQuestion());
    setScore(0);
    setRound(1);
    setGameComplete(false);
  };

  // Start screen
  if (!started) {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-pink/10 to-yellow/10">
        <BackButton />
        <span className="text-8xl mb-6">🎨</span>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-pink">
          Colors & Shapes
        </h1>
        <p className="text-xl md:text-2xl text-center mb-8 text-foreground/70">
          Identify colors and shapes!
        </p>
        <button
          onClick={startGame}
          className="game-button bg-pink text-white text-2xl font-bold py-6 px-12 rounded-2xl shadow-lg"
        >
          Start Playing!
        </button>
      </main>
    );
  }

  // Game complete screen
  if (gameComplete) {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-pink/10 to-yellow/10">
        <BackButton />
        <span className="text-8xl mb-6 celebrate">🎉</span>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-pink">
          Wonderful!
        </h1>
        <p className="text-2xl md:text-3xl text-center mb-2 text-foreground">
          You got <span className="text-pink font-bold">{score}</span> out of <span className="font-bold">{TOTAL_ROUNDS}</span>!
        </p>
        <div className="text-5xl my-6">
          {score === TOTAL_ROUNDS ? "🌟🌟🌟" : score >= 7 ? "🌟🌟" : score >= 4 ? "🌟" : "💪"}
        </div>
        <button
          onClick={() => setStarted(false)}
          className="game-button bg-pink text-white text-2xl font-bold py-6 px-12 rounded-2xl shadow-lg mt-4"
        >
          Play Again
        </button>
      </main>
    );
  }

  const isColorMode = question.mode === "colors";

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-pink/10 to-yellow/10">
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

      <h1 className="text-3xl md:text-5xl font-bold text-center mb-8 text-pink">
        {isColorMode ? "What color is this?" : "What shape is this?"}
      </h1>

      {/* Display */}
      <div
        className={`bg-white rounded-3xl p-8 shadow-lg mb-8 flex items-center justify-center ${shake ? "wiggle" : ""}`}
      >
        {isColorMode ? (
          <div
            className="w-32 h-32 md:w-48 md:h-48 rounded-full pop-in shadow-lg"
            style={{ backgroundColor: (question.target as typeof colors[0]).hex }}
          />
        ) : (
          <svg viewBox="0 0 100 100" className="w-32 h-32 md:w-48 md:h-48 pop-in">
            <path
              d={(question.target as typeof shapes[0]).svg}
              fill={(question as { color: typeof colors[0] }).color.hex}
            />
          </svg>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-6 w-full max-w-xl">
        {question.options.map((option) => (
          <button
            key={option.name}
            onClick={() => handleAnswer(option.name)}
            className="game-button bg-white text-foreground text-2xl md:text-3xl font-bold py-6 md:py-8 px-6 rounded-3xl shadow-lg hover:shadow-xl active:scale-95 transition-all border-4 border-pink/30 hover:border-pink"
          >
            {isColorMode ? (
              <div className="flex items-center gap-4 justify-center">
                <div
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full"
                  style={{ backgroundColor: (option as typeof colors[0]).hex }}
                />
                <span>{option.name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-4 justify-center">
                <span className="text-4xl md:text-5xl">{(option as typeof shapes[0]).emoji}</span>
                <span>{option.name}</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </main>
  );
}
