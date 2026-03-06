import React, { useState, useEffect } from 'react';
import { GameHeader } from './GameHeader';
import { User } from '../types';
import { storageService } from '../services/storageService';
import { Loader2, HelpCircle } from 'lucide-react';

interface RhymeTimeProps {
    onBack: () => void;
    currentUser: User | null;
    onUpdateUser: (user: User) => void;
}

interface RhymeData {
    word: string;
    rhymes: string[];
}

export const RhymeTime: React.FC<RhymeTimeProps> = ({ onBack, currentUser, onUpdateUser }) => {
    const [currentLevel, setCurrentLevel] = useState(0);
    const [inputs, setInputs] = useState(['', '', '']);
    const [feedback, setFeedback] = useState(['', '', '']);
    const [isComplete, setIsComplete] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [gameData, setGameData] = useState<RhymeData | null>(null);
    const [showHint, setShowHint] = useState(false);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadNewChallenge();
    }, [currentLevel]);

    const loadNewChallenge = async () => {
        setIsLoading(true);
        setError(null);
        setInputs(['', '', '']);
        setFeedback(['', '', '']);
        setIsComplete(false);
        setShowHint(false);
        try {
            const response = await fetch('/api/generate-game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameType: 'RHYME_TIME' })
            });
            if (!response.ok) throw new Error("Failed to connect");
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            if (!data.word || !data.rhymes) throw new Error("Invalid rhyme data");

            setGameData(data);
        } catch (err: any) {
            console.error("Failed to load rhymes:", err);
            setError(err.message || "Failed to load rhyme challenge");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheck = () => {
        if (!gameData) return;
        const newFeedback = [...feedback];
        let correctCount = 0;
        const usedRhymes = new Set();

        inputs.forEach((input, i) => {
            const trimmed = input.trim().toLowerCase();
            if (!trimmed) {
                newFeedback[i] = 'empty';
            } else if (
                gameData.rhymes.some(r => r.toLowerCase() === trimmed) && 
                !usedRhymes.has(trimmed)
            ) {
                newFeedback[i] = 'correct';
                usedRhymes.add(trimmed);
                correctCount++;
            } else {
                newFeedback[i] = 'incorrect';
            }
        });

        setFeedback(newFeedback);

        if (correctCount === 3) {
            setIsComplete(true);
            if (currentUser) {
                storageService.incrementGameStat(currentUser.username, 'RHYME_TIME');
                const updated = storageService.getUser(currentUser.username);
                if (updated) onUpdateUser(updated);
            }
        }
    };

    const giveHint = () => {
        if (!gameData || isComplete) return;
        setShowHint(true);
        setTimeout(() => setShowHint(false), 4000);
    };

    const nextLevel = () => {
        setCurrentLevel(prev => prev + 1);
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-brand-mint animate-spin mb-4" />
                <p className="text-brand-dark font-bold animate-pulse">AI is thinking of rhythmic words...</p>
            </div>
        );
    }

    if (error || !gameData) {
        return (
             <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
                <p className="text-red-500 font-bold mb-4">{error || "Could not load rhymes."}</p>
                <button onClick={loadNewChallenge} className="px-6 py-3 bg-brand-dark text-white rounded-xl font-bold hover:scale-105 transition-transform">Retry</button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-lg mx-auto animate-[fadeIn_0.5s_ease-out] flex flex-col items-center min-h-[80vh] p-4">
            <GameHeader 
                title="Rhyme Time" 
                gameId="RHYME_TIME" 
                currentUser={currentUser} 
                onBack={onBack} 
            />

            <div className="w-full flex justify-between items-center mb-4">
                <div className="text-left">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-1">Challenge {currentLevel + 1}</p>
                </div>
                <button 
                    onClick={giveHint}
                    className="p-3 bg-white border-2 border-brand-lavender text-brand-lavender rounded-2xl hover:bg-brand-lavender hover:text-white transition-all shadow-sm flex items-center gap-2 font-bold"
                >
                    <HelpCircle className="w-5 h-5" />
                    <span>Hint</span>
                </button>
            </div>

            <div className="text-center mb-8">
                <div className="bg-brand-lavender/20 p-8 rounded-full w-40 h-40 flex items-center justify-center mx-auto border-4 border-white shadow-xl">
                    <p className="text-3xl font-black text-brand-dark">{gameData?.word}</p>
                </div>
                <p className="mt-6 text-gray-600 font-bold">Find 3 words that rhyme with "{gameData?.word}"!</p>
            </div>

            {showHint && gameData && (
                <div className="mb-4 p-3 bg-brand-lavender/10 border border-brand-lavender/30 rounded-xl text-brand-dark font-bold text-sm animate-bounce text-center">
                    Hint: Some rhyming words are: <span className="text-brand-lavender">{gameData.rhymes.slice(0, 3).join(', ')}</span>
                </div>
            )}

            <div className="w-full space-y-4 mb-8">
                {inputs.map((val, i) => (
                    <div key={i} className="relative">
                        <input 
                            type="text" 
                            value={val}
                            onChange={(e) => {
                                const newInputs = [...inputs];
                                newInputs[i] = e.target.value;
                                setInputs(newInputs);
                                const newFeedback = [...feedback];
                                newFeedback[i] = '';
                                setFeedback(newFeedback);
                            }}
                            className={`w-full px-6 py-4 rounded-2xl border-2 outline-none font-bold text-lg transition-all ${
                                feedback[i] === 'correct' ? 'bg-brand-mint/10 border-brand-mint text-brand-dark' :
                                feedback[i] === 'incorrect' ? 'bg-red-50 border-red-200 text-red-500' :
                                'bg-white border-gray-200 focus:border-brand-lavender focus:ring-4 focus:ring-brand-lavender/10'
                            }`}
                            placeholder={`Rhyme #${i + 1}`}
                            disabled={isComplete}
                        />
                        {feedback[i] === 'correct' && (
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl">✅</span>
                        )}
                        {feedback[i] === 'incorrect' && (
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl">❌</span>
                        )}
                    </div>
                ))}
            </div>

            {isComplete ? (
                <div className="text-center animate-pop-in">
                    <div className="inline-block bg-brand-brightGold text-brand-dark px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest mb-4 shadow-lg">
                        Young Poet Badge Earned! 🏅
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
                    onClick={handleCheck}
                    className="w-full py-4 bg-brand-lavender text-white rounded-2xl font-black shadow-xl hover:scale-105 transition-transform"
                >
                    Check Rhymes
                </button>
            )}
        </div>
    );
};