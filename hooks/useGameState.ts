"use client";

import { useState, useCallback } from "react";
import { playCorrectSound, playWrongSound } from "@/lib/sounds";

interface UseGameStateOptions<T> {
  totalRounds: number;
  generateQuestion: () => T;
}

export function useGameState<T>({ totalRounds, generateQuestion }: UseGameStateOptions<T>) {
  const [started, setStarted] = useState(false);
  const [question, setQuestion] = useState<T>(generateQuestion);
  const [showCelebration, setShowCelebration] = useState(false);
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [gameComplete, setGameComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCorrect = useCallback(() => {
    if (isProcessing) return;
    setIsProcessing(true);
    playCorrectSound();
    setShowCelebration(true);
    setScore((s) => s + 1);
  }, [isProcessing]);

  const handleWrong = useCallback(() => {
    if (isProcessing) return;
    playWrongSound();
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, [isProcessing]);

  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
    setIsProcessing(false);
    if (round >= totalRounds) {
      setGameComplete(true);
    } else {
      setRound((r) => r + 1);
      setQuestion(generateQuestion());
    }
  }, [round, totalRounds, generateQuestion]);

  const startGame = useCallback(() => {
    setStarted(true);
    setQuestion(generateQuestion());
    setScore(0);
    setRound(1);
    setGameComplete(false);
  }, [generateQuestion]);

  const resetGame = useCallback(() => {
    setStarted(false);
    setGameComplete(false);
  }, []);

  return {
    // State
    started,
    question,
    showCelebration,
    shake,
    score,
    round,
    gameComplete,
    totalRounds,
    isProcessing,
    // Actions
    handleCorrect,
    handleWrong,
    handleCelebrationComplete,
    startGame,
    resetGame,
    setQuestion,
  };
}
