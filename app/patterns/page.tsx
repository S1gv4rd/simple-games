"use client";

import { useState, useCallback } from "react";
import BackButton from "@/components/BackButton";
import Celebration from "@/components/Celebration";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";

const TOTAL_ROUNDS = 10;

// Pattern sets using colored shapes instead of emojis
const patternSets = [
  [{ shape: "circle", color: "#ef476f" }, { shape: "circle", color: "#00bbf9" }],
  [{ shape: "square", color: "#fee440" }, { shape: "square", color: "#00f5d4" }],
  [{ shape: "star", color: "#9b5de5" }, { shape: "star", color: "#ff9e00" }],
  [{ shape: "triangle", color: "#ef476f" }, { shape: "triangle", color: "#ff9e00" }],
  [{ shape: "heart", color: "#ff6b9d" }, { shape: "heart", color: "#9b5de5" }],
  [{ shape: "diamond", color: "#00bbf9" }, { shape: "diamond", color: "#fee440" }],
  [{ shape: "circle", color: "#ff9e00" }, { shape: "square", color: "#00f5d4" }],
  [{ shape: "star", color: "#ef476f" }, { shape: "heart", color: "#00bbf9" }],
  [{ shape: "triangle", color: "#9b5de5" }, { shape: "diamond", color: "#fee440" }],
  [{ shape: "square", color: "#ff6b9d" }, { shape: "circle", color: "#00f5d4" }],
];

type ShapeItem = { shape: string; color: string };

function generateQuestion(): {
  pattern: ShapeItem[];
  correctAnswer: ShapeItem;
  options: ShapeItem[];
} {
  const patternSet = patternSets[Math.floor(Math.random() * patternSets.length)];
  const [a, b] = patternSet;

  // Generate pattern types: AB, AAB, ABB, AABB
  const patternTypes = [
    { pattern: [a, b, a, b], next: a },
    { pattern: [a, a, b, a, a], next: b },
    { pattern: [a, b, b, a, b], next: b },
    { pattern: [a, a, b, b, a, a], next: b },
    { pattern: [a, b, a, b, a], next: b },
    { pattern: [b, a, b, a, b], next: a },
  ];

  const selected = patternTypes[Math.floor(Math.random() * patternTypes.length)];

  // Generate options including the correct answer
  const options: ShapeItem[] = [selected.next];
  // Compare by shape+color since objects can't be compared by reference
  const isNextA = selected.next.shape === a.shape && selected.next.color === a.color;
  const wrongOption = isNextA ? b : a;
  options.push(wrongOption);

  // Add a random third option from another set
  const otherSet = patternSets.filter(s =>
    !(s[0].shape === a.shape && s[0].color === a.color) &&
    !(s[1].shape === a.shape && s[1].color === a.color)
  )[0];
  if (otherSet) {
    options.push(otherSet[Math.floor(Math.random() * 2)]);
  }

  return {
    pattern: selected.pattern,
    correctAnswer: selected.next,
    options: options.sort(() => Math.random() - 0.5),
  };
}

export default function PatternsGame() {
  const [started, setStarted] = useState(false);
  const [question, setQuestion] = useState(generateQuestion);
  const [showCelebration, setShowCelebration] = useState(false);
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [gameComplete, setGameComplete] = useState(false);

  // Helper to render shape SVG
  const renderShape = (item: ShapeItem, size: string = "w-10 h-10") => (
    <svg viewBox="0 0 100 100" className={size}>
      {item.shape === "circle" && <circle cx="50" cy="50" r="45" fill={item.color} />}
      {item.shape === "square" && <rect x="5" y="5" width="90" height="90" rx="8" fill={item.color} />}
      {item.shape === "triangle" && <polygon points="50,5 95,95 5,95" fill={item.color} />}
      {item.shape === "star" && <polygon points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40" fill={item.color} />}
      {item.shape === "heart" && <path d="M50,88 C20,60 5,40 15,25 C25,10 45,15 50,30 C55,15 75,10 85,25 C95,40 80,60 50,88 Z" fill={item.color} />}
      {item.shape === "diamond" && <polygon points="50,5 95,50 50,95 5,50" fill={item.color} />}
    </svg>
  );

  const handleAnswer = useCallback((answer: ShapeItem) => {
    if (answer.shape === question.correctAnswer.shape && answer.color === question.correctAnswer.color) {
      playCorrectSound();
      setShowCelebration(true);
      setScore((s) => s + 1);
    } else {
      playWrongSound();
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }, [question.correctAnswer.shape, question.correctAnswer.color]);

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
      <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-purple/10 to-blue/10">
        <BackButton />
        <div className="flex gap-2 mb-6 pop-in">
          {renderShape({ shape: "circle", color: "#9b5de5" }, "w-10 h-10")}
          {renderShape({ shape: "circle", color: "#00bbf9" }, "w-10 h-10")}
          {renderShape({ shape: "circle", color: "#9b5de5" }, "w-10 h-10")}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-purple pop-in" style={{ animationDelay: "0.1s" }}>
          Patterns Game
        </h1>
        <p className="text-xl md:text-2xl text-center mb-8 text-foreground/70 pop-in" style={{ animationDelay: "0.2s" }}>
          Complete the pattern!
        </p>
        <button
          onClick={startGame}
          className="game-button bg-purple text-white text-2xl font-bold py-6 px-12 rounded-2xl shadow-lg pop-in"
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
      <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-purple/10 to-blue/10">
        <BackButton />
        <div className="text-6xl font-bold mb-6 celebrate text-green">Brilliant!</div>
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
          onClick={() => setStarted(false)}
          className="game-button bg-purple text-white text-2xl font-bold py-6 px-12 rounded-2xl shadow-lg mt-4"
        >
          Play Again
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-purple/10 to-blue/10">
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

      <h1 className="text-2xl md:text-4xl font-bold text-center mb-6 text-purple">
        What comes next?
      </h1>

      {/* Pattern display */}
      <div className={`bg-white rounded-3xl p-6 shadow-lg mb-8 flex items-center gap-2 md:gap-4 ${shake ? "wiggle" : ""}`}>
        {question.pattern.map((item, index) => (
          <div key={index} className="pop-in" style={{ animationDelay: `${index * 0.1}s` }}>
            {renderShape(item, "w-12 h-12 md:w-16 md:h-16")}
          </div>
        ))}
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl border-4 border-dashed border-gray-300 flex items-center justify-center">
          <span className="text-2xl text-gray-300 font-bold">?</span>
        </div>
      </div>

      {/* Options */}
      <div className="flex gap-4 md:gap-6">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(option)}
            className="game-button bg-white p-4 md:p-6 rounded-3xl shadow-lg hover:shadow-xl hover:scale-105 transition-all border-4 border-purple/30 hover:border-purple"
          >
            {renderShape(option, "w-14 h-14 md:w-16 md:h-16")}
          </button>
        ))}
      </div>
    </main>
  );
}
