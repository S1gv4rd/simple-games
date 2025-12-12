"use client";

import { useState, useCallback } from "react";
import BackButton from "@/components/BackButton";
import Celebration from "@/components/Celebration";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";

const TOTAL_ROUNDS = 10;

const letterData: Record<string, { word: string; emoji: string }> = {
  A: { word: "Apple", emoji: "🍎" },
  B: { word: "Ball", emoji: "⚽" },
  C: { word: "Cat", emoji: "🐱" },
  D: { word: "Dog", emoji: "🐶" },
  E: { word: "Elephant", emoji: "🐘" },
  F: { word: "Fish", emoji: "🐟" },
  G: { word: "Grapes", emoji: "🍇" },
  H: { word: "Hat", emoji: "🎩" },
  I: { word: "Ice cream", emoji: "🍦" },
  J: { word: "Juice", emoji: "🧃" },
  K: { word: "Kite", emoji: "🪁" },
  L: { word: "Lion", emoji: "🦁" },
  M: { word: "Moon", emoji: "🌙" },
  N: { word: "Nest", emoji: "🪺" },
  O: { word: "Orange", emoji: "🍊" },
  P: { word: "Pig", emoji: "🐷" },
  Q: { word: "Queen", emoji: "👸" },
  R: { word: "Rainbow", emoji: "🌈" },
  S: { word: "Sun", emoji: "☀️" },
  T: { word: "Tree", emoji: "🌳" },
  U: { word: "Umbrella", emoji: "☂️" },
  V: { word: "Violin", emoji: "🎻" },
  W: { word: "Whale", emoji: "🐋" },
  X: { word: "Xylophone", emoji: "🎵" },
  Y: { word: "Yo-yo", emoji: "🪀" },
  Z: { word: "Zebra", emoji: "🦓" },
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

  const { word, emoji } = letterData[question.targetLetter];

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
        <span className="text-8xl mb-6">🔤</span>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-blue">
          Alphabet Game
        </h1>
        <p className="text-xl md:text-2xl text-center mb-8 text-foreground/70">
          Match letters to words!
        </p>
        <button
          onClick={startGame}
          className="game-button bg-blue text-white text-2xl font-bold py-6 px-12 rounded-2xl shadow-lg"
        >
          Start Playing!
        </button>
      </main>
    );
  }

  // Game complete screen
  if (gameComplete) {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-blue/10 to-green/10">
        <BackButton />
        <span className="text-8xl mb-6 celebrate">🎉</span>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-blue">
          Amazing!
        </h1>
        <p className="text-2xl md:text-3xl text-center mb-2 text-foreground">
          You got <span className="text-blue font-bold">{score}</span> out of <span className="font-bold">{TOTAL_ROUNDS}</span>!
        </p>
        <div className="text-5xl my-6">
          {score === TOTAL_ROUNDS ? "🌟🌟🌟" : score >= 7 ? "🌟🌟" : score >= 4 ? "🌟" : "💪"}
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
          ⭐ {score}
        </span>
      </div>

      <h1 className="text-2xl md:text-4xl font-bold text-center mb-4 text-blue">
        What letter does <span className="text-purple">{word}</span> start with?
      </h1>

      {/* Word display */}
      <div
        className={`bg-white rounded-3xl p-8 shadow-lg mb-8 flex flex-col items-center ${shake ? "wiggle" : ""}`}
      >
        <span className="text-8xl md:text-9xl mb-4 pop-in">{emoji}</span>
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
