export const createEmptyBoard = () => {
  const board = Array(3).fill(null).map(() => Array(3).fill(null));
  
  // Place red pieces at the top
  board[0][0] = 'red';
  board[0][1] = 'red';
  board[0][2] = 'red';
  
  // Place blue pieces at the bottom
  board[2][0] = 'blue';
  board[2][1] = 'blue';
  board[2][2] = 'blue';
  
  return board;
};

export const checkWin = (board) => {
  // Define initial positions that should never count as wins
  const initialTopRow = ['red', 'red', 'red'];
  const initialBottomRow = ['blue', 'blue', 'blue'];

  const winningLines = [
    // Horizontal rows
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    // Vertical columns
    [[0, 0], [1, 0], [2, 0]],
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    // Diagonals
    [[0, 0], [1, 1], [2, 2]],
    [[0, 2], [1, 1], [2, 0]]
  ];

  for (let line of winningLines) {
    const [a, b, c] = line;
    const lineValues = [board[a[0]][a[1]], board[b[0]][b[1]], board[c[0]][c[1]]];
    
    // Check if we have three in a row
    if (lineValues[0] && 
        lineValues[0] === lineValues[1] && 
        lineValues[0] === lineValues[2]) {
      
      // Don't count if it's the initial top row of red pieces
      if (JSON.stringify(lineValues) === JSON.stringify(initialTopRow) &&
          JSON.stringify([a, b, c]) === JSON.stringify([[0, 0], [0, 1], [0, 2]])) {
        continue;
      }
      
      // Don't count if it's the initial bottom row of blue pieces
      if (JSON.stringify(lineValues) === JSON.stringify(initialBottomRow) &&
          JSON.stringify([a, b, c]) === JSON.stringify([[2, 0], [2, 1], [2, 2]])) {
        continue;
      }
      
      return lineValues[0]; // Return the winning color
    }
  }
  return null; // No winner yet
};

// Check if a move is valid
export const isAdjacentMove = (r1, c1, r2, c2) => {
  const validMoves = [
    [r1 - 1, c1], [r1 + 1, c1], [r1, c1 - 1], [r1, c1 + 1], // Horizontal/Vertical
    [r1 - 1, c1 - 1], [r1 - 1, c1 + 1], [r1 + 1, c1 - 1], [r1 + 1, c1 + 1] // Diagonal
  ];
  return validMoves.some(([r, c]) => r === r2 && c === c2);
};

// Handle move logic
export const handleMove = (board, row, col, turn, piecesPlaced, selectedPiece) => {
  let newBoard = board.map((r) => [...r]);

  if (piecesPlaced[turn] < 3) {
    if (!newBoard[row][col]) {
      newBoard[row][col] = turn;
      return { newBoard, moveSuccess: true };
    }
  } else if (selectedPiece) {
    const [prevRow, prevCol] = selectedPiece;
    if (!newBoard[row][col] && isAdjacentMove(prevRow, prevCol, row, col)) {
      newBoard[prevRow][prevCol] = null;
      newBoard[row][col] = turn;
      return { newBoard, moveSuccess: true };
    }
  }

  return { newBoard, moveSuccess: false };
};

export const getValidMoves = (row, col) => {
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
  