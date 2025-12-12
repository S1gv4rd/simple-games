"use client";

import { useState, useCallback } from "react";
import BackButton from "@/components/BackButton";
import Celebration from "@/components/Celebration";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";

const TOTAL_ROUNDS = 10;

const patternSets = [
  ["🔴", "🔵"],
  ["🟡", "🟢"],
  ["⭐", "🌙"],
  ["🍎", "🍊"],
  ["🐶", "🐱"],
  ["❤️", "💙"],
  ["🌸", "🌻"],
  ["⚽", "🏀"],
  ["🦋", "🐝"],
  ["🌈", "☀️"],
];

function generateQuestion() {
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
  const options = [selected.next];
  const wrongOption = selected.next === a ? b : a;
  options.push(wrongOption);

  // Add a random third option from another set
  const otherSet = patternSets.filter(s => s[0] !== a && s[1] !== a)[0];
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

  const handleAnswer = useCallback((answer: string) => {
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
      <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-purple/10 to-blue/10">
        <BackButton />
        <span className="text-8xl mb-6">🧩</span>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-purple">
          Patterns Game
        </h1>
        <p className="text-xl md:text-2xl text-center mb-8 text-foreground/70">
          Complete the pattern!
        </p>
        <button
          onClick={startGame}
          className="game-button bg-purple text-white text-2xl font-bold py-6 px-12 rounded-2xl shadow-lg"
        >
          Start Playing!
        </button>
      </main>
    );
  }

  // Game complete screen
  if (gameComplete) {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-purple/10 to-blue/10">
        <BackButton />
        <span className="text-8xl mb-6 celebrate">🎉</span>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-purple">
          Brilliant!
        </h1>
        <p className="text-2xl md:text-3xl text-center mb-2 text-foreground">
          You got <span className="text-purple font-bold">{score}</span> out of <span className="font-bold">{TOTAL_ROUNDS}</span>!
        </p>
        <div className="text-5xl my-6">
          {score === TOTAL_ROUNDS ? "🌟🌟🌟" : score >= 7 ? "🌟🌟" : score >= 4 ? "🌟" : "💪"}
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
          ⭐ {score}
        </span>
      </div>

      <h1 className="text-2xl md:text-4xl font-bold text-center mb-6 text-purple">
        What comes next?
      </h1>

      {/* Pattern display */}
      <div className={`bg-white rounded-3xl p-6 shadow-lg mb-8 flex items-center gap-2 md:gap-4 ${shake ? "wiggle" : ""}`}>
        {question.pattern.map((item, index) => (
          <span key={index} className="text-4xl md:text-6xl pop-in" style={{ animationDelay: `${index * 0.1}s` }}>
            {item}
          </span>
        ))}
        <span className="text-4xl md:text-6xl text-gray-300">❓</span>
      </div>

      {/* Options */}
      <div className="flex gap-4 md:gap-6">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(option)}
            className="game-button bg-white text-6xl md:text-7xl p-6 md:p-8 rounded-3xl shadow-lg hover:shadow-xl hover:scale-105 transition-all border-4 border-purple/30 hover:border-purple"
          >
            {option}
          </button>
        ))}
      </div>
    </main>
  );
}
