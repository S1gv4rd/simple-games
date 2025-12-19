"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import StartScreen from "@/components/StartScreen";
import GameComplete from "@/components/GameComplete";
import BackButton from "@/components/BackButton";
import Celebration from "@/components/Celebration";
import { playCorrectSound } from "@/lib/sounds";
import { GAME_COLORS, TOTAL_ROUNDS, GAME_GRADIENTS } from "@/lib/gameUtils";

const GRADIENT = GAME_GRADIENTS.tracing;

const tracingItems = [
  { char: "A", color: GAME_COLORS.red },
  { char: "B", color: GAME_COLORS.orange },
  { char: "C", color: GAME_COLORS.yellow },
  { char: "D", color: GAME_COLORS.green },
  { char: "E", color: GAME_COLORS.blue },
  { char: "1", color: GAME_COLORS.purple },
  { char: "2", color: GAME_COLORS.pink },
  { char: "3", color: GAME_COLORS.blue },
  { char: "4", color: GAME_COLORS.green },
  { char: "5", color: GAME_COLORS.yellow },
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

  useEffect(() => {
    const updateSize = () => {
      const size = Math.min(window.innerWidth - 64, 320);
      setCanvasSize({ width: size, height: size });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#f0f0f0";
    ctx.lineWidth = 1;
    const mid = canvas.width / 2;
    ctx.beginPath();
    ctx.moveTo(mid, 0);
    ctx.lineTo(mid, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    const fontSize = canvasSize.height * 0.65;
    ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#e8e8e8";
    ctx.fillText(question.char, canvasSize.width / 2, canvasSize.height / 2 + 5);

    ctx.strokeStyle = "#d0d0d0";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.strokeText(question.char, canvasSize.width / 2, canvasSize.height / 2 + 5);
    ctx.setLineDash([]);

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

  const resetGame = () => {
    setStarted(false);
    setGameComplete(false);
  };

  if (!started) {
    return (
      <StartScreen
        title="Tracing"
        description="Draw letters and numbers!"
        icon={<div className="text-7xl font-bold text-purple">Aa</div>}
        color="purple"
        gradient={GRADIENT}
        onStart={startGame}
      />
    );
  }

  if (gameComplete) {
    return (
      <GameComplete
        title="Great!"
        score={score}
        totalRounds={TOTAL_ROUNDS}
        color="purple"
        gradient={GRADIENT}
        onPlayAgain={resetGame}
      />
    );
  }

  return (
    <main className={`min-h-screen p-4 flex flex-col items-center justify-center bg-gradient-to-b ${GRADIENT}`}>
      <BackButton />
      <Celebration show={showCelebration} onComplete={handleCelebrationComplete} />

      <div className="w-full max-w-sm mb-4">
        <div className="flex justify-between text-sm font-medium text-foreground/60 mb-1">
          <span>Round {round}/{TOTAL_ROUNDS}</span>
          <span>{score} pts</span>
        </div>
        <div className="h-2 bg-white/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple rounded-full transition-all duration-300"
            style={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }}
          />
        </div>
      </div>

      <div
        className="text-6xl font-bold mb-3 pop-in"
        style={{ color: question.color }}
      >
        {question.char}
      </div>

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

      <div className="flex gap-3">
        <button
          onClick={handleClear}
          className="bg-white text-foreground/70 text-lg font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all"
        >
          Clear
        </button>
        <button
          onClick={handleDone}
          disabled={allStrokes.length === 0}
          className="text-white text-lg font-semibold py-3 px-8 rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: allStrokes.length > 0 ? "#00f5d4" : "#ccc" }}
        >
          Done
        </button>
      </div>
    </main>
  );
}
