"use client";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center ">
      <h1 className="text-4xl font-bold mb-8 text-white">Tapatan Game</h1>
      <p className="text-lg mb-4 text-gray-300">Click below to start playing.</p>
      <Link href="/game" className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200">
        Start Game
      </Link>
    </div>
  );
}
