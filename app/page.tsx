import Link from "next/link";

const games = [
  {
    name: "Counting",
    icon: "123",
    description: "Count the objects!",
    href: "/counting",
    color: "bg-purple",
  },
  {
    name: "Alphabet",
    icon: "ABC",
    description: "Learn your ABCs!",
    href: "/alphabet",
    color: "bg-blue",
  },
  {
    name: "Colors",
    icon: "●●●",
    description: "Find the colors!",
    href: "/colors",
    color: "bg-pink",
  },
  {
    name: "Matching",
    icon: "▢▢",
    description: "Find the pairs!",
    href: "/matching",
    color: "bg-orange",
  },
  {
    name: "Sorting",
    icon: "◀▶",
    description: "Big or small?",
    href: "/sorting",
    color: "bg-green",
  },
  {
    name: "Patterns",
    icon: "◐◑◐",
    description: "What comes next?",
    href: "/patterns",
    color: "bg-purple",
  },
  {
    name: "Tracing",
    icon: "Aa",
    description: "Draw letters!",
    href: "/tracing",
    color: "bg-yellow",
  },
  {
    name: "Numbers",
    icon: "1•2•3",
    description: "Learn 1 to 10!",
    href: "/numbers",
    color: "bg-red",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center">
      <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-center mb-4 text-purple pop-in">
        Simple Games
      </h1>
      <p className="text-xl md:text-2xl lg:text-3xl text-center mb-12 text-foreground/70 pop-in" style={{ animationDelay: "0.1s" }}>
        Pick a game!
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8 w-full max-w-6xl px-4">
        {games.map((game, index) => (
          <Link
            key={game.name}
            href={game.href}
            className={`game-button ${game.color} flex flex-col items-center justify-center p-6 md:p-8 lg:p-10 rounded-[24px] md:rounded-[32px] lg:rounded-[36px] shadow-lg hover:shadow-xl hover:scale-105 transition-all text-white no-underline pop-in`}
            style={{ animationDelay: `${0.1 + index * 0.05}s` }}
          >
            <span className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 opacity-90">{game.icon}</span>
            <span className="text-xl md:text-2xl lg:text-3xl font-bold text-center">{game.name}</span>
            <span className="text-sm md:text-base lg:text-lg opacity-80 mt-1 text-center">{game.description}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
