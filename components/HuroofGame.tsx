import React, { useState, useEffect } from 'react';
import { HuroofWord, User } from '../types';
import { storageService } from '../services/storageService';
import { VALID_WORDS } from '../data/validWords';
import { GameHeader } from './GameHeader';
import { Loader2 } from 'lucide-react';

interface HuroofGameProps {
    onWriteStory: (prompt: string) => void;
    onBack: () => void;
    currentUser: User | null;
    onUpdateUser: (user: User) => void;
}

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

export const HuroofGame: React.FC<HuroofGameProps> = ({ onWriteStory, onBack, currentUser, onUpdateUser }) => {
    const [target, setTarget] = useState<HuroofWord | null>(null);
    const [guesses, setGuesses] = useState<string[]>([]);
    const [currentGuess, setCurrentGuess] = useState('');
    const [gameStatus, setGameStatus] = useState<'PLAYING' | 'WON' | 'LOST'>('PLAYING');
    const [shakeRow, setShakeRow] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hintsUsed, setHintsUsed] = useState(0);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadNewTarget();
    }, []);

    const loadNewTarget = async () => {
        setIsLoading(true);
        setError(null);
        setGuesses([]);
        setCurrentGuess('');
        setGameStatus('PLAYING');
        setHintsUsed(0);
        try {
            const response = await fetch('/api/generate-game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gameType: 'HUROOF' })
            });
            if (!response.ok) throw new Error("Failed to connect");
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            // Ensure the word is 5 letters and uppercase
            if (data.word) data.word = data.word.toUpperCase().substring(0, 5);
            else throw new Error("No word received");

            setTarget(data);
        } catch (err: any) {
            console.error("Failed to load target word:", err);
            setError(err.message || "Failed to load word challenge");
        } finally {
            setIsLoading(false);
        }
    };

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 2000);
    };

    const handleKeyDown = (key: string) => {
        if (gameStatus !== 'PLAYING' || isLoading) return;

        if (key === 'ENTER') {
            if (currentGuess.length !== WORD_LENGTH) {
                setShakeRow(true);
                setTimeout(() => setShakeRow(false), 500);
                return;
            }

            // Dictionary Check
            const upperGuess = currentGuess.toUpperCase();
            if (!VALID_WORDS.includes(upperGuess) && upperGuess !== target?.word) {
                setShakeRow(true);
                showToast("Not in word list");
                setTimeout(() => {
                    setShakeRow(false);
                }, 500);
                return;
            }

            const newGuesses = [...guesses, upperGuess];
            setGuesses(newGuesses);
            setCurrentGuess('');

            if (upperGuess === target?.word) {
                setGameStatus('WON');
                if (currentUser) {
                    storageService.incrementGameStat(currentUser.username, 'HUROOF');
                    const updated = storageService.getUser(currentUser.username);
                    if (updated) onUpdateUser(updated);
                }
            } else if (newGuesses.length >= MAX_GUESSES) {
                setGameStatus('LOST');
            }
        } else if (key === 'BACKSPACE') {
            setCurrentGuess(prev => prev.slice(0, -1));
        } else if (currentGuess.length < WORD_LENGTH && /^[A-Z]$/.test(key)) {
            setCurrentGuess(prev => prev + key);
        }
    };

    useEffect(() => {
        const handlePhysicalKey = (e: KeyboardEvent) => {
            const key = e.key.toUpperCase();
            if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
                handleKeyDown(key);
            }
        };
        window.addEventListener('keydown', handlePhysicalKey);
        return () => window.removeEventListener('keydown', handlePhysicalKey);
    }, [currentGuess, gameStatus, guesses, isLoading]);

    const handleHint = () => {
        if (!currentUser || !target) return;
        if (hintsUsed >= 3) {
            showToast("Max 3 hints used!");
            return;
        }
        if ((currentUser.rewardPoints || 0) < 1) {
            showToast("Not enough points!");
            return;
        }

        // Find a letter the user hasn't correctly guessed yet in its position
        let hintIndex = -1;
        for (let i = 0; i < WORD_LENGTH; i++) {
            const wasGuessedCorrectly = guesses.some(g => g[i] === target.word[i]);
            if (!wasGuessedCorrectly) {
                hintIndex = i;
                break;
            }
        }

        if (hintIndex === -1) {
            showToast("You've got this!");
            return;
        }

        const correctLetter = target.word[hintIndex];
        
        if (storageService.deductRewardPoints(currentUser.username, 1)) {
            showToast(`Hint: Pos ${hintIndex + 1} is ${correctLetter}`);
            setHintsUsed(prev => prev + 1);
            const updated = storageService.getUser(currentUser.username);
            if (updated) onUpdateUser(updated);
        }
    };

    const handleShare = () => {
        if (!target) return;
        const grid = guesses.map(guess => {
            return guess.split('').map((char, i) => {
                if (char === target.word[i]) return '🟩';
                if (target.word.includes(char)) return '🟨';
                return '⬜';
            }).join('');
        }).join('\n');

        const text = `Huroof ${gameStatus === 'WON' ? guesses.length : 'X'}/6\n\n${grid}\n\nPlay at StoryBookAi!`;
        navigator.clipboard.writeText(text);
        showToast("Copied to clipboard!");
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-brand-mint animate-spin mb-4" />
                <p className="text-brand-dark font-bold animate-pulse">AI is picking a sacred word for you...</p>
            </div>
        );
    }

    if (error || !target) {
        return (
             <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
                <p className="text-red-500 font-bold mb-4">{error || "Could not load word challenge."}</p>
                <button onClick={loadNewTarget} className="px-6 py-3 bg-brand-dark text-white rounded-xl font-bold hover:scale-105 transition-transform">Retry</button>
            </div>
        );
    }

    const getLetterStatus = (letter: string, index: number, word: string) => {
        if (!target) return 'absent';
        if (target.word[index] === letter) return 'correct';
        if (target.word.includes(letter)) return 'present';
        return 'absent';
    };

    return (
        <div className="w-full max-w-lg mx-auto animate-[fadeIn_0.5s_ease-out] flex flex-col items-center min-h-[80vh]">
            <GameHeader 
                title="Huroof" 
                gameId="HUROOF" 
                currentUser={currentUser} 
                onBack={onBack} 
            />

            {toastMessage && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-brand-dark text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm animate-pop-in z-50">
                    {toastMessage}
                </div>
            )}

            <p className="text-center text-gray-500 mb-8 font-bold text-sm">Guess the AI-generated Quranic Word in 6 tries.</p>

            <div className="grid gap-2 mb-8">
                {Array.from({ length: MAX_GUESSES }).map((_, rowIndex) => {
                    const isCurrentRow = rowIndex === guesses.length;
                    const guess = guesses[rowIndex] || (isCurrentRow ? currentGuess : '');
                    const isComplete = rowIndex < guesses.length;

                    return (
                        <div 
                            key={rowIndex} 
                            className={`grid grid-cols-5 gap-2 ${isCurrentRow && shakeRow ? 'animate-shake' : ''}`}
                        >
                            {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
                                const letter = guess[colIndex] || '';
                                let statusClass = 'bg-white border-2 border-gray-200 text-brand-dark';
                                
                                if (isComplete) {
                                    const status = getLetterStatus(letter, colIndex, guess);
                                    if (status === 'correct') statusClass = 'bg-brand-mint text-brand-dark border-brand-mint';
                                    else if (status === 'present') statusClass = 'bg-brand-brightGold text-brand-dark border-brand-brightGold';
                                    else statusClass = 'bg-gray-400 text-white border-gray-400';
                                } else if (letter) {
                                    statusClass = 'bg-white border-2 border-brand-dark text-brand-dark animate-pop-in';
                                }

                                return (
                                    <div 
                                        key={colIndex}
                                        className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black transition-all duration-500 ${statusClass}`}
                                    >
                                        {letter}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            {gameStatus === 'PLAYING' && currentUser && (
                <button 
                    onClick={handleHint}
                    disabled={hintsUsed >= 3 || (currentUser.rewardPoints || 0) < 1}
                    className="mb-6 px-4 py-2 bg-brand-brightGold/20 text-brand-dark text-xs font-black uppercase tracking-widest rounded-full hover:bg-brand-brightGold hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <span>💡 Hint (1 Pt)</span>
                    <span className="bg-white/50 px-1.5 rounded text-[10px]">{3 - hintsUsed} left</span>
                </button>
            )}

            <div className="w-full max-w-md px-2">
                <div className="flex flex-wrap justify-center gap-1.5">
                    {['Q','W','E','R','T','Y','U','I','O','P','A','S','D','F','G','H','J','K','L','Z','X','C','V','B','N','M'].map((key) => {
                        let keyColor = 'bg-gray-200 text-gray-700 hover:bg-gray-300';
                        let bestStatus = '';
                        guesses.forEach(g => {
                            const idx = g.indexOf(key);
                            if (idx !== -1 && target) {
                                if (target.word[idx] === key) bestStatus = 'correct';
                                else if (target.word.includes(key) && bestStatus !== 'correct') bestStatus = 'present';
                                else if (!target.word.includes(key) && !bestStatus) bestStatus = 'absent';
                            }
                        });

                        if (bestStatus === 'correct') keyColor = 'bg-brand-mint text-brand-dark';
                        else if (bestStatus === 'present') keyColor = 'bg-brand-brightGold text-brand-dark';
                        else if (bestStatus === 'absent') keyColor = 'bg-gray-400 text-white opacity-50';

                        return (
                            <button
                                key={key}
                                onClick={() => handleKeyDown(key)}
                                className={`h-12 w-8 sm:w-10 rounded-lg font-bold text-sm transition-colors ${keyColor}`}
                            >
                                {key}
                            </button>
                        );
                    })}
                    <button onClick={() => handleKeyDown('BACKSPACE')} className="h-12 px-3 rounded-lg font-bold bg-gray-300 text-gray-700 hover:bg-gray-400">⌫</button>
                    <button onClick={() => handleKeyDown('ENTER')} className="h-12 px-3 rounded-lg font-black bg-brand-dark text-white hover:bg-brand-primary text-xs">ENTER</button>
                </div>
            </div>

            {gameStatus !== 'PLAYING' && target && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
                    <div className="bg-white rounded-[3rem] p-8 max-w-md w-full text-center shadow-2xl border border-white/50 relative overflow-hidden animate-pop-in">
                        <div className={`absolute inset-0 opacity-10 ${gameStatus === 'WON' ? 'bg-brand-mint' : 'bg-red-500'}`}></div>
                        
                        <h2 className="text-4xl font-serif font-black mb-2 relative z-10">
                            {gameStatus === 'WON' ? 'Mashallah!' : 'Next Time!'}
                        </h2>
                        <p className="text-gray-500 font-bold mb-6 relative z-10">
                            The word was <span className="text-brand-dark uppercase">{target.word}</span>
                        </p>

                        <div className="bg-brand-cream p-6 rounded-2xl border-l-4 border-brand-brightGold mb-8 text-left relative z-10">
                            <p className="text-lg font-serif italic text-brand-dark mb-2">"{target.verse}"</p>
                            <p className="text-xs font-bold text-brand-accent text-right uppercase tracking-wider">— {target.reference}</p>
                        </div>

                        <div className="flex gap-4 mb-6 relative z-10">
                            <button 
                                onClick={handleShare}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                            >
                                Share
                            </button>
                        </div>

                        {gameStatus === 'WON' ? (
                            <div className="relative z-10">
                                <p className="text-sm font-bold text-gray-600 mb-4">Inspired? Let's write a story!</p>
                                <button 
                                    onClick={() => onWriteStory(target.prompt)}
                                    className="w-full py-4 bg-brand-dark text-white rounded-2xl font-black shadow-xl hover:scale-105 hover:bg-brand-lavender transition-all flex items-center justify-center gap-2"
                                >
                                    Write Story with this Verse
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={loadNewTarget}
                                className="relative z-10 w-full py-4 bg-gray-200 text-gray-700 rounded-2xl font-black hover:bg-gray-300 transition-all"
                            >
                                Generate New Word
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};