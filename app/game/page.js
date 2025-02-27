"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Board from "../_components/Board";

export default function Game() {
  const router = useRouter();
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState([
    { name: '', color: '#EF4444' },
    { name: '', color: '#3B82F6' }
  ]);

  const handleQuit = () => {
    router.push('/');
  };

  const handleNameChange = (index, name) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], name };
    setPlayers(newPlayers);
  };

  const handleStartGame = () => {
    if (!players[0].name.trim() || !players[1].name.trim()) {
      alert('Please enter names for both players');
      return;
    }
    setGameStarted(true);
  };

  return (
    <div className="min-h-screen  flex items-center">
      <div className="container mx-auto px-4">
        {!gameStarted ? (
          <div className="flex flex-col items-center space-y-10">
            <h1 className="text-3xl font-bold text-white">Enter Your Names</h1>
            <div className="w-full max-w-md space-y-8">
              <div>
                <input
                  type="text"
                  value={players[0].name}
                  onChange={(e) => handleNameChange(0, e.target.value)}
                  placeholder="Enter first player's name"
                  className="w-full px-4 py-3 bg-white/10 text-white rounded-lg 
                           border border-white/20 focus:border-white/50 focus:outline-none
                           placeholder-white/50"
                  maxLength={20}
                />
              </div>
              <div>
                <input
                  type="text"
                  value={players[1].name}
                  onChange={(e) => handleNameChange(1, e.target.value)}
                  placeholder="Enter second player's name"
                  className="w-full px-4 py-3 bg-white/10 text-white rounded-lg 
                           border border-white/20 focus:border-white/50 focus:outline-none
                           placeholder-white/50"
                  maxLength={20}
                />
              </div>
              <div className="flex space-x-6 pt-6">
                <button
                  className="flex-1 py-3 px-6 bg-red-500/20 hover:bg-red-500/30 
                           text-white font-bold rounded-lg transition-colors"
                  onClick={handleQuit}
                >
                  Quit
                </button>
                <button
                  className="flex-1 py-3 px-6 bg-white/10 hover:bg-white/20 
                           text-white font-bold rounded-lg transition-colors"
                  onClick={handleStartGame}
                  disabled={!players[0].name.trim() || !players[1].name.trim()}
                >
                  Start Game
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Board 
            players={players} 
            onQuit={handleQuit}
          />
        )}
      </div>
    </div>
  );
}
