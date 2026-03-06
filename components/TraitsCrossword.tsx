import React, { useState, useEffect } from 'react';
import { GameHeader } from './GameHeader';
import { User } from '../types';
import { storageService } from '../services/storageService';
import { Loader2, HelpCircle } from 'lucide-react';

interface TraitsCrosswordProps {
    onBack: () => void;
    currentUser: User | null;
    onUpdateUser: (user: User) => void;
}

interface CrosswordData {
    clue: string;
    answer: string;
    gridSize: number;
}

export const TraitsCrossword: React.FC<TraitsCrosswordProps> = ({ onBack, currentUser, onUpdateUser }) => {
    const [currentLevel, setCurrentLevel] = useState(0);
    const [input, setInput] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [gameData, setGameData] = useState<CrosswordData | null>(null);
    const [showHint, setShowHint] = useState(false);
    const [puzzles, setPuzzles] = useState<CrosswordData[]>([]);
    const [puzzleIndex, setPuzzleIndex] = useState(0);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadNewPuzzles();
    }, [currentLevel]);

    const loadNewPuzzles = async () => {
        setIsLoading(true);
        setError(null);
        setIsCorrect(false);
        setInput('');
        setShowHint(false);
        try {
            const response = await fetch('/api/generate-game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameType: 'TRAITS_CROSSWORD' })
            });
            if (!response.ok) throw new Error("Failed to connect");
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            // The API returns an array for TRAITS_CROSSWORD
            if (Array.isArray(data) && data.length > 0) {
                setPuzzles(data);
                setGameData(data[0]);
                setPuzzleIndex(0);
            } else if (data && !Array.isArray(data)) {
                 // Single object fallback
                setPuzzles([data]);
                setGameData(data);
                setPuzzleIndex(0);
            } else {
                throw new Error("Invalid data format");
            }
        } catch (err: any) {
            console.error("Failed to load puzzles:", err);
            setError(err.message || "Failed to load puzzles");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (val: string) => {
        if (!gameData) return;
        if (val.length <= gameData.answer.length) {
            setInput(val.toUpperCase());
            if (val.toUpperCase() === gameData.answer.toUpperCase()) {
                setIsCorrect(true);
                if (currentUser) {
                    storageService.incrementGameStat(currentUser.username, 'TRAITS_CROSSWORD');
                    const updated = storageService.getUser(currentUser.username);
                    if (updated) onUpdateUser(updated);
                }
            }
        }
    };

    const giveHint = () => {
        if (!gameData || isCorrect) return;
        setShowHint(true);
        setTimeout(() => setShowHint(false), 3000);
    };

    const nextLevel = () => {
        if (puzzleIndex < puzzles.length - 1) {
            const nextIdx = puzzleIndex + 1;
            setPuzzleIndex(nextIdx);
            setGameData(puzzles[nextIdx]);
            setInput('');
            setIsCorrect(false);
            setShowHint(false);
        } else {
            setCurrentLevel(prev => prev + 1);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-brand-mint animate-spin mb-4" />
                <p className="text-brand-dark font-bold animate-pulse">AI is preparing wisdom challenges...</p>
            </div>
        );
    }

    if (error || !gameData) {
        return (
             <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
                <p className="text-red-500 font-bold mb-4">{error || "Could not load crossword."}</p>
                <button onClick={loadNewPuzzles} className="px-6 py-3 bg-brand-dark text-white rounded-xl font-bold hover:scale-105 transition-transform">Retry</button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-lg mx-auto animate-[fadeIn_0.5s_ease-out] flex flex-col items-center min-h-[80vh] p-4">
            <GameHeader 
                title="Prophet's Traits" 
                gameId="TRAITS_CROSSWORD" 
                currentUser={currentUser} 
                onBack={onBack} 
            />

            <div className="w-full flex justify-between items-center mb-8">
                <div className="text-left">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-1">Puzzle {puzzleIndex + 1} of {puzzles.length || 1}</p>
                </div>
                <button 
                    onClick={giveHint}
                    className="p-3 bg-white border-2 border-brand-accent text-brand-accent rounded-2xl hover:bg-brand-accent hover:text-white transition-all shadow-sm flex items-center gap-2 font-bold"
                >
                    <HelpCircle className="w-5 h-5" />
                    <span>Hint</span>
                </button>
            </div>

            <div className="text-center mb-12 w-full">
                <div className="bg-brand-accent/10 p-6 rounded-3xl border border-brand-accent/20 shadow-sm min-h-[100px] flex items-center justify-center">
                    <p className="text-xl font-serif font-bold text-brand-dark leading-relaxed">"{gameData?.clue}"</p>
                </div>
            </div>

            {showHint && gameData && (
                <div className="mb-4 p-3 bg-brand-accent/10 border border-brand-accent/30 rounded-xl text-brand-dark font-bold text-sm animate-bounce">
                    Hint: The first letter is <span className="underline text-brand-accent">"{gameData.answer[0]}"</span> and it has {gameData.answer.length} letters.
                </div>
            )}

            {/* Word Grid */}
            <div className="flex justify-center gap-2 mb-8 flex-wrap">
                {gameData && Array.from({ length: gameData.answer.length }).map((_, i) => {
                    const char = input[i] || '';
                    return (
                        <div 
                            key={i}
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-black transition-all ${
                                isCorrect 
                                ? 'bg-brand-mint border-brand-mint text-brand-dark' 
                                : char 
                                    ? 'bg-white border-brand-dark text-brand-dark' 
                                    : 'bg-gray-50 border-gray-200'
                            }`}
                        >
                            {char}
                        </div>
                    );
                })}
            </div>

            {/* Hidden Input for Mobile Keyboard */}
            {!isCorrect && (
                <div className="relative w-full h-12">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => handleChange(e.target.value)}
                        className="opacity-0 absolute inset-0 h-full w-full cursor-pointer"
                        autoFocus
                    />
                    <p className="text-gray-400 text-sm font-bold animate-pulse text-center">Tap here & type to solve...</p>
                </div>
            )}

            {isCorrect && (
                <div className="text-center animate-pop-in mt-4">
                    <p className="text-2xl font-serif font-bold text-brand-dark mb-4">Correct!</p>
                    <button 
                        onClick={nextLevel}
                        className="px-8 py-3 bg-brand-dark text-white rounded-2xl font-black shadow-xl hover:scale-105 transition-transform"
                    >
                        {puzzleIndex < puzzles.length - 1 ? 'Next Puzzle' : 'Generate More'}
                    </button>
                </div>
            )}
        </div>
    );
};