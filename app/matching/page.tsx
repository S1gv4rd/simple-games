"use client";

import { useState, useCallback, useEffect } from "react";
import BackButton from "@/components/BackButton";
import Celebration from "@/components/Celebration";
import { playCorrectSound, playWrongSound, playClickSound } from "@/lib/sounds";

const TOTAL_PAIRS = 6;

// Colored shapes for matching cards
const cardPatterns = [
  { id: "circle-red", shape: "circle", color: "#ef476f" },
  { id: "circle-blue", shape: "circle", color: "#00bbf9" },
  { id: "square-purple", shape: "square", color: "#9b5de5" },
  { id: "square-green", shape: "square", color: "#00f5d4" },
  { id: "triangle-yellow", shape: "triangle", color: "#fee440" },
  { id: "triangle-orange", shape: "triangle", color: "#ff9e00" },
  { id: "star-pink", shape: "star", color: "#ff6b9d" },
  { id: "star-blue", shape: "star", color: "#00bbf9" },
  { id: "heart-red", shape: "heart", color: "#ef476f" },
  { id: "heart-purple", shape: "heart", color: "#9b5de5" },
  { id: "diamond-green", shape: "diamond", color: "#00f5d4" },
  { id: "diamond-yellow", shape: "diamond", color: "#fee440" },
];

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateCards() {
  const selected = shuffleArray(cardPatterns).slice(0, TOTAL_PAIRS);
  const pairs = [...selected, ...selected];
  return shuffleArray(pairs).map((pattern, index) => ({
    id: index,
    pattern,
    isFlipped: false,
    isMatched: false,
  }));
}

export default function MatchingGame() {
  const [started, setStarted] = useState(false);
  const [cards, setCards] = useState(generateCards);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleCardClick = useCallback((id: number) => {
    if (isChecking) return;

    const card = cards.find(c => c.id === id);
    if (!card || card.isFlipped || card.isMatched) return;
    if (flippedCards.length >= 2) return;

    playClickSound();

    setCards(prev => prev.map(c =>
      c.id === id ? { ...c, isFlipped: true } : c
    ));

    setFlippedCards(prev => [...prev, id]);
  }, [cards, flippedCards, isChecking]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      setIsChecking(true);
      setMoves(m => m + 1);

      const [first, second] = flippedCards;
      const firstCard = cards.find(c => c.id === first);
      const secondCard = cards.find(c => c.id === second);

      if (firstCard?.pattern.id === secondCard?.pattern.id) {
        // Match!
        setTimeout(() => {
          playCorrectSound();
          setCards(prev => prev.map(c =>
            c.id === first || c.id === second
              ? { ...c, isMatched: true }
              : c
          ));
          setMatches(m => m + 1);
          setFlippedCards([]);
          setIsChecking(false);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          playWrongSound();
          setCards(prev => prev.map(c =>
            c.id === first || c.id === second
              ? { ...c, isFlipped: false }
              : c
          ));
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  }, [flippedCards, cards]);

  useEffect(() => {
    if (matches === TOTAL_PAIRS && started) {
      setShowCelebration(true);
    }
  }, [matches, started]);

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    setGameComplete(true);
  };

  const startGame = () => {
    setStarted(true);
    setCards(generateCards());
    setFlippedCards([]);
    setMatches(0);
    setMoves(0);
    setGameComplete(false);
  };

  // Helper to render shape SVG
  const renderShape = (shape: string, color: string, size: string = "w-10 h-10") => (
    <svg viewBox="0 0 100 100" className={size}>
      {shape === "circle" && <circle cx="50" cy="50" r="45" fill={color} />}
      {shape === "square" && <rect x="5" y="5" width="90" height="90" rx="8" fill={color} />}
      {shape === "triangle" && <polygon points="50,5 95,95 5,95" fill={color} />}
      {shape === "star" && <polygon points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40" fill={color} />}
      {shape === "heart" && <path d="M50,88 C20,60 5,40 15,25 C25,10 45,15 50,30 C55,15 75,10 85,25 C95,40 80,60 50,88 Z" fill={color} />}
      {shape === "diamond" && <polygon points="50,5 95,50 50,95 5,50" fill={color} />}
    </svg>
  );

  // Start screen
  if (!started) {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-orange/10 to-yellow/10">
        <BackButton />
        <div className="text-7xl font-bold mb-6 text-orange pop-in">
          <span className="inline-flex gap-1">
            {renderShape("square", "#ff9e00", "w-12 h-12")}
            {renderShape("square", "#ff9e00", "w-12 h-12")}
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-orange pop-in" style={{ animationDelay: "0.1s" }}>
          Matching Game
        </h1>
        <p className="text-xl md:text-2xl text-center mb-8 text-foreground/70 pop-in" style={{ animationDelay: "0.2s" }}>
          Find the matching pairs!
        </p>
        <button
          onClick={startGame}
          className="game-button bg-orange text-white text-2xl font-bold py-6 px-12 rounded-2xl shadow-lg pop-in"
          style={{ animationDelay: "0.3s" }}
        >
          Start!
        </button>
      </main>
    );
  }

  // Game complete screen
  if (gameComplete) {
    const stars = moves <= TOTAL_PAIRS + 2 ? 3 : moves <= TOTAL_PAIRS + 5 ? 2 : 1;
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-orange/10 to-yellow/10">
        <BackButton />
        <div className="text-6xl font-bold mb-6 celebrate text-green">You Did It!</div>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-orange">
          Great Job!
        </h1>
        <p className="text-2xl md:text-3xl text-center mb-2 text-foreground">
          Found all pairs in <span className="text-orange font-bold">{moves}</span> moves!
        </p>
        <div className="flex gap-2 my-6">
          {Array.from({ length: stars }).map((_, i) => (
            <div key={i} className="w-8 h-8 bg-yellow rounded-full shadow-md" />
          ))}
        </div>
        <button
          onClick={() => setStarted(false)}
          className="game-button bg-orange text-white text-2xl font-bold py-6 px-12 rounded-2xl shadow-lg mt-4"
        >
          Play Again
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 flex flex-col items-center justify-center bg-gradient-to-b from-orange/10 to-yellow/10">
      <BackButton />
      <Celebration show={showCelebration} onComplete={handleCelebrationComplete} />

      <div className="flex justify-between w-full max-w-md mb-4">
        <span className="bg-white/80 text-foreground px-4 py-2 rounded-full font-bold text-lg">
          Pairs: {matches}/{TOTAL_PAIRS}
        </span>
        <span className="bg-yellow text-foreground px-4 py-2 rounded-full font-bold text-lg">
          Moves: {moves}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 md:gap-3 w-full max-w-md">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            disabled={card.isMatched || card.isFlipped}
            className={`aspect-square rounded-xl flex items-center justify-center transition-all duration-300 ${
              card.isMatched
                ? "bg-green/30 scale-95"
                : card.isFlipped
                ? "bg-white shadow-lg"
                : "bg-orange shadow-md hover:shadow-lg hover:scale-105"
            }`}
          >
            {card.isFlipped || card.isMatched ? (
              renderShape(card.pattern.shape, card.pattern.color, "w-10 h-10 md:w-12 md:h-12")
            ) : (
              <span className="text-2xl md:text-3xl font-bold text-white/80">?</span>
            )}
          </button>
        ))}
      </div>
    </main>
  );
}
