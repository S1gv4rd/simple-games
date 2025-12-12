"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import BackButton from "@/components/BackButton";
import Celebration from "@/components/Celebration";
import { playCorrectSound } from "@/lib/sounds";

const TOTAL_ROUNDS = 10;

const tracingItems = [
  { char: "A", color: "#ef476f" },
  { char: "B", color: "#ff9e00" },
  { char: "C", color: "#fee440" },
  { char: "D", color: "#00f5d4" },
  { char: "E", color: "#00bbf9" },
  { char: "1", color: "#9b5de5" },
  { char: "2", color: "#ff6b9d" },
  { char: "3", color: "#00bbf9" },
  { char: "4", color: "#00f5d4" },
  { char: "5", color: "#fee440" },
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
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [allStrokes, setAllStrokes] = useState<{ x: number; y: number }[][]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 280, height: 280 });

  // Set canvas size based on screen
  useEffect(() => {
    const updateSize = () => {
      const size = Math.min(window.innerWidth - 64, 320);
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

  // Draw everything
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear with rounded rect feel
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw faint grid lines for guidance
    ctx.strokeStyle = "#f0f0f0";
    ctx.lineWidth = 1;
    const mid = canvas.width / 2;
    ctx.beginPath();
    ctx.moveTo(mid, 0);
    ctx.lineTo(mid, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Draw the template character
    const fontSize = canvasSize.height * 0.65;
    ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Soft fill
    ctx.fillStyle = "#e8e8e8";
    ctx.fillText(question.char, canvasSize.width / 2, canvasSize.height / 2 + 5);

    // Dotted outline for tracing guide
    ctx.strokeStyle = "#d0d0d0";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.strokeText(question.char, canvasSize.width / 2, canvasSize.height / 2 + 5);
    ctx.setLineDash([]);

    // Draw all completed strokes with gradient effect
    allStrokes.forEach((stroke) => {
      if (stroke.length < 2) return;

      ctx.strokeStyle = question.color;
      ctx.lineWidth = 12;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = question.color;
      ctx.shadowBlur = 8;

      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // Draw current stroke
    if (points.length >= 2) {
      ctx.strokeStyle = question.color;
      ctx.lineWidth = 12;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = question.color;
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Draw cursor dot when drawing
    if (isDrawing && points.length > 0) {
      const lastPoint = points[points.length - 1];
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = question.color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(lastPoint.x, lastPoint.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }, [question, points, allStrokes, canvasSize, isDrawing]);

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
    setIsDrawing(true);
    const coords = getCoordinates(e);
    setPoints([coords]);
  }, []);

  const handleMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    e.stopPropagation();
    const coords = getCoordinates(e);
    setPoints((prev) => [...prev, coords]);
  }, [isDrawing]);

  const handleEnd = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (points.length > 1) {
      setAllStrokes((prev) => [...prev, points]);
    }
    setPoints([]);
  }, [isDrawing, points]);

  const handleDone = useCallback(() => {
    if (allStrokes.length > 0) {
      playCorrectSound();
      setShowCelebration(true);
      setScore((s) => s + 1);
    }
  }, [allStrokes]);

  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
    setPoints([]);
    setAllStrokes([]);
    if (round >= TOTAL_ROUNDS) {
      setGameComplete(true);
    } else {
      setRound((r) => r + 1);
      setQuestion(generateQuestion());
    }
  }, [round]);

  const handleClear = () => {
    setPoints([]);
    setAllStrokes([]);
  };

  const startGame = () => {
    setStarted(true);
    setQuestion(generateQuestion());
    setScore(0);
    setRound(1);
    setGameComplete(false);
    setPoints([]);
    setAllStrokes([]);
  };

  // Start screen
  if (!started) {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-purple/10 to-pink/10">
        <BackButton />
        <div className="text-8xl mb-6 pop-in">✏️</div>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-purple pop-in" style={{ animationDelay: "0.1s" }}>
          Tracing
        </h1>
        <p className="text-xl md:text-2xl text-center mb-8 text-foreground/70 pop-in" style={{ animationDelay: "0.2s" }}>
          Draw letters and numbers!
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
      <main className="min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b from-purple/10 to-pink/10">
        <BackButton />
        <div className="text-8xl mb-6 celebrate">🎉</div>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-purple">
          Great Job!
        </h1>
        <p className="text-2xl md:text-3xl text-center mb-2 text-foreground">
          You traced <span className="text-purple font-bold">{score}</span> of {TOTAL_ROUNDS}!
        </p>
        <div className="text-5xl my-6">
          {score === TOTAL_ROUNDS ? "🌟🌟🌟" : score >= 7 ? "🌟🌟" : score >= 4 ? "🌟" : "💪"}
        </div>
        <button
          onClick={() => setStarted(false)}
          className="game-button bg-purple text-white text-2xl font-bold py-6 px-12 rounded-2xl shadow-lg"
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

      {/* Progress bar */}
      <div className="w-full max-w-sm mb-4">
        <div className="flex justify-between text-sm font-medium text-foreground/60 mb-1">
          <span>Round {round}/{TOTAL_ROUNDS}</span>
          <span>⭐ {score}</span>
        </div>
        <div className="h-2 bg-white/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple rounded-full transition-all duration-300"
            style={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }}
          />
        </div>
      </div>

      {/* Character preview */}
      <div
        className="text-6xl font-bold mb-3 pop-in"
        style={{ color: question.color }}
      >
        {question.char}
      </div>

      {/* Canvas */}
      <div
        className="rounded-3xl shadow-xl overflow-hidden mb-4"
        style={{
          touchAction: "none",
          background: "linear-gradient(145deg, #ffffff, #f5f5f5)",
          padding: "4px"
        }}
      >
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="rounded-2xl cursor-crosshair"
          style={{ touchAction: "none", display: "block" }}
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
      <div className="flex gap-3">
        <button
          onClick={handleClear}
          className="flex items-center gap-2 bg-white text-foreground/70 text-lg font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all"
        >
          <span>🗑️</span> Clear
        </button>
        <button
          onClick={handleDone}
          disabled={allStrokes.length === 0}
          className="flex items-center gap-2 text-white text-lg font-semibold py-3 px-8 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: allStrokes.length > 0 ? "#00f5d4" : "#ccc" }}
        >
          <span>✓</span> Done
        </button>
      </div>
    </main>
  );
}
