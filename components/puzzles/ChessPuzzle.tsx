import React, { useState, useCallback, useMemo } from 'react';
import { ChessPuzzleData, Secret, PuzzleType } from '../../types';
import { generateChessPuzzle } from '../../services/geminiService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import SecretForm from '../SecretForm';
import SecretDisplay from '../SecretDisplay';
import { Spinner } from '../ui/Spinner';
import ExportButton from '../ExportButton';

const pieceMap: { [key: string]: string } = {
  'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
  'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙',
};

const ChessPuzzle: React.FC = () => {
    const [isConfiguring, setIsConfiguring] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSolved, setIsSolved] = useState(false);
    const [puzzleData, setPuzzleData] = useState<ChessPuzzleData | null>(null);
    const [secret, setSecret] = useState<Secret>({ type: 'text', value: '' });
    const [userSolution, setUserSolution] = useState('');

    const handleGenerate = async () => {
        if (!secret.value) {
            alert("Please set a secret reward.");
            return;
        }
        setIsGenerating(true);
        const data = await generateChessPuzzle();
        if (data) {
            setPuzzleData(data);
            setIsConfiguring(false);
        } else {
            alert("Failed to generate chess puzzle. Please try again.");
        }
        setIsGenerating(false);
    };

    const checkSolution = useCallback(() => {
        if (!puzzleData) return;
        // Normalize solutions: remove check/mate symbols and spaces
        const normalizedUserSolution = userSolution.replace(/[+#\s]/g, '').toLowerCase();
        const normalizedPuzzleSolution = puzzleData.solution.replace(/[+#\s]/g, '').toLowerCase();
        
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
            const boardRow: (string | null)[] = [];
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

    if (isConfiguring) {
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-cyan-400">Configure Chess Puzzle</h2>
                <p className="text-slate-400">This will generate a random 'Mate in 1' puzzle.</p>
                <SecretForm secret={secret} onSecretChange={setSecret} />
                <Button onClick={handleGenerate} disabled={isGenerating}>
                    {isGenerating ? <div className="flex items-center gap-2"><Spinner /> Generating...</div> : "Generate Puzzle"}
                </Button>
            </div>
        );
    }

    if (isSolved) {
        return <SecretDisplay secret={secret} title="Checkmate!" />;
    }

    return (
        <div className="flex flex-col items-center">
            <div className="flex justify-between items-center mb-2 w-full max-w-md flex-wrap gap-4">
                 <h2 className="text-2xl font-bold text-cyan-400">Chess Puzzle</h2>
                 <ExportButton 
                      puzzleType={PuzzleType.Chess}
                      puzzleState={{ puzzleData, secret }} 
                    />
            </div>
            <p className="mb-4 text-slate-300 font-semibold">{puzzleData?.description}</p>
            <div className="border-4 border-slate-600">
                {board.map((row, r) => (
                    <div key={r} className="flex">
                        {row.map((piece, c) => (
                            <div
                                key={`${r}-${c}`}
                                className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-3xl
                                ${(r + c) % 2 === 0 ? 'bg-slate-300 text-slate-800' : 'bg-slate-500 text-slate-100'}`}
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

export default ChessPuzzle;