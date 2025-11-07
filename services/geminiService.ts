import { GoogleGenAI, Type } from "@google/genai";
import { ChessPuzzleData, CrosswordData, WordSearchData } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateCrossword = async (theme: string, words?: string[]): Promise<CrosswordData | null> => {
  try {
    const prompt = words && words.length > 0
        ? `Generate a compact crossword puzzle using only these words: ${words.join(', ')}. Create appropriate, short clues for each word.`
        : `Generate a small 5x7 crossword puzzle about "${theme}". The words should be common and not too long.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            theme: { type: Type.STRING },
            grid: {
              type: Type.ARRAY,
              items: {
                type: Type.ARRAY,
                items: { type: Type.STRING, nullable: true },
              },
              description: "5 columns, 7 rows. Null for black squares, letter for answer squares.",
            },
            clues: {
              type: Type.OBJECT,
              properties: {
                across: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      number: { type: Type.INTEGER },
                      clue: { type: Type.STRING },
                      answer: { type: Type.STRING },
                      row: { type: Type.INTEGER },
                      col: { type: Type.INTEGER },
                      length: { type: Type.INTEGER },
                    },
                  },
                },
                down: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      number: { type: Type.INTEGER },
                      clue: { type: Type.STRING },
                      answer: { type: Type.STRING },
                      row: { type: Type.INTEGER },
                      col: { type: Type.INTEGER },
                      length: { type: Type.INTEGER },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const jsonText = response.text.trim();
    const data = JSON.parse(jsonText);
    return data as CrosswordData;
  } catch (error) {
    console.error("Error generating crossword:", error);
    return null;
  }
};

export const generateWordLadder = async (startWord: string, endWord: string): Promise<string[] | null> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a word ladder from "${startWord}" to "${endWord}". Each step must be a valid English word.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        ladder: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        return data.ladder as string[];
    } catch (error) {
        console.error("Error generating word ladder:", error);
        return null;
    }
};

export const generateChessPuzzle = async (): Promise<ChessPuzzleData | null> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Generate a simple 'mate in 1' chess puzzle for White to move. Provide the board position in FEN notation, a short description, and the solution in standard algebraic notation (e.g., 'Qh7#').",
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        fen: { type: Type.STRING, description: "The board state in FEN format." },
                        solution: { type: Type.STRING, description: "The winning move in algebraic notation." },
                        description: { type: Type.STRING, description: "A brief description of the puzzle, e.g., 'White to move and mate in 1'."}
                    }
                }
            }
        });
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        return data as ChessPuzzleData;
    } catch (error) {
        console.error("Error generating chess puzzle:", error);
        return null;
    }
};

export const generateWordSearch = async (words: string[], secretMessage: string, gridSize: number = 12): Promise<WordSearchData | null> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Create a ${gridSize}x${gridSize} word search puzzle.
            Hide the following words: ${words.join(', ')}. Words can be placed horizontally, vertically, or diagonally in any direction.
            After placing the words, the remaining empty cells must be filled with letters that, when read from top-to-bottom and left-to-right, spell out this exact secret message: "${secretMessage}".
            Return the completed grid and the exact start and end coordinates ({row, col}) for each placed word. Do not include the secret message in the response.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        grid: {
                            type: Type.ARRAY,
                            description: "The completed word search grid.",
                            items: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        solutions: {
                            type: Type.ARRAY,
                            description: "The list of hidden words and their start/end coordinates.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    word: { type: Type.STRING },
                                    start: { type: Type.OBJECT, properties: { row: { type: Type.INTEGER }, col: { type: Type.INTEGER } } },
                                    end: { type: Type.OBJECT, properties: { row: { type: Type.INTEGER }, col: { type: Type.INTEGER } } }
                                }
                            }
                        }
                    }
                }
            }
        });
        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        // Ensure words from input are used, as Gemini might change casing
        return { ...data, words } as WordSearchData;
    } catch (error) {
        console.error("Error generating word search:", error);
        return null;
    }
};