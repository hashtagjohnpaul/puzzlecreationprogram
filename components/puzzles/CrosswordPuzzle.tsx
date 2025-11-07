import React, { useState, useCallback, useRef } from 'react';
import { CrosswordData, Secret, PuzzleType } from '../../types';
import { generateCrossword } from '../../services/geminiService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import SecretForm from '../SecretForm';
import SecretDisplay from '../SecretDisplay';
import { Spinner } from '../ui/Spinner';
import ExportButton from '../ExportButton';

type UserAnswers = { [key: string]: string }; // key: "row-col"

const CrosswordPuzzle: React.FC = () => {
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [puzzleData, setPuzzleData] = useState<CrosswordData | null>(null);
  const [theme, setTheme] = useState('');
  const [wordList, setWordList] = useState('');
  const [generationMode, setGenerationMode] = useState<'theme' | 'words'>('theme');
  const [secret, setSecret] = useState<Secret>({ type: 'text', value: '' });
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [feedback, setFeedback] = useState<{ [key: string]: boolean }>({});

  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleGenerate = async () => {
    if (!secret.value) {
      alert("Please set a secret reward.");
      return;
    }

    const words = generationMode === 'words' ? wordList.split(',').map(w => w.trim()).filter(Boolean) : undefined;
    if (generationMode === 'theme' && !theme) {
        alert("Please enter a theme.");
        return;
    }
    if (generationMode === 'words' && (!words || words.length < 2)) {
      alert("Please provide at least two words, separated by commas.");
      return;
    }

    setIsGenerating(true);
    const data = await generateCrossword(theme, words);
    if (data) {
      setPuzzleData(data);
      setIsConfiguring(false);
    } else {
      alert("Failed to generate crossword. Please try another theme or word list.");
    }
    setIsGenerating(false);
  };
  
  const handleInputChange = (row: number, col: number, value: string) => {
    const upperValue = value.toUpperCase();
    setUserAnswers(prev => ({ ...prev, [`${row}-${col}`]: upperValue }));
    
    if (upperValue && col < puzzleData!.grid[0].length - 1) {
      const nextCellKey = `${row}-${col + 1}`;
      if (inputRefs.current[nextCellKey]) {
        inputRefs.current[nextCellKey]?.focus();
      }
    }
  };
  
  const checkSolution = useCallback(() => {
    if (!puzzleData) return;
    let correctCount = 0;
    const newFeedback: { [key: string]: boolean } = {};
    let totalCells = 0;

    puzzleData.grid.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell) {
            totalCells++;
          const userAnswer = userAnswers[`${r}-${c}`] || '';
          const isCorrect = userAnswer === cell.toUpperCase();
          newFeedback[`${r}-${c}`] = isCorrect;
          if (isCorrect) correctCount++;
        }
      });
    });
    setFeedback(newFeedback);
    if (correctCount === totalCells) {
      setIsSolved(true);
    } else {
      alert(`You have ${correctCount} out of ${totalCells} correct letters. Keep trying!`);
    }
  }, [puzzleData, userAnswers]);


  if (isConfiguring) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-cyan-400">Configure Crossword Puzzle</h2>
        <div>
            <label className="block mb-2 text-sm font-medium text-slate-300">Generation Method</label>
            <div className="flex items-center gap-4 bg-slate-700/50 p-2 rounded-lg">
                <Button variant={generationMode === 'theme' ? 'primary' : 'secondary'} onClick={() => setGenerationMode('theme')} className="flex-1">From Theme</Button>
                <Button variant={generationMode === 'words' ? 'primary' : 'secondary'} onClick={() => setGenerationMode('words')} className="flex-1">From Word List</Button>
            </div>
        </div>
        
        {generationMode === 'theme' ? (
             <div>
                <label className="block mb-2 text-sm font-medium text-slate-300">Puzzle Theme</label>
                <Input 
                    type="text" 
                    value={theme} 
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="e.g., Space Exploration, Ocean Animals" 
                />
            </div>
        ) : (
            <div>
                 <label className="block mb-2 text-sm font-medium text-slate-300">Word List</label>
                 <textarea
                    value={wordList}
                    onChange={(e) => setWordList(e.target.value)}
                    placeholder="Enter words separated by commas, e.g., REACT, GEMINI, PUZZLE"
                    className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 h-24 transition-colors duration-200"
                 />
            </div>
        )}
       
        <SecretForm secret={secret} onSecretChange={setSecret} />
        <Button onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? <div className="flex items-center gap-2"><Spinner /> Generating...</div> : "Generate Puzzle"}
        </Button>
      </div>
    );
  }

  if (isSolved) {
    return <SecretDisplay secret={secret} title="Crossword Complete!" />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-cyan-400">Crossword: {puzzleData?.theme}</h2>
        <ExportButton 
          puzzleType={PuzzleType.Crossword}
          puzzleState={{ puzzleData, secret }} 
        />
      </div>
      <div className="flex flex-col md:flex-row gap-8 justify-center items-start">
        <div className="grid gap-px bg-slate-600 border border-slate-600" style={{gridTemplateColumns: `repeat(${puzzleData?.grid[0].length}, 1fr)`}}>
            {puzzleData?.grid.map((row, r) =>
                row.map((cell, c) => {
                    const key = `${r}-${c}`;
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
                                className={`w-full h-full text-center font-bold text-lg uppercase ${cellColor} focus:outline-none focus:ring-2 focus:ring-cyan-500`}
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
                    {puzzleData?.clues.across.map(c => <li key={`a-${c.number}`}><strong>{c.number}.</strong> {c.clue}</li>)}
                </ul>
            </div>
            <div>
                <h3 className="font-bold text-lg text-slate-300 mb-2">Down</h3>
                <ul className="space-y-1 text-slate-400">
                    {puzzleData?.clues.down.map(c => <li key={`d-${c.number}`}><strong>{c.number}.</strong> {c.clue}</li>)}
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

export default CrosswordPuzzle;