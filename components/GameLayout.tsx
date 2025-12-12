"use client";

import BackButton from "./BackButton";
import Celebration from "./Celebration";

interface GameLayoutProps {
  children: React.ReactNode;
  gradient: string;
  showCelebration?: boolean;
  onCelebrationComplete?: () => void;
}

export default function GameLayout({
  children,
  gradient,
  showCelebration = false,
  onCelebrationComplete,
}: GameLayoutProps) {
  return (
    <main className={`min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b ${gradient}`}>
      <BackButton />
      <Celebration show={showCelebration} onComplete={onCelebrationComplete} />
      {children}
    </main>
  );
}
