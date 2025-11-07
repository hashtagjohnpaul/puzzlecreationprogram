import React, { useState, useEffect, useCallback } from 'react';
import { Secret, PuzzleType } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import SecretForm from '../SecretForm';
import SecretDisplay from '../SecretDisplay';
import ExportButton from '../ExportButton';

type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';
interface Guess {
  word: string;
  statuses: LetterStatus[];
}

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

const WordGuessPuzzle: React.FC = () => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [solution, setSolution] = useState('');
  const [secret, setSecret] = useState<Secret>({ type: 'text', value: '' });

  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [message, setMessage] = useState('');

  const handleStart = () => {
    if (solution.length === WORD_LENGTH && /^[a-zA-Z]+$/.test(solution) && secret.value) {
      setIsConfigured(true);
    } else {
      alert(`Please enter a ${WORD_LENGTH}-letter word and a secret reward.`);
    }
  };
  
  const handleGuessSubmit = useCallback(() => {
    if (currentGuess.length !== WORD_LENGTH) {
      setMessage(`Guess must be ${WORD_LENGTH} letters long.`);
      return;
    }
    
    const newStatuses: LetterStatus[] = Array(WORD_LENGTH).fill('absent');
    const solutionUpper = solution.toUpperCase();
    const guessUpper = currentGuess.toUpperCase();
    const solutionLetters = solutionUpper.split('');

    // First pass for correct letters
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guessUpper[i] === solutionUpper[i]) {
        newStatuses[i] = 'correct';
        solutionLetters[i] = '_'; // Mark as used
      }
    }

    // Second pass for present letters
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (newStatuses[i] !== 'correct') {
        const letterIndex = solutionLetters.indexOf(guessUpper[i]);
        if (letterIndex !== -1) {
          newStatuses[i] = 'present';
          solutionLetters[letterIndex] = '_'; // Mark as used
        }
      }
    }
    
    const newGuess: Guess = { word: currentGuess, statuses: newStatuses };
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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSolved || isLost || !isConfigured) return;

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
  }, [currentGuess, handleGuessSubmit, isSolved, isLost, isConfigured]);

  if (!isConfigured) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-cyan-400">Configure Word Guess Puzzle</h2>
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-300">Secret Word ({WORD_LENGTH} letters)</label>
          <Input 
            type="text" 
            value={solution} 
            onChange={(e) => setSolution(e.target.value.toUpperCase())} 
            maxLength={WORD_LENGTH} 
          />
        </div>
        <SecretForm secret={secret} onSecretChange={setSecret} />
        <Button onClick={handleStart}>Create Puzzle</Button>
      </div>
    );
  }

  if (isSolved) {
    return <SecretDisplay secret={secret} title="You Guessed It!" moves={guesses.length} />;
  }
  
  if (isLost) {
    return (
        <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-red-500">Game Over!</h2>
            <p className="text-slate-300 text-lg">The word was: <strong className="text-cyan-400">{solution}</strong></p>
            <p className="text-slate-400">Better luck next time!</p>
        </div>
    );
  }

  const emptyRows = Array(MAX_GUESSES - guesses.length - 1).fill(0);
  
  return (
    <div className="max-w-xs mx-auto text-center">
       <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <h2 className="text-2xl font-bold text-cyan-400">Word Guess</h2>
            <ExportButton 
              puzzleType={PuzzleType.WordGuess}
              puzzleState={{ solution, secret }} 
            />
        </div>
      <div className="grid grid-rows-6 gap-2 mb-4">
        {guesses.map((guess, i) => (
          <div key={i} className="grid grid-cols-5 gap-2">
            {guess.statuses.map((status, j) => (
              <div key={j} className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center font-bold text-2xl rounded
                ${status === 'correct' ? 'bg-green-500' : status === 'present' ? 'bg-yellow-500' : 'bg-slate-600'}
              `}>
                {guess.word[j].toUpperCase()}
              </div>
            ))}
          </div>
        ))}
        {guesses.length < MAX_GUESSES && (
            <div className="grid grid-cols-5 gap-2">
                {currentGuess.split('').concat(Array(WORD_LENGTH - currentGuess.length).fill('')).map((letter, j) => (
                    <div key={j} className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center font-bold text-2xl rounded border-2 border-slate-500`}>
                        {letter}
                    </div>
                ))}
            </div>
        )}
        {emptyRows.map((_, i) => (
            <div key={i} className="grid grid-cols-5 gap-2">
                {Array(WORD_LENGTH).fill(0).map((_, j) => (
                    <div key={j} className={`w-12 h-12 sm:w-14 sm:h-14 rounded bg-slate-700`}></div>
                ))}
            </div>
        ))}
      </div>
      {message && <p className="text-red-400 mb-2">{message}</p>}
      <p className="text-sm text-slate-400">Type your guess and press Enter.</p>
    </div>
  );
};

export default WordGuessPuzzle;