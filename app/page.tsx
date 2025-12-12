import Link from "next/link";

const games = [
  {
    name: "Counting",
    emoji: "🔢",
    description: "Count the animals!",
    href: "/counting",
    color: "bg-purple",
  },
  {
    name: "Alphabet",
    emoji: "🔤",
    description: "Learn your ABCs!",
    href: "/alphabet",
    color: "bg-blue",
  },
  {
    name: "Colors & Shapes",
    emoji: "🎨",
    description: "Find the colors!",
    href: "/colors",
    color: "bg-pink",
  },
  {
    name: "Matching",
    emoji: "🃏",
    description: "Find the pairs!",
    href: "/matching",
    color: "bg-orange",
  },
  {
    name: "Sorting",
    emoji: "📏",
    description: "Big or small?",
    href: "/sorting",
    color: "bg-green",
  },
  {
    name: "Patterns",
    emoji: "🧩",
    description: "What comes next?",
    href: "/patterns",
    color: "bg-purple",
  },
  {
    name: "Animal Sounds",
    emoji: "🔊",
    description: "Match the sounds!",
    href: "/animals",
    color: "bg-yellow",
  },
  {
    name: "Numbers",
    emoji: "🔢",
    description: "Learn 1 to 10!",
    href: "/numbers",
    color: "bg-red",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center">
      {/* Mascot */}
      <div className="text-7xl md:text-8xl mb-4 animate-bounce">🧒</div>

      <h1 className="text-4xl md:text-6xl font-bold text-center mb-4 text-purple pop-in">
        Let&apos;s Play!
      </h1>
      <p className="text-xl md:text-2xl text-center mb-12 text-foreground/70 pop-in" style={{ animationDelay: "0.1s" }}>
        Pick a game!
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-6xl px-4">
        {games.map((game, index) => (
          <Link
            key={game.name}
            href={game.href}
            className={`game-button ${game.color} flex flex-col items-center justify-center p-6 md:p-8 rounded-[24px] shadow-lg hover:shadow-xl hover:scale-105 transition-all text-white no-underline pop-in`}
            style={{ animationDelay: `${0.1 + index * 0.05}s` }}
          >
            <span className="text-5xl md:text-6xl mb-3">{game.emoji}</span>
            <span className="text-xl md:text-2xl font-bold text-center">{game.name}</span>
            <span className="text-sm md:text-base opacity-90 mt-1 text-center">{game.description}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
