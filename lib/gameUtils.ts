import { ShapeType } from "@/components/ShapeRenderer";

// Common colors used across games
export const GAME_COLORS = {
  red: "#ef476f",
  orange: "#ff9e00",
  yellow: "#fee440",
  green: "#00f5d4",
  blue: "#00bbf9",
  purple: "#9b5de5",
  pink: "#ff6b9d",
} as const;

// Get array of color values
export const COLOR_VALUES = Object.values(GAME_COLORS);

// Shuffle array utility
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Get random item from array
export function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Get random number in range (inclusive)
export function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate unique options for multiple choice
export function generateUniqueOptions<T>(
  correct: T,
  pool: T[],
  count: number,
  isEqual: (a: T, b: T) => boolean = (a, b) => a === b
): T[] {
  const options: T[] = [correct];
  const shuffledPool = shuffleArray(pool);

  for (const item of shuffledPool) {
    if (options.length >= count) break;
    if (!options.some(opt => isEqual(opt, item))) {
      options.push(item);
    }
  }

  return shuffleArray(options);
}

// Common shape definitions
export const SHAPES: ShapeType[] = ["circle", "square", "triangle", "diamond", "star", "heart"];

// Generate a random shape with color
export function randomShape(): { shape: ShapeType; color: string } {
  return {
    shape: randomItem(SHAPES),
    color: randomItem(COLOR_VALUES),
  };
}
