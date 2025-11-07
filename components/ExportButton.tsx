import React from 'react';
import { PuzzleType } from '../types';
import { exportPuzzle } from '../services/exportService';
import { Button } from './ui/Button';
import { Download } from 'lucide-react';

interface ExportButtonProps {
  puzzleType: PuzzleType;
  puzzleState: any;
  className?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ puzzleType, puzzleState, className }) => {
  const handleExport = () => {
    exportPuzzle(puzzleType, puzzleState);
  };

  return (
    <Button variant="secondary" onClick={handleExport} className={`flex items-center gap-2 ${className}`}>
      <Download className="w-4 h-4" />
      Export Puzzle
    </Button>
  );
};

export default ExportButton;
