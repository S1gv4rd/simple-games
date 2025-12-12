"use client";

import { useState, useCallback, useEffect } from "react";
import BackButton from "@/components/BackButton";
import Celebration from "@/components/Celebration";
import { playCorrectSound, playWrongSound, playClickSound } from "@/lib/sounds";

const TOTAL_PAIRS = 6;
const emojis = ["🐶", "🐱", "🐰", "🦊", "🐻", "🐸", "🦁", "🐷", "🐮", "🐵", "🐼", "🐨"];

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateCards() {
  const selected = shuffleArray(emojis).slice(0, TOTAL_PAIRS);
  const pairs = [...selected, ...selected];
  return shuffleArray(pairs).map((emoji, index) => ({
    id: index,
    emoji,
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

      if (firstCard?.emoji === secondCard?.emoji) {
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

  // Start screen
  if (!started) {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-orange/10 to-yellow/10">
        <BackButton />
        <span className="text-8xl mb-6">🃏</span>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-orange">
          Matching Game
        </h1>
        <p className="text-xl md:text-2xl text-center mb-8 text-foreground/70">
          Find the matching pairs!
        </p>
        <button
          onClick={startGame}
          className="game-button bg-orange text-white text-2xl font-bold py-6 px-12 rounded-2xl shadow-lg"
        >
          Start Playing!
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
        <span className="text-8xl mb-6 celebrate">🎉</span>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-orange">
          You Did It!
        </h1>
        <p className="text-2xl md:text-3xl text-center mb-2 text-foreground">
          Found all pairs in <span className="text-orange font-bold">{moves}</span> moves!
        </p>
        <div className="text-5xl my-6">
          {"🌟".repeat(stars)}
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
            className={`aspect-square rounded-xl text-4xl md:text-5xl flex items-center justify-center transition-all duration-300 ${
              card.isMatched
                ? "bg-green/30 scale-95"
                : card.isFlipped
                ? "bg-white shadow-lg"
                : "bg-orange shadow-md hover:shadow-lg hover:scale-105"
            }`}
          >
            {card.isFlipped || card.isMatched ? card.emoji : "❓"}
          </button>
        ))}
      </div>
    </main>
  );
}
