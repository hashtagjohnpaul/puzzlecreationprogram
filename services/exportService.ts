import { PuzzleType } from "../types";

// --- COMPONENT TEMPLATES (AS STRINGS) ---
// Note: These are string representations of React components.
// They will be transpiled in the browser by Babel Standalone.

const secretDisplayComponentString = `
const SecretDisplay = ({ secret, title, moves }) => {
  const renderSecret = () => {
    switch (secret.type) {
      case 'text':
        return (
            <div className="flex items-start gap-3 p-4 bg-slate-700 rounded-lg">
                <MessageSquare className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                <p className="text-lg text-slate-200 break-words">{secret.value}</p>
            </div>
        );
      case 'url':
        return (
            <div className="flex items-start gap-3 p-4 bg-slate-700 rounded-lg">
                <Link className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                <a href={secret.value} target="_blank" rel="noopener noreferrer" className="text-lg text-cyan-400 hover:underline break-all">
                    {secret.value}
                </a>
            </div>
        );
      case 'image':
        return (
            <div className="space-y-2">
                <div className="flex items-center gap-2"><Image className="w-5 h-5 text-cyan-400" /> <p className="text-slate-300">Image revealed:</p></div>
                <img src={secret.value} alt="Secret Reward" className="max-w-full mx-auto rounded-lg shadow-lg" />
            </div>
        );
      case 'video':
        return (
            <div className="space-y-2">
                 <div className="flex items-center gap-2"><Video className="w-5 h-5 text-cyan-400" /> <p className="text-slate-300">Video revealed:</p></div>
                <video controls src={secret.value} className="max-w-full mx-auto rounded-lg shadow-lg" />
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="text-center p-6 bg-slate-800 rounded-xl shadow-2xl border border-cyan-500/30">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-slate-100 mb-2">{title}</h2>
        {typeof moves !== 'undefined' && (
            <p className="text-slate-400 mb-6">Completed in {moves} {moves === 1 ? 'move' : 'moves'}.</p>
        )}
        <div className="my-6">
            <h3 className="text-xl font-semibold text-slate-300 mb-4">Your Reward:</h3>
            {renderSecret()}
        </div>
    </div>
  );
};
`;

const buttonComponentString = `
const Button = ({ children, className, variant = 'primary', ...props }) => {
  const baseClasses = 'font-bold py-2 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-cyan-500 hover:bg-cyan-600 text-white focus:ring-cyan-500',
    secondary: 'bg-slate-600 hover:bg-slate-500 text-white focus:ring-slate-500',
  };

  return (
    <button className={\`\${baseClasses} \${variantClasses[variant]} \${className}\`} {...props}>
      {children}
    </button>
  );
};
`;

const inputComponentString = `
const Input = ({ className, ...props }) => {
  return (
    <input
      className={\`bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 transition-colors duration-200 \${className}\`}
      {...props}
    />
  );
};
`;

