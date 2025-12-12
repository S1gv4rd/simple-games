"use client";

export type ShapeType = "circle" | "square" | "triangle" | "diamond" | "star" | "heart";

export interface ShapeItem {
  shape: ShapeType;
  color: string;
}

interface ShapeRendererProps {
  shape: ShapeType;
  color: string;
  className?: string;
}

export default function ShapeRenderer({ shape, color, className = "w-10 h-10" }: ShapeRendererProps) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      {shape === "circle" && <circle cx="50" cy="50" r="45" fill={color} />}
      {shape === "square" && <rect x="5" y="5" width="90" height="90" rx="8" fill={color} />}
      {shape === "triangle" && <polygon points="50,5 95,95 5,95" fill={color} />}
      {shape === "diamond" && <polygon points="50,5 95,50 50,95 5,50" fill={color} />}
      {shape === "star" && <polygon points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40" fill={color} />}
      {shape === "heart" && <path d="M50,88 C20,60 5,40 15,25 C25,10 45,15 50,30 C55,15 75,10 85,25 C95,40 80,60 50,88 Z" fill={color} />}
    </svg>
  );
}
