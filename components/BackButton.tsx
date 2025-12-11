"use client";

import Link from "next/link";

export default function BackButton() {
  return (
    <Link
      href="/"
      className="fixed top-4 left-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md text-purple font-bold text-lg hover:bg-white transition-colors no-underline z-50"
    >
      ← Home
    </Link>
  );
}