const slidingTilePlayerString = `
const SlidingTilePuzzlePlayer = () => {
  const { initialTiles, gridSize, secret, puzzleImageSrc } = window.PUZZLE_STATE;
  
  const [isSolved, setIsSolved] = useState(false);
  const [tiles, setTiles] = useState(initialTiles);
  const [moves, setMoves] = useState(0);
  const blankTileId = gridSize * gridSize - 1;

  const checkWinCondition = useCallback(() => {
    if (tiles.length === 0) return false;
    return tiles.every(tile => tile.originalIndex === tile.currentIndex);
  }, [tiles]);

  useEffect(() => {
    if (checkWinCondition()) {
        setIsSolved(true);
    }
  }, [tiles, checkWinCondition]);

  const handleTileClick = (clickedTile) => {
    if (isSolved) return;
    const blankTile = tiles.find(t => t.id === blankTileId);
    const blankIndex = blankTile.currentIndex;
    const clickedIndex = clickedTile.currentIndex;

    const isAdjacent = 
      (Math.abs(blankIndex - clickedIndex) === 1 && Math.floor(blankIndex / gridSize) === Math.floor(clickedIndex / gridSize)) ||
      (Math.abs(blankIndex - clickedIndex) === gridSize);

    if (isAdjacent) {
      const newTiles = [...tiles];
      const blank = newTiles.find(t => t.id === blankTile.id);
      const clicked = newTiles.find(t => t.id === clickedTile.id);

      [blank.currentIndex, clicked.currentIndex] = [clicked.currentIndex, blank.currentIndex];

      setTiles(newTiles);
      setMoves(m => m + 1);
    }
  };

  const sortedTiles = useMemo(() => {
    return [...tiles].sort((a,b) => a.currentIndex - b.currentIndex);
  }, [tiles]);

  if (isSolved) {
    return <SecretDisplay secret={secret} title="Puzzle Solved!" moves={moves} />;
  }
  
  return (
    <div>
        <h2 className="text-2xl font-bold text-center mb-4 text-cyan-400">Sliding Tile Puzzle</h2>
        <p className="text-center text-slate-400 mb-4">Moves: {moves}</p>
        <div 
            className="grid mx-auto border-4 border-slate-600 rounded-lg overflow-hidden" 
            style={{ gridTemplateColumns: \`repeat(\${gridSize}, 1fr)\`, width: 'clamp(280px, 90vw, 400px)' }}>
          {sortedTiles.map((tile) => (
            <div 
              key={tile.id} 
              onClick={() => handleTileClick(tile)}
              className="aspect-square transition-transform duration-200 ease-in-out"
              style={tile.id === blankTileId ? { 
                backgroundColor: '#1e293b',
                cursor: 'default'
              } : {
                backgroundImage: \`url(\${puzzleImageSrc})\`,
                backgroundSize: \`\${gridSize * 100}% \${gridSize * 100}%\`,
                backgroundPosition: \`\${(tile.originalIndex % gridSize) * (100 / (gridSize - 1))}% \${Math.floor(tile.originalIndex / gridSize) * (100 / (gridSize - 1))}% \`,
                cursor: 'pointer',
              }}
            >
            </div>
          ))}
        </div>
    </div>
  );
};
`;

