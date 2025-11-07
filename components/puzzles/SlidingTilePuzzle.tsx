import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Secret, PuzzleType } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import SecretForm from '../SecretForm';
import SecretDisplay from '../SecretDisplay';
import ExportButton from '../ExportButton';

interface Tile {
  id: number;
  originalIndex: number;
  currentIndex: number;
}

const SlidingTilePuzzle: React.FC = () => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null); // Original user upload
  const [puzzleImageSrc, setPuzzleImageSrc] = useState<string | null>(null); // Cropped, square puzzle image
  const [gridSize, setGridSize] = useState(3);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [initialTiles, setInitialTiles] = useState<Tile[]>([]);
  const [moves, setMoves] = useState(0);
  const [secret, setSecret] = useState<Secret>({ type: 'text', value: '' });

  const shuffleTiles = useCallback((tilesToShuffle: Tile[]) => {
    const shuffled = [...tilesToShuffle];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.map((tile, index) => ({ ...tile, currentIndex: index }));
  }, []);

  const generateTiles = useCallback(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const sourceSize = Math.min(img.width, img.height);
      const sourceX = (img.width - sourceSize) / 2;
      const sourceY = (img.height - sourceSize) / 2;
      
      // We draw the final, cropped, square image onto a canvas to get a clean data URL
      canvas.width = sourceSize;
      canvas.height = sourceSize;
      ctx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, sourceSize, sourceSize);
      setPuzzleImageSrc(canvas.toDataURL());
      
      const newTiles: Omit<Tile, 'currentIndex'>[] = [];
      for (let i = 0; i < gridSize * gridSize; i++) {
        newTiles.push({ id: i, originalIndex: i });
      }

      const shuffled = shuffleTiles(newTiles as Tile[]);
      setTiles(shuffled);
      setInitialTiles(JSON.parse(JSON.stringify(shuffled)));
    };
  }, [imageSrc, gridSize, shuffleTiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleStart = () => {
    if (imageSrc && secret.value) {
      generateTiles();
      setIsConfigured(true);
      setMoves(0);
    } else {
      alert("Please upload an image and set a secret reward.");
    }
  };
  
  const checkWinCondition = useCallback(() => {
    if (tiles.length === 0) return false;
    return tiles.every(tile => tile.originalIndex === tile.currentIndex);
  }, [tiles]);

  useEffect(() => {
    if(isConfigured && checkWinCondition()) {
        setIsSolved(true);
    }
  }, [tiles, isConfigured, checkWinCondition]);

  const handleTileClick = (clickedTile: Tile) => {
    if (isSolved) return;
    const blankTileId = gridSize * gridSize - 1;
    const blankTile = tiles.find(t => t.id === blankTileId)!;
    const blankIndex = blankTile.currentIndex;
    const clickedIndex = clickedTile.currentIndex;

    const isAdjacent = 
      (Math.abs(blankIndex - clickedIndex) === 1 && Math.floor(blankIndex / gridSize) === Math.floor(clickedIndex / gridSize)) ||
      (Math.abs(blankIndex - clickedIndex) === gridSize);

    if (isAdjacent) {
      const newTiles = [...tiles];
      
      const blank = newTiles.find(t => t.id === blankTile.id)!;
      const clicked = newTiles.find(t => t.id === clickedTile.id)!;

      [blank.currentIndex, clicked.currentIndex] = [clicked.currentIndex, blank.currentIndex];

      setTiles(newTiles);
      setMoves(m => m + 1);
    }
  };

  const sortedTiles = useMemo(() => {
    return [...tiles].sort((a,b) => a.currentIndex - b.currentIndex);
  }, [tiles]);


  if (!isConfigured) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-cyan-400">Configure Sliding Tile Puzzle</h2>
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-300">Upload Image</label>
          <Input type="file" accept="image/*" onChange={handleFileChange} />
          {imageSrc && <img src={imageSrc} alt="Preview" className="mt-4 rounded-lg max-w-xs mx-auto" />}
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-300">Grid Size</label>
          <select value={gridSize} onChange={(e) => setGridSize(Number(e.target.value))} className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5">
            <option value="3">3x3 (Easy)</option>
            <option value="4">4x4 (Medium)</option>
            <option value="5">5x5 (Hard)</option>
          </select>
        </div>
        <SecretForm secret={secret} onSecretChange={setSecret} />
        <Button onClick={handleStart}>Create Puzzle</Button>
      </div>
    );
  }

  if (isSolved) {
    return <SecretDisplay secret={secret} title="Puzzle Solved!" moves={moves} />;
  }
  
  const blankTileId = gridSize * gridSize - 1;

  return (
    <div>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <h2 className="text-2xl font-bold text-cyan-400">Sliding Tile Puzzle</h2>
            <ExportButton 
              puzzleType={PuzzleType.SlidingTile}
              puzzleState={{ puzzleImageSrc, gridSize, initialTiles, secret }} 
            />
        </div>
        <p className="text-center text-slate-400 mb-4">Moves: {moves}</p>
        <div 
            className="grid mx-auto border-4 border-slate-600 rounded-lg overflow-hidden" 
            style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`, width: 'clamp(280px, 90vw, 400px)' }}>
          {sortedTiles.map((tile) => (
            <div 
              key={tile.id} 
              onClick={() => handleTileClick(tile)}
              className="aspect-square transition-transform duration-200 ease-in-out"
              style={tile.id === blankTileId ? { 
                backgroundColor: '#1e293b', // slate-800
                cursor: 'default'
              } : {
                backgroundImage: `url(${puzzleImageSrc})`,
                backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                backgroundPosition: `${(tile.originalIndex % gridSize) * (100 / (gridSize - 1))}% ${Math.floor(tile.originalIndex / gridSize) * (100 / (gridSize - 1))}%`,
                cursor: 'pointer',
              }}
            >
            </div>
          ))}
        </div>
    </div>
  );
};

export default SlidingTilePuzzle;