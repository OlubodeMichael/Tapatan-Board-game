"use client";
import { useState, useEffect } from "react";
import { createEmptyBoard, checkWin } from "../../utils/gameLogic";
import ColorPicker from "./ColorPicker";

const Board = ({ players, onQuit = () => {} }) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerColors, setPlayerColors] = useState({
    player1: '#EF4444', // Default red
    player2: '#3B82F6'  // Default blue
  });

  if (!players || !players[0] || !players[1]) {
    return <div className="text-center text-red-500">Error: Players not set.</div>;
  }

  const [board, setBoard] = useState(createEmptyBoard());
  const [turn, setTurn] = useState('red');
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [positionHistory, setPositionHistory] = useState([createEmptyBoard()]);
  const [phase, setPhase] = useState('placement');
  const [piecesPlaced, setPiecesPlaced] = useState({ [players[0]?.name]: 0, [players[1]?.name]: 0 });
  const [winningPieces, setWinningPieces] = useState([]);
  const [scores, setScores] = useState({
    red: 0,
    blue: 0
  });

  // Add state for touch interactions
  const [touchedPiece, setTouchedPiece] = useState(null);

  useEffect(() => {
    const savedScores = localStorage.getItem('tapatanScores');
    if (savedScores) {
      setScores(JSON.parse(savedScores));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tapatanScores', JSON.stringify(scores));
  }, [scores]);

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setTurn('red');
    setSelectedPiece(null);
    setGameOver(false);
    setWinningPieces([]);
  };

  // Get valid moves for a piece
  const getValidMoves = (row, col) => {
    const connections = {
      '0,0': [[0,1], [1,0], [1,1]],
      '0,1': [[0,0], [0,2], [1,1]],
      '0,2': [[0,1], [1,1], [1,2]],
      '1,0': [[0,0], [1,1], [2,0]],
      '1,1': [[0,0], [0,1], [0,2], [1,0], [1,2], [2,0], [2,1], [2,2]],
      '1,2': [[0,2], [1,1], [2,2]],
      '2,0': [[1,0], [1,1], [2,1]],
      '2,1': [[2,0], [1,1], [2,2]],
      '2,2': [[2,1], [1,1], [1,2]]
    };
    return connections[`${row},${col}`] || [];
  };

  // Check for threefold repetition
  const checkThreefoldRepetition = (newBoard) => {
    const boardString = JSON.stringify(newBoard);
    const count = positionHistory.filter(pos => JSON.stringify(pos) === boardString).length;
    return count >= 2;
  };

  const handleClick = (row, col) => {
    if (gameOver) return;

    // Placement Phase
    if (phase === 'placement') {
      if (board[row][col] !== null) return;
      if (piecesPlaced[turn] >= 3) return;

      const newBoard = [...board];
      newBoard[row][col] = turn;
      setBoard(newBoard);
      
      const newPiecesPlaced = { ...piecesPlaced, [turn]: piecesPlaced[turn] + 1 };
      setPiecesPlaced(newPiecesPlaced);

      // Check win condition during placement
      if (checkWin(newBoard)) {
        setGameOver(true);
        alert(`${turn} wins during placement!`);
        return;
      }

      // Check if placement phase is complete
      if (newPiecesPlaced[players[0].name] === 3 && newPiecesPlaced[players[1].name] === 3) {
        setPhase('movement');
      }

      setTurn(turn === players[0].name ? players[1].name : players[0].name);
    } 
    // Movement Phase
    else {
      const currentPlayer = turn === players[0].name ? players[0] : players[1];
      const currentColor = currentPlayer.color;

      if (!selectedPiece) {
        // Select a piece to move (must be player's own color)
        if (board[row][col] === currentColor) {
          setSelectedPiece({ row, col });
        }
      } else {
        // Try to move the selected piece
        const validMoves = getValidMoves(selectedPiece.row, selectedPiece.col);
        const isValidMove = validMoves.some(([r, c]) => r === row && c === col && board[r][c] === null);

        if (isValidMove) {
          const newBoard = board.map(row => [...row]);
          newBoard[row][col] = currentColor;
          newBoard[selectedPiece.row][selectedPiece.col] = null;

          // Check for threefold repetition
          if (checkThreefoldRepetition(newBoard)) {
            setGameOver(true);
            alert("Game drawn by threefold repetition!");
            return;
          }

          setBoard(newBoard);
          setPositionHistory([...positionHistory, newBoard]);

          // Check win condition
          if (checkWin(newBoard)) {
            setGameOver(true);
            alert(`${turn} wins!`);
            return;
          }

          setTurn(turn === players[0].name ? players[1].name : players[0].name);
        }
        setSelectedPiece(null);
      }
    }
  };

  const handleDragStart = (e, row, col) => {
    // Only allow current player to drag their pieces
    if (gameOver || board[row][col] !== turn) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', JSON.stringify({ row, col }));
    setSelectedPiece({ row, col });
  };

  const handleDragOver = (e, row, col) => {
    e.preventDefault();
    if (selectedPiece) {
      const validMoves = getValidMoves(selectedPiece.row, selectedPiece.col);
      const isValidMove = validMoves.some(([r, c]) => r === row && c === col && board[r][c] === null);
      
      // Show visual feedback only for valid moves
      if (isValidMove) {
        e.currentTarget.classList.add('bg-white/20');
      }
    }
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('bg-white/20');
  };

  const handleDrop = async (e, targetRow, targetCol) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-white/20');
    
    if (gameOver) return;

    const sourceData = JSON.parse(e.dataTransfer.getData('text/plain'));
    const { row: sourceRow, col: sourceCol } = sourceData;

    // Verify it's the correct player's turn and piece
    if (board[sourceRow][sourceCol] !== turn) {
      return;
    }

    // Check if move is valid
    const validMoves = getValidMoves(sourceRow, sourceCol);
    const isValidMove = validMoves.some(([r, c]) => r === targetRow && c === targetCol && board[targetRow][targetCol] === null);

    if (isValidMove) {
      // Create new board state
      const newBoard = [...board.map(row => [...row])];
      const movingPiece = newBoard[sourceRow][sourceCol];
      
      // Clear source position
      newBoard[sourceRow][sourceCol] = null;
      
      // Place piece in new position
      newBoard[targetRow][targetCol] = movingPiece;
      
      // Update board first
      setBoard(newBoard);

      // Add delay to ensure the piece is visibly in place
      await new Promise(resolve => setTimeout(resolve, 300));

      // Check for win
      const winner = checkWin(newBoard);
      if (winner) {
        // Highlight winning pieces before showing alert
        const winningLine = findWinningLine(newBoard);
        if (winningLine) {
          setWinningPieces(winningLine);
        }
        setGameOver(true);
        
        // Update scores
        setScores(prevScores => ({
          ...prevScores,
          [winner]: prevScores[winner] + 1
        }));
        
        await new Promise(resolve => setTimeout(resolve, 500));
        alert(`${winner.toUpperCase()} wins!`);
        return;
      }

      // Switch turns if no win
      setTurn(turn === 'red' ? 'blue' : 'red');
    }
    
    setSelectedPiece(null);
  };

  const startGame = () => {
    if (playerColors.player1 && playerColors.player2) {
      setGameStarted(true);
      setBoard(createEmptyBoard());
    }
  };

  // Add touch handlers
  const handleTouchStart = (e, row, col) => {
    e.preventDefault();
    if (gameOver || board[row][col] !== turn) return;
    
    setTouchedPiece({ row, col });
    setSelectedPiece({ row, col });
  };

  const handleTouchMove = (e, row, col) => {
    e.preventDefault();
    if (!touchedPiece) return;

    const touch = e.touches[0];
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
    const dropTarget = elements.find(el => el.classList.contains('drop-target'));
    
    if (dropTarget) {
      dropTarget.classList.add('bg-white/20');
    }
  };

  const handleTouchEnd = async (e, targetRow, targetCol) => {
    e.preventDefault();
    if (!touchedPiece) return;

    const sourceRow = touchedPiece.row;
    const sourceCol = touchedPiece.col;

    // Use the same logic as handleDrop
    if (gameOver || board[sourceRow][sourceCol] !== turn) {
      setTouchedPiece(null);
      setSelectedPiece(null);
      return;
    }

    const validMoves = getValidMoves(sourceRow, sourceCol);
    const isValidMove = validMoves.some(([r, c]) => r === targetRow && c === targetCol && board[targetRow][targetCol] === null);

    if (isValidMove) {
      const newBoard = [...board.map(row => [...row])];
      const movingPiece = newBoard[sourceRow][sourceCol];
      newBoard[sourceRow][sourceCol] = null;
      newBoard[targetRow][targetCol] = movingPiece;
      setBoard(newBoard);

      await new Promise(resolve => setTimeout(resolve, 50));

      const winner = checkWin(newBoard);
      if (winner) {
        setGameOver(true);
        alert(`${winner === 'red' ? players[0].name : players[1].name} wins!`);
        return;
      }

      setTurn(turn === 'red' ? 'blue' : 'red');
    }

    setTouchedPiece(null);
    setSelectedPiece(null);
  };

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center space-y-8 p-6">
        <h2 className="text-2xl font-bold text-white">Choose Your Colors</h2>
        
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-3">
            <label className="block text-white text-lg">{players[0].name}'s Color</label>
            <ColorPicker
              selectedColor={playerColors.player1}
              onColorChange={(color) => setPlayerColors(prev => ({ ...prev, player1: color }))}
              disabledColors={[playerColors.player2, '#000000']}
            />
          </div>

          <div className="space-y-3">
            <label className="block text-white text-lg">{players[1].name}'s Color</label>
            <ColorPicker
              selectedColor={playerColors.player2}
              onColorChange={(color) => setPlayerColors(prev => ({ ...prev, player2: color }))}
              disabledColors={[playerColors.player1, '#000000']}
            />
          </div>

          {/* Show current scores if any */}
          {(scores.red > 0 || scores.blue > 0) && (
            <div className="text-white text-center p-3 bg-white/5 rounded-lg">
              <p className="text-lg mb-2">Current Score</p>
              <p>{players[0].name}: {scores.red} - {players[1].name}: {scores.blue}</p>
            </div>
          )}

          {/* Add button container with flex layout */}
          <div className="flex space-x-4">
            <button
              className="flex-1 py-3 px-6 bg-red-500/20 hover:bg-red-500/30 
                       text-white font-bold rounded-lg transition-colors"
              onClick={() => {
                if (confirm('Are you sure you want to quit? All progress will be lost.')) {
                  onQuit(); // Call the onQuit callback
                }
              }}
            >
              Quit Game
            </button>
            <button
              className="flex-1 py-3 px-6 bg-white/10 hover:bg-white/20 
                       text-white font-bold rounded-lg transition-colors"
              onClick={startGame}
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Update the piece rendering to use selected colors
  const getPieceColor = (piece) => {
    return piece === 'red' ? playerColors.player1 : playerColors.player2;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 w-full max-w-md">
        <div className="flex justify-between items-center bg-white/10 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-4 h-4 rounded-full" 
                 style={{ backgroundColor: playerColors.player1 }}></div>
            <span className="text-white font-bold">{players[0].name}</span>
            <span className="text-2xl text-white">{scores.red}</span>
          </div>
          <div className="text-white font-bold">vs</div>
          <div className="flex items-center space-x-4">
            <span className="text-2xl text-white">{scores.blue}</span>
            <span className="text-white font-bold">{players[1].name}</span>
            <div className="w-4 h-4 rounded-full" 
                 style={{ backgroundColor: playerColors.player2 }}></div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4 text-white">
        {gameOver ? "Game Over" : `${turn === 'red' ? players[0].name : players[1].name}'s Turn`}
      </h2>
      
      <div className="mb-4 text-white text-sm">
        {!gameOver && (
          <p className="text-center px-4">
            {`${turn === 'red' ? players[0].name : players[1].name}: ${window.innerWidth <= 768 ? 'Tap and drag' : 'Drag'} your piece to an adjacent empty point`}
          </p>
        )}
      </div>

      {/* Responsive board size */}
      <div className="relative w-[min(300px,80vw)] h-[min(300px,80vw)]">
        {/* Game board lines */}
        <svg 
          className="absolute inset-0 w-full h-full z-0" 
          viewBox="0 0 300 300" 
          style={{ strokeWidth: '2', stroke: 'rgba(255,255,255,0.3)' }}
        >
          {/* Horizontal lines */}
          <line x1="0" y1="0" x2="300" y2="0" />
          <line x1="0" y1="150" x2="300" y2="150" />
          <line x1="0" y1="300" x2="300" y2="300" />
          
          {/* Vertical lines */}
          <line x1="0" y1="0" x2="0" y2="300" />
          <line x1="150" y1="0" x2="150" y2="300" />
          <line x1="300" y1="0" x2="300" y2="300" />
          
          {/* Diagonal lines */}
          <line x1="0" y1="0" x2="300" y2="300" />
          <line x1="300" y1="0" x2="0" y2="300" />
        </svg>

        {/* Game board intersection points */}
        <div className="absolute inset-0">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-between" 
                 style={{ position: 'absolute', top: `${rowIndex * 50}%`, left: 0, right: 0 }}>
              {row.map((cell, colIndex) => (
                <div 
                  key={`${rowIndex}-${colIndex}`}
                  className="relative"
                  style={{ 
                    position: 'absolute', 
                    left: `${colIndex * 50}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div
                    className={`w-[min(4rem,20vw)] h-[min(4rem,20vw)] flex justify-center items-center
                      ${!cell && !gameOver ? 'drop-target' : ''}
                      transition-all duration-200`}
                    onDragOver={(e) => handleDragOver(e, rowIndex, colIndex)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
                    onTouchEnd={(e) => handleTouchEnd(e, rowIndex, colIndex)}
                  >
                    {cell && (
                      <div 
                        draggable={!gameOver && cell === turn}
                        onDragStart={(e) => handleDragStart(e, rowIndex, colIndex)}
                        onTouchStart={(e) => handleTouchStart(e, rowIndex, colIndex)}
                        onTouchMove={(e) => handleTouchMove(e, rowIndex, colIndex)}
                        className={`w-[min(3rem,15vw)] h-[min(3rem,15vw)] rounded-full shadow-lg
                          ${!gameOver && cell === turn ? 'cursor-move touch-manipulation' : 'cursor-not-allowed'}
                          transition-all duration-300 ease-in-out
                          ${!gameOver && cell === turn ? 'hover:scale-105 active:scale-95' : ''}
                          ${selectedPiece?.row === rowIndex && selectedPiece?.col === colIndex ? 'ring-2 ring-white/50' : ''}`}
                        style={{ 
                          backgroundColor: getPieceColor(cell),
                          opacity: (!gameOver && cell === turn) || touchedPiece?.row === rowIndex && touchedPiece?.col === colIndex ? 1 : 0.7
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Make buttons bigger on mobile */}
      <div className="mt-8 flex space-x-4">
        <button 
          className="px-6 py-3 text-base sm:text-lg bg-red-500/20 hover:bg-red-500/30 
                     text-white font-bold rounded-lg transition-colors touch-manipulation"
          onClick={() => {
            if (confirm('Are you sure you want to quit? All progress will be lost.')) {
              onQuit(); // Call the onQuit callback
            }
          }}
        >
          Quit Game
        </button>
        {gameOver && (
          <button 
            className="px-6 py-3 text-base sm:text-lg bg-white/10 hover:bg-white/20 
                       text-white font-bold rounded-lg transition-colors touch-manipulation"
            onClick={resetGame}
          >
            New Game
          </button>
        )}
      </div>
    </div>
  );
};

// Add helper function to find winning line
const findWinningLine = (board) => {
  const winningLines = [
    [[0, 0], [0, 1], [0, 2]], // Horizontal
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    [[0, 0], [1, 0], [2, 0]], // Vertical
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    [[0, 0], [1, 1], [2, 2]], // Diagonal
    [[0, 2], [1, 1], [2, 0]]
  ];

  for (let line of winningLines) {
    const [a, b, c] = line;
    if (
      board[a[0]][a[1]] &&
      board[a[0]][a[1]] === board[b[0]][b[1]] &&
      board[a[0]][a[1]] === board[c[0]][c[1]]
    ) {
      return line;
    }
  }
  return null;
};

export default Board;