const wordGuessPlayerString = `
const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

const WordGuessPuzzlePlayer = () => {
    const { solution, secret } = window.PUZZLE_STATE;
    const [isSolved, setIsSolved] = useState(false);
    const [isLost, setIsLost] = useState(false);
    const [guesses, setGuesses] = useState([]);
    const [currentGuess, setCurrentGuess] = useState('');
    const [message, setMessage] = useState('');

    const handleGuessSubmit = useCallback(() => {
        if (currentGuess.length !== WORD_LENGTH) {
            setMessage(\`Guess must be \${WORD_LENGTH} letters long.\`);
            return;
        }

        const newStatuses = Array(WORD_LENGTH).fill('absent');
        const solutionUpper = solution.toUpperCase();
        const guessUpper = currentGuess.toUpperCase();
        const solutionLetters = solutionUpper.split('');

        for (let i = 0; i < WORD_LENGTH; i++) {
            if (guessUpper[i] === solutionUpper[i]) {
                newStatuses[i] = 'correct';
                solutionLetters[i] = '_';
            }
        }

        for (let i = 0; i < WORD_LENGTH; i++) {
            if (newStatuses[i] !== 'correct') {
                const letterIndex = solutionLetters.indexOf(guessUpper[i]);
                if (letterIndex !== -1) {
                    newStatuses[i] = 'present';
                    solutionLetters[letterIndex] = '_';
                }
            }
        }

        const newGuess = { word: currentGuess, statuses: newStatuses };
        const updatedGuesses = [...guesses, newGuess];
        setGuesses(updatedGuesses);
        setCurrentGuess('');
        setMessage('');

        if (guessUpper === solutionUpper) {
            setIsSolved(true);
        } else if (updatedGuesses.length >= MAX_GUESSES) {
            setIsLost(true);
        }
    }, [currentGuess, solution, guesses]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isSolved || isLost) return;
            if (e.key === 'Enter') {
                handleGuessSubmit();
            } else if (e.key === 'Backspace') {
                setCurrentGuess(g => g.slice(0, -1));
            } else if (currentGuess.length < WORD_LENGTH && /^[a-zA-Z]$/.test(e.key)) {
                setCurrentGuess(g => g + e.key.toUpperCase());
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentGuess, handleGuessSubmit, isSolved, isLost]);

    if (isSolved) {
        return <SecretDisplay secret={secret} title="You Guessed It!" moves={guesses.length} />;
    }

    if (isLost) {
        return (
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-red-500">Game Over!</h2>
                <p className="text-slate-300 text-lg">The word was: <strong className="text-cyan-400">{solution}</strong></p>
            </div>
        );
    }

    const emptyRows = Array(MAX_GUESSES - guesses.length - 1).fill(0);

    return (
        <div className="max-w-xs mx-auto text-center">
            <h2 className="text-2xl font-bold text-center mb-4 text-cyan-400">Word Guess</h2>
            <div className="grid grid-rows-6 gap-2 mb-4">
                {guesses.map((guess, i) => (
                    <div key={i} className="grid grid-cols-5 gap-2">
                        {guess.statuses.map((status, j) => (
                            <div key={j} className={\`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center font-bold text-2xl rounded \${status === 'correct' ? 'bg-green-500' : status === 'present' ? 'bg-yellow-500' : 'bg-slate-600'}\`}>
                                {guess.word[j].toUpperCase()}
                            </div>
                        ))}
                    </div>
                ))}
                {guesses.length < MAX_GUESSES && (
                    <div className="grid grid-cols-5 gap-2">
                        {currentGuess.split('').concat(Array(WORD_LENGTH - currentGuess.length).fill('')).map((letter, j) => (
                            <div key={j} className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center font-bold text-2xl rounded border-2 border-slate-500">
                                {letter}
                            </div>
                        ))}
                    </div>
                )}
                {emptyRows.map((_, i) => (
                    <div key={i} className="grid grid-cols-5 gap-2">
                        {Array(WORD_LENGTH).fill(0).map((_, j) => (
                            <div key={j} className="w-12 h-12 sm:w-14 sm:h-14 rounded bg-slate-700"></div>
                        ))}
                    </div>
                ))}
            </div>
            {message && <p className="text-red-400 mb-2">{message}</p>}
            <p className="text-sm text-slate-400">Type your guess and press Enter.</p>
        </div>
    );
};
`;

