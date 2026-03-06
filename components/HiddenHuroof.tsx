import React, { useState, useEffect } from 'react';
import { GameHeader } from './GameHeader';
import { User } from '../types';
import { storageService } from '../services/storageService';
import { Loader2, HelpCircle } from 'lucide-react';

interface HiddenHuroofProps {
    onBack: () => void;
    currentUser: User | null;
    onUpdateUser: (user: User) => void;
}

interface HuroofData {
    theme: string;
    words: string[];
    gridSize: number;
}

export const HiddenHuroof: React.FC<HiddenHuroofProps> = ({ onBack, currentUser, onUpdateUser }) => {
    const [currentLevel, setCurrentLevel] = useState(0);
    const [grid, setGrid] = useState<string[][]>([]);
    const [foundWords, setFoundWords] = useState<string[]>([]);
    const [selection, setSelection] = useState<{r: number, c: number}[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [gameData, setGameData] = useState<HuroofData | null>(null);
    const [showHint, setShowHint] = useState(false);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadNewPuzzle();
    }, [currentLevel]);

    const loadNewPuzzle = async () => {
        setIsLoading(true);
        setError(null);
        setFoundWords([]);
        setSelection([]);
        setShowHint(false);
        try {
            const response = await fetch('/api/generate-game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameType: 'HIDDEN_HUROOF' })
            });
            if (!response.ok) throw new Error("Failed to connect");
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            if (!data.words || !Array.isArray(data.words) || data.words.length === 0) {
                throw new Error("Invalid puzzle data");
            }

            setGameData(data);
            generateGrid(data);
        } catch (err: any) {
            console.error("Failed to load word search:", err);
            setError(err.message || "Failed to load word search");
        } finally {
            setIsLoading(false);
        }
    };

    const generateGrid = (data: HuroofData) => {
        const size = data.gridSize || 8;
        const newGrid = Array(size).fill(null).map(() => Array(size).fill(''));

        data.words.forEach(word => {
            let placed = false;
            let attempts = 0;
            const upperWord = word.toUpperCase();
            while (!placed && attempts < 100) {
                const dir = Math.random() > 0.5 ? 'H' : 'V';
                const r = Math.floor(Math.random() * size);
                const c = Math.floor(Math.random() * size);

                if (canPlace(newGrid, upperWord, r, c, dir, size)) {
                    place(newGrid, upperWord, r, c, dir);
                    placed = true;
                }
                attempts++;
            }
        });

        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (!newGrid[r][c]) {
                    newGrid[r][c] = letters[Math.floor(Math.random() * letters.length)];
                }
            }
        }
        setGrid(newGrid);
    };

    const canPlace = (grid: string[][], word: string, r: number, c: number, dir: 'H' | 'V', size: number) => {
        if (dir === 'H') {
            if (c + word.length > size) return false;
            for (let i = 0; i < word.length; i++) {
                if (grid[r][c + i] !== '' && grid[r][c + i] !== word[i]) return false;
            }
        } else {
            if (r + word.length > size) return false;
            for (let i = 0; i < word.length; i++) {
                if (grid[r + i][c] !== '' && grid[r + i][c] !== word[i]) return false;
            }
        }
        return true;
    };

    const place = (grid: string[][], word: string, r: number, c: number, dir: 'H' | 'V') => {
        for (let i = 0; i < word.length; i++) {
            if (dir === 'H') grid[r][c + i] = word[i];
            else grid[r + i][c] = word[i];
        }
    };

    const handleCellClick = (r: number, c: number) => {
        if (selection.length === 0) {
            setSelection([{r, c}]);
        } else if (selection.length === 1) {
            const start = selection[0];
            const end = {r, c};
            let word = '';
            
            if (start.r === end.r) {
                const minC = Math.min(start.c, end.c);
                const maxC = Math.max(start.c, end.c);
                word = grid[start.r].slice(minC, maxC + 1).join('');
            } else if (start.c === end.c) {
                const minR = Math.min(start.r, end.r);
                const maxR = Math.max(start.r, end.r);
                for (let i = minR; i <= maxR; i++) word += grid[i][start.c];
            }
            
            if (word) checkWord(word);
            setSelection([]);
        }
    };

    const checkWord = (word: string) => {
        if (!gameData) return;
        const upperWord = word.toUpperCase();
        const reverse = upperWord.split('').reverse().join('');
        
        const targetWord = gameData.words.find(w => 
            w.toUpperCase() === upperWord || w.toUpperCase() === reverse
        );

        if (targetWord && !foundWords.includes(targetWord)) {
            const updated = [...foundWords, targetWord];
            setFoundWords(updated);
            if (updated.length === gameData.words.length) {
                if (currentUser) {
                    storageService.incrementGameStat(currentUser.username, 'HIDDEN_HUROOF');
                    const updatedUser = storageService.getUser(currentUser.username);
                    if (updatedUser) onUpdateUser(updatedUser);
                }
            }
        }
    };

    const giveHint = () => {
        if (!gameData || foundWords.length === gameData.words.length) return;
        setShowHint(true);
        setTimeout(() => setShowHint(false), 3000);
    };

    const nextLevel = () => {
        setCurrentLevel(prev => prev + 1);
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-brand-mint animate-spin mb-4" />
                <p className="text-brand-dark font-bold animate-pulse">AI is hiding words in the huroof...</p>
            </div>
        );
    }

    if (error || !gameData) {
        return (
             <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
                <p className="text-red-500 font-bold mb-4">{error || "Could not load word search."}</p>
                <button onClick={loadNewPuzzle} className="px-6 py-3 bg-brand-dark text-white rounded-xl font-bold hover:scale-105 transition-transform">Retry</button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-lg mx-auto animate-[fadeIn_0.5s_ease-out] flex flex-col items-center min-h-[80vh] p-4">
            <GameHeader 
                title="Hidden Huroof" 
                gameId="HIDDEN_HUROOF" 
                currentUser={currentUser} 
                onBack={onBack} 
            />

            <div className="w-full flex justify-between items-center mb-8">
                <div className="text-left">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-1">Theme</p>
                    <p className="text-2xl font-black text-brand-dark">{gameData?.theme}</p>
                </div>
                <button 
                    onClick={giveHint}
                    className="p-3 bg-white border-2 border-orange-400 text-orange-400 rounded-2xl hover:bg-orange-400 hover:text-white transition-all shadow-sm flex items-center gap-2 font-bold"
                >
                    <HelpCircle className="w-5 h-5" />
                    <span>Hint</span>
                </button>
            </div>

            {showHint && gameData && (
                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-xl text-orange-600 font-bold text-sm animate-bounce text-center">
                    Hint: Look for the word <span className="underline uppercase">"{gameData.words.find(w => !foundWords.includes(w))}"</span>
                </div>
            )}

            {/* Grid */}
            <div 
                className="grid gap-1 mb-8 bg-white p-2 rounded-xl shadow-lg border border-gray-200 select-none"
                style={{ gridTemplateColumns: `repeat(${gameData?.gridSize || 8}, 1fr)` }}
            >
                {grid.map((row, r) => (
                    row.map((char, c) => {
                        const isSelected = selection.some(s => s.r === r && s.c === c);
                        return (
                            <div 
                                key={`${r}-${c}`}
                                onClick={() => handleCellClick(r, c)}
                                className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center font-bold text-sm md:text-lg rounded cursor-pointer transition-colors ${
                                    isSelected ? 'bg-brand-brightGold text-brand-dark' : 'hover:bg-gray-100 text-gray-700'
                                }`}
                            >
                                {char}
                            </div>
                        );
                    })
                ))}
            </div>

            {/* Word List */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
                {gameData?.words.map(word => (
                    <div 
                        key={word}
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                            foundWords.includes(word) 
                            ? 'bg-brand-mint text-brand-dark line-through opacity-50' 
                            : 'bg-white border border-gray-200 text-gray-500'
                        }`}
                    >
                        {word}
                    </div>
                ))}
            </div>

            {gameData && foundWords.length === gameData.words.length && (
                <div className="text-center animate-pop-in">
                    <p className="text-2xl font-serif font-bold text-brand-dark mb-4">All Found!</p>
                    <button 
                        onClick={nextLevel}
                        className="px-8 py-3 bg-brand-dark text-white rounded-2xl font-black shadow-xl hover:scale-105 transition-transform"
                    >
                        Generate Next Puzzle
                    </button>
                </div>
            )}
        </div>
    );
};