"use client";
import { useState } from "react";

const PlayerSetup = ({ onStart }) => {
  const [player1, setPlayer1] = useState({ name: "", color: "blue" });
  const [player2, setPlayer2] = useState({ name: "", color: "red" });

  const startGame = () => {
    if (!player1.name || !player2.name) return alert("Both players must enter names!");
    if (player1.color === player2.color) return alert("Players must choose different colors!");

    onStart(player1, player2);
  };

  return (
    <div>
      <h2>Choose Your Colors</h2>
      <input type="text" placeholder="Player 1 Name" onChange={(e) => setPlayer1({ ...player1, name: e.target.value })} />
      <select onChange={(e) => setPlayer1({ ...player1, color: e.target.value })}>
        <option value="blue">Blue</option>
        <option value="red">Red</option>
        <option value="green">Green</option>
      </select>

      <input type="text" placeholder="Player 2 Name" onChange={(e) => setPlayer2({ ...player2, name: e.target.value })} />
      <select onChange={(e) => setPlayer2({ ...player2, color: e.target.value })}>
        <option value="red">Red</option>
        <option value="blue">Blue</option>
        <option value="green">Green</option>
      </select>

      <button onClick={startGame}>Start Game</button>
    </div>
  );
};

export default PlayerSetup;