const crosswordPlayerString = `
${buttonComponentString}
const CrosswordPuzzlePlayer = () => {
  const { puzzleData, secret } = window.PUZZLE_STATE;
  const [isSolved, setIsSolved] = useState(false);
  const [userAnswers, setUserAnswers] = useState({});
  const [feedback, setFeedback] = useState({});
  const inputRefs = useRef({});

  const handleInputChange = (row, col, value) => {
    const upperValue = value.toUpperCase();
    setUserAnswers(prev => ({ ...prev, [\`\${row}-\${col}\`]: upperValue }));
    
    if (upperValue && col < puzzleData.grid[0].length - 1) {
      const nextCellKey = \`\${row}-\${col + 1}\`;
      if (inputRefs.current[nextCellKey]) {
        inputRefs.current[nextCellKey]?.focus();
      }
    }
  };
  
  const checkSolution = useCallback(() => {
    if (!puzzleData) return;
    let correctCount = 0;
    const newFeedback = {};
    let totalCells = 0;

    puzzleData.grid.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell) {
            totalCells++;
          const userAnswer = userAnswers[\`\${r}-\${c}\`] || '';
          const isCorrect = userAnswer === cell.toUpperCase();
          newFeedback[\`\${r}-\${c}\`] = isCorrect;
          if (isCorrect) correctCount++;
        }
      });
    });
    setFeedback(newFeedback);
    if (correctCount === totalCells) {
      setIsSolved(true);
    } else {
      alert(\`You have \${correctCount} out of \${totalCells} correct letters. Keep trying!\`);
    }
  }, [puzzleData, userAnswers]);

  if (isSolved) {
    return <SecretDisplay secret={secret} title="Crossword Complete!" />;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-4 text-cyan-400">Crossword: {puzzleData?.theme}</h2>
      <div className="flex flex-col md:flex-row gap-8 justify-center items-start">
        <div className="grid gap-px bg-slate-600 border border-slate-600" style={{gridTemplateColumns: \`repeat(\${puzzleData?.grid[0].length}, 1fr)\`}}>
            {puzzleData?.grid.map((row, r) =>
                row.map((cell, c) => {
                    const key = \`\${r}-\${c}\`;
                    if (!cell) {
                        return <div key={key} className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-800" />;
                    }
                    const cellFeedback = feedback[key];
                    const cellColor = cellFeedback === true ? 'bg-green-300 text-black' : cellFeedback === false ? 'bg-red-300 text-black' : 'bg-slate-200 text-black';

                    return (
                        <div key={key} className="w-8 h-8 sm:w-10 sm:h-10 relative bg-white">
                            <input
                                ref={el => inputRefs.current[key] = el}
                                type="text"
                                maxLength={1}
                                value={userAnswers[key] || ''}
                                onChange={(e) => handleInputChange(r,c,e.target.value)}
                                className={\`w-full h-full text-center font-bold text-lg uppercase \${cellColor} focus:outline-none focus:ring-2 focus:ring-cyan-500\`}
                            />
                        </div>
                    )
                })
            )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div>
                <h3 className="font-bold text-lg text-slate-300 mb-2">Across</h3>
                <ul className="space-y-1 text-slate-400">
                    {puzzleData?.clues.across.map(c => <li key={\`a-\${c.number}\`}><strong>{c.number}.</strong> {c.clue}</li>)}
                </ul>
            </div>
            <div>
                <h3 className="font-bold text-lg text-slate-300 mb-2">Down</h3>
                <ul className="space-y-1 text-slate-400">
                    {puzzleData?.clues.down.map(c => <li key={\`d-\${c.number}\`}><strong>{c.number}.</strong> {c.clue}</li>)}
                </ul>
            </div>
        </div>
      </div>
      <div className="text-center mt-8">
        <Button onClick={checkSolution}>Check My Answers</Button>
      </div>
    </div>
  );
};
`;

const wordLadderPlayerString = `
${buttonComponentString}
${inputComponentString}
const WordLadderPuzzlePlayer = () => {
    const { solution, secret } = window.PUZZLE_STATE;
    const [isSolved, setIsSolved] = useState(false);
    const [userLadder, setUserLadder] = useState(Array(solution.length).fill(''));

    const handleInputChange = (index, value) => {
        const newUserLadder = [...userLadder];
        newUserLadder[index] = value.toUpperCase();
        setUserLadder(newUserLadder);
    };

    const checkSolution = useCallback(() => {
        const isCorrect = solution.every((word, index) => userLadder[index] === word.toUpperCase());
        if (isCorrect) {
            setIsSolved(true);
        } else {
            alert("Not quite right. Check your ladder and try again!");
        }
    }, [solution, userLadder]);
    
    if (isSolved) {
        return <SecretDisplay secret={secret} title="Ladder Climbed!" moves={solution.length - 2} />;
    }

    return (
        <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">Word Ladder</h2>
            <p className="mb-6 text-slate-400">Change one letter at a time to get from the start word to the end word.</p>
            <div className="flex flex-col items-center gap-2 max-w-xs mx-auto">
                {solution.map((word, index) => (
                    <Input
                        key={index}
                        type="text"
                        readOnly={index === 0 || index === solution.length - 1}
                        value={index === 0 || index === solution.length - 1 ? word.toUpperCase() : userLadder[index]}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        maxLength={word.length}
                        className={\`text-center font-mono tracking-widest text-lg \${index === 0 || index === solution.length - 1 ? 'bg-slate-800 border-slate-700 cursor-default' : ''} \${userLadder[index] && userLadder[index] !== word.toUpperCase() ? 'border-red-500' : 'border-slate-600'}\`}
                    />
                ))}
            </div>
            <div className="mt-8">
                <Button onClick={checkSolution}>Check My Ladder</Button>
            </div>
        </div>
    );
};
`;

