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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl px-4">
        {games.map((game, index) => (
          <Link
            key={game.name}
            href={game.href}
            className={`game-button ${game.color} flex flex-col items-center justify-center p-10 md:p-12 rounded-[32px] shadow-lg hover:shadow-xl hover:scale-105 transition-all text-white no-underline pop-in`}
            style={{ animationDelay: `${0.2 + index * 0.1}s` }}
          >
            <span className="text-7xl md:text-8xl mb-6">{game.emoji}</span>
            <span className="text-3xl md:text-4xl font-bold">{game.name}</span>
            <span className="text-xl md:text-2xl opacity-90 mt-2">{game.description}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
