"use client";

import { useState, useCallback } from "react";
import BackButton from "@/components/BackButton";
import Celebration from "@/components/Celebration";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";

const animals = ["🐶", "🐱", "🐰", "🐻", "🦊", "🐸", "🐷", "🐮", "🐵", "🦁"];

function getRandomAnimal() {
  return animals[Math.floor(Math.random() * animals.length)];
}

function generateQuestion() {
  const count = Math.floor(Math.random() * 5) + 1; // 1-5
  const animal = getRandomAnimal();

  // Generate wrong answers
  const options = [count];
  while (options.length < 4) {
    const wrong = Math.floor(Math.random() * 5) + 1;
    if (!options.includes(wrong)) {
      options.push(wrong);
    }
  }

  // Shuffle options
  options.sort(() => Math.random() - 0.5);

  return { count, animal, options };
}

export default function CountingGame() {
  const [question, setQuestion] = useState(generateQuestion);
  const [showCelebration, setShowCelebration] = useState(false);
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);

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
    setQuestion(generateQuestion());
  }, []);

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-purple/10 to-pink/10">
      <BackButton />
      <Celebration show={showCelebration} onComplete={handleCelebrationComplete} />

      <div className="text-right w-full max-w-2xl mb-4">
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