const chessPlayerString = `
${buttonComponentString}
${inputComponentString}
const pieceMap = {
  'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
  'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙',
};

const ChessPuzzlePlayer = () => {
    const { puzzleData, secret } = window.PUZZLE_STATE;
    const [isSolved, setIsSolved] = useState(false);
    const [userSolution, setUserSolution] = useState('');

    const checkSolution = useCallback(() => {
        if (!puzzleData) return;
        const normalizedUserSolution = userSolution.replace(/[+#\\s]/g, '').toLowerCase();
        const normalizedPuzzleSolution = puzzleData.solution.replace(/[+#\\s]/g, '').toLowerCase();
        
        if (normalizedUserSolution === normalizedPuzzleSolution) {
            setIsSolved(true);
        } else {
            alert("That's not the correct move. Try again!");
        }
    }, [puzzleData, userSolution]);

    const board = useMemo(() => {
        if (!puzzleData) return [];
        const boardState = [];
        const fenParts = puzzleData.fen.split(' ');
        const rows = fenParts[0].split('/');
        for (const row of rows) {
            const boardRow = [];
            for (const char of row) {
                if (isNaN(parseInt(char, 10))) {
                    boardRow.push(pieceMap[char]);
                } else {
                    for (let i = 0; i < parseInt(char, 10); i++) {
                        boardRow.push(null);
                    }
                }
            }
            boardState.push(boardRow);
        }
        return boardState;
    }, [puzzleData]);

    if (isSolved) {
        return <SecretDisplay secret={secret} title="Checkmate!" />;
    }

    return (
        <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-2 text-cyan-400">Chess Puzzle</h2>
            <p className="mb-4 text-slate-300 font-semibold">{puzzleData?.description}</p>
            <div className="border-4 border-slate-600">
                {board.map((row, r) => (
                    <div key={r} className="flex">
                        {row.map((piece, c) => (
                            <div
                                key={\`\${r}-\${c}\`}
                                className={\`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-3xl \${(r + c) % 2 === 0 ? 'bg-slate-300 text-slate-800' : 'bg-slate-500 text-slate-100'}\`}
                            >
                                {piece}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="mt-6 w-full max-w-xs">
                <label className="block mb-2 text-sm font-medium text-slate-300">Your Move (e.g., Qh7#)</label>
                <Input 
                    type="text" 
                    value={userSolution} 
                    onChange={(e) => setUserSolution(e.target.value)}
                    placeholder="Enter algebraic notation"
                />
            </div>
            <div className="mt-4">
                <Button onClick={checkSolution}>Submit Move</Button>
            </div>
        </div>
    );
};
`;

