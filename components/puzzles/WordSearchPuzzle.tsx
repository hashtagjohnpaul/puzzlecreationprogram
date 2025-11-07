// FIX: Import `useMemo` from 'react' to resolve errors.
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { WordSearchData, Secret, PuzzleType } from '../../types';
import { generateWordSearch } from '../../services/geminiService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import SecretForm from '../SecretForm';
import SecretDisplay from '../SecretDisplay';
import { Spinner } from '../ui/Spinner';
import ExportButton from '../ExportButton';

interface Cell {
  row: number;
  col: number;
}

const WordSearchPuzzle: React.FC = () => {
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [puzzleData, setPuzzleData] = useState<WordSearchData | null>(null);
  const [words, setWords] = useState('');
  const [secretMessage, setSecretMessage] = useState('');
  const [secret, setSecret] = useState<Secret>({ type: 'text', value: '' });

  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [selection, setSelection] = useState<Cell[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    const wordList = words.split(',').map(w => w.trim().toUpperCase()).filter(Boolean);
    if (wordList.length < 2 || !secretMessage || !secret.value) {
      alert("Please provide at least two words, a secret message, and a secret reward.");
      return;
    }
    setIsGenerating(true);
    const data = await generateWordSearch(wordList, secretMessage);
    if (data) {
      setPuzzleData(data);
      setIsConfiguring(false);
    } else {
      alert("Failed to generate word search. Please try a different word list or message.");
    }
    setIsGenerating(false);
  };
  
  const getCellFromEvent = (e: React.MouseEvent): Cell | null => {
    const target = e.target as HTMLElement;
    const cellElement = target.closest('[data-row]');
    if (cellElement) {
        const row = parseInt(cellElement.getAttribute('data-row')!, 10);
        const col = parseInt(cellElement.getAttribute('data-col')!, 10);
        return { row, col };
    }
    return null;
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const cell = getCellFromEvent(e);
    if (cell) {
        setIsSelecting(true);
        setSelection([cell]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // FIX: Add check for selection.length to prevent error on fast mouse movements
    if (isSelecting && selection.length > 0) {
        const cell = getCellFromEvent(e);
        // Also check if the cell is different from the current end-point to avoid needless re-renders.
        const lastCell = selection.length > 1 ? selection[1] : selection[0];
        
        if (cell && (cell.row !== lastCell.row || cell.col !== lastCell.col)) {
             // Keep the start point, update the end point
             setSelection([selection[0], cell]);
        }
    }
  };
  
  const handleMouseUp = () => {
    if (selection.length === 2) {
        checkSelection();
    }
    setIsSelecting(false);
    setSelection([]);
  };

  const checkSelection = useCallback(() => {
    if (!puzzleData || selection.length < 2) return;
    const [start, end] = selection;
    
    // Check all solutions
    for (const sol of puzzleData.solutions) {
        // Match forwards or backwards
        const matchForward = sol.start.row === start.row && sol.start.col === start.col && sol.end.row === end.row && sol.end.col === end.col;
        const matchBackward = sol.start.row === end.row && sol.start.col === end.col && sol.end.row === start.row && sol.end.col === start.col;

        if ((matchForward || matchBackward) && !foundWords.has(sol.word)) {
            setFoundWords(prev => new Set(prev).add(sol.word));
            return;
        }
    }
  }, [selection, puzzleData, foundWords]);
  
  useEffect(() => {
    if (puzzleData && foundWords.size === puzzleData.words.length) {
        setIsSolved(true);
    }
  }, [foundWords, puzzleData]);
  
  // FIX: Replace vulnerable while-loop with a safe, bounded calculation
  // to prevent infinite loops and RangeError.
  const cellsInSelection = useMemo(() => {
    const cells = new Set<string>();
    if (selection.length === 0) return cells;

    // For a single point selection, just highlight that cell.
    if (selection.length === 1) {
        const [start] = selection;
        cells.add(`${start.row}-${start.col}`);
        return cells;
    }
    
    const [start, end] = selection;
    
    const dRow = end.row - start.row;
    const dCol = end.col - start.col;

    // We only support horizontal, vertical, and 45-degree diagonal lines.
    const isHorizontal = dRow === 0;
    const isVertical = dCol === 0;
    const isDiagonal = Math.abs(dRow) === Math.abs(dCol);
    
    // If it's not a valid line, just highlight start and end points for feedback
    if (!isHorizontal && !isVertical && !isDiagonal) {
        cells.add(`${start.row}-${start.col}`);
        cells.add(`${end.row}-${end.col}`);
        return cells;
    }

    const dx = Math.sign(dCol);
    const dy = Math.sign(dRow);
    const steps = Math.max(Math.abs(dRow), Math.abs(dCol));
    
    for (let i = 0; i <= steps; i++) {
        const row = start.row + i * dy;
        const col = start.col + i * dx;
        cells.add(`${row}-${col}`);
    }
    
    return cells;
  }, [selection]);
  
  const foundCells = useMemo(() => {
    const cells = new Set<string>();
    if (!puzzleData) return cells;
    
    puzzleData.solutions.forEach(sol => {
        if(foundWords.has(sol.word)) {
            const { start, end } = sol;
            const dx = Math.sign(end.col - start.col);
            const dy = Math.sign(end.row - start.row);
            let { row, col } = start;
            while(true) {
                cells.add(`${row}-${col}`);
                if(row === end.row && col === end.col) break;
                row += dy;
                col += dx;
            }
        }
    });
    return cells;
  }, [foundWords, puzzleData]);


  if (isConfiguring) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-cyan-400">Configure Word Search</h2>
        <div>
            <label className="block mb-2 text-sm font-medium text-slate-300">Words to Hide</label>
            <textarea
                value={words}
                onChange={(e) => setWords(e.target.value)}
                placeholder="Enter words separated by commas, e.g., REACT, GEMINI, PUZZLE"
                className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 h-24 transition-colors duration-200"
            />
        </div>
        <div>
            <label className="block mb-2 text-sm font-medium text-slate-300">Secret Message</label>
            <Input 
                type="text" 
                value={secretMessage} 
                onChange={(e) => setSecretMessage(e.target.value)}
                placeholder="The leftover letters will spell this" 
            />
        </div>
        <SecretForm secret={secret} onSecretChange={setSecret} />
        <Button onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? <div className="flex items-center gap-2"><Spinner /> Generating...</div> : "Generate Puzzle"}
        </Button>
      </div>
    );
  }

  if (isSolved) {
    return <SecretDisplay secret={secret} title="All Words Found!" />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-cyan-400">Word Search</h2>
        <ExportButton 
          puzzleType={PuzzleType.WordSearch}
          puzzleState={{ puzzleData, secret }} 
        />
      </div>
      <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
        <div 
            ref={gridRef}
            className="grid bg-slate-600 border border-slate-600 select-none" 
            style={{gridTemplateColumns: `repeat(${puzzleData?.grid[0].length}, 1fr)`, touchAction: 'none'}}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {puzzleData?.grid.map((row, r) =>
                row.map((letter, c) => {
                    const key = `${r}-${c}`;
                    const isSelected = cellsInSelection.has(key);
                    const isFound = foundCells.has(key);
                    return (
                        <div 
                            key={key} 
                            data-row={r} data-col={c}
                            className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center font-bold font-mono text-lg uppercase transition-colors duration-150
                            ${isFound ? 'bg-cyan-500 text-white' : isSelected ? 'bg-yellow-400 text-slate-800' : 'bg-slate-300 text-slate-800'}`}
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
                    <li key={word} className={`transition-colors duration-200 ${foundWords.has(word.toUpperCase()) ? 'line-through text-green-400' : ''}`}>
                        {word}
                    </li>
                ))}
            </ul>
        </div>
      </div>
    </div>
  );
};

export default WordSearchPuzzle;