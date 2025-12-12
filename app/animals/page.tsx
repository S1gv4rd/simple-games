"use client";

import { useState, useCallback, useEffect } from "react";
import BackButton from "@/components/BackButton";
import Celebration from "@/components/Celebration";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";

const TOTAL_ROUNDS = 10;

const animalSounds = [
  { emoji: "🐶", name: "Dog", sound: "Woof!", soundFile: "bark" },
  { emoji: "🐱", name: "Cat", sound: "Meow!", soundFile: "meow" },
  { emoji: "🐮", name: "Cow", sound: "Moo!", soundFile: "moo" },
  { emoji: "🐷", name: "Pig", sound: "Oink!", soundFile: "oink" },
  { emoji: "🐸", name: "Frog", sound: "Ribbit!", soundFile: "ribbit" },
  { emoji: "🦁", name: "Lion", sound: "Roar!", soundFile: "roar" },
  { emoji: "🐔", name: "Chicken", sound: "Cluck!", soundFile: "cluck" },
  { emoji: "🦆", name: "Duck", sound: "Quack!", soundFile: "quack" },
  { emoji: "🐑", name: "Sheep", sound: "Baa!", soundFile: "baa" },
  { emoji: "🐴", name: "Horse", sound: "Neigh!", soundFile: "neigh" },
  { emoji: "🦉", name: "Owl", sound: "Hoot!", soundFile: "hoot" },
  { emoji: "🐝", name: "Bee", sound: "Buzz!", soundFile: "buzz" },
];

function generateQuestion() {
  const shuffled = [...animalSounds].sort(() => Math.random() - 0.5);
  const target = shuffled[0];
  const options = shuffled.slice(0, 4);

  // Make sure target is in options
  if (!options.find(o => o.emoji === target.emoji)) {
    options[3] = target;
  }

  return {
    target,
    options: options.sort(() => Math.random() - 0.5),
  };
}

// Simple text-to-speech for animal sounds
function speakSound(sound: string) {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(sound);
    utterance.rate = 0.8;
    utterance.pitch = 1.2;
    speechSynthesis.speak(utterance);
  }
}

export default function AnimalsGame() {
  const [started, setStarted] = useState(false);
  const [question, setQuestion] = useState(generateQuestion);
  const [showCelebration, setShowCelebration] = useState(false);
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [gameComplete, setGameComplete] = useState(false);

  // Play sound when question changes
  useEffect(() => {
    if (started && !gameComplete) {
      const timer = setTimeout(() => {
        speakSound(question.target.sound);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [question, started, gameComplete]);

  const handleAnswer = useCallback((answer: string) => {
    if (answer === question.target.emoji) {
      playCorrectSound();
      setShowCelebration(true);
      setScore((s) => s + 1);
    } else {
      playWrongSound();
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }, [question.target.emoji]);

  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
    if (round >= TOTAL_ROUNDS) {
      setGameComplete(true);
    } else {
      setRound((r) => r + 1);
      setQuestion(generateQuestion());
    }
  }, [round]);

  const replaySound = () => {
    speakSound(question.target.sound);
  };

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
      <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-yellow/10 to-orange/10">
        <BackButton />
        <span className="text-8xl mb-6">🔊</span>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-yellow">
          Animal Sounds
        </h1>
        <p className="text-xl md:text-2xl text-center mb-8 text-foreground/70">
          Match the sound to the animal!
        </p>
        <button
          onClick={startGame}
          className="game-button bg-yellow text-foreground text-2xl font-bold py-6 px-12 rounded-2xl shadow-lg"
        >
          Start Playing!
        </button>
      </main>
    );
  }

  // Game complete screen
  if (gameComplete) {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-yellow/10 to-orange/10">
        <BackButton />
        <span className="text-8xl mb-6 celebrate">🎉</span>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-yellow">
          Fantastic!
        </h1>
        <p className="text-2xl md:text-3xl text-center mb-2 text-foreground">
          You got <span className="text-orange font-bold">{score}</span> out of <span className="font-bold">{TOTAL_ROUNDS}</span>!
        </p>
        <div className="text-5xl my-6">
          {score === TOTAL_ROUNDS ? "🌟🌟🌟" : score >= 7 ? "🌟🌟" : score >= 4 ? "🌟" : "💪"}
        </div>
        <button
          onClick={() => setStarted(false)}
          className="game-button bg-yellow text-foreground text-2xl font-bold py-6 px-12 rounded-2xl shadow-lg mt-4"
        >
          Play Again
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-yellow/10 to-orange/10">
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

      <h1 className="text-2xl md:text-4xl font-bold text-center mb-4 text-orange">
        Which animal says...
      </h1>

      {/* Sound display */}
      <button
        onClick={replaySound}
        className={`bg-white rounded-3xl p-8 shadow-lg mb-8 flex flex-col items-center hover:scale-105 transition-all ${shake ? "wiggle" : ""}`}
      >
        <span className="text-6xl mb-2">🔊</span>
        <span className="text-4xl md:text-5xl font-bold text-orange">&quot;{question.target.sound}&quot;</span>
        <span className="text-sm text-foreground/50 mt-2">Tap to hear again</span>
      </button>

      {/* Options */}
      <div className="grid grid-cols-2 gap-4 md:gap-6 w-full max-w-lg">
        {question.options.map((animal) => (
          <button
            key={animal.emoji}
            onClick={() => handleAnswer(animal.emoji)}
            className="game-button bg-white flex flex-col items-center justify-center p-6 md:p-8 rounded-3xl shadow-lg hover:shadow-xl hover:scale-105 transition-all border-4 border-yellow/30 hover:border-yellow"
          >
            <span className="text-5xl md:text-6xl mb-2">{animal.emoji}</span>
            <span className="text-lg md:text-xl font-bold text-foreground">{animal.name}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