const wordSearchPlayerString = `
const WordSearchPlayer = () => {
  const { puzzleData, secret } = window.PUZZLE_STATE;
  const [isSolved, setIsSolved] = useState(false);
  const [foundWords, setFoundWords] = useState(new Set());
  const [selection, setSelection] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);

  const getCellFromEvent = (e) => {
    const target = e.target;
    const cellElement = target.closest('[data-row]');
    if (cellElement) {
        const row = parseInt(cellElement.getAttribute('data-row'), 10);
        const col = parseInt(cellElement.getAttribute('data-col'), 10);
        return { row, col };
    }
    return null;
  }

  const handleMouseDown = (e) => {
    const cell = getCellFromEvent(e);
    if (cell) {
        setIsSelecting(true);
        setSelection([cell]);
    }
  };

  const handleMouseMove = (e) => {
    if (isSelecting && selection.length > 0) {
        const cell = getCellFromEvent(e);
        const lastCell = selection.length > 1 ? selection[1] : selection[0];
        if (cell && (cell.row !== lastCell.row || cell.col !== lastCell.col)) {
             setSelection([selection[0], cell]);
        }
    }
  };

  const handleMouseUp = () => {
    if (selection.length === 2) {
      if (!puzzleData) return;
      const [start, end] = selection;
      for (const sol of puzzleData.solutions) {
          const matchForward = sol.start.row === start.row && sol.start.col === start.col && sol.end.row === end.row && sol.end.col === end.col;
          const matchBackward = sol.start.row === end.row && sol.start.col === end.col && sol.end.row === start.row && sol.end.col === start.col;

          if ((matchForward || matchBackward) && !foundWords.has(sol.word)) {
              setFoundWords(prev => new Set(prev).add(sol.word));
              break;
          }
      }
    }
    setIsSelecting(false);
    setSelection([]);
  };

  useEffect(() => {
    if (puzzleData && foundWords.size === puzzleData.words.length) {
        setIsSolved(true);
    }
  }, [foundWords, puzzleData]);

  const cellsInSelection = useMemo(() => {
    const cells = new Set();
    if (selection.length === 0) return cells;

    if (selection.length === 1) {
        const [start] = selection;
        cells.add(\`\${start.row}-\${start.col}\`);
        return cells;
    }
    
    const [start, end] = selection;
    
    const dRow = end.row - start.row;
    const dCol = end.col - start.col;

    const isHorizontal = dRow === 0;
    const isVertical = dCol === 0;
    const isDiagonal = Math.abs(dRow) === Math.abs(dCol);
    
    if (!isHorizontal && !isVertical && !isDiagonal) {
        cells.add(\`\${start.row}-\${start.col}\`);
        cells.add(\`\${end.row}-\${end.col}\`);
        return cells;
    }

    const dx = Math.sign(dCol);
    const dy = Math.sign(dRow);
    const steps = Math.max(Math.abs(dRow), Math.abs(dCol));
    
    for (let i = 0; i <= steps; i++) {
        const row = start.row + i * dy;
        const col = start.col + i * dx;
        cells.add(\`\${row}-\${col}\`);
    }
    
    return cells;
  }, [selection]);

  const foundCells = useMemo(() => {
    const cells = new Set();
    if (!puzzleData) return cells;
    puzzleData.solutions.forEach(sol => {
        if(foundWords.has(sol.word)) {
            const { start, end } = sol;
            const dx = Math.sign(end.col - start.col);
            const dy = Math.sign(end.row - start.row);
            let { row, col } = start;
            while(true) {
                cells.add(\`\${row}-\${col}\`);
                if(row === end.row && col === end.col) break;
                row += dy;
                col += dx;
            }
        }
    });
    return cells;
  }, [foundWords, puzzleData]);

  if (isSolved) {
    return <SecretDisplay secret={secret} title="All Words Found!" />;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-4 text-cyan-400">Word Search</h2>
      <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
        <div 
            className="grid bg-slate-600 border border-slate-600 select-none" 
            style={{gridTemplateColumns: \`repeat(\${puzzleData?.grid[0].length}, 1fr)\`, touchAction: 'none'}}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {puzzleData?.grid.map((row, r) =>
                row.map((letter, c) => {
                    const key = \`\${r}-\${c}\`;
                    const isSelected = cellsInSelection.has(key);
                    const isFound = foundCells.has(key);
                    return (
                        <div 
                            key={key} 
                            data-row={r} data-col={c}
                            className={\`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center font-bold font-mono text-lg uppercase transition-colors duration-150 \${isFound ? 'bg-cyan-500 text-white' : isSelected ? 'bg-yellow-400 text-slate-800' : 'bg-slate-300 text-slate-800'}\`}
                        >
                            {letter}
                        </div>
                    )
                })
            )}
        </div>
        <div className="w-full md:w-48">
            <h3 className="font-bold text-lg text-slate-300 mb-2">Find These Words:</h3>
            <ul className="space-y-1 text-slate-400">
                {puzzleData?.words.map(word => (
                    <li key={word} className={\`transition-colors duration-200 \${foundWords.has(word.toUpperCase()) ? 'line-through text-green-400' : ''}\`}>
                        {word}
                    </li>
                ))}
            </ul>
        </div>
      </div>
    </div>
  );
};
`;

