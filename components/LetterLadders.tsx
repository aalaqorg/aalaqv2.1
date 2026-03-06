import React, { useState, useEffect } from 'react';
import { GameHeader } from './GameHeader';
import { User } from '../types';
import { storageService } from '../services/storageService';
import { Loader2, HelpCircle } from 'lucide-react';

interface LetterLaddersProps {
    onBack: () => void;
    currentUser: User | null;
    onUpdateUser: (user: User) => void;
}

interface LadderData {
    start: string;
    end: string;
    steps: string[];
}

export const LetterLadders: React.FC<LetterLaddersProps> = ({ onBack, currentUser, onUpdateUser }) => {
    const [currentLevel, setCurrentLevel] = useState(0);
    const [currentWord, setCurrentWord] = useState('');
    const [history, setHistory] = useState<string[]>([]);
    const [input, setInput] = useState('');
    const [message, setMessage] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [gameData, setGameData] = useState<LadderData | null>(null);
    const [showHint, setShowHint] = useState(false);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadNewLadder();
    }, [currentLevel]);

    const loadNewLadder = async () => {
        setIsLoading(true);
        setError(null);
        setIsComplete(false);
        setHistory([]);
        setInput('');
        setMessage('');
        setShowHint(false);
        try {
            const response = await fetch('/api/generate-game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameType: 'LETTER_LADDERS' })
            });
            if (!response.ok) throw new Error("Failed to connect");
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            
            setGameData(data);
            setCurrentWord(data.start);
            setHistory([data.start]);
        } catch (err: any) {
            console.error("Failed to load ladder:", err);
            setError(err.message || "Failed to load game");
        } finally {
            setIsLoading(false);
        }
    };

    const checkWord = () => {
        if (!gameData) return;
        const guess = input.toUpperCase();
        
        // 1. Check length
        if (guess.length !== currentWord.length) {
            setMessage("Word must be same length!");
            return;
        }

        // 2. Check one letter difference
        let diff = 0;
        for (let i = 0; i < guess.length; i++) {
            if (guess[i] !== currentWord[i]) diff++;
        }
        if (diff !== 1) {
            setMessage("Change exactly one letter!");
            return;
        }

        // Success (allowing any one-letter-diff word for flexibility)
        setHistory([...history, guess]);
        setCurrentWord(guess);
        setInput('');
        setMessage('');

        if (guess === gameData.end.toUpperCase()) {
            setIsComplete(true);
            if (currentUser) {
                storageService.incrementGameStat(currentUser.username, 'LETTER_LADDERS');
                const updated = storageService.getUser(currentUser.username);
                if (updated) onUpdateUser(updated);
            }
        }
    };

    const giveHint = () => {
        if (!gameData || isComplete) return;
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
                <p className="text-brand-dark font-bold animate-pulse">AI is forging a new ladder for you...</p>
            </div>
        );
    }

    if (error || !gameData) {
        return (
            <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
                <p className="text-red-500 font-bold mb-4">{error || "Could not generate ladder."}</p>
                <button onClick={loadNewLadder} className="px-6 py-3 bg-brand-dark text-white rounded-xl font-bold hover:scale-105 transition-transform">Retry</button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-lg mx-auto animate-[fadeIn_0.5s_ease-out] flex flex-col items-center min-h-[80vh] p-4">
            <GameHeader 
                title="Letter Ladders" 
                gameId="LETTER_LADDERS" 
                currentUser={currentUser} 
                onBack={onBack} 
            />

            <div className="w-full flex justify-between items-center mb-8">
                <div className="text-left">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-1">Level {currentLevel + 1}</p>
                    <div className="flex items-center gap-4 text-2xl font-black text-brand-dark">
                        <span>{gameData?.start}</span>
                        <span className="text-gray-300">→</span>
                        <span className="text-brand-mint">{gameData?.end}</span>
                    </div>
                </div>
                <button 
                    onClick={giveHint}
                    className="p-3 bg-white border-2 border-brand-lavender text-brand-lavender rounded-2xl hover:bg-brand-lavender hover:text-white transition-all shadow-sm flex items-center gap-2 font-bold"
                >
                    <HelpCircle className="w-5 h-5" />
                    <span>Hint</span>
                </button>
            </div>

            {showHint && gameData && (
                <div className="mb-4 p-3 bg-brand-lavender/10 border border-brand-lavender/30 rounded-xl text-brand-dark font-bold text-sm animate-bounce">
                    Hint: A possible next word is <span className="underline text-brand-lavender">"{gameData.steps[history.length] || gameData.end}"</span>
                </div>
            )}

            {/* Ladder Display */}
            <div className="flex flex-col gap-2 mb-8 w-full max-w-xs">
                {history.map((word, idx) => (
                    <div key={idx} className="bg-white border-2 border-brand-dark/10 p-3 rounded-xl text-center font-mono font-bold text-xl shadow-sm animate-pop-in">
                        {word}
                    </div>
                ))}
                
                {/* Input Area */}
                {!isComplete && (
                    <div className="relative">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value.toUpperCase())}
                            maxLength={gameData?.start.length}
                            className="w-full bg-brand-brightGold/10 border-2 border-brand-brightGold p-3 rounded-xl text-center font-mono font-bold text-xl outline-none focus:ring-4 focus:ring-brand-brightGold/20 uppercase placeholder-brand-dark/20"
                            placeholder="NEXT WORD"
                            onKeyDown={(e) => e.key === 'Enter' && checkWord()}
                        />
                        <button 
                            onClick={checkWord}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-dark text-white p-2 rounded-lg hover:bg-brand-primary transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </button>
                    </div>
                )}
                
                {/* Target Placeholder */}
                {!isComplete && (
                    <div className="bg-brand-mint/10 border-2 border-dashed border-brand-mint p-3 rounded-xl text-center font-mono font-bold text-xl text-brand-mint opacity-50">
                        {gameData?.end}
                    </div>
                )}
            </div>

            {message && (
                <p className="text-red-500 font-bold mb-4 animate-shake">{message}</p>
            )}

            {isComplete && (
                <div className="text-center animate-pop-in">
                    <p className="text-2xl font-serif font-bold text-brand-dark mb-4">Ladder Complete!</p>
                    <button 
                        onClick={nextLevel}
                        className="px-8 py-3 bg-brand-dark text-white rounded-2xl font-black shadow-xl hover:scale-105 transition-transform"
                    >
                        Generate Next Ladder
                    </button>
                </div>
            )}
        </div>
    );
};