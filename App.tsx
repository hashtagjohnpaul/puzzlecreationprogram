import React, { useState, useCallback } from 'react';
import { PuzzleType } from './types';
import SlidingTilePuzzle from './components/puzzles/SlidingTilePuzzle';
import WordGuessPuzzle from './components/puzzles/WordGuessPuzzle';
import CrosswordPuzzle from './components/puzzles/CrosswordPuzzle';
import WordLadderPuzzle from './components/puzzles/WordLadderPuzzle';
import ChessPuzzle from './components/puzzles/ChessPuzzle';
import WordSearchPuzzle from './components/puzzles/WordSearchPuzzle';
import { Gamepad2, ImageIcon, Puzzle, Swords, ListOrdered, BrainCircuit, FileSearch } from 'lucide-react';

const puzzleOptions = [
  { type: PuzzleType.SlidingTile, name: 'Sliding Tile', icon: <ImageIcon className="w-12 h-12 mx-auto" />, description: "Scramble an image into a solvable tile puzzle." },
  { type: PuzzleType.WordGuess, name: 'Word Guess', icon: <Puzzle className="w-12 h-12 mx-auto" />, description: "A Wordle-like game with a secret word." },
  { type: PuzzleType.Crossword, name: 'Crossword', icon: <Gamepad2 className="w-12 h-12 mx-auto" />, description: "Generate a themed or custom crossword puzzle." },
  { type: PuzzleType.WordLadder, name: 'Word Ladder', icon: <ListOrdered className="w-12 h-12 mx-auto" />, description: "Find the path from a start word to an end word." },
  { type: PuzzleType.Chess, name: 'Chess Puzzle', icon: <Swords className="w-12 h-12 mx-auto" />, description: "Create a 'mate-in-one' chess challenge." },
  { type: PuzzleType.WordSearch, name: 'Word Search', icon: <FileSearch className="w-12 h-12 mx-auto" />, description: "Find words in a grid to reveal a hidden message." },
];

const App: React.FC = () => {
  const [activePuzzle, setActivePuzzle] = useState<PuzzleType | null>(null);

  const renderActivePuzzle = useCallback(() => {
    switch (activePuzzle) {
      case PuzzleType.SlidingTile:
        return <SlidingTilePuzzle />;
      case PuzzleType.WordGuess:
        return <WordGuessPuzzle />;
      case PuzzleType.Crossword:
        return <CrosswordPuzzle />;
      case PuzzleType.WordLadder:
        return <WordLadderPuzzle />;
      case PuzzleType.Chess:
        return <ChessPuzzle />;
      case PuzzleType.WordSearch:
        return <WordSearchPuzzle />;
      default:
        return null;
    }
  }, [activePuzzle]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <BrainCircuit className="w-10 h-10 text-cyan-400" />
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-violet-500 text-transparent bg-clip-text">
              Puzzle Box Generator
            </h1>
          </div>
          <p className="text-slate-400">Create a challenge. Hide a secret.</p>
        </header>

        {activePuzzle ? (
          <main>
            <button
              onClick={() => setActivePuzzle(null)}
              className="mb-6 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              &larr; Back to Puzzle Selection
            </button>
            <div className="bg-slate-800 rounded-xl shadow-2xl p-6">
              {renderActivePuzzle()}
            </div>
          </main>
        ) : (
          <main>
            <h2 className="text-2xl font-semibold text-center mb-6">Choose a Puzzle Type</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {puzzleOptions.map((puzzle) => (
                <button
                  key={puzzle.type}
                  onClick={() => setActivePuzzle(puzzle.type)}
                  className="bg-slate-800 text-left p-6 rounded-xl shadow-lg hover:bg-slate-700 hover:scale-105 transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50"
                >
                  <div className="text-cyan-400 mb-4">{puzzle.icon}</div>
                  <h3 className="text-xl font-bold text-slate-100">{puzzle.name}</h3>
                  <p className="text-slate-400 mt-1">{puzzle.description}</p>
                </button>
              ))}
            </div>
          </main>
        )}
      </div>
       <footer className="text-center mt-12 text-slate-500 text-sm">
        <p>Built with React, Tailwind CSS, and the Gemini API.</p>
      </footer>
    </div>
  );
};

export default App;