const playerComponentMap: Record<PuzzleType, string> = {
    [PuzzleType.SlidingTile]: slidingTilePlayerString,
    [PuzzleType.WordGuess]: wordGuessPlayerString,
    [PuzzleType.Crossword]: crosswordPlayerString,
    [PuzzleType.WordLadder]: wordLadderPlayerString,
    [PuzzleType.Chess]: chessPlayerString,
    [PuzzleType.WordSearch]: wordSearchPlayerString,
};

const playerAppNameMap: Record<PuzzleType, string> = {
    [PuzzleType.SlidingTile]: "SlidingTilePuzzlePlayer",
    [PuzzleType.WordGuess]: "WordGuessPuzzlePlayer",
    [PuzzleType.Crossword]: "CrosswordPuzzlePlayer",
    [PuzzleType.WordLadder]: "WordLadderPuzzlePlayer",
    [PuzzleType.Chess]: "ChessPuzzlePlayer",
    [PuzzleType.WordSearch]: "WordSearchPlayer",
};

// --- EXPORT LOGIC ---

const generateHtml = (puzzleType: PuzzleType, puzzleState: any): string => {
    const puzzlePlayerName = playerAppNameMap[puzzleType];
    const puzzlePlayerCode = playerComponentMap[puzzleType];
    const puzzleStateJson = JSON.stringify(puzzleState, null, 2);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Puzzle Challenge</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script type="importmap">
    {
        "imports": {
            "react": "https://aistudiocdn.com/react@^19.2.0",
            "react-dom/client": "https://aistudiocdn.com/react-dom@^19.2.0/client",
            "lucide-react": "https://aistudiocdn.com/lucide-react@^0.553.0"
        }
    }
    </script>
</head>
<body class="bg-slate-900 text-white">
    <div id="root"></div>
    <script type="text/babel" data-type="module">
        import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
        import ReactDOM from 'react-dom/client';
        import { CheckCircle, Link, Image, Video, MessageSquare } from 'lucide-react';

        window.PUZZLE_STATE = ${puzzleStateJson};

        // --- Component Definitions ---
        ${secretDisplayComponentString}
        ${puzzlePlayerCode}

        const PlayerLayout = ({ children }) => {
            return (
                <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 sm:p-6 md:p-8 flex flex-col">
                    <header className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-cyan-400">Puzzle Challenge</h1>
                        <p className="text-slate-400">Solve the puzzle to reveal the secret!</p>
                    </header>
                    <main className="flex-grow flex items-center justify-center">
                        <div className="w-full max-w-4xl mx-auto bg-slate-800 rounded-xl shadow-2xl p-6">
                            {children}
                        </div>
                    </main>
                    <footer className="text-center mt-12 text-slate-500 text-sm">
                        <p>This puzzle was created with the Puzzle Box Generator.</p>
                    </footer>
                </div>
            );
        };

        const App = () => {
            const PuzzleComponent = ${puzzlePlayerName};
            return (
                <PlayerLayout>
                    <PuzzleComponent />
                </PlayerLayout>
            );
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>
  `;
};

export const exportPuzzle = (puzzleType: PuzzleType, puzzleState: any) => {
  const htmlContent = generateHtml(puzzleType, puzzleState);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${puzzleType.toLowerCase().replace(/_/g, '-')}-puzzle.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};