"use client";

import { useState, useCallback, useEffect } from "react";
import BackButton from "@/components/BackButton";
import Celebration from "@/components/Celebration";
import ShapeRenderer, { ShapeItem, ShapeType } from "@/components/ShapeRenderer";
import StartScreen from "@/components/StartScreen";
import GameComplete from "@/components/GameComplete";
import { playCorrectSound, playWrongSound, playClickSound } from "@/lib/sounds";
import { GAME_COLORS, shuffleArray } from "@/lib/gameUtils";

const TOTAL_PAIRS = 6;
const GRADIENT = "from-orange/10 to-yellow/10";

// Card patterns for matching
const cardPatterns: ShapeItem[] = [
  { shape: "circle", color: GAME_COLORS.red },
  { shape: "circle", color: GAME_COLORS.blue },
  { shape: "square", color: GAME_COLORS.purple },
  { shape: "square", color: GAME_COLORS.green },
  { shape: "triangle", color: GAME_COLORS.yellow },
  { shape: "triangle", color: GAME_COLORS.orange },
  { shape: "star", color: GAME_COLORS.pink },
  { shape: "star", color: GAME_COLORS.blue },
  { shape: "heart", color: GAME_COLORS.red },
  { shape: "heart", color: GAME_COLORS.purple },
  { shape: "diamond", color: GAME_COLORS.green },
  { shape: "diamond", color: GAME_COLORS.yellow },
];

interface Card {
  id: number;
  pattern: ShapeItem;
  isFlipped: boolean;
  isMatched: boolean;
}

function generateCards(): Card[] {
  const selected = shuffleArray(cardPatterns).slice(0, TOTAL_PAIRS);
  const pairs = [...selected, ...selected];
  return shuffleArray(pairs).map((pattern, index) => ({
    id: index,
    pattern,
    isFlipped: false,
    isMatched: false,
  }));
}

function patternEquals(a: ShapeItem, b: ShapeItem): boolean {
  return a.shape === b.shape && a.color === b.color;
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

      if (firstCard && secondCard && patternEquals(firstCard.pattern, secondCard.pattern)) {
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

  if (!started) {
    return (
      <StartScreen
        title="Matching Game"
        description="Find the matching pairs!"
        icon={
          <span className="inline-flex gap-1">
            <ShapeRenderer shape="square" color={GAME_COLORS.orange} className="w-12 h-12" />
            <ShapeRenderer shape="square" color={GAME_COLORS.orange} className="w-12 h-12" />
          </span>
        }
        color="orange"
        gradient={GRADIENT}
        onStart={startGame}
      />
    );
  }

  if (gameComplete) {
    const stars = moves <= TOTAL_PAIRS + 2 ? 3 : moves <= TOTAL_PAIRS + 5 ? 2 : 1;
    return (
      <main className={`min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b ${GRADIENT}`}>
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
    <main className={`min-h-screen p-4 flex flex-col items-center justify-center bg-gradient-to-b ${GRADIENT}`}>
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
              <ShapeRenderer shape={card.pattern.shape} color={card.pattern.color} className="w-10 h-10 md:w-12 md:h-12" />
            ) : (
              <span className="text-2xl md:text-3xl font-bold text-white/80">?</span>
            )}
          </button>
        ))}
      </div>
    </main>
  );
}
