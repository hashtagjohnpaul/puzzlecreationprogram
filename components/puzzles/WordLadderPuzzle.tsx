import React, { useState, useCallback } from 'react';
import { Secret, PuzzleType } from '../../types';
import { generateWordLadder } from '../../services/geminiService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import SecretForm from '../SecretForm';
import SecretDisplay from '../SecretDisplay';
import { Spinner } from '../ui/Spinner';
import ExportButton from '../ExportButton';

const WordLadderPuzzle: React.FC = () => {
    const [isConfiguring, setIsConfiguring] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSolved, setIsSolved] = useState(false);
    const [solution, setSolution] = useState<string[]>([]);
    const [startWord, setStartWord] = useState('');
    const [endWord, setEndWord] = useState('');
    const [secret, setSecret] = useState<Secret>({ type: 'text', value: '' });
    const [userLadder, setUserLadder] = useState<string[]>([]);

    const handleGenerate = async () => {
        if (!startWord || !endWord || startWord.length !== endWord.length || !secret.value) {
            alert("Please provide a start and end word of the same length, and a secret.");
            return;
        }
        setIsGenerating(true);
        const ladder = await generateWordLadder(startWord, endWord);
        if (ladder && ladder.length > 0) {
            setSolution(ladder);
            setUserLadder(Array(ladder.length).fill(''));
            setIsConfiguring(false);
        } else {
            alert("Could not generate a word ladder for these words. Please try different ones.");
        }
        setIsGenerating(false);
    };

    const handleInputChange = (index: number, value: string) => {
        const newUserLadder = [...userLadder];
        newUserLadder[index] = value.toUpperCase();
        setUserLadder(newUserLadder);
    };

    const checkSolution = useCallback(() => {
        const isCorrect = solution.every((word, index) => userLadder[index] === word.toUpperCase());
        if (isCorrect) {
            setIsSolved(true);
        } else {
            alert("Not quite right. A correct word is red, incorrect is default. Check your ladder and try again!");
        }
    }, [solution, userLadder]);

    if (isConfiguring) {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-cyan-400">Configure Word Ladder</h2>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block mb-2 text-sm font-medium text-slate-300">Start Word</label>
                        <Input type="text" value={startWord} onChange={(e) => setStartWord(e.target.value.toUpperCase())} />
                    </div>
                    <div className="flex-1">
                        <label className="block mb-2 text-sm font-medium text-slate-300">End Word</label>
                        <Input type="text" value={endWord} onChange={(e) => setEndWord(e.target.value.toUpperCase())} />
                    </div>
                </div>
                <SecretForm secret={secret} onSecretChange={setSecret} />
                <Button onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating ? <div className="flex items-center gap-2"><Spinner /> Generating...</div> : "Generate Puzzle"}
                </Button>
            </div>
        );
    }
    
    if (isSolved) {
        return <SecretDisplay secret={secret} title="Ladder Climbed!" moves={solution.length - 2} />;
    }

    return (
        <div className="text-center">
             <div className="flex justify-center items-center mb-4 flex-wrap gap-4 relative">
                <h2 className="text-2xl font-bold text-cyan-400">Word Ladder</h2>
                <div className="sm:absolute sm:right-0">
                    <ExportButton 
                      puzzleType={PuzzleType.WordLadder}
                      puzzleState={{ solution, secret }} 
                    />
                </div>
            </div>
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
                        className={`text-center font-mono tracking-widest text-lg ${index === 0 || index === solution.length - 1 ? 'bg-slate-800 border-slate-700 cursor-default' : ''} ${userLadder[index] && userLadder[index] !== word.toUpperCase() ? 'border-red-500' : 'border-slate-600'}`}
                    />
                ))}
            </div>
            <div className="mt-8">
                <Button onClick={checkSolution}>Check My Ladder</Button>
            </div>
        </div>
    );
};

export default WordLadderPuzzle;