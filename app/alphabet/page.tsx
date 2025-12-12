"use client";

import { useState, useCallback } from "react";
import BackButton from "@/components/BackButton";
import Celebration from "@/components/Celebration";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";

const TOTAL_ROUNDS = 10;

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

function generateQuestion() {
  const targetLetter = letters[Math.floor(Math.random() * letters.length)];

  // Generate 3 wrong options
  const options = [targetLetter];
  while (options.length < 4) {
    const wrong = letters[Math.floor(Math.random() * letters.length)];
    if (!options.includes(wrong)) {
      options.push(wrong);
    }
  }

  // Shuffle
  options.sort(() => Math.random() - 0.5);

  return { targetLetter, options };
}

export default function AlphabetGame() {
  const [started, setStarted] = useState(false);
  const [question, setQuestion] = useState(generateQuestion);
  const [showCelebration, setShowCelebration] = useState(false);
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [gameComplete, setGameComplete] = useState(false);

  const { word, color } = letterData[question.targetLetter];

  const handleAnswer = useCallback((answer: string) => {
    if (answer === question.targetLetter) {
      playCorrectSound();
      setShowCelebration(true);
      setScore((s) => s + 1);
    } else {
      playWrongSound();
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }, [question.targetLetter]);

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
      <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-blue/10 to-green/10">
        <BackButton />
        <div className="text-7xl font-bold mb-6 text-blue pop-in">ABC</div>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-blue pop-in" style={{ animationDelay: "0.1s" }}>
          Alphabet Game
        </h1>
        <p className="text-xl md:text-2xl text-center mb-8 text-foreground/70 pop-in" style={{ animationDelay: "0.2s" }}>
          Match letters to words!
        </p>
        <button
          onClick={startGame}
          className="game-button bg-blue text-white text-2xl font-bold py-6 px-12 rounded-2xl shadow-lg pop-in"
          style={{ animationDelay: "0.3s" }}
        >
          Start!
        </button>
      </main>
    );
  }

  // Game complete screen
  if (gameComplete) {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-blue/10 to-green/10">
        <BackButton />
        <div className="text-6xl font-bold mb-6 celebrate text-green">Amazing!</div>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-blue">
          Great Job!
        </h1>
        <p className="text-2xl md:text-3xl text-center mb-2 text-foreground">
          You got <span className="text-blue font-bold">{score}</span> out of <span className="font-bold">{TOTAL_ROUNDS}</span>!
        </p>
        <div className="flex gap-2 my-6">
          {Array.from({ length: score === TOTAL_ROUNDS ? 3 : score >= 7 ? 2 : 1 }).map((_, i) => (
            <div key={i} className="w-8 h-8 bg-yellow rounded-full shadow-md" />
          ))}
        </div>
        <button
          onClick={() => setStarted(false)}
          className="game-button bg-blue text-white text-2xl font-bold py-6 px-12 rounded-2xl shadow-lg mt-4"
        >
          Play Again
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-blue/10 to-green/10">
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

      <h1 className="text-2xl md:text-4xl font-bold text-center mb-4 text-blue">
        What letter does <span className="text-purple">{word}</span> start with?
      </h1>

      {/* Word display */}
      <div
        className={`bg-white rounded-3xl p-8 shadow-lg mb-8 flex flex-col items-center ${shake ? "wiggle" : ""}`}
      >
        <div
          className="text-8xl md:text-9xl mb-4 pop-in font-bold"
          style={{ color }}
        >
          {question.targetLetter}
        </div>
        <span className="text-3xl md:text-4xl font-bold text-foreground">
          <span className="text-purple text-4xl md:text-5xl">{question.targetLetter}</span>
          {word.slice(1).toLowerCase()}
        </span>
      </div>

      {/* Letter options */}
      <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
        {question.options.map((letter) => (
          <button
            key={letter}
            onClick={() => handleAnswer(letter)}
            className="game-button bg-purple text-white text-5xl md:text-7xl font-bold py-8 md:py-10 rounded-3xl shadow-lg hover:bg-purple/90 active:scale-95 transition-all"
          >
            {letter}
          </button>
        ))}
      </div>
    </main>
  );
}
