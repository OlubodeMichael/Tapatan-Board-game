"use client";
import { useState } from "react";

const PlayerSetup = ({ onStart }) => {
  const [player1, setPlayer1] = useState({ name: "", color: "red" });
  const [player2, setPlayer2] = useState({ name: "", color: "blue" });

  const startGame = () => {
    if (!player1.name.trim() || !player2.name.trim()) {
      alert("Both players must enter names!");
      return;
    }
    if (player1.color === player2.color) {
      alert("Players must choose different colors!");
      return;
    }
    onStart(player1, player2);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">Choose Your Colors</h2>
      <div className="space-y-4">
        <div className="flex flex-col items-center">
          <input type="text" placeholder="Player 1 Name"
            className="p-2 border border-white/30 bg-white/10 text-white rounded-md mb-2"
            onChange={(e) => setPlayer1({ ...player1, name: e.target.value })} />
          <select className="p-2 border border-white/30 bg-white/10 text-white rounded-md"
            onChange={(e) => setPlayer1({ ...player1, color: e.target.value })}>
            <option value="red">Red</option>
            <option value="blue">Blue</option>
          </select>
        </div>
        <div className="flex flex-col items-center">
          <input type="text" placeholder="Player 2 Name"
            className="p-2 border border-white/30 bg-white/10 text-white rounded-md mb-2"
            onChange={(e) => setPlayer2({ ...player2, name: e.target.value })} />
          <select className="p-2 border border-white/30 bg-white/10 text-white rounded-md"
            onChange={(e) => setPlayer2({ ...player2, color: e.target.value })}>
            <option value="blue">Blue</option>
            <option value="red">Red</option>
          </select>
        </div>
      </div>
      <button className="mt-6 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
        onClick={startGame}>
        Start Game
      </button>
    </div>
  );
};

export default PlayerSetup;
