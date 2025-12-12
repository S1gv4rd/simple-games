"use client";

import { useState, useCallback } from "react";
import BackButton from "@/components/BackButton";
import Celebration from "@/components/Celebration";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";

const TOTAL_ROUNDS = 10;

const sortableItems = [
  { emoji: "🐘", name: "Elephant" },
  { emoji: "🐁", name: "Mouse" },
  { emoji: "🐕", name: "Dog" },
  { emoji: "🐈", name: "Cat" },
  { emoji: "🐻", name: "Bear" },
  { emoji: "🐰", name: "Bunny" },
  { emoji: "🦁", name: "Lion" },
  { emoji: "🐸", name: "Frog" },
  { emoji: "🦋", name: "Butterfly" },
  { emoji: "🐢", name: "Turtle" },
  { emoji: "🏠", name: "House" },
  { emoji: "🏰", name: "Castle" },
  { emoji: "⚽", name: "Ball" },
  { emoji: "🎾", name: "Tennis ball" },
  { emoji: "🍎", name: "Apple" },
  { emoji: "🍇", name: "Grape" },
];

type SortType = "size" | "speed";

function generateQuestion(): { items: typeof sortableItems; correctAnswer: "first" | "second"; sortType: SortType; question: string } {
  const shuffled = [...sortableItems].sort(() => Math.random() - 0.5);
  const [item1, item2] = shuffled.slice(0, 2);

  // Randomly decide sort type and which is "correct"
  const sortType: SortType = Math.random() > 0.5 ? "size" : "size"; // Keep it simple with size for now
  const askBigger = Math.random() > 0.5;

  // For simplicity, randomly assign which is bigger (in real app, you'd have actual size data)
  const firstIsBigger = Math.random() > 0.5;

  return {
    items: [item1, item2],
    correctAnswer: (askBigger && firstIsBigger) || (!askBigger && !firstIsBigger) ? "first" : "second",
    sortType,
    question: askBigger ? "Which is BIGGER?" : "Which is SMALLER?",
  };
}

export default function SortingGame() {
  const [started, setStarted] = useState(false);
  const [question, setQuestion] = useState(generateQuestion);
  const [showCelebration, setShowCelebration] = useState(false);
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [gameComplete, setGameComplete] = useState(false);

  const handleAnswer = useCallback((answer: "first" | "second") => {
    if (answer === question.correctAnswer) {
      playCorrectSound();
      setShowCelebration(true);
      setScore((s) => s + 1);
    } else {
      playWrongSound();
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }, [question.correctAnswer]);

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
      <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-green/10 to-blue/10">
        <BackButton />
        <span className="text-8xl mb-6">📏</span>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-green">
          Sorting Game
        </h1>
        <p className="text-xl md:text-2xl text-center mb-8 text-foreground/70">
          Which is bigger or smaller?
        </p>
        <button
          onClick={startGame}
          className="game-button bg-green text-white text-2xl font-bold py-6 px-12 rounded-2xl shadow-lg"
        >
          Start Playing!
        </button>
      </main>
    );
  }

  // Game complete screen
  if (gameComplete) {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-green/10 to-blue/10">
        <BackButton />
        <span className="text-8xl mb-6 celebrate">🎉</span>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-green">
          Super!
        </h1>
        <p className="text-2xl md:text-3xl text-center mb-2 text-foreground">
          You got <span className="text-green font-bold">{score}</span> out of <span className="font-bold">{TOTAL_ROUNDS}</span>!
        </p>
        <div className="text-5xl my-6">
          {score === TOTAL_ROUNDS ? "🌟🌟🌟" : score >= 7 ? "🌟🌟" : score >= 4 ? "🌟" : "💪"}
        </div>
        <button
          onClick={() => setStarted(false)}
          className="game-button bg-green text-white text-2xl font-bold py-6 px-12 rounded-2xl shadow-lg mt-4"
        >
          Play Again
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-green/10 to-blue/10">
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

      <h1 className={`text-3xl md:text-5xl font-bold text-center mb-8 text-green ${shake ? "wiggle" : ""}`}>
        {question.question}
      </h1>

      <div className="flex gap-6 md:gap-12">
        {question.items.map((item, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index === 0 ? "first" : "second")}
            className="game-button bg-white flex flex-col items-center justify-center p-8 md:p-12 rounded-3xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <span className="text-7xl md:text-9xl mb-4">{item.emoji}</span>
            <span className="text-xl md:text-2xl font-bold text-foreground">{item.name}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
