"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import BackButton from "@/components/BackButton";
import Celebration from "@/components/Celebration";
import { playCorrectSound, playClickSound } from "@/lib/sounds";

const TOTAL_ROUNDS = 10;

const tracingItems = [
  { char: "A", path: "M 50 180 L 100 20 L 150 180 M 70 120 L 130 120" },
  { char: "B", path: "M 50 20 L 50 180 M 50 20 L 120 20 Q 160 20 160 60 Q 160 100 120 100 L 50 100 M 50 100 L 130 100 Q 170 100 170 140 Q 170 180 130 180 L 50 180" },
  { char: "C", path: "M 160 50 Q 100 0 50 50 Q 0 100 50 150 Q 100 200 160 150" },
  { char: "1", path: "M 70 50 L 100 20 L 100 180 M 60 180 L 140 180" },
  { char: "2", path: "M 50 60 Q 50 20 100 20 Q 150 20 150 60 Q 150 100 50 180 L 150 180" },
  { char: "3", path: "M 50 20 L 150 20 L 100 90 Q 160 90 160 135 Q 160 180 100 180 Q 50 180 50 150" },
  { char: "O", path: "M 100 20 Q 170 20 170 100 Q 170 180 100 180 Q 30 180 30 100 Q 30 20 100 20" },
  { char: "L", path: "M 60 20 L 60 180 L 150 180" },
  { char: "T", path: "M 40 20 L 160 20 M 100 20 L 100 180" },
  { char: "X", path: "M 50 20 L 150 180 M 150 20 L 50 180" },
  { char: "V", path: "M 40 20 L 100 180 L 160 20" },
  { char: "4", path: "M 120 20 L 40 120 L 160 120 M 120 60 L 120 180" },
];

function generateQuestion() {
  return tracingItems[Math.floor(Math.random() * tracingItems.length)];
}

export default function TracingGame() {
  const [started, setStarted] = useState(false);
  const [question, setQuestion] = useState(generateQuestion);
  const [showCelebration, setShowCelebration] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [gameComplete, setGameComplete] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 300 });

  // Set canvas size based on screen
  useEffect(() => {
    const updateSize = () => {
      const size = Math.min(window.innerWidth - 48, 300);
      setCanvasSize({ width: size, height: size });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Prevent page scroll when game is active
  useEffect(() => {
    if (started && !gameComplete) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.height = "100%";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
    };
  }, [started, gameComplete]);

  // Draw template and user strokes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw template character (light gray, dashed)
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 40;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.setLineDash([]);

    // Draw the character as big text
    ctx.font = `bold ${canvasSize.height * 0.7}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#f0f0f0";
    ctx.fillText(question.char, canvasSize.width / 2, canvasSize.height / 2);

    // Draw dotted guide
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    ctx.fillStyle = "transparent";
    ctx.strokeText(question.char, canvasSize.width / 2, canvasSize.height / 2);

    // Draw user strokes
    ctx.setLineDash([]);
    ctx.strokeStyle = "#9b5de5";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    paths.forEach((pathData) => {
      const points = pathData.split(" ");
      if (points.length < 2) return;
      ctx.beginPath();
      const [x, y] = points[0].split(",").map(Number);
      ctx.moveTo(x, y);
      for (let i = 1; i < points.length; i++) {
        const [px, py] = points[i].split(",").map(Number);
        ctx.lineTo(px, py);
      }
      ctx.stroke();
    });

    // Draw current path
    if (currentPath) {
      const points = currentPath.split(" ");
      if (points.length >= 2) {
        ctx.beginPath();
        const [x, y] = points[0].split(",").map(Number);
        ctx.moveTo(x, y);
        for (let i = 1; i < points.length; i++) {
          const [px, py] = points[i].split(",").map(Number);
          ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    }
  }, [question, paths, currentPath, canvasSize]);

  const getCoordinates = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: (e as React.MouseEvent).clientX - rect.left,
      y: (e as React.MouseEvent).clientY - rect.top,
    };
  };

  const handleStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playClickSound();
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    setCurrentPath(`${x},${y}`);
  }, []);

  const handleMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    e.stopPropagation();
    const { x, y } = getCoordinates(e);
    setCurrentPath((prev) => `${prev} ${x},${y}`);
  }, [isDrawing]);

  const handleEnd = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPath) {
      setPaths((prev) => [...prev, currentPath]);
      setCurrentPath("");
    }
  }, [isDrawing, currentPath]);

  const handleDone = useCallback(() => {
    // Simple check: if user drew something, count it as success
    if (paths.length > 0) {
      playCorrectSound();
      setShowCelebration(true);
      setScore((s) => s + 1);
    }
  }, [paths]);

  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
    setPaths([]);
    setCurrentPath("");
    if (round >= TOTAL_ROUNDS) {
      setGameComplete(true);
    } else {
      setRound((r) => r + 1);
      setQuestion(generateQuestion());
    }
  }, [round]);

  const handleClear = () => {
    setPaths([]);
    setCurrentPath("");
  };

  const startGame = () => {
    setStarted(true);
    setQuestion(generateQuestion());
    setScore(0);
    setRound(1);
    setGameComplete(false);
    setPaths([]);
    setCurrentPath("");
  };

  // Start screen
  if (!started) {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-purple/10 to-pink/10">
        <BackButton />
        <span className="text-8xl mb-6">✏️</span>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-purple">
          Tracing Game
        </h1>
        <p className="text-xl md:text-2xl text-center mb-8 text-foreground/70">
          Trace the letters and numbers!
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
      <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-purple/10 to-pink/10">
        <BackButton />
        <span className="text-8xl mb-6 celebrate">🎉</span>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-purple">
          Great Writing!
        </h1>
        <p className="text-2xl md:text-3xl text-center mb-2 text-foreground">
          You traced <span className="text-purple font-bold">{score}</span> characters!
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
    <main className="min-h-screen p-4 flex flex-col items-center justify-center bg-gradient-to-b from-purple/10 to-pink/10">
      <BackButton />
      <Celebration show={showCelebration} onComplete={handleCelebrationComplete} />

      <div className="flex justify-between w-full max-w-md mb-4">
        <span className="bg-white/80 text-foreground px-4 py-2 rounded-full font-bold text-lg">
          Round {round}/{TOTAL_ROUNDS}
        </span>
        <span className="bg-yellow text-foreground px-4 py-2 rounded-full font-bold text-lg">
          ⭐ {score}
        </span>
      </div>

      <h1 className="text-2xl md:text-4xl font-bold text-center mb-4 text-purple">
        Trace the letter: <span className="text-pink">{question.char}</span>
      </h1>

      {/* Canvas */}
      <div
        className="bg-white rounded-3xl shadow-lg p-2 mb-4"
        style={{ touchAction: "none" }}
      >
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="rounded-2xl"
          style={{ touchAction: "none" }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleClear}
          className="game-button bg-gray-200 text-foreground text-xl font-bold py-4 px-8 rounded-2xl shadow-lg"
        >
          Clear
        </button>
        <button
          onClick={handleDone}
          disabled={paths.length === 0}
          className="game-button bg-green text-white text-xl font-bold py-4 px-8 rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Done ✓
        </button>
      </div>
    </main>
  );
}
