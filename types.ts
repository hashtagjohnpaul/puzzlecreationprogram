export enum PuzzleType {
  SlidingTile = 'SLIDING_TILE',
  WordGuess = 'WORD_GUESS',
  Crossword = 'CROSSWORD',
  WordLadder = 'WORD_LADDER',
  Chess = 'CHESS',
  WordSearch = 'WORD_SEARCH',
}

export type SecretType = 'text' | 'url' | 'image' | 'video';

export interface Secret {
  type: SecretType;
  value: string;
}

export interface CrosswordData {
  theme: string;
  grid: (string | null)[][];
  clues: {
    across: { number: number; clue: string; answer: string; row: number; col: number; length: number }[];
    down: { number: number; clue: string; answer: string; row: number; col: number; length: number }[];
  };
}

export interface ChessPuzzleData {
  fen: string;
  solution: string;
  description: string;
}

export interface WordSearchData {
  grid: string[][];
  solutions: { word: string; start: { row: number; col: number }; end: { row: number; col: number } }[];
  words: string[];
}