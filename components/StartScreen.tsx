"use client";

import BackButton from "./BackButton";

interface StartScreenProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  onStart: () => void;
}

export default function StartScreen({
  title,
  description,
  icon,
  color,
  gradient,
  onStart,
}: StartScreenProps) {
  return (
    <main className={`min-h-screen p-6 flex flex-col items-center justify-center bg-gradient-to-b ${gradient}`}>
      <BackButton />
      <div className="mb-6 pop-in">{icon}</div>
      <h1
        className={`text-4xl md:text-5xl font-bold text-center mb-4 text-${color} pop-in`}
        style={{ animationDelay: "0.1s" }}
      >
        {title}
      </h1>
      <p
        className="text-xl md:text-2xl text-center mb-8 text-foreground/70 pop-in"
        style={{ animationDelay: "0.2s" }}
      >
        {description}
      </p>
      <button
        onClick={onStart}
        className={`game-button bg-${color} text-white text-2xl font-bold py-6 px-12 rounded-2xl shadow-lg pop-in`}
        style={{ animationDelay: "0.3s" }}
      >
        Start!
      </button>
    </main>
  );
}
