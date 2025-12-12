"use client";

import { useState, useCallback } from "react";
import BackButton from "@/components/BackButton";
import Celebration from "@/components/Celebration";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";

const TOTAL_ROUNDS = 10;

const numberWords = [
  { num: 1, word: "One", dots: "●" },
  { num: 2, word: "Two", dots: "● ●" },
  { num: 3, word: "Three", dots: "● ● ●" },
  { num: 4, word: "Four", dots: "● ● ● ●" },
  { num: 5, word: "Five", dots: "● ● ● ● ●" },
  { num: 6, word: "Six", dots: "● ● ● ● ● ●" },
  { num: 7, word: "Seven", dots: "● ● ● ● ● ● ●" },
  { num: 8, word: "Eight", dots: "● ● ● ● ● ● ● ●" },
  { num: 9, word: "Nine", dots: "● ● ● ● ● ● ● ● ●" },
  { num: 10, word: "Ten", dots: "● ● ● ● ● ● ● ● ● ●" },
];

type QuestionType = "word-to-number" | "number-to-word" | "dots-to-number";

function generateQuestion(): {
  type: QuestionType;
  display: string;
  correctAnswer: number | string;
  options: (number | string)[];
} {
  const types: QuestionType[] = ["word-to-number", "number-to-word", "dots-to-number"];
  const type = types[Math.floor(Math.random() * types.length)];
  const target = numberWords[Math.floor(Math.random() * numberWords.length)];

  // Generate options
  const generateOptions = (correct: number | string, isNumber: boolean) => {
    const options: (number | string)[] = [correct];
    while (options.length < 4) {
      const random = numberWords[Math.floor(Math.random() * numberWords.length)];
      const value = isNumber ? random.num : random.word;
      if (!options.includes(value)) {
        options.push(value);
      }
    }
    return options.sort(() => Math.random() - 0.5);
  };

  switch (type) {
    case "word-to-number":
      return {
        type,
        display: target.word,
        correctAnswer: target.num,
        options: generateOptions(target.num, true),
      };
    case "number-to-word":
      return {
        type,
        display: String(target.num),
        correctAnswer: target.word,
        options: generateOptions(target.word, false),
      };
    case "dots-to-number":
      return {
        type,
        display: target.dots,
        correctAnswer: target.num,
        options: generateOptions(target.num, true),
      };
  }
}

export default function NumbersGame() {
  const [started, setStarted] = useState(false);
  const [question, setQuestion] = useState(generateQuestion);
  const [showCelebration, setShowCelebration] = useState(false);
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [gameComplete, setGameComplete] = useState(false);

  const handleAnswer = useCallback((answer: number | string) => {
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

  const getQuestionText = () => {
    switch (question.type) {
      case "word-to-number":
        return "What number is this?";
      case "number-to-word":
        return "What is this number called?";
      case "dots-to-number":
        return "How many dots?";
    }
  };

  // Start screen
  if (!started) {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-red/10 to-pink/10">
        <BackButton />
        <span className="text-8xl mb-6">🔢</span>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-red">
          Numbers Game
        </h1>
        <p className="text-xl md:text-2xl text-center mb-8 text-foreground/70">
          Learn numbers 1 to 10!
        </p>
        <button
          onClick={startGame}
          className="game-button bg-red text-white text-2xl font-bold py-6 px-12 rounded-2xl shadow-lg"
        >
          Start Playing!
        </button>
      </main>
    );
  }

  // Game complete screen
  if (gameComplete) {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-red/10 to-pink/10">
        <BackButton />
        <span className="text-8xl mb-6 celebrate">🎉</span>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-red">
          Excellent!
        </h1>
        <p className="text-2xl md:text-3xl text-center mb-2 text-foreground">
          You got <span className="text-red font-bold">{score}</span> out of <span className="font-bold">{TOTAL_ROUNDS}</span>!
        </p>
        <div className="text-5xl my-6">
          {score === TOTAL_ROUNDS ? "🌟🌟🌟" : score >= 7 ? "🌟🌟" : score >= 4 ? "🌟" : "💪"}
        </div>
        <button
          onClick={() => setStarted(false)}
          className="game-button bg-red text-white text-2xl font-bold py-6 px-12 rounded-2xl shadow-lg mt-4"
        >
          Play Again
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-red/10 to-pink/10">
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

      <h1 className="text-2xl md:text-4xl font-bold text-center mb-6 text-red">
        {getQuestionText()}
      </h1>

      {/* Display */}
      <div className={`bg-white rounded-3xl p-8 shadow-lg mb-8 min-w-[200px] text-center ${shake ? "wiggle" : ""}`}>
        <span className={`font-bold text-red ${question.type === "dots-to-number" ? "text-3xl md:text-4xl" : "text-6xl md:text-8xl"}`}>
          {question.display}
        </span>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-4 md:gap-6 w-full max-w-lg">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(option)}
            className="game-button bg-white text-foreground text-3xl md:text-4xl font-bold py-6 md:py-8 rounded-3xl shadow-lg hover:shadow-xl hover:scale-105 transition-all border-4 border-red/30 hover:border-red"
          >
            {option}
          </button>
        ))}
      </div>
    </main>
  );
}
