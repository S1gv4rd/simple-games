"use client";

import { useState, useCallback } from "react";
import BackButton from "@/components/BackButton";
import Celebration from "@/components/Celebration";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";

const TOTAL_ROUNDS = 10;

// Items with relative sizes for comparison (1-10 scale)
const sortableItems = [
  { name: "Elephant", size: 10, color: "#9b5de5" },
  { name: "Mouse", size: 1, color: "#ff6b9d" },
  { name: "Dog", size: 5, color: "#ff9e00" },
  { name: "Cat", size: 4, color: "#fee440" },
  { name: "Bear", size: 9, color: "#00f5d4" },
  { name: "Bunny", size: 3, color: "#ef476f" },
  { name: "Lion", size: 8, color: "#fee440" },
  { name: "Frog", size: 2, color: "#00f5d4" },
  { name: "Butterfly", size: 1, color: "#ff6b9d" },
  { name: "Turtle", size: 3, color: "#00bbf9" },
  { name: "House", size: 10, color: "#ef476f" },
  { name: "Castle", size: 10, color: "#9b5de5" },
  { name: "Ball", size: 4, color: "#00bbf9" },
  { name: "Tennis ball", size: 2, color: "#fee440" },
  { name: "Apple", size: 2, color: "#ef476f" },
  { name: "Grape", size: 1, color: "#9b5de5" },
];

type SortType = "size" | "speed";

function generateQuestion(): { items: typeof sortableItems; correctAnswer: "first" | "second"; sortType: SortType; question: string } {
  // Pick two items with different sizes
  let shuffled = [...sortableItems].sort(() => Math.random() - 0.5);
  let item1 = shuffled[0];
  let item2 = shuffled.find(item => item.size !== item1.size) || shuffled[1];

  const sortType: SortType = "size";
  const askBigger = Math.random() > 0.5;

  // Determine which is actually bigger based on size property
  const firstIsBigger = item1.size > item2.size;

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
        <div className="flex items-end gap-2 mb-6 pop-in">
          <div className="w-8 h-8 bg-green rounded-lg" />
          <div className="w-12 h-16 bg-green rounded-lg" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-green pop-in" style={{ animationDelay: "0.1s" }}>
          Sorting Game
        </h1>
        <p className="text-xl md:text-2xl text-center mb-8 text-foreground/70 pop-in" style={{ animationDelay: "0.2s" }}>
          Which is bigger or smaller?
        </p>
        <button
          onClick={startGame}
          className="game-button bg-green text-white text-2xl font-bold py-6 px-12 rounded-2xl shadow-lg pop-in"
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
      <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-green/10 to-blue/10">
        <BackButton />
        <div className="text-6xl font-bold mb-6 celebrate text-green">Super!</div>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-green">
          Great Job!
        </h1>
        <p className="text-2xl md:text-3xl text-center mb-2 text-foreground">
          You got <span className="text-green font-bold">{score}</span> out of <span className="font-bold">{TOTAL_ROUNDS}</span>!
        </p>
        <div className="flex gap-2 my-6">
          {Array.from({ length: score === TOTAL_ROUNDS ? 3 : score >= 7 ? 2 : 1 }).map((_, i) => (
            <div key={i} className="w-8 h-8 bg-yellow rounded-full shadow-md" />
          ))}
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
          {score} pts
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
            <div
              className="mb-4 rounded-2xl flex items-center justify-center"
              style={{
                width: `${60 + item.size * 8}px`,
                height: `${60 + item.size * 8}px`,
                backgroundColor: item.color,
              }}
            >
              <span className="text-white font-bold text-2xl md:text-3xl">
                {item.name.charAt(0)}
              </span>
            </div>
            <span className="text-xl md:text-2xl font-bold text-foreground">{item.name}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
