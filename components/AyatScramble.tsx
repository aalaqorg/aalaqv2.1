import React, { useState, useEffect } from 'react';
import { GameHeader } from './GameHeader';
import { User } from '../types';
import { storageService } from '../services/storageService';
import { Loader2, HelpCircle } from 'lucide-react';

interface AyatScrambleProps {
    onBack: () => void;
    currentUser: User | null;
    onUpdateUser: (user: User) => void;
}

interface GameData {
    verse: string;
    reference: string;
    words: string[];
}

export const AyatScramble: React.FC<AyatScrambleProps> = ({ onBack, currentUser, onUpdateUser }) => {
    const [currentLevel, setCurrentLevel] = useState(0);
    const [scrambledWords, setScrambledWords] = useState<string[]>([]);
    const [selectedWords, setSelectedWords] = useState<string[]>([]);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [gameData, setGameData] = useState<GameData | null>(null);
    const [showHint, setShowHint] = useState(false);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadNewLevel();
    }, [currentLevel]);

    const loadNewLevel = async () => {
        setIsLoading(true);
        setError(null);
        setIsCorrect(null);
        setSelectedWords([]);
        setShowHint(false);
        try {
            const response = await fetch('/api/generate-game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameType: 'AYAT_SCRAMBLE' })
            });
            
            if (!response.ok) {
                throw new Error("Failed to generate game");
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            if (!data.words || !Array.isArray(data.words)) {
                throw new Error("Invalid data received");
            }

            setGameData(data);
            
            // Fisher-Yates shuffle
            const shuffled = [...data.words];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            setScrambledWords(shuffled);
        } catch (err: any) {
            console.error("Failed to load game data:", err);
            setError(err.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleWordClick = (word: string, index: number, from: 'scrambled' | 'selected') => {
        if (isCorrect || isLoading) return;

        if (from === 'scrambled') {
            const newScrambled = [...scrambledWords];
            newScrambled.splice(index, 1);
            setScrambledWords(newScrambled);
            setSelectedWords([...selectedWords, word]);
        } else {
            const newSelected = [...selectedWords];
            newSelected.splice(index, 1);
            setSelectedWords(newSelected);
            setScrambledWords([...scrambledWords, word]);
        }
    };

    const checkAnswer = () => {
        if (!gameData) return;
        const currentSentence = selectedWords.join(' ');
        const targetSentence = gameData.words.join(' ');
        
        if (currentSentence === targetSentence) {
            setIsCorrect(true);
            if (currentUser) {
                storageService.incrementGameStat(currentUser.username, 'AYAT_SCRAMBLE');
                const updated = storageService.getUser(currentUser.username);
                if (updated) onUpdateUser(updated);
            }
        } else {
            setIsCorrect(false);
            setTimeout(() => setIsCorrect(null), 1000); // Reset error state
        }
    };

    const giveHint = () => {
        if (!gameData || isCorrect) return;
        
        // Find the first word that isn't correctly placed
        const correctWords = gameData.words;
        let hintIndex = selectedWords.length;
        
        // If the user has made a mistake already, we just reset and show the first word
        // Or if they are on the right track, we give them the next word.
        const nextCorrectWord = correctWords[hintIndex];
        
        if (nextCorrectWord) {
            setShowHint(true);
            setTimeout(() => setShowHint(false), 3000);
        }
    };

    const nextLevel = () => {
        setCurrentLevel(prev => prev + 1);
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-brand-mint animate-spin mb-4" />
                <p className="text-brand-dark font-bold animate-pulse">AI is crafting a unique challenge for you...</p>
            </div>
        );
    }

    if (error || !gameData) {
        return (
            <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
                <p className="text-red-500 font-bold mb-4">{error || "Failed to load game content."}</p>
                <button 
                    onClick={loadNewLevel}
                    className="px-6 py-3 bg-brand-dark text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-transform"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto animate-[fadeIn_0.5s_ease-out] flex flex-col items-center min-h-[80vh] p-4">
            <GameHeader 
                title="Ayat Scramble" 
                gameId="AYAT_SCRAMBLE" 
                currentUser={currentUser} 
                onBack={onBack} 
            />

            <div className="w-full flex justify-between items-center mb-8 px-4">
                <div className="text-left">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-1">AI Generated Level {currentLevel + 1}</p>
                    <p className="text-brand-dark font-serif italic text-lg opacity-60">"Arrange the words to reveal the wisdom."</p>
                </div>
                <button 
                    onClick={giveHint}
                    className="p-3 bg-white border-2 border-brand-lavender text-brand-lavender rounded-2xl hover:bg-brand-lavender hover:text-white transition-all shadow-sm flex items-center gap-2 font-bold"
                    title="Get a Hint"
                >
                    <HelpCircle className="w-5 h-5" />
                    <span className="hidden sm:inline">Hint</span>
                </button>
            </div>

            {showHint && gameData && (
                <div className="mb-4 p-3 bg-brand-lavender/10 border border-brand-lavender/30 rounded-xl text-brand-dark font-bold animate-bounce text-sm">
                    Hint: The next word is <span className="underline text-brand-lavender">"{gameData.words[selectedWords.length]}"</span>
                </div>
            )}

            {/* Answer Area */}
            <div className={`w-full min-h-[120px] bg-white rounded-3xl border-2 border-dashed ${isCorrect === false ? 'border-red-400 bg-red-50' : isCorrect === true ? 'border-brand-mint bg-brand-mint/10' : 'border-gray-300'} p-6 flex flex-wrap justify-center gap-3 mb-8 transition-colors duration-300 shadow-inner`}>
                {selectedWords.length === 0 && !isCorrect && (
                    <p className="text-gray-400 font-bold self-center w-full text-center">Tap words below to build the verse</p>
                )}
                {selectedWords.map((word, index) => (
                    <button
                        key={`${word}-${index}`}
                        onClick={() => handleWordClick(word, index, 'selected')}
                        className="px-4 py-2 bg-brand-dark text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-transform animate-pop-in"
                    >
                        {word}
                    </button>
                ))}
            </div>

            {/* Scrambled Words Area */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
                {scrambledWords.map((word, index) => (
                    <button
                        key={`${word}-${index}`}
                        onClick={() => handleWordClick(word, index, 'scrambled')}
                        className="px-4 py-2 bg-white border-2 border-brand-dark/10 text-brand-dark rounded-xl font-bold shadow-sm hover:bg-brand-dark/5 hover:border-brand-dark/30 transition-all animate-pop-in"
                    >
                        {word}
                    </button>
                ))}
            </div>

            {/* Controls */}
            <div className="w-full max-w-xs">
                {isCorrect ? (
                    <div className="text-center animate-pop-in">
                        <div className="mb-6 p-6 bg-brand-mint/20 rounded-3xl border border-brand-mint shadow-lg">
                            <p className="text-2xl font-serif font-bold text-brand-dark mb-2">Mashallah!</p>
                            <p className="text-sm font-bold text-brand-dark/60 italic">{gameData?.reference}</p>
                        </div>
                        <button 
                            onClick={nextLevel}
                            className="w-full py-4 bg-brand-dark text-white rounded-2xl font-black shadow-xl hover:scale-105 transition-transform"
                        >
                            Generate Next Challenge
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={checkAnswer}
                        disabled={selectedWords.length === 0 || isLoading}
                        className="w-full py-4 bg-brand-brightGold text-brand-dark rounded-2xl font-black shadow-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Check Answer
                    </button>
                )}
            </div>
        </div>
    );
